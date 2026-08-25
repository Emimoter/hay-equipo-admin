import React, { useState, useEffect, useRef } from 'react';
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
} from '../components/AppIcons';
import { mobileApi } from '../services/api';
import {
  getRealUserLocation,
  UserLocationState,
  DEFAULT_LOCATION,
  calculateDistanceKm,
} from '../services/location';
import { TimeSlot, Club } from '@hay-equipo/contracts';

const { width, height } = Dimensions.get('window');

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#161b22" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#090d13" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#161b22" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6e7681" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#21262d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1117" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#30363d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050914" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#388bfd" }] }
];

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
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('MAP');
  const [sport, setSport] = useState<string>(initialSport);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('20:00');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = async () => {
    try {
      const loc = await getRealUserLocation();
      setUserLocation(loc);
    } catch (e) {
      console.log('Location request error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [sport, timeFilter, userLocation]);

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs(sport),
      mobileApi.searchAvailability({ sport, date: today, timeFrom: timeFilter }),
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

    if (adaptedClubs.length > 0 && !selectedClub) {
      setSelectedClub(adaptedClubs[0]);
    }
  };

  const getActiveSlotForClub = (clubId: string) => {
    return availableSlots.find(s => s.clubId === clubId) || availableSlots[0];
  };

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    webViewRef.current?.injectJavaScript(`
      if (window.selectClubById) {
        window.selectClubById("${club.id}");
      }
      true;
    `);
  };

  const centerOnUser = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.flyToUser) {
        window.flyToUser(${userLocation.latitude}, ${userLocation.longitude});
      }
      true;
    `);
  };

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_CLUB') {
        const club = clubs.find(c => c.id === data.clubId);
        if (club) {
          setSelectedClub(club);
        }
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateMapHtml = () => {
    const clubsToRender = filteredClubs.length > 0 ? filteredClubs : clubs;
    const clubsJson = JSON.stringify(
      clubsToRender.map(c => {
        const isPadel = c.name.toLowerCase().includes('padel') || c.name.toLowerCase().includes('pádel');
        const sportIcon = isPadel ? '🎾' : '⚽';
        const cleanName = c.name.split('-')[0].replace(/Complejo/gi, '').replace(/Canchas de/gi, '').trim();
        return {
          id: c.id,
          name: cleanName,
          lat: c.latitude,
          lng: c.longitude,
          sportIcon,
          price: c.minPrice || 0,
        };
      })
    );

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    ${LEAFLET_CSS}
    * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      overflow: hidden;
    }
    #map {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0b0f19;
    }
    .custom-pin {
      display: inline-flex;
      align-items: center;
      background-color: #0f172a;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 18px;
      border: 1.5px solid rgba(255,255,255,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      cursor: pointer;
      white-space: nowrap;
    }
    .custom-pin.active {
      background-color: #fc1c46;
      border-color: #ffffff;
      transform: scale(1.15);
      box-shadow: 0 4px 18px rgba(252,28,70,0.8);
    }
    .user-pulse-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fc1c46;
      border: 3px solid #ffffff;
      box-shadow: 0 0 14px rgba(252, 28, 70, 1);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    window.onerror = function(msg, url, line) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', msg: 'JS ERR: ' + msg + ' (' + line + ')' }));
      }
    };

    ${LEAFLET_JS}

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);

    // Google Maps Tile Layer
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    // User Location Pin
    var userIcon = L.divIcon({
      className: 'user-icon-container',
      html: '<div class="user-pulse-dot"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon, zIndexOffset: 500 }).addTo(map);

    var clubsData = ${clubsJson};
    var currentActiveId = "${selectedClub?.id || ''}";
    var clubsGroup = L.layerGroup().addTo(map);

    function buildClubIcon(club, isActive) {
      return L.divIcon({
        className: 'club-pin-container',
        html: '<div class="custom-pin ' + (isActive ? 'active' : '') + '">' +
                '<span style="margin-right:4px;">' + club.sportIcon + '</span>' +
                '<span>' + club.name + '</span>' +
                '<span style="margin-left:5px;color:#ff6b8b;font-weight:800;background:rgba(0,0,0,0.4);padding:1px 5px;border-radius:4px;font-size:10px;">$' + Number(club.price).toLocaleString('es-AR') + '</span>' +
              '</div>',
        iconSize: [140, 30],
        iconAnchor: [70, 15]
      });
    }

    function renderMarkers() {
      clubsGroup.clearLayers();
      clubsData.forEach(function(club) {
        var isAct = club.id === currentActiveId;
        var marker = L.marker([club.lat, club.lng], {
          icon: buildClubIcon(club, isAct),
          zIndexOffset: isAct ? 1000 : 100
        });
        marker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          setActiveClub(club.id);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_CLUB', clubId: club.id }));
          }
        });
        clubsGroup.addLayer(marker);
      });
    }

    function setActiveClub(clubId) {
      currentActiveId = clubId;
      renderMarkers();
      var target = clubsData.find(function(c) { return c.id === clubId; });
      if (target) {
        map.flyTo([target.lat, target.lng], 15, { animate: true, duration: 0.5 });
      }
    }

    renderMarkers();

    setTimeout(function() {
      map.invalidateSize();
    }, 200);

    window.flyToUser = function(lat, lng) {
      map.flyTo([lat, lng], 14, { animate: true, duration: 0.5 });
    };

    window.selectClubById = function(clubId) {
      setActiveClub(clubId);
    };
  </script>
</body>
</html>`;
  };

  return (
    <View style={styles.container}>
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
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: '#6b7280', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'LIST' && styles.toggleBtnActive]}
              onPress={() => setViewMode('LIST')}
            >
              <Text style={[styles.toggleText, viewMode === 'LIST' && styles.toggleTextActive]}>📋 Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'MAP' && styles.toggleBtnActive]}
              onPress={() => setViewMode('MAP')}
            >
              <Text style={[styles.toggleText, viewMode === 'MAP' && styles.toggleTextActive]}>🗺️ Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
          <TouchableOpacity
            style={[styles.sportChip, sport === 'PADEL' && styles.sportChipActive]}
            onPress={() => setSport('PADEL')}
          >
            <Text style={styles.sportChipIcon}>🎾</Text>
            <Text style={[styles.sportChipText, sport === 'PADEL' && styles.sportChipTextActive]}>Pádel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sportChip, sport === 'FUTBOL' && styles.sportChipActive]}
            onPress={() => setSport('FUTBOL')}
          >
            <Text style={styles.sportChipIcon}>⚽</Text>
            <Text style={[styles.sportChipText, sport === 'FUTBOL' && styles.sportChipTextActive]}>Fútbol 5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sportChip, sport === 'TENIS' && styles.sportChipActive]}
            onPress={() => setSport('TENIS')}
          >
            <Text style={styles.sportChipIcon}>🎾</Text>
            <Text style={[styles.sportChipText, sport === 'TENIS' && styles.sportChipTextActive]}>Tenis</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {viewMode === 'MAP' ? (
        <View style={StyleSheet.absoluteFillObject}>
          <WebView
            ref={webViewRef}
            source={{ html: generateMapHtml() }}
            style={{ flex: 1, backgroundColor: '#0b0f19' }}
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
            <TouchableOpacity activeOpacity={0.8} style={styles.mapBtn} onPress={centerOnUser}>
              <MapPinIcon size={18} color="#f8fafc" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {selectedClub ? (
            <View style={styles.bottomCardContainer}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.clubPreviewCard}
                onPress={() => onNavigateClub(selectedClub.id)}
              >
                <Image source={{ uri: selectedClub.images[0] }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.clubTitle} numberOfLines={1}>{selectedClub.name}</Text>
                    <TouchableOpacity onPress={() => onNavigateClub(selectedClub.id)}>
                      <Text style={styles.verClubLinkText}>Ver →</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.locationRow}>
                    <MapPinIcon size={12} color="#9ca3af" strokeWidth={1.8} />
                    <Text style={styles.addressText} numberOfLines={1}>{selectedClub.address}</Text>
                  </View>

                  <View style={styles.clubMetaRow}>
                    <StarIcon size={11} fill="#fbbf24" color="#fbbf24" />
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
                      onPress={() => onNavigateCheckout(getActiveSlotForClub(selectedClub.id))}
                    >
                      <Text style={styles.bookDirectButtonText}>Reservar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listScrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.listHeaderTitle}>
            {`${filteredClubs.length} Complejos cerca de ${userLocation.city || 'tu ubicación'}`}
          </Text>

          {filteredClubs.map(item => {
            const isPadel = item.name.toLowerCase().includes('padel') || item.name.toLowerCase().includes('pádel');
            const distance = calculateDistanceKm(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude).toFixed(1);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={styles.listClubCard}
                onPress={() => onNavigateClub(item.id)}
              >
                <View style={styles.listImageWrapper}>
                  <Image source={{ uri: item.images[0] }} style={styles.listCardImage} />
                  <View style={styles.listBadgeOverlay}>
                    <Text style={styles.listBadgeText}>{isPadel ? '🎾 PÁDEL' : '⚽ FÚTBOL'}</Text>
                  </View>
                </View>

                <View style={styles.listCardDetails}>
                  <View style={styles.listRowHeader}>
                    <Text style={styles.listClubTitle} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.listRatingBadge}>
                      <StarIcon size={11} fill="#fbbf24" color="#fbbf24" />
                      <Text style={styles.listRatingValue}>{item.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.listAddressRow}>
                    <MapPinIcon size={12} color="#9ca3af" strokeWidth={1.8} />
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
                        onPress={() => onNavigateClub(item.id)}
                      >
                        <Text style={styles.listSecBtnText}>Canchas</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.listPriBtn}
                        onPress={() => onNavigateCheckout(getActiveSlotForClub(item.id))}
                      >
                        <Text style={styles.listPriBtnText}>Reservar →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07080a' },
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
    backgroundColor: '#12151e',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#12151e',
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  toggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  toggleBtnActive: {
    backgroundColor: '#fc1c46',
  },
  toggleText: {
    color: '#9ca3af',
    fontSize: 11.5,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sportsScroll: {
    flexDirection: 'row',
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12151e',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  sportChipActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#fc1c46',
  },
  sportChipIcon: { fontSize: 12 },
  sportChipText: { color: '#9ca3af', fontSize: 11.5, fontFamily: fonts.medium },
  sportChipTextActive: { color: '#ffffff', fontFamily: fonts.bold },

  /* LIST VIEW STYLES */
  listScrollContent: {
    paddingTop: Platform.OS === 'ios' ? 150 : 120,
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  listHeaderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  listClubCard: {
    backgroundColor: '#12151e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
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
    fontWeight: '700',
    fontFamily: fonts.bold,
    flex: 1,
    marginRight: 8,
  },
  listRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  listRatingValue: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  listAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listAddressText: { color: '#9ca3af', fontSize: 12, flex: 1 },
  listDistanceSubtext: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  listFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  listButtonsGroup: { flexDirection: 'row', gap: 8 },
  listSecBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#1f2430',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listSecBtnText: { color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  listPriBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fc1c46',
  },
  listPriBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  /* MAP VIEW STYLES */
  mapControls: { position: 'absolute', right: 16, top: height * 0.42, zIndex: 50 },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#12151e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  markerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: '#12151e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  markerPillActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#ffffff',
    borderWidth: 1.5,
  },
  markerIcon: { fontSize: 12 },
  markerName: { color: '#f1f5f9', fontSize: 11, fontWeight: '700', maxWidth: 90 },
  markerNameActive: { color: '#ffffff' },
  markerPrice: {
    color: '#ff4d6d',
    fontSize: 10.5,
    fontWeight: '800',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  markerPriceActive: { color: '#ffffff' },
  bottomCardContainer: { position: 'absolute', bottom: 80, left: 14, right: 14, zIndex: 50 },
  clubPreviewCard: {
    backgroundColor: '#12151e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    elevation: 12,
  },
  cardImage: { width: 90, height: 90, borderRadius: 14, resizeMode: 'cover' },
  cardContent: { flex: 1, justifyContent: 'space-between' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clubTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', fontFamily: fonts.bold, flex: 1, marginRight: 6 },
  verClubLinkText: { color: '#fc1c46', fontSize: 11, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { color: '#9ca3af', fontSize: 11.5, fontFamily: fonts.regular, flex: 1 },
  clubMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clubRatingText: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },
  clubDotSeparator: { color: '#4b5563', fontSize: 10 },
  clubDistanceText: { color: '#9ca3af', fontSize: 11 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceSmallLabel: { color: '#6b7280', fontSize: 9, textTransform: 'uppercase' },
  priceCardValue: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  bookDirectButton: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fc1c46' },
  bookDirectButtonText: { color: '#ffffff', fontSize: 11.5, fontWeight: '700' },
});
