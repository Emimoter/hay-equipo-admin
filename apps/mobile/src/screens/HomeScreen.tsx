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
import Svg, { Circle, Line, Rect, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { colors, fonts, formatCurrency } from '../components/theme';
import {
  PadelIcon,
  FootballIcon,
  TennisIcon,
  PickleballIcon,
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  UsersIcon,
  RepeatIcon,
  RoofIcon,
  ParkingIcon,
  CoffeeIcon,
  ClockIcon,
} from '../components/AppIcons';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRealUserLocation, UserLocationState, DEFAULT_LOCATION } from '../services/location';
import { QuickBookingFinderModal } from '../components/QuickBookingFinderModal';
import { Club, TimeSlot } from '@hay-equipo/contracts';

interface HomeScreenProps {
  onNavigateSearch: (sport?: string) => void;
  onNavigateClub: (clubId: string) => void;
  onNavigateCheckout: (slot: TimeSlot) => void;
  onNavigateFixedSlots: () => void;
  onNavigateProfile: () => void;
}

const SPORTS_CATEGORIES = [
  { id: 'PADEL', label: 'Pádel', Icon: PadelIcon },
  { id: 'FUTBOL', label: 'Fútbol 5', Icon: FootballIcon },
  { id: 'TENIS', label: 'Tenis', Icon: TennisIcon },
  { id: 'PICKLEBALL', label: 'Pickleball', Icon: PickleballIcon },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateSearch,
  onNavigateClub,
  onNavigateCheckout,
  onNavigateFixedSlots,
  onNavigateProfile,
}) => {
  const { userProfile, user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('PADEL');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);
  const [showQuickFinder, setShowQuickFinder] = useState<boolean>(false);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    const loc = await getRealUserLocation();
    setUserLocation(loc);
  };

  useEffect(() => {
    loadHomeData(selectedSport);
  }, [selectedSport]);

  const loadHomeData = async (sport: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [clubsData, slotsData] = await Promise.all([
      mobileApi.getClubs(sport),
      mobileApi.searchAvailability({ date: today, timeFrom: '18:00', sport }),
    ]);
    setClubs(clubsData);
    setAvailableSlots(slotsData);
    setLoading(false);
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Emiliano';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* ═══════════════════════════════════════════════════════
          HEADER: BUSCADOR PROFESIONAL Y PERFIL
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => setShowQuickFinder(true)}
        >
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
          <View style={{ flex: 1 }}>
            <Text style={styles.searchPlaceholder}>Encontrar cancha</Text>
            <Text style={styles.searchSub}>
              {userLocation.formattedLocation || 'Mar del Plata, Buenos Aires'} · Búsqueda rápida
            </Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>Buscar →</Text>
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
          SELECTOR DE DEPORTES (ICONOS VECTORIALES SVG)
          ═══════════════════════════════════════════════════════ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsScroll}
        contentContainerStyle={styles.sportsScrollContent}
      >
        {SPORTS_CATEGORIES.map((sport) => {
          const isActive = selectedSport === sport.id;
          const IconComp = sport.Icon;
          return (
            <TouchableOpacity
              key={sport.id}
              activeOpacity={0.8}
              style={[styles.sportPill, isActive && styles.sportPillActive]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <IconComp size={15} color={isActive ? '#fc1c46' : '#94a3b8'} strokeWidth={2} />
              <Text style={[styles.sportLabel, isActive && styles.sportLabelActive]}>
                {sport.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════
          BANNER DESTACADO: TURNO FIJO SEMANAL (PREMIUM)
          ═══════════════════════════════════════════════════════ */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.offerBanner}
        onPress={onNavigateFixedSlots}
      >
        {/* Glow de fondo y perspectiva vectorial de cancha */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 360 220" preserveAspectRatio="none">
            <Defs>
              <RadialGradient id="bannerGlow" cx="90%" cy="15%" r="80%">
                <Stop offset="0%" stopColor="#fc1c46" stopOpacity="0.25" />
                <Stop offset="55%" stopColor="#fc1c46" stopOpacity="0.05" />
                <Stop offset="100%" stopColor="#fc1c46" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="meshLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#fc1c46" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bannerGlow)" />
            <Path
              d="M 200,0 L 360,120 M 260,0 L 360,75 M 150,0 L 360,165"
              stroke="url(#meshLineGrad)"
              strokeWidth="1.2"
            />
            <Circle cx="320" cy="45" r="48" stroke="rgba(252, 28, 70, 0.09)" strokeWidth="1.5" fill="none" />
          </Svg>
        </View>

        {/* Encabezado del banner */}
        <View style={styles.offerHeaderRow}>
          <View style={styles.offerBadge}>
            <View style={styles.offerLiveDot} />
            <Text style={styles.offerBadgeText}>TURNO FIJO SEMANAL</Text>
          </View>
          <View style={styles.discountPill}>
            <Text style={styles.discountPillText}>-15% OFF</Text>
          </View>
        </View>

        {/* Título y descripción */}
        <Text style={styles.offerTitle}>Asegurá tu Cancha Fija</Text>
        <Text style={styles.offerSubtitle}>
          Mismo día y horario garantizado cada semana para tu grupo, sin señas manuales.
        </Text>

        {/* Micro-Chips con iconos vectoriales */}
        <View style={styles.offerPerksRow}>
          <View style={styles.offerPerkChip}>
            <CalendarIcon size={12} color="#cbd5e1" strokeWidth={2} />
            <Text style={styles.offerPerkText}>Horario fijo</Text>
          </View>
          <View style={styles.offerPerkChip}>
            <UsersIcon size={12} color="#cbd5e1" strokeWidth={2} />
            <Text style={styles.offerPerkText}>Pago dividido</Text>
          </View>
          <View style={styles.offerPerkChip}>
            <RepeatIcon size={12} color="#cbd5e1" strokeWidth={2} />
            <Text style={styles.offerPerkText}>Renovación auto</Text>
          </View>
        </View>

        {/* Botón CTA */}
        <View style={styles.offerCtaRow}>
          <View style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Reservar turno recurrente</Text>
            <View style={styles.offerButtonIconCircle}>
              <Text style={styles.offerButtonArrow}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════
          SECTION: PARA JUGAR HOY (TURNOS LIBRES INMEDIATOS)
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Para jugar hoy</Text>
          <Text style={styles.sectionSubtitle}>Turnos libres en las próximas horas</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateSearch(selectedSport)} activeOpacity={0.7}>
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
          {availableSlots.slice(0, 6).map((slot, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.slotCard}
              onPress={() => onNavigateCheckout(slot)}
              activeOpacity={0.88}
            >
              {/* Badge de Horario */}
              <View style={styles.slotTimeBadge}>
                <ClockIcon size={12} color="#fc1c46" strokeWidth={2.2} />
                <Text style={styles.slotTimeText}>{slot.startTime} – {slot.endTime}</Text>
              </View>

              <Text style={styles.slotCourtName} numberOfLines={1}>
                {slot.courtName}
              </Text>
              
              <View style={styles.slotClubRow}>
                <MapPinIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
                <Text style={styles.slotClubName} numberOfLines={1}>
                  {slot.clubName}
                </Text>
              </View>

              <View style={styles.slotPriceRow}>
                <View>
                  <Text style={styles.slotPriceLabel}>Por jugador</Text>
                  <Text style={styles.slotPrice}>{formatCurrency(slot.price)}</Text>
                </View>
                <View style={styles.reserveButton}>
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION: CLUBES DESTACADOS CERCA TUYO
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Clubes cerca tuyo</Text>
          <Text style={styles.sectionSubtitle}>Complejos con mejores instalaciones</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateSearch(selectedSport)} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Ver mapa →</Text>
        </TouchableOpacity>
      </View>

      {clubs.map((club) => (
        <TouchableOpacity
          key={club.id}
          style={styles.clubCard}
          onPress={() => onNavigateClub(club.id)}
          activeOpacity={0.9}
        >
          <View style={styles.clubImageContainer}>
            <Image source={{ uri: club.images[0] }} style={styles.clubImage} />
            <View style={styles.clubImageOverlay} />
            
            {/* Badges superiores sobre la foto con iconos SVG */}
            <View style={styles.clubFloatingBadgeRow}>
              <View style={styles.clubSportTag}>
                {selectedSport === 'PADEL' ? (
                  <PadelIcon size={12} color="#f8fafc" strokeWidth={2} />
                ) : selectedSport === 'FUTBOL' ? (
                  <FootballIcon size={12} color="#f8fafc" strokeWidth={2} />
                ) : (
                  <TennisIcon size={12} color="#f8fafc" strokeWidth={2} />
                )}
                <Text style={styles.clubSportTagText}>
                  {selectedSport === 'PADEL' ? 'PÁDEL' : selectedSport === 'FUTBOL' ? 'FÚTBOL' : 'TENIS'}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <StarIcon size={11} fill="#FACC15" color="#FACC15" />
                <Text style={styles.ratingText}>{club.rating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.clubInfo}>
            <View style={styles.clubHeaderRow}>
              <Text style={styles.clubName}>{club.name}</Text>
            </View>

            <View style={styles.clubLocationRow}>
              <MapPinIcon size={13} color={colors.textSecondary} strokeWidth={1.8} />
              <Text style={styles.clubAddress}>{club.address} · {club.city}</Text>
            </View>

            {/* Amenities en chips con iconos vectoriales */}
            <View style={styles.amenitiesRow}>
              {club.amenities.covered && (
                <View style={styles.amenityTag}>
                  <RoofIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
                  <Text style={styles.amenityText}>Techada</Text>
                </View>
              )}
              {club.amenities.parking && (
                <View style={styles.amenityTag}>
                  <ParkingIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
                  <Text style={styles.amenityText}>Parking</Text>
                </View>
              )}
              {club.amenities.buffet && (
                <View style={styles.amenityTag}>
                  <CoffeeIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
                  <Text style={styles.amenityText}>Bar & Buffet</Text>
                </View>
              )}
            </View>

            {/* Footer de precio y botón */}
            <View style={styles.clubFooterRow}>
              <View>
                <Text style={styles.priceStartingLabel}>Precio desde</Text>
                <Text style={styles.priceStartingText}>{formatCurrency(club.minPrice)}</Text>
              </View>
              <View style={styles.viewCourtsButton}>
                <Text style={styles.viewCourtsLink}>Ver canchas →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════
          MINI CUESTIONARIO DE BÚSQUEDA RÁPIDA (MODAL)
          ═══════════════════════════════════════════════════════ */}
      <QuickBookingFinderModal
        visible={showQuickFinder}
        onClose={() => setShowQuickFinder(false)}
        userLocation={userLocation}
        onSelectSlot={(slot) => {
          setShowQuickFinder(false);
          onNavigateCheckout(slot);
        }}
        onOpenMap={(sport) => {
          setShowQuickFinder(false);
          onNavigateSearch(sport);
        }}
      />
    </View>
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
    paddingBottom: 95,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 21, 29, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 20,
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
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  searchSub: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  filterPill: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterPillText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 11.5,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(252, 28, 70, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileBadgeText: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 18,
  },

  /* Selector de Deportes */
  sportsScroll: {
    marginBottom: 16,
  },
  sportsScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 7,
  },
  sportPillActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderColor: '#fc1c46',
  },
  sportLabel: {
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 13,
  },
  sportLabelActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },

  /* Banner Turno Fijo */
  offerBanner: {
    backgroundColor: '#0f121a',
    borderRadius: 22,
    padding: 18,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.24)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  offerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fc1c46',
  },
  offerBadgeText: {
    fontFamily: fonts.bold,
    color: '#ff4d6d',
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  discountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  discountPillText: {
    fontFamily: fonts.bold,
    color: '#f8fafc',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  offerTitle: {
    fontFamily: fonts.headingBold,
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  offerSubtitle: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18.5,
    marginBottom: 14,
  },
  offerPerksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  offerPerkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  offerPerkText: {
    fontFamily: fonts.medium,
    color: '#cbd5e1',
    fontSize: 11.5,
  },
  offerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fc1c46',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 14,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  offerButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 13.5,
    letterSpacing: -0.1,
    marginRight: 10,
  },
  offerButtonIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerButtonArrow: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: -1,
  },

  /* Secciones Headers */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 19,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  seeAllText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 13,
  },

  /* Turnos Libres Scroll */
  slotsScroll: {
    marginBottom: 28,
  },
  slotCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    width: 216,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  slotTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.28)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  slotTimeText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12.5,
  },
  slotCourtName: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  slotClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  slotClubName: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  slotPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  slotPriceLabel: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 1,
  },
  slotPrice: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 15,
    letterSpacing: -0.3,
  },
  reserveButton: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12,
  },

  /* Clubes Destacados */
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  clubImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  clubImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  clubFloatingBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubSportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 18, 26, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clubSportTagText: {
    fontFamily: fonts.bold,
    color: '#f8fafc',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 18, 26, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: fonts.bold,
    color: '#FACC15',
    fontSize: 12,
  },
  clubInfo: {
    padding: 16,
  },
  clubHeaderRow: {
    marginBottom: 4,
  },
  clubName: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  clubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  clubAddress: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12.5,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 11,
  },
  clubFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 12,
  },
  priceStartingLabel: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 10.5,
  },
  priceStartingText: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  viewCourtsButton: {
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewCourtsLink: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12.5,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 13,
  },
});
