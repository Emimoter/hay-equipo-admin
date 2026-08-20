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
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { colors, formatCurrency } from '../components/theme';
import { mobileApi } from '../services/api';
import { TimeSlot, Club } from '@hay-equipo/contracts';

const { width, height } = Dimensions.get('window');

// Default coordinates: Palermo, Buenos Aires
const DEFAULT_LATITUDE = -34.5885;
const DEFAULT_LONGITUDE = -58.4350;

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
  const webViewRef = useRef<WebView | null>(null);
  const [sport, setSport] = useState<string>(initialSport);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('20:00');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });

  // Request real GPS Location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserCoords(newCoords);

        // Update webview map position and user marker
        sendCoordsToMap(newCoords.latitude, newCoords.longitude, 15);
      }
    } catch (e) {
      console.log('Location request error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [sport, timeFilter, userCoords]);

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs(sport),
      mobileApi.searchAvailability({ sport, date: today, timeFrom: timeFilter }),
    ]);

    // Adapt club coordinates so there are always clubs around the user's current GPS location
    const adaptedClubs = clubsData.map((c, i) => {
      const offsets = [
        { lat: 0.005, lng: -0.006 },
        { lat: 0.009, lng: 0.007 },
        { lat: -0.006, lng: 0.008 },
        { lat: -0.008, lng: -0.005 },
      ];
      const offset = offsets[i % offsets.length];
      return {
        ...c,
        latitude: userCoords.latitude + offset.lat,
        longitude: userCoords.longitude + offset.lng,
      };
    });

    setClubs(adaptedClubs);
    setAvailableSlots(slotsData);

    if (adaptedClubs.length > 0 && !selectedClub) {
      setSelectedClub(adaptedClubs[0]);
    }

    updateMapMarkers(adaptedClubs, selectedClub?.id || adaptedClubs[0]?.id);
  };

  const getActiveSlotForClub = (clubId: string) => {
    return availableSlots.find(s => s.clubId === clubId) || availableSlots[0];
  };

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    sendCoordsToMap(club.latitude, club.longitude, 16);
    updateMapMarkers(clubs, club.id);
  };

  const centerOnUser = () => {
    sendCoordsToMap(userCoords.latitude, userCoords.longitude, 15);
  };

  const sendCoordsToMap = (lat: number, lng: number, zoom = 15) => {
    if (webViewRef.current) {
      const script = `
        if (window.map) {
          window.map.flyTo([${lat}, ${lng}], ${zoom}, { animate: true, duration: 1.0 });
          if (window.userMarker) {
            window.userMarker.setLatLng([${userCoords.latitude}, ${userCoords.longitude}]);
          }
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const updateMapMarkers = (clubsList: Club[], activeId?: string) => {
    if (webViewRef.current) {
      const dataStr = JSON.stringify(
        clubsList.map(c => ({
          id: c.id,
          name: c.name,
          lat: c.latitude,
          lng: c.longitude,
          price: c.minPrice,
          sport: c.name.toLowerCase().includes('padel') ? '🎾' : '⚽',
          isActive: c.id === activeId,
        }))
      );

      const script = `
        if (window.setClubMarkers) {
          window.setClubMarkers(${dataStr});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_CLUB') {
        const found = clubs.find(c => c.id === data.clubId);
        if (found) {
          setSelectedClub(found);
          updateMapMarkers(clubs, found.id);
        }
      } else if (data.type === 'MAP_READY') {
        updateMapMarkers(clubs, selectedClub?.id);
        sendCoordsToMap(userCoords.latitude, userCoords.longitude, 15);
      }
    } catch (err) {
      console.log('Error parsing webview message:', err);
    }
  };

  // Leaflet Dark Mode Real Map HTML Template
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body, #map { width: 100%; height: 100%; background: #07080a; }
          
          /* Custom User Pulse Pin */
          .user-pulse-marker {
            position: relative;
            width: 44px;
            height: 44px;
          }
          .user-pulse-ring {
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(252, 28, 70, 0.35);
            border: 1.5px solid #fc1c46;
            animation: pulse 2s infinite ease-out;
          }
          .user-dot {
            position: absolute;
            top: 12px;
            left: 12px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #fc1c46;
            border: 3px solid #ffffff;
            box-shadow: 0 0 14px rgba(252, 28, 70, 0.9);
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.9); opacity: 0; }
          }

          /* Club Price Badges */
          .custom-pin-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: translate(-50%, -100%);
          }
          .custom-pin-pill {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 11px;
            border-radius: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(0,0,0,0.7);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .custom-pin-pill.inactive {
            background: #141720;
            color: #f0f2f5;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .custom-pin-pill.active {
            background: #fc1c46;
            color: #ffffff;
            border: 1.5px solid #ffffff;
            box-shadow: 0 0 18px rgba(252, 28, 70, 0.9), 0 4px 14px rgba(0,0,0,0.7);
            transform: scale(1.14);
          }
          .custom-pin-arrow {
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid #141720;
          }
          .custom-pin-arrow.active {
            border-top-color: #fc1c46;
          }
          
          /* Hide Leaflet default controls to fit our custom floating UI */
          .leaflet-control-container .leaflet-top,
          .leaflet-control-container .leaflet-bottom {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize Real Dark Map
          var map = L.map('map', {
            center: [${userCoords.latitude}, ${userCoords.longitude}],
            zoom: 15,
            zoomControl: false,
            attributionControl: false
          });

          // High Resolution Real Dark Street Tiles (CartoDB Dark Matter)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);

          // User Pulse Marker
          var userIcon = L.divIcon({
            className: 'user-marker-icon',
            html: '<div class="user-pulse-marker"><div class="user-pulse-ring"></div><div class="user-dot"></div></div>',
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          });
          var userMarker = L.marker([${userCoords.latitude}, ${userCoords.longitude}], { icon: userIcon, zIndexOffset: 500 }).addTo(map);

          // Dynamic Club Markers Group
          var clubsLayerGroup = L.layerGroup().addTo(map);

          window.setClubMarkers = function(clubsData) {
            clubsLayerGroup.clearLayers();
            clubsData.forEach(function(club) {
              var isAct = club.isActive;
              var html = '<div class="custom-pin-container" onclick="selectClub(\\'' + club.id + '\\')">' +
                '<div class="custom-pin-pill ' + (isAct ? 'active' : 'inactive') + '">' +
                  '<span>' + club.sport + '</span>' +
                  '<span>$' + club.price.toLocaleString('es-AR') + '</span>' +
                '</div>' +
                '<div class="custom-pin-arrow ' + (isAct ? 'active' : 'inactive') + '"></div>' +
              '</div>';

              var icon = L.divIcon({
                className: 'club-custom-icon',
                html: html,
                iconSize: [90, 40],
                iconAnchor: [45, 40]
              });

              var m = L.marker([club.lat, club.lng], { 
                icon: icon, 
                zIndexOffset: isAct ? 1000 : 100 
              });
              
              m.on('click', function() {
                selectClub(club.id);
              });
              
              clubsLayerGroup.addLayer(m);
            });
          };

          function selectClub(clubId) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SELECT_CLUB',
                clubId: clubId
              }));
            }
          }

          // Notify React Native that map is ready
          setTimeout(function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
            }
          }, 300);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* ═══════════════════════════════════════════════════════
          REAL INTERACTIVE DARK MODE MAP ENGINE (HYBRID)
          ═══════════════════════════════════════════════════════ */}
      <View style={StyleSheet.absoluteFillObject}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webViewMap}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
        />
      </View>

      {/* Floating Map Controls (Right Side) */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.mapBtn}
          onPress={() => {
            requestUserLocation();
            centerOnUser();
          }}
        >
          <Text style={{ fontSize: 18 }}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.mapBtn}
          onPress={() => {
            if (clubs.length > 0) {
              const nextIndex =
                (clubs.findIndex(c => c.id === selectedClub?.id) + 1) %
                clubs.length;
              handleSelectClub(clubs[nextIndex]);
            }
          }}
        >
          <Text style={{ fontSize: 18 }}>🎯</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Top Pill: "Buscar en esta zona" */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.searchThisAreaBtn}
        onPress={() => loadData()}
      >
        <Text style={styles.searchThisAreaText}>🔄 Buscar en esta zona</Text>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════
          FLOATING TOP SEARCH BAR & SPORT FILTERS
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.topFloatingHeader}>
        {/* Search Input Bar with Lupita */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconBox}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="7" stroke="#fc1c46" strokeWidth={2.5} />
                <Line
                  x1="16.5"
                  y1="16.5"
                  x2="21.5"
                  y2="21.5"
                  stroke="#fc1c46"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar club, barrio o zona..."
              placeholderTextColor="#8b92a0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={{ color: '#8b92a0', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.filterIconButton}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Line x1="4" y1="6" x2="20" y2="6" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                  <Line x1="8" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                  <Line x1="12" y1="18" x2="20" y2="18" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </View>
            )}
          </View>
        </View>

        {/* Sport Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <TouchableOpacity
            style={[styles.filterPill, sport === 'PADEL' && styles.filterPillActive]}
            onPress={() => setSport('PADEL')}
          >
            <Text style={styles.filterPillIcon}>🎾</Text>
            <Text
              style={[
                styles.filterPillText,
                sport === 'PADEL' && styles.filterPillTextActive,
              ]}
            >
              Pádel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, sport === 'FUTBOL_5' && styles.filterPillActive]}
            onPress={() => setSport('FUTBOL_5')}
          >
            <Text style={styles.filterPillIcon}>⚽</Text>
            <Text
              style={[
                styles.filterPillText,
                sport === 'FUTBOL_5' && styles.filterPillTextActive,
              ]}
            >
              Fútbol 5
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, sport === 'TENIS' && styles.filterPillActive]}
            onPress={() => setSport('TENIS')}
          >
            <Text style={styles.filterPillIcon}>🎾</Text>
            <Text
              style={[
                styles.filterPillText,
                sport === 'TENIS' && styles.filterPillTextActive,
              ]}
            >
              Tenis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, sport === 'BASQUET' && styles.filterPillActive]}
            onPress={() => setSport('BASQUET')}
          >
            <Text style={styles.filterPillIcon}>🏀</Text>
            <Text
              style={[
                styles.filterPillText,
                sport === 'BASQUET' && styles.filterPillTextActive,
              ]}
            >
              Básquet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, timeFilter === '20:00' && styles.filterPillActive]}
            onPress={() => setTimeFilter(timeFilter === '20:00' ? '' : '20:00')}
          >
            <Text style={styles.filterPillIcon}>⏰</Text>
            <Text
              style={[
                styles.filterPillText,
                timeFilter === '20:00' && styles.filterPillTextActive,
              ]}
            >
              20:00 hs
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ═══════════════════════════════════════════════════════
          FLOATING BOTTOM CARD: "CERCA DE VOS" (Exact Reference)
          ═══════════════════════════════════════════════════════ */}
      {selectedClub && (
        <View style={styles.bottomCardWrapper}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Cerca de vos</Text>
            <TouchableOpacity onPress={() => onNavigateClub(selectedClub.id)}>
              <Text style={styles.viewMoreText}>Ver club →</Text>
            </TouchableOpacity>
          </View>

          {/* Club Obsidian Card */}
          <View style={styles.clubCard}>
            <View style={styles.cardTopRow}>
              {/* Club Logo / Crimson Icon Box */}
              <View style={styles.clubLogoBox}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="3" width="18" height="18" rx="4" stroke="#fc1c46" strokeWidth={2} />
                  <Line x1="12" y1="3" x2="12" y2="21" stroke="#fc1c46" strokeWidth={1.5} />
                  <Line x1="3" y1="12" x2="21" y2="12" stroke="#fc1c46" strokeWidth={1.5} />
                  <Circle cx="12" cy="12" r="3" stroke="#fc1c46" strokeWidth={1.5} />
                </Svg>
              </View>

              {/* Title & Location Info */}
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.clubCardTitle} numberOfLines={1}>
                    {selectedClub.name}
                  </Text>
                  <View style={styles.fixedSlotBadge}>
                    <Text style={styles.fixedSlotBadgeText}>Turno fijo</Text>
                  </View>
                </View>

                <Text style={styles.clubCardAddress} numberOfLines={1}>
                  📍 {selectedClub.address}
                </Text>

                <View style={styles.clubMetaRow}>
                  <Text style={styles.clubRatingText}>★ {selectedClub.rating}</Text>
                  <Text style={styles.clubDotSeparator}>·</Text>
                  <Text style={styles.clubDistanceText}>a 0.8 km</Text>
                  <Text style={styles.clubDotSeparator}>·</Text>
                  <Text style={styles.clubTimeSlotText}>Hoy 20:30 hs</Text>
                </View>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.priceSmallLabel}>Desde</Text>
                <Text style={styles.priceCardValue}>
                  {formatCurrency(selectedClub.minPrice)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.viewCourtsButton}
                  onPress={() => onNavigateClub(selectedClub.id)}
                >
                  <Text style={styles.viewCourtsButtonText}>Canchas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bookDirectButton}
                  onPress={() => {
                    const slot = getActiveSlotForClub(selectedClub.id);
                    onNavigateCheckout(slot);
                  }}
                >
                  <Text style={styles.bookDirectButtonText}>Reservar →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080a',
  },
  webViewMap: {
    flex: 1,
    backgroundColor: '#07080a',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: height * 0.42,
    gap: 10,
    zIndex: 50,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 22, 31, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  searchThisAreaBtn: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 22, 28, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 50,
  },
  searchThisAreaText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  topFloatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 8,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 22, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  searchIconBox: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '500',
  },
  filterIconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#232733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 22, 28, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingVertical: 7,
    paddingHorizontal: 13,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.16)',
    borderColor: '#fc1c46',
  },
  filterPillIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  filterPillText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 84,
    left: 14,
    right: 14,
    zIndex: 40,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  viewMoreText: {
    color: '#fc1c46',
    fontSize: 12,
    fontWeight: '600',
  },
  clubCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubCardTitle: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
    maxWidth: '70%',
  },
  fixedSlotBadge: {
    backgroundColor: '#fc1c46',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  fixedSlotBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  clubCardAddress: {
    color: '#8b92a0',
    fontSize: 11.5,
    marginTop: 2,
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clubRatingText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
  },
  clubDotSeparator: {
    color: '#4b5563',
    marginHorizontal: 4,
  },
  clubDistanceText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  clubTimeSlotText: {
    color: '#fc1c46',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  priceSmallLabel: {
    color: '#6b7280',
    fontSize: 9.5,
    textTransform: 'uppercase',
  },
  priceCardValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewCourtsButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#202430',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewCourtsButtonText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  bookDirectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fc1c46',
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  bookDirectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
