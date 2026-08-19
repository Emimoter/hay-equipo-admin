import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Image } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
import { mobileApi } from '../services/api';
import { TimeSlot, Club } from '@hay-equipo/contracts';

interface SearchMapScreenProps {
  initialSport?: string;
  onNavigateCheckout: (slot: TimeSlot) => void;
  onNavigateClub: (clubId: string) => void;
}

export const SearchMapScreen: React.FC<SearchMapScreenProps> = ({
  initialSport = 'PADEL',
  onNavigateCheckout,
  onNavigateClub
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [sport, setSport] = useState<string>(initialSport);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('20:00');
  const [onlyCovered, setOnlyCovered] = useState<boolean>(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedMapClub, setSelectedMapClub] = useState<Club | null>(null);

  useEffect(() => {
    fetchResults();
  }, [sport, timeFilter, onlyCovered]);

  const fetchResults = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [slotsData, clubsData] = await Promise.all([
      mobileApi.searchAvailability({ sport, date: today, timeFrom: timeFilter }),
      mobileApi.getClubs(sport)
    ]);
    setSlots(slotsData);
    setClubs(clubsData);
    if (clubsData.length > 0) setSelectedMapClub(clubsData[0]);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Zona, barrio o club (ej. Palermo, Urquiza)"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* View Mode Toggle: LISTA | MAPA */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'LIST' && styles.toggleBtnActive]}
            onPress={() => setViewMode('LIST')}
          >
            <Text style={[styles.toggleBtnText, viewMode === 'LIST' && styles.toggleBtnTextActive]}>📋 LISTA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'MAP' && styles.toggleBtnActive]}
            onPress={() => setViewMode('MAP')}
          >
            <Text style={[styles.toggleBtnText, viewMode === 'MAP' && styles.toggleBtnTextActive]}>🗺️ MAPA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <TouchableOpacity
          style={[styles.filterChip, sport === 'PADEL' && styles.filterChipActive]}
          onPress={() => setSport('PADEL')}
        >
          <Text style={[styles.filterChipText, sport === 'PADEL' && styles.filterChipTextActive]}>🎾 Pádel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, sport === 'FUTBOL_5' && styles.filterChipActive]}
          onPress={() => setSport('FUTBOL_5')}
        >
          <Text style={[styles.filterChipText, sport === 'FUTBOL_5' && styles.filterChipTextActive]}>⚽ Fútbol 5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, sport === 'FUTBOL_7' && styles.filterChipActive]}
          onPress={() => setSport('FUTBOL_7')}
        >
          <Text style={[styles.filterChipText, sport === 'FUTBOL_7' && styles.filterChipTextActive]}>⚽ Fútbol 7</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, timeFilter === '20:00' && styles.filterChipActive]}
          onPress={() => setTimeFilter(timeFilter === '20:00' ? '' : '20:00')}
        >
          <Text style={[styles.filterChipText, timeFilter === '20:00' && styles.filterChipTextActive]}>⏰ 20:00 en adelante</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, onlyCovered && styles.filterChipActive]}
          onPress={() => setOnlyCovered(!onlyCovered)}
        >
          <Text style={[styles.filterChipText, onlyCovered && styles.filterChipTextActive]}>🏠 Techada</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content Area: LIST or MAP */}
      {viewMode === 'LIST' ? (
        <FlatList
          data={slots}
          keyExtractor={(item, index) => `${item.courtId}-${item.startTime}-${index}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.slotListItem}>
              <View style={styles.slotItemHeader}>
                <View>
                  <Text style={styles.slotItemCourt}>{item.courtName}</Text>
                  <Text style={styles.slotItemClub}>📍 {item.clubName}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{item.startTime} – {item.endTime}</Text>
                </View>
              </View>

              <View style={styles.slotItemFooter}>
                <View>
                  <Text style={styles.priceLabel}>Precio total ({item.durationMinutes} min)</Text>
                  <Text style={styles.priceValue}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.fixedDiscountHint}>Turno fijo: {formatCurrency(item.fixedSlotPrice)}/partido</Text>
                </View>
                <TouchableOpacity style={styles.bookNowBtn} onPress={() => onNavigateCheckout(item)}>
                  <Text style={styles.bookNowBtnText}>Reservar ya</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎾</Text>
              <Text style={styles.emptyTitle}>No encontramos canchas disponibles</Text>
              <Text style={styles.emptySubtitle}>Probá cambiando la franja horaria o el deporte.</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          {/* Simulated Vector Map View with Dynamic Pins */}
          <View style={styles.simulatedMap}>
            <View style={styles.searchThisAreaFloatingBtn}>
              <Text style={styles.searchThisAreaText}>🔄 Buscar en esta zona</Text>
            </View>

            {/* Map Markers */}
            <View style={styles.mapMarkersContainer}>
              {clubs.map((c, i) => {
                const isSelected = selectedMapClub?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.mapMarkerPin, isSelected && styles.mapMarkerPinActive]}
                    onPress={() => setSelectedMapClub(c)}
                  >
                    <Text style={[styles.markerPrice, isSelected && styles.markerPriceActive]}>
                      {formatCurrency(c.minPrice)}
                    </Text>
                    <Text style={[styles.markerTime, isSelected && styles.markerTimeActive]}>21:00 hs</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Club Preview Card at bottom of map */}
          {selectedMapClub && (
            <View style={styles.mapPreviewCard}>
              <Image source={{ uri: selectedMapClub.images[0] }} style={styles.previewImage} />
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.previewTitle}>{selectedMapClub.name}</Text>
                  <Text style={styles.previewRating}>★ {selectedMapClub.rating}</Text>
                </View>
                <Text style={styles.previewAddress}>{selectedMapClub.address}</Text>
                <View style={styles.previewActionRow}>
                  <TouchableOpacity
                    style={styles.previewDetailsBtn}
                    onPress={() => onNavigateClub(selectedMapClub.id)}
                  >
                    <Text style={styles.previewDetailsBtnText}>Ver Canchas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.directionsBtn}>
                    <Text style={styles.directionsBtnText}>📍 Cómo llegar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  toggleBtnActive: {
    backgroundColor: colors.primary
  },
  toggleBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700'
  },
  toggleBtnTextActive: {
    color: colors.background
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 52
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
    alignSelf: 'center'
  },
  filterChipActive: {
    backgroundColor: colors.elevated,
    borderColor: colors.primary
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  listContent: {
    padding: 16
  },
  slotListItem: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 14
  },
  slotItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  slotItemCourt: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  slotItemClub: {
    color: colors.textSecondary,
    fontSize: 13
  },
  timeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  timeBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13
  },
  slotItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: 11
  },
  priceValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  fixedDiscountHint: {
    color: colors.neonAccent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  bookNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  bookNowBtnText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center'
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchThisAreaFloatingBtn: {
    position: 'absolute',
    top: 16,
    backgroundColor: colors.elevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  searchThisAreaText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  mapMarkersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    padding: 20
  },
  mapMarkerPin: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center'
  },
  mapMarkerPinActive: {
    backgroundColor: colors.primary,
    borderColor: colors.white
  },
  markerPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800'
  },
  markerPriceActive: {
    color: colors.background
  },
  markerTime: {
    color: colors.textMuted,
    fontSize: 10
  },
  markerTimeActive: {
    color: colors.background
  },
  mapPreviewCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    flexDirection: 'row'
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  previewRating: {
    color: '#FACC15',
    fontWeight: '700',
    fontSize: 12
  },
  previewAddress: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 8
  },
  previewDetailsBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  previewDetailsBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12
  },
  directionsBtn: {
    backgroundColor: colors.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  directionsBtnText: {
    color: colors.textPrimary,
    fontSize: 12
  }
});
