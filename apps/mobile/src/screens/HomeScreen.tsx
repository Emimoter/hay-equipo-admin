import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Club, TimeSlot } from '@hay-equipo/contracts';

interface HomeScreenProps {
  onNavigateSearch: (sport?: string) => void;
  onNavigateClub: (clubId: string) => void;
  onNavigateCheckout: (slot: TimeSlot) => void;
  onNavigateFixedSlots: () => void;
  onNavigateProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateSearch,
  onNavigateClub,
  onNavigateCheckout,
  onNavigateFixedSlots,
  onNavigateProfile
}) => {
  const { userProfile, user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('PADEL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'HOY' | 'MANANA' | 'FINDE'>('HOY');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHomeData();
  }, [selectedSport, selectedDateFilter]);

  const loadHomeData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs(selectedSport),
      mobileApi.searchAvailability({ sport: selectedSport, date: today, timeFrom: '18:00' })
    ]);
    setClubs(clubsData);
    setAvailableSlots(slotsData);
    setLoading(false);
  };

  const sportsList = [
    { id: 'PADEL', name: 'Pádel', icon: '🎾' },
    { id: 'FUTBOL_5', name: 'Fútbol 5', icon: '⚽' },
    { id: 'FUTBOL_7', name: 'Fútbol 7', icon: '⚽' },
    { id: 'FUTBOL_8', name: 'Fútbol 8', icon: '⚽' },
    { id: 'FUTBOL_11', name: 'Fútbol 11', icon: '⚽' },
    { id: 'TENIS', name: 'Tenis', icon: '🎾' }
  ];

  const displayName = userProfile?.displayName || user?.displayName || 'Emiliano';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {displayName.split(' ')[0]}! 👋</Text>
          <Text style={typography.titleLarge}>¿Dónde querés jugar?</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={onNavigateProfile}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileBadgeText}>{displayName.charAt(0)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sport Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
        {sportsList.map(sport => {
          const isSelected = selectedSport === sport.id;
          return (
            <TouchableOpacity
              key={sport.id}
              style={[styles.sportChip, isSelected && styles.sportChipActive]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={[styles.sportName, isSelected && styles.sportNameActive]}>{sport.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quick Search Bar */}
      <TouchableOpacity style={styles.searchBarContainer} onPress={() => onNavigateSearch(selectedSport)}>
        <View style={styles.searchIconBox}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchPlaceholder}>Buscar por zona o club...</Text>
          <Text style={styles.searchSub}>Palermo · Hoy · 20:00 en adelante</Text>
        </View>
        <View style={styles.filterPill}>
          <Text style={styles.filterPillText}>Filtros</Text>
        </View>
      </TouchableOpacity>

      {/* Turno Fijo Banner */}
      <TouchableOpacity style={styles.fixedSlotBanner} onPress={onNavigateFixedSlots}>
        <View style={styles.fixedSlotBadge}>
          <Text style={styles.fixedSlotBadgeText}>TURNO FIJO SEMANAL</Text>
        </View>
        <Text style={styles.fixedSlotTitle}>Asegurá tu cancha todas las semanas</Text>
        <Text style={styles.fixedSlotSubtitle}>Descuentos de hasta 15% + renovación automática con tu grupo.</Text>
        <View style={styles.fixedSlotAction}>
          <Text style={styles.fixedSlotActionText}>Ver opciones fijas →</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Date Chips */}
      <View style={styles.dateChipsRow}>
        {(['HOY', 'MANANA', 'FINDE'] as const).map(dateKey => {
          const isSelected = selectedDateFilter === dateKey;
          const labels = { HOY: 'Hoy', MANANA: 'Mañana', FINDE: 'Fin de semana' };
          return (
            <TouchableOpacity
              key={dateKey}
              style={[styles.dateChip, isSelected && styles.dateChipActive]}
              onPress={() => setSelectedDateFilter(dateKey)}
            >
              <Text style={[styles.dateChipText, isSelected && styles.dateChipTextActive]}>{labels[dateKey]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section: Disponibles para jugar hoy (Direct Available Slots) */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={typography.titleMedium}>Para jugar hoy</Text>
          <Text style={typography.bodyMuted}>Turnos libres en las próximas horas</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateSearch(selectedSport)}>
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : availableSlots.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay turnos libres inmediatos para este filtro.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
          {availableSlots.slice(0, 5).map((slot, idx) => (
            <TouchableOpacity key={idx} style={styles.slotCard} onPress={() => onNavigateCheckout(slot)}>
              <View style={styles.slotTimeBadge}>
                <Text style={styles.slotTimeText}>{slot.startTime} – {slot.endTime}</Text>
              </View>
              <Text style={styles.slotCourtName} numberOfLines={1}>{slot.courtName}</Text>
              <Text style={styles.slotClubName} numberOfLines={1}>{slot.clubName}</Text>
              <View style={styles.slotPriceRow}>
                <Text style={styles.slotPrice}>{formatCurrency(slot.price)}</Text>
                <View style={styles.reserveButton}>
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Section: Clubes destacados */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={typography.titleMedium}>Clubes cerca tuyo</Text>
          <Text style={typography.bodyMuted}>Complejos con mejores instalaciones</Text>
        </View>
      </View>

      {clubs.map(club => (
        <TouchableOpacity key={club.id} style={styles.clubCard} onPress={() => onNavigateClub(club.id)}>
          <Image source={{ uri: club.images[0] }} style={styles.clubImage} />
          <View style={styles.clubInfo}>
            <View style={styles.clubHeaderRow}>
              <Text style={styles.clubName}>{club.name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {club.rating}</Text>
              </View>
            </View>
            <Text style={styles.clubAddress}>📍 {club.address} · {club.city}</Text>
            <View style={styles.amenitiesRow}>
              {club.amenities.covered && <Text style={styles.amenityTag}>Techada</Text>}
              {club.amenities.parking && <Text style={styles.amenityTag}>Estacionamiento</Text>}
              {club.amenities.buffet && <Text style={styles.amenityTag}>Buffet</Text>}
            </View>
            <View style={styles.clubFooterRow}>
              <Text style={styles.priceStartingText}>Desde {formatCurrency(club.minPrice)}</Text>
              <Text style={styles.viewCourtsLink}>Ver canchas →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Volvé a jugar (Repeat booking) */}
      <View style={styles.repeatBookingCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.repeatBadge}>VOLVÉ A JUGAR</Text>
          <Text style={styles.repeatTitle}>Pádel · Jueves 19:30 hs</Text>
          <Text style={styles.repeatSubtitle}>Arena Pádel Palermo · Cancha 1</Text>
        </View>
        <TouchableOpacity
          style={styles.repeatButton}
          onPress={() => onNavigateSearch('PADEL')}
        >
          <Text style={styles.repeatButtonText}>Repetir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: {
    ...typography.subtitle,
    marginBottom: 4
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1.5,
    borderColor: '#fc1c46',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  profileImage: {
    width: '100%',
    height: '100%'
  },
  profileBadgeText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 18
  },
  sportsScroll: {
    marginBottom: 16
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  sportChipActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#fc1c46'
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 6
  },
  sportName: {
    ...typography.caption,
    color: colors.textPrimary
  },
  sportNameActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16
  },
  searchIconBox: {
    marginRight: 10
  },
  searchPlaceholder: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  searchSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  filterPill: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  filterPillText: {
    color: '#fc1c46',
    fontSize: 12,
    fontWeight: '700'
  },
  fixedSlotBanner: {
    backgroundColor: 'rgba(252, 28, 70, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)'
  },
  fixedSlotBadge: {
    backgroundColor: '#fc1c46',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8
  },
  fixedSlotBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800'
  },
  fixedSlotTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  fixedSlotSubtitle: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 10
  },
  fixedSlotAction: {
    alignSelf: 'flex-start'
  },
  fixedSlotActionText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 13
  },
  dateChipsRow: {
    flexDirection: 'row',
    marginBottom: 20
  },
  dateChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  dateChipActive: {
    backgroundColor: colors.elevated,
    borderColor: colors.primary
  },
  dateChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500'
  },
  dateChipTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 6
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  slotsScroll: {
    marginBottom: 24
  },
  slotCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    width: 210,
    marginRight: 12
  },
  slotTimeBadge: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  slotTimeText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 13
  },
  slotCourtName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  slotClubName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12
  },
  slotPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8
  },
  slotPrice: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14
  },
  reserveButton: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3
  },
  reserveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16
  },
  clubImage: {
    width: '100%',
    height: 140
  },
  clubInfo: {
    padding: 14
  },
  clubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700'
  },
  ratingBadge: {
    backgroundColor: '#3B371E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ratingText: {
    color: '#FACC15',
    fontWeight: '700',
    fontSize: 12
  },
  clubAddress: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  amenityTag: {
    backgroundColor: colors.elevated,
    color: colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  clubFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10
  },
  priceStartingText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  viewCourtsLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13
  },
  emptyCard: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  repeatBookingCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  repeatBadge: {
    color: colors.neonAccent,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4
  },
  repeatTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  repeatSubtitle: {
    color: colors.textSecondary,
    fontSize: 12
  },
  repeatButton: {
    backgroundColor: colors.elevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary
  },
  repeatButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13
  }
});
