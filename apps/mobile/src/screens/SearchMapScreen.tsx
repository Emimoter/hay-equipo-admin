import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import WebView from 'react-native-webview';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { LEAFLET_CSS, LEAFLET_JS } from '../services/leafletBundle';
import { colors, fonts, formatCurrency } from '../components/theme';
import {
  PadelIcon,
  FootballIcon,
  TennisIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  RepeatIcon,
  PlusIcon,
  MinusIcon,
  ListIcon,
  MapIcon,
  CloseIcon,
} from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import {
  getRealUserLocation,
  UserLocationState,
  DEFAULT_LOCATION,
  calculateDistanceKm,
} from '../services/location';
import { TimeSlot, Club } from '@hay-equipo/contracts';

const { width, height } = Dimensions.get('window');

interface SearchMapScreenProps {
  initialSport?: string;
  onNavigateCheckout: (slot: TimeSlot) => void;
  onNavigateClub: (clubId: string) => void;
}

export const SearchMapScreen: React.FC<SearchMapScreenProps> = ({
  initialSport = 'PADEL',
  onNavigateCheckout,
  onNavigateClub,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('MAP');
  const [sport, setSport] = useState<string>(initialSport);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = async (forceFresh = false) => {
    try {
      setIsLocating(true);
      const loc = await getRealUserLocation(forceFresh);
      setUserLocation(loc);
      if (isMapReady && loc.isRealLocation) {
        webViewRef.current?.injectJavaScript(`
          if (window.updateUserLocation) {
            window.updateUserLocation(${loc.latitude}, ${loc.longitude});
          }
          if (window.flyToUser) {
            window.flyToUser(${loc.latitude}, ${loc.longitude});
          }
          true;
        `);
      }
    } catch (e) {
      console.log('Location request error:', e);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sport, userLocation]);

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs(sport),
      mobileApi.searchAvailability({ sport, date: today }),
    ]);

    const adaptedClubs = clubsData.map((c, i) => {
      if (c.latitude && c.longitude && c.latitude !== 0) {
        return c;
      }
      const offsets = [
        { lat: 0.005, lng: -0.006 },
        { lat: 0.009, lng: 0.007 },
        { lat: -0.006, lng: 0.008 },
        { lat: -0.008, lng: -0.005 },
      ];
      const offset = offsets[i % offsets.length];
      return {
        ...c,
        latitude: userLocation.latitude + offset.lat,
        longitude: userLocation.longitude + offset.lng,
      };
    });

    setClubs(adaptedClubs);
    setAvailableSlots(slotsData);

    if (adaptedClubs.length > 0) {
      setSelectedClub(prev => (prev && adaptedClubs.some(c => c.id === prev.id) ? prev : adaptedClubs[0]));
    } else {
      setSelectedClub(null);
    }
  };

  const filteredClubs = searchQuery.trim().length > 0
    ? clubs.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clubs;

  useEffect(() => {
    if (!isMapReady) return;

    const clubsToRender = filteredClubs;
    const currentSportUpper = sport.toUpperCase();
    const serializedClubs = clubsToRender.map(c => {
      let sportType = 'PADEL';
      if (currentSportUpper.includes('FUTBOL')) {
        sportType = 'FUTBOL';
      } else if (currentSportUpper === 'TENIS') {
        sportType = 'TENIS';
      }
      return {
        id: c.id,
        name: c.name,
        lat: c.latitude,
        lng: c.longitude,
        price: c.minPrice,
        sportType,
      };
    });

    const activeId = selectedClub?.id || (clubsToRender.length > 0 ? clubsToRender[0].id : '');
    webViewRef.current?.injectJavaScript(`
      if (window.updateClubsData) {
        window.updateClubsData(${JSON.stringify(serializedClubs)}, "${activeId}");
      }
      true;
    `);
  }, [isMapReady, filteredClubs, selectedClub?.id, sport]);

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsMapReady(true);
        if (userLocation.latitude && userLocation.longitude) {
          webViewRef.current?.injectJavaScript(`
            if (window.updateUserLocation) {
              window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude});
            }
            if (window.flyToUser) {
              window.flyToUser(${userLocation.latitude}, ${userLocation.longitude});
            }
            true;
          `);
        }
      } else if (data.type === 'SELECT_CLUB') {
        triggerHaptic('light');
        const found = clubs.find(c => c.id === data.clubId);
        if (found) {
          setSelectedClub(found);
        }
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  const centerOnUser = () => {
    triggerHaptic('medium');
    requestUserLocation(true);
  };

  const zoomIn = () => {
    triggerHaptic('light');
    webViewRef.current?.injectJavaScript('if(window.zoomInMap) window.zoomInMap(); true;');
  };

  const zoomOut = () => {
    triggerHaptic('light');
    webViewRef.current?.injectJavaScript('if(window.zoomOutMap) window.zoomOutMap(); true;');
  };

  const getActiveSlotForClub = (clubId: string): TimeSlot => {
    const slot = availableSlots.find(s => s.clubId === clubId);
    if (slot) return slot;
    return {
      courtId: `court-${clubId}-1`,
      courtName: 'Cancha 1 Panorámica',
      clubId,
      clubName: selectedClub?.name || 'Club Deportivo',
      sportType: sport === 'FUTBOL_5' ? 'FUTBOL_5' : sport === 'FUTBOL_7' ? 'FUTBOL_7' : sport === 'TENIS' ? 'TENIS' : 'PADEL',
      date: new Date().toISOString().split('T')[0],
      startTime: '20:00',
      endTime: '21:30',
      durationMinutes: 90,
      price: selectedClub?.minPrice || 24000,
      fixedSlotPrice: Math.round((selectedClub?.minPrice || 24000) * 0.85),
      status: 'AVAILABLE',
    };
  };

  const staticMapHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    ${LEAFLET_CSS}
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#0b0e14; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-pin {
      background:#0b0e14;
      border:1.5px solid #fc1c46;
      border-radius:18px;
      color:#ffffff;
      padding:4px 10px;
      font-size:11px;
      font-weight:700;
      box-shadow:0 6px 14px rgba(252,28,70,0.35);
      display:inline-flex;
      align-items:center;
      gap:5px;
      white-space:nowrap;
    }
    .custom-pin.active {
      background:#fc1c46;
      border-color:#ffffff;
      transform:scale(1.15);
      z-index:9999;
      color:#ffffff;
    }
    .user-pulse-container {
      position:relative;
      width:24px;
      height:24px;
    }
    .user-pulse-ring {
      position:absolute;
      width:24px;
      height:24px;
      border-radius:12px;
      background:rgba(252,28,70,0.35);
      animation:pulseRing 1.8s infinite;
    }
    .user-pulse-dot {
      position:absolute;
      top:4px;
      left:4px;
      width:16px;
      height:16px;
      border-radius:8px;
      background:#fc1c46;
      border:3px solid #ffffff;
      box-shadow:0 0 10px #fc1c46;
    }
    @keyframes pulseRing {
      0% { transform:scale(0.8); opacity:1; }
      100% { transform:scale(2.2); opacity:0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    ${LEAFLET_JS}
    var defaultLat = -37.9718;
    var defaultLng = -57.5593;

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    }).setView([defaultLat, defaultLng], 14);

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    var userIcon = L.divIcon({
      className: 'user-marker-icon',
      html: '<div class="user-pulse-container"><div class="user-pulse-ring"></div><div class="user-pulse-dot"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var userMarker = L.marker([defaultLat, defaultLng], { icon: userIcon, zIndexOffset: 500 }).addTo(map);

    var currentActiveId = "";
    var currentClubs = [];
    var markersMap = {};
    var clubsGroup = L.layerGroup().addTo(map);

    var padelSvgIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fc1c46" stroke-width="2.5"><circle cx="12" cy="12" r="9.5"></circle></svg>';

    function buildClubPinHtml(club, isActive) {
      var priceFormatted = Number(club.price || 0).toLocaleString('es-AR');
      return '<div class="custom-pin ' + (isActive ? 'active' : '') + '">' +
               padelSvgIcon +
               '<span>' + club.name + '</span>' +
               '<span style="margin-left:5px;color:#ffffff;font-weight:800;background:rgba(0,0,0,0.3);padding:2px 5px;border-radius:5px;font-size:9.5px;">$' + priceFormatted + '</span>' +
             '</div>';
    }

    function renderAllMarkers() {
      clubsGroup.clearLayers();
      markersMap = {};

      currentClubs.forEach(function(club) {
        var isActive = club.id === currentActiveId;
        var icon = L.divIcon({
          className: 'club-pin-container',
          html: buildClubPinHtml(club, isActive),
          iconSize: [130, 30],
          iconAnchor: [65, 15]
        });

        var marker = L.marker([club.lat, club.lng], {
          icon: icon,
          zIndexOffset: isActive ? 2000 : 100
        });

        marker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          internalSelectClub(club.id, true);
        });

        clubsGroup.addLayer(marker);
        markersMap[club.id] = { marker: marker, club: club };
      });
    }

    function internalSelectClub(clubId, notifyRN) {
      currentActiveId = clubId;

      for (var id in markersMap) {
        var entry = markersMap[id];
        var isAct = id === currentActiveId;
        var newIcon = L.divIcon({
          className: 'club-pin-container',
          html: buildClubPinHtml(entry.club, isAct),
          iconSize: [130, 30],
          iconAnchor: [65, 15]
        });
        entry.marker.setIcon(newIcon);
        entry.marker.setZIndexOffset(isAct ? 2000 : 100);
      }

      var targetClub = currentClubs.find(function(c) { return c.id === clubId; });
      if (targetClub) {
        map.flyTo([targetClub.lat, targetClub.lng], 15.5, { animate: true, duration: 0.6 });
      }

      if (notifyRN && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_CLUB', clubId: clubId }));
      }
    }

    window.updateClubsData = function(clubs, activeId) {
      currentClubs = clubs || [];
      if (activeId) {
        currentActiveId = activeId;
      }
      renderAllMarkers();
    };

    window.selectClubById = function(clubId) {
      internalSelectClub(clubId, false);
    };

    window.updateUserLocation = function(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      }
    };

    window.flyToUser = function(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      }
      map.flyTo([lat, lng], 15, { animate: true, duration: 0.6 });
    };

    window.zoomInMap = function() {
      map.zoomIn(1, { animate: true });
    };

    window.zoomOutMap = function() {
      map.zoomOut(1, { animate: true });
    };

    setTimeout(function() {
      map.invalidateSize();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
      }
    }, 150);
  </script>
</body>
</html>`;
  }, []);

  return (
    <View style={styles.container}>
      {/* ═══════════════════════════════════════════════════════
          FLOATING SEARCH & CONTROLS TOP BAR
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.topContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="8" stroke="#fc1c46" strokeWidth={2.5} />
              <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#fc1c46" strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar club, barrio o zona..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setSearchQuery('');
                }}
              >
                <CloseIcon size={14} color="#94a3b8" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'LIST' && styles.toggleBtnActive]}
              onPress={() => {
                triggerHaptic('selection');
                setViewMode('LIST');
              }}
            >
              <ListIcon size={13} color={viewMode === 'LIST' ? '#ffffff' : '#94a3b8'} strokeWidth={2.2} />
              <Text style={[styles.toggleText, viewMode === 'LIST' && styles.toggleTextActive]}>Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'MAP' && styles.toggleBtnActive]}
              onPress={() => {
                triggerHaptic('selection');
                setViewMode('MAP');
              }}
            >
              <MapIcon size={13} color={viewMode === 'MAP' ? '#ffffff' : '#94a3b8'} strokeWidth={2.2} />
              <Text style={[styles.toggleText, viewMode === 'MAP' && styles.toggleTextActive]}>Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sports Category Filter Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll} contentContainerStyle={{ paddingRight: 14 }}>
          <TouchableOpacity
            style={[styles.sportChip, sport === 'PADEL' && styles.sportChipActive]}
            onPress={() => {
              triggerHaptic('selection');
              setSport('PADEL');
            }}
          >
            <PadelIcon size={13} color={sport === 'PADEL' ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
            <Text style={[styles.sportChipText, sport === 'PADEL' && styles.sportChipTextActive]}>Pádel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sportChip, (sport === 'FUTBOL' || sport === 'FUTBOL_5' || sport === 'FUTBOL_7') && styles.sportChipActive]}
            onPress={() => {
              triggerHaptic('selection');
              setSport('FUTBOL');
            }}
          >
            <FootballIcon size={13} color={(sport === 'FUTBOL' || sport === 'FUTBOL_5' || sport === 'FUTBOL_7') ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
            <Text style={[styles.sportChipText, (sport === 'FUTBOL' || sport === 'FUTBOL_5' || sport === 'FUTBOL_7') && styles.sportChipTextActive]}>Fútbol</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ═══════════════════════════════════════════════════════
          MAP VIEW WRAPPER
          ═══════════════════════════════════════════════════════ */}
      <View style={[StyleSheet.absoluteFillObject, { display: viewMode === 'MAP' ? 'flex' : 'none' }]}>
        <WebView
          ref={webViewRef}
          source={{ html: staticMapHtml }}
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowFileAccess={true}
          scrollEnabled={false}
          bounces={false}
          onMessage={onWebViewMessage}
        />

        <View style={styles.mapControls}>
          <TouchableOpacity activeOpacity={0.8} style={styles.mapBtn} onPress={zoomIn}>
            <PlusIcon size={18} color="#ffffff" strokeWidth={2.8} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.mapBtn} onPress={zoomOut}>
            <MinusIcon size={18} color="#ffffff" strokeWidth={2.8} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.mapBtn, isLocating && styles.mapBtnActive]}
            onPress={centerOnUser}
          >
            <MapPinIcon size={18} color="#fc1c46" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {selectedClub ? (
          <View style={styles.bottomCardContainer}>
            <DoubleBezelCard
              variant="black"
              style={styles.clubPreviewCardOuter}
              innerStyle={styles.clubPreviewCardInner}
              onPress={() => {
                triggerHaptic('medium');
                onNavigateClub(selectedClub.id);
              }}
              glow
            >
              <Image source={{ uri: selectedClub.images[0] }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{selectedClub.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('light');
                      onNavigateClub(selectedClub.id);
                    }}
                  >
                    <Text style={styles.verClubLinkText}>Ver →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.locationRow}>
                  <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                  <Text style={styles.addressText} numberOfLines={1}>{selectedClub.address}</Text>
                </View>

                <View style={styles.clubMetaRow}>
                  <StarIcon size={11} fill="#FACC15" color="#FACC15" />
                  <Text style={styles.clubRatingText}>{selectedClub.rating}</Text>
                  <Text style={styles.clubDotSeparator}>•</Text>
                  <Text style={styles.clubDistanceText}>
                    {`a ${calculateDistanceKm(userLocation.latitude, userLocation.longitude, selectedClub.latitude, selectedClub.longitude).toFixed(1)} km`}
                  </Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={styles.priceSmallLabel}>Precio desde</Text>
                    <Text style={styles.priceCardValue}>{formatCurrency(selectedClub.minPrice)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookDirectButton}
                    onPress={() => {
                      triggerHaptic('medium');
                      onNavigateCheckout(getActiveSlotForClub(selectedClub.id));
                    }}
                  >
                    <Text style={styles.bookDirectButtonText}>Reservar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </DoubleBezelCard>
          </View>
        ) : null}
      </View>

      {/* ═══════════════════════════════════════════════════════
          LIST VIEW (WHITE BACKGROUND CANVAS)
          ═══════════════════════════════════════════════════════ */}
      {viewMode === 'LIST' && (
        <ScrollView contentContainerStyle={styles.listScrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.listHeaderTitle}>
            {filteredClubs.length === 0
              ? 'No hay complejos con canchas disponibles'
              : `${filteredClubs.length} Complejos cerca tuyo`}
          </Text>

          {filteredClubs.map(item => {
            const distance = calculateDistanceKm(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude).toFixed(1);

            return (
              <DoubleBezelCard
                key={item.id}
                variant="black"
                style={styles.listClubCardOuter}
                innerStyle={styles.listClubCardInner}
                onPress={() => {
                  triggerHaptic('medium');
                  onNavigateClub(item.id);
                }}
              >
                <View style={styles.listImageWrapper}>
                  <Image source={{ uri: item.images[0] }} style={styles.listCardImage} />
                  <View style={styles.listBadgeOverlay}>
                    <PadelIcon size={11} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.listBadgeText}> PÁDEL</Text>
                  </View>
                </View>

                <View style={styles.listCardDetails}>
                  <View style={styles.listRowHeader}>
                    <Text style={styles.listClubTitle} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.listRatingBadge}>
                      <StarIcon size={11} fill="#FACC15" color="#FACC15" />
                      <Text style={styles.listRatingValue}>{item.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.listAddressRow}>
                    <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                    <Text style={styles.listAddressText} numberOfLines={1}>{item.address}</Text>
                  </View>

                  <Text style={styles.listDistanceSubtext}>{`a ${distance} km de tu ubicación`}</Text>

                  <View style={styles.listFooterRow}>
                    <View>
                      <Text style={styles.priceSmallLabel}>Precio cancha desde</Text>
                      <Text style={styles.priceCardValue}>{formatCurrency(item.minPrice)}</Text>
                    </View>

                    <View style={styles.listButtonsGroup}>
                      <TouchableOpacity
                        style={styles.listSecBtn}
                        onPress={() => {
                          triggerHaptic('light');
                          onNavigateClub(item.id);
                        }}
                      >
                        <Text style={styles.listSecBtnText}>Canchas</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.listPriBtn}
                        onPress={() => {
                          triggerHaptic('medium');
                          onNavigateCheckout(getActiveSlotForClub(item.id));
                        }}
                      >
                        <Text style={styles.listPriBtnText}>Reservar →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </DoubleBezelCard>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 14,
    right: 14,
    gap: 10,
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0e14',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0b0e14',
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#fc1c46',
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: fonts.medium,
  },
  toggleTextActive: {
    color: '#ffffff',
    fontFamily: fonts.bold,
  },
  sportsScroll: {
    flexDirection: 'row',
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sportChipActive: {
    backgroundColor: '#0b0e14',
    borderColor: '#fc1c46',
  },
  sportChipText: { color: '#475569', fontSize: 11.5, fontFamily: fonts.medium },
  sportChipTextActive: { color: '#ffffff', fontFamily: fonts.bold },

  /* LIST VIEW STYLES */
  listScrollContent: {
    paddingTop: Platform.OS === 'ios' ? 150 : 120,
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  listHeaderTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontFamily: fonts.headingBold,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  listClubCardOuter: {
    marginBottom: 14,
  },
  listClubCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    overflow: 'hidden',
  },
  listImageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  listCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listBadgeText: { color: '#ffffff', fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.4 },
  listCardDetails: {
    padding: 14,
  },
  listRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listClubTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.headingBold,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  listRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0b0e14',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  listRatingValue: { color: '#FACC15', fontSize: 12, fontFamily: fonts.bold },
  listAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listAddressText: { color: '#94a3b8', fontSize: 12, fontFamily: fonts.regular, flex: 1 },
  listDistanceSubtext: { color: '#64748b', fontSize: 11, fontFamily: fonts.medium, marginTop: 2 },
  listFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  listButtonsGroup: { flexDirection: 'row', gap: 8 },
  listSecBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listSecBtnText: { color: '#ffffff', fontSize: 12, fontFamily: fonts.semiBold },
  listPriBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fc1c46',
  },
  listPriBtnText: { color: '#ffffff', fontSize: 12, fontFamily: fonts.bold },

  /* MAP VIEW STYLES */
  mapControls: {
    position: 'absolute',
    right: 16,
    top: height * 0.38,
    gap: 10,
    zIndex: 90,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  mapBtnActive: {
    borderColor: '#fc1c46',
    backgroundColor: '#fc1c46',
  },
  bottomCardContainer: { position: 'absolute', bottom: 85, left: 14, right: 14, zIndex: 50 },
  clubPreviewCardOuter: {
    width: '100%',
  },
  clubPreviewCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  cardImage: { width: 90, height: 90, borderRadius: 14, resizeMode: 'cover' },
  cardContent: { flex: 1, justifyContent: 'space-between' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clubTitle: { color: '#ffffff', fontSize: 14, fontFamily: fonts.headingBold, flex: 1, marginRight: 6 },
  verClubLinkText: { color: '#fc1c46', fontSize: 11, fontFamily: fonts.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { color: '#94a3b8', fontSize: 11.5, fontFamily: fonts.regular, flex: 1 },
  clubMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clubRatingText: { color: '#FACC15', fontSize: 11, fontFamily: fonts.bold },
  clubDotSeparator: { color: '#4b5563', fontSize: 10 },
  clubDistanceText: { color: '#94a3b8', fontSize: 11, fontFamily: fonts.medium },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceSmallLabel: { color: '#94a3b8', fontSize: 9, fontFamily: fonts.regular, textTransform: 'uppercase' },
  priceCardValue: { color: '#ffffff', fontSize: 14, fontFamily: fonts.headingBold },
  bookDirectButton: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fc1c46' },
  bookDirectButtonText: { color: '#ffffff', fontSize: 11.5, fontFamily: fonts.bold },
});
