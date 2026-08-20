import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
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
  onNavigateProfile,
}) => {
  const { userProfile, user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs('PADEL'),
      mobileApi.searchAvailability({ date: today, timeFrom: '18:00' }),
    ]);
    setClubs(clubsData);
    setAvailableSlots(slotsData);
    setLoading(false);
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Emiliano';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ═══════════════════════════════════════════════════════
          HEADER: BUSCADOR CON LUPITA Y PERFIL
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => onNavigateSearch()}
        >
          <View style={styles.searchIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
          <View style={{ flex: 1 }}>
            <Text style={styles.searchPlaceholder}>Buscar club, zona o cancha...</Text>
            <Text style={styles.searchSub}>Palermo, Belgrano, Caballito · Hoy</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>Filtros</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={onNavigateProfile}
          activeOpacity={0.8}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileBadgeText}>{displayName.charAt(0)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════
          OFERTA / ANUNCIO: TURNO FIJO SEMANAL
          ═══════════════════════════════════════════════════════ */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.offerBanner}
        onPress={onNavigateFixedSlots}
      >
        <View style={styles.offerHeaderRow}>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>🔥 15% OFF SEMANAL</Text>
          </View>
          <Text style={styles.offerTag}>OFERTA EXCLUSIVA</Text>
        </View>

        <Text style={styles.offerTitle}>Asegurá tu Cancha Fija Todas las Semanas</Text>
        <Text style={styles.offerSubtitle}>
          Mismo día y horario reservado automáticamente con tu grupo. Descuentos especiales y sin señas manuales.
        </Text>

        <View style={styles.offerCtaRow}>
          <View style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Aprovechar turno fijo →</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════
          SECTION: PARA JUGAR HOY (TURNOS LIBRES INMEDIATOS)
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={typography.titleMedium}>Para jugar hoy</Text>
          <Text style={typography.bodyMuted}>Turnos libres en las próximas horas</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateSearch()}>
          <Text style={styles.seeAllText}>Ver todos →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 24 }} />
      ) : availableSlots.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay turnos libres inmediatos para hoy.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.slotsScroll}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {availableSlots.slice(0, 5).map((slot, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.slotCard}
              onPress={() => onNavigateCheckout(slot)}
              activeOpacity={0.85}
            >
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

      {/* ═══════════════════════════════════════════════════════
          SECTION: CLUBES CERCA TUYO
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={typography.titleMedium}>Clubes cerca tuyo</Text>
          <Text style={typography.bodyMuted}>Complejos con mejores instalaciones</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateSearch()}>
          <Text style={styles.seeAllText}>Ver mapa →</Text>
        </TouchableOpacity>
      </View>

      {clubs.map(club => (
        <TouchableOpacity
          key={club.id}
          style={styles.clubCard}
          onPress={() => onNavigateClub(club.id)}
          activeOpacity={0.85}
        >
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 22, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIconBox: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  searchSub: {
    color: colors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  filterPill: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterPillText: {
    color: '#fc1c46',
    fontSize: 11.5,
    fontWeight: '700',
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
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileBadgeText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 18,
  },
  offerBanner: {
    backgroundColor: 'rgba(252, 28, 70, 0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerBadge: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  offerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  offerTag: {
    color: '#fc1c46',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  offerSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  offerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerButton: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: '#fc1c46',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  offerButtonText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 4,
  },
  seeAllText: {
    color: '#fc1c46',
    fontSize: 13,
    fontWeight: '700',
  },
  slotsScroll: {
    marginBottom: 24,
  },
  slotCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    width: 210,
    marginRight: 12,
  },
  slotTimeBadge: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  slotTimeText: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 13,
  },
  slotCourtName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  slotClubName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  slotPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  slotPrice: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
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
    elevation: 3,
  },
  reserveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
  },
  clubImage: {
    width: '100%',
    height: 140,
  },
  clubInfo: {
    padding: 14,
  },
  clubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  ratingBadge: {
    backgroundColor: '#3B371E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FACC15',
    fontWeight: '700',
    fontSize: 12,
  },
  clubAddress: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: colors.elevated,
    color: colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clubFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  priceStartingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  viewCourtsLink: {
    color: '#fc1c46',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
