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
  ZapIcon,
  ChevronDownIcon,
} from '../components/AppIcons';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRealUserLocation, UserLocationState, DEFAULT_LOCATION, calculateDistanceKm } from '../services/location';
import { QuickBookingFinderModal } from '../components/QuickBookingFinderModal';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { Club, TimeSlot, Booking } from '@hay-equipo/contracts';

const PADEL_RED_3D_ASSET = require('../../assets/padel_rackets_cutout.png');
const SOCCER_BALL_3D_ASSET = require('../../assets/soccer_ball_cutout.png');

interface HomeScreenProps {
  onNavigateSearch: (sport?: string) => void;
  onNavigateClub: (clubId: string) => void;
  onNavigateCheckout: (slot: TimeSlot) => void;
  onNavigateFixedSlots: () => void;
  onNavigateProfile: () => void;
  onNavigateDemoSplit?: () => void;
}

const SPORTS_CATEGORIES = [
  { id: 'PADEL', label: 'Pádel', Icon: PadelIcon },
  { id: 'FUTBOL', label: 'Fútbol', Icon: FootballIcon },
];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateSearch,
  onNavigateClub,
  onNavigateCheckout,
  onNavigateFixedSlots,
  onNavigateProfile,
  onNavigateDemoSplit,
}) => {
  const { userProfile, user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('PADEL');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<UserLocationState>(DEFAULT_LOCATION);
  const [showQuickFinder, setShowQuickFinder] = useState<boolean>(false);
  const [visibleClubsLimit, setVisibleClubsLimit] = useState<number>(5);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    const loc = await getRealUserLocation();
    setUserLocation(loc);
  };

  useEffect(() => {
    setVisibleClubsLimit(5);
    loadHomeData(selectedSport);
  }, [selectedSport]);

  const loadHomeData = async (sport: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const uid = userProfile?.uid || user?.uid || 'user-1';
    const [clubsData, slotsData, bookingsData] = await Promise.all([
      mobileApi.getClubs(sport),
      mobileApi.searchAvailability({ date: today, timeFrom: '18:00', sport }),
      mobileApi.getUserBookings(uid),
    ]);
    setClubs(clubsData);
    setAvailableSlots(slotsData);
    setUserBookings(bookingsData?.upcoming || []);
    setLoading(false);
  };

  const handleSportSelect = (sportId: string) => {
    triggerHaptic('selection');
    setSelectedSport(sportId);
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
            TOP BAR: SALUDO PERSONALIZADO (CANVAS BLANCO)
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.topGreetingRow}>
          <View>
            <Text style={styles.greetingTitle}>¡Hola, {displayName}! 👋</Text>
            <Text style={styles.greetingSubtitle}>¿Qué jugamos hoy?</Text>
          </View>

          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => {
              triggerHaptic('light');
              onNavigateProfile();
            }}
            activeOpacity={0.8}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileBadgeText}>{displayName.charAt(0)}</Text>
            )}
            <View style={styles.onlineBadgeDot} />
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════
            BUSCADOR ESTRUCTURADO MULTI-SEGMENTO:
            [¿Dónde querés jugar?] | [Deporte] | [Fecha] | [Buscar]
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.segmentedSearchOuter}>
          {/* Segmento 1: ¿Dónde querés jugar? */}
          <TouchableOpacity
            style={styles.searchSegmentLocation}
            onPress={() => {
              triggerHaptic('light');
              setShowQuickFinder(true);
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.searchSegmentLabel} numberOfLines={1}>¿Dónde querés jugar?</Text>
            <View style={styles.searchSegmentValueRow}>
              <MapPinIcon size={11} color="#fc1c46" strokeWidth={2.2} />
              <Text style={styles.searchSegmentValueText} numberOfLines={1}>
                {userLocation.city || 'Mar del Plata'}
              </Text>
              <ChevronDownIcon size={9} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          {/* Divisor vertical */}
          <View style={styles.searchSegmentDivider} />

          {/* Segmento 2: Deporte */}
          <TouchableOpacity
            style={styles.searchSegmentSport}
            onPress={() => {
              triggerHaptic('selection');
              const nextSport = selectedSport === 'PADEL' ? 'FUTBOL' : 'PADEL';
              handleSportSelect(nextSport);
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.searchSegmentLabel} numberOfLines={1}>Deporte</Text>
            <View style={styles.searchSegmentValueRow}>
              {selectedSport === 'FUTBOL' ? (
                <FootballIcon size={11} color="#fc1c46" strokeWidth={2.2} />
              ) : (
                <PadelIcon size={11} color="#fc1c46" strokeWidth={2.2} />
              )}
              <Text style={styles.searchSegmentValueText} numberOfLines={1}>
                {selectedSport === 'FUTBOL' ? 'Fútbol' : 'Pádel'}
              </Text>
              <ChevronDownIcon size={9} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          {/* Divisor vertical */}
          <View style={styles.searchSegmentDivider} />

          {/* Segmento 3: Fecha */}
          <TouchableOpacity
            style={styles.searchSegmentDate}
            onPress={() => {
              triggerHaptic('light');
              setShowQuickFinder(true);
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.searchSegmentLabel} numberOfLines={1}>Fecha</Text>
            <View style={styles.searchSegmentValueRow}>
              <CalendarIcon size={11} color="#fc1c46" strokeWidth={2.2} />
              <Text style={styles.searchSegmentValueText} numberOfLines={1}>
                Hoy 20:00h
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botón Rojo Buscar */}
          <TouchableOpacity
            style={styles.searchSegmentBtn}
            onPress={() => {
              triggerHaptic('medium');
              setShowQuickFinder(true);
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.searchSegmentBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════
            SELECTOR DE DEPORTES: PASTILLAS NEGRO / ROJO
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
                onPress={() => handleSportSelect(sport.id)}
              >
                <IconComp
                  size={15}
                  color={isActive ? '#ffffff' : '#fc1c46'}
                  strokeWidth={2.2}
                />
                <Text style={[styles.sportLabel, isActive && styles.sportLabelActive]}>
                  {sport.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════
            VARIACIÓN 1: TARJETA ROJA CON DETALLES NEGROS Y LETRAS BLANCAS
            WIDGET: TU PRÓXIMO PARTIDO (SOLO SI EL USUARIO TIENE PARTIDO RESERVADO / ES HOST)
            ═══════════════════════════════════════════════════════ */}
        {(() => {
          const activeUpcomingMatch = userBookings.find(
            b => b.status === 'CONFIRMED' || b.status === 'HELD' || !!b.splitToken
          );
          if (!activeUpcomingMatch) return null;

          const isMatchFutbol = (activeUpcomingMatch.sportType || '').toUpperCase().includes('FUTBOL');

          return (
            <View style={styles.upcomingBookingSection}>
              <View style={styles.upcomingHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.upcomingSectionTitle}>Tu próximo partido</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic('light');
                    if (onNavigateDemoSplit) onNavigateDemoSplit();
                  }}
                >
                  <Text style={styles.upcomingLinkText}>Ver sala →</Text>
                </TouchableOpacity>
              </View>

              <DoubleBezelCard
                variant="red"
                style={styles.upcomingCardOuter}
                innerStyle={styles.upcomingCardInner}
                onPress={() => {
                  triggerHaptic('medium');
                  if (onNavigateDemoSplit) onNavigateDemoSplit();
                }}
                glow
              >
                <View style={styles.upcomingTopRow}>
                  <View style={styles.upcomingSportTag}>
                    {isMatchFutbol ? (
                      <FootballIcon size={12} color="#ffffff" strokeWidth={2.2} />
                    ) : (
                      <PadelIcon size={12} color="#ffffff" strokeWidth={2.2} />
                    )}
                    <Text style={styles.upcomingSportTagText}>
                      {isMatchFutbol ? 'FÚTBOL' : 'PÁDEL'} · {activeUpcomingMatch.courtName || 'CANCHA 1'}
                    </Text>
                  </View>
                  <View style={styles.upcomingTimeBadge}>
                    <ClockIcon size={11} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.upcomingTimeBadgeText}>
                      {activeUpcomingMatch.date === new Date().toISOString().split('T')[0] ? 'Hoy' : activeUpcomingMatch.date} {activeUpcomingMatch.startTime} hs
                    </Text>
                  </View>
                </View>

                <Text style={styles.upcomingClubName}>{activeUpcomingMatch.clubName || 'Arena Pádel Palermo'}</Text>

                <View style={styles.upcomingBottomRow}>
                  <View style={styles.avatarPileContainer}>
                    <View style={styles.avatarPileRow}>
                      {SAMPLE_AVATARS.map((uri, idx) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={[styles.avatarPileImg, { marginLeft: idx > 0 ? -10 : 0 }]}
                        />
                      ))}
                      <View style={[styles.avatarPileBadge, { marginLeft: -10 }]}>
                        <Text style={styles.avatarPileBadgeText}>+1</Text>
                      </View>
                    </View>
                    <Text style={styles.avatarPileLabel}>Confirmado</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.upcomingActionBtn}
                    onPress={() => {
                      triggerHaptic('medium');
                      if (onNavigateDemoSplit) onNavigateDemoSplit();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.upcomingActionText}>Split</Text>
                    <Text style={styles.upcomingActionArrow}>↗</Text>
                  </TouchableOpacity>
                </View>
              </DoubleBezelCard>
            </View>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            VARIACIÓN 2: TARJETA NEGRA CON DETALLES ROJOS Y LETRAS BLANCAS
            HERO CARD: ASEGURÁ TU CANCHA FIJA (CON ASSET 3D DINÁMICO PÁDEL / FÚTBOL)
            ═══════════════════════════════════════════════════════ */}
        {(() => {
          const isSoccer = selectedSport.toUpperCase().includes('FUTBOL');

          return (
            <DoubleBezelCard
              variant="black"
              style={styles.heroBannerOuter}
              innerStyle={styles.heroBannerInner}
              onPress={() => {
                triggerHaptic('medium');
                onNavigateFixedSlots();
              }}
              glow
            >
              {/* Fondo Texturizado con halo rojo sutil */}
              <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox="0 0 360 180" preserveAspectRatio="none">
                  <Defs>
                    <RadialGradient id="redGlow" cx="85%" cy="30%" r="70%">
                      <Stop offset="0%" stopColor="#fc1c46" stopOpacity="0.25" />
                      <Stop offset="60%" stopColor="#0b0e14" stopOpacity="0.08" />
                      <Stop offset="100%" stopColor="#0b0e14" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#redGlow)" />
                </Svg>
              </View>

              <View style={styles.heroContentLeft}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.heroTag}>
                    <ZapIcon size={11} color="#fc1c46" strokeWidth={2.4} />
                    <Text style={styles.heroTagText}>TURNO FIJO SEMANAL</Text>
                  </View>
                  <View style={styles.heroDiscountBadge}>
                    <Text style={styles.heroDiscountText}>-15% OFF</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Asegurá tu Cancha Fija</Text>
                <Text style={styles.heroSubtitle}>
                  {isSoccer
                    ? 'Fútbol semanal con tu equipo y pago dividido automático.'
                    : 'Mismo día y horario cada semana con pago dividido automático.'}
                </Text>

                {/* Button-in-Button Rojo */}
                <View style={styles.heroCtaBtn}>
                  <Text style={styles.heroCtaText}>Asegurar cupo</Text>
                  <View style={styles.heroCtaCircle}>
                    <Text style={styles.heroCtaArrow}>↗</Text>
                  </View>
                </View>
              </View>

              {/* Imagen 3D Saliente Dinámica (Paletas de Pádel o Pelota de Fútbol) */}
              <View style={styles.heroImageContainer}>
                <Image
                  source={isSoccer ? SOCCER_BALL_3D_ASSET : PADEL_RED_3D_ASSET}
                  style={styles.hero3DImage}
                />
              </View>
            </DoubleBezelCard>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            SECTION: PARA JUGAR HOY (TARJETAS NEGRAS CON DETALLES ROJOS)
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Para jugar hoy</Text>
            <Text style={styles.sectionSubtitle}>Turnos libres en las próximas horas</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onNavigateSearch(selectedSport);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 24 }} />
        ) : availableSlots.length === 0 ? (
          <DoubleBezelCard style={{ marginBottom: 20 }} innerStyle={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay turnos libres inmediatos para hoy.</Text>
          </DoubleBezelCard>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.slotsScroll}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {availableSlots.slice(0, 6).map((slot, idx) => {
              const courtUpper = (slot.courtName + ' ' + (slot.sportType || '')).toUpperCase();
              let courtBadgeTag = 'Pádel Panorámica';
              let courtCapacity = '4 jugadores';

              if (courtUpper.includes('7') || slot.sportType === 'FUTBOL_7') {
                courtBadgeTag = 'Fútbol 7';
                courtCapacity = '14 jugadores';
              } else if (courtUpper.includes('8') || slot.sportType === 'FUTBOL_8') {
                courtBadgeTag = 'Fútbol 8';
                courtCapacity = '16 jugadores';
              } else if (courtUpper.includes('11') || slot.sportType === 'FUTBOL_11') {
                courtBadgeTag = 'Fútbol 11';
                courtCapacity = '22 jugadores';
              } else if (courtUpper.includes('FUTBOL') || courtUpper.includes('5') || slot.sportType === 'FUTBOL_5') {
                courtBadgeTag = 'Fútbol 5';
                courtCapacity = '10 jugadores';
              }

              return (
                <DoubleBezelCard
                  key={idx}
                  variant="black"
                  style={styles.slotCardOuter}
                  innerStyle={styles.slotCardInner}
                  onPress={() => {
                    triggerHaptic('medium');
                    onNavigateCheckout(slot);
                  }}
                >
                  {/* Header de la tarjeta con badge de horario rojo */}
                  <View style={styles.slotCardHeaderRow}>
                    <View style={styles.slotTimeBadge}>
                      <ClockIcon size={11} color="#fc1c46" strokeWidth={2.2} />
                      <Text style={styles.slotTimeText}>{slot.startTime} – {slot.endTime}</Text>
                    </View>
                    <View style={styles.slotArrowCircle}>
                      <Text style={styles.slotArrowText}>↗</Text>
                    </View>
                  </View>

                  <Text style={styles.slotCourtName} numberOfLines={1}>
                    {slot.courtName}
                  </Text>

                  {/* Badge de tipo de cancha y jugadores */}
                  <View style={styles.courtSpecBadge}>
                    <Text style={styles.courtSpecBadgeText}>{courtBadgeTag} · {courtCapacity}</Text>
                  </View>
                  
                  <View style={styles.slotClubRow}>
                    <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                    <Text style={styles.slotClubName} numberOfLines={1}>
                      {slot.clubName}
                    </Text>
                  </View>

                  {/* Avatar pile social en el turno */}
                  <View style={styles.slotAvatarRow}>
                    <View style={styles.avatarPileRowMini}>
                      {SAMPLE_AVATARS.slice(0, 2).map((uri, aIdx) => (
                        <Image
                          key={aIdx}
                          source={{ uri }}
                          style={[styles.avatarPileImgMini, { marginLeft: aIdx > 0 ? -6 : 0 }]}
                        />
                      ))}
                      <View style={[styles.avatarPileBadgeMini, { marginLeft: -6 }]}>
                        <Text style={styles.avatarPileBadgeTextMini}>+2</Text>
                      </View>
                    </View>
                    <Text style={styles.slotPlayersRemaining}>2 cupos libres</Text>
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
                </DoubleBezelCard>
              );
            })}
          </ScrollView>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION: CLUBES DESTACADOS CERCA TUYO (TARJETAS NEGRAS / ROJAS)
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Clubes cerca tuyo</Text>
            <Text style={styles.sectionSubtitle}>Complejos con mejores canchas</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onNavigateSearch(selectedSport);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Ver mapa →</Text>
          </TouchableOpacity>
        </View>

        {clubs.slice(0, visibleClubsLimit).map((club) => (
          <DoubleBezelCard
            key={club.id}
            variant="black"
            style={styles.clubCardOuter}
            innerStyle={styles.clubCardInner}
            onPress={() => {
              triggerHaptic('medium');
              onNavigateClub(club.id);
            }}
          >
            <View style={styles.clubImageContainer}>
              <Image source={{ uri: club.images[0] }} style={styles.clubImage} />
              <View style={styles.clubImageOverlay} />
              
              {/* Badges superiores sobre la foto con iconos SVG */}
              <View style={styles.clubFloatingBadgeRow}>
                <View style={styles.clubSportTag}>
                  {selectedSport === 'PADEL' ? (
                    <PadelIcon size={12} color="#ffffff" strokeWidth={2} />
                  ) : selectedSport === 'FUTBOL' ? (
                    <FootballIcon size={12} color="#ffffff" strokeWidth={2} />
                  ) : (
                    <TennisIcon size={12} color="#ffffff" strokeWidth={2} />
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
                <View style={styles.clubArrowBtn}>
                  <Text style={styles.clubArrowText}>↗</Text>
                </View>
              </View>

              <View style={styles.clubLocationRow}>
                <MapPinIcon size={13} color="#94a3b8" strokeWidth={1.8} />
                <Text style={styles.clubAddress} numberOfLines={1}>
                  {club.address} · {club.city}
                  {club.latitude && club.longitude
                    ? ` · a ${calculateDistanceKm(userLocation.latitude, userLocation.longitude, club.latitude, club.longitude).toFixed(1)} km`
                    : ''}
                </Text>
              </View>

              {/* Amenities en chips */}
              <View style={styles.amenitiesRow}>
                {Boolean(club.amenities?.covered) ? (
                  <View style={styles.amenityTag}>
                    <RoofIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                    <Text style={styles.amenityText}>Techada</Text>
                  </View>
                ) : null}
                {Boolean(club.amenities?.parking) ? (
                  <View style={styles.amenityTag}>
                    <ParkingIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                ) : null}
                {Boolean(club.amenities?.buffet) ? (
                  <View style={styles.amenityTag}>
                    <CoffeeIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                    <Text style={styles.amenityText}>Buffet</Text>
                  </View>
                ) : null}
              </View>

              {/* Footer de precio y botón */}
              <View style={styles.clubFooterRow}>
                <View>
                  <Text style={styles.priceStartingLabel}>Precio desde</Text>
                  <Text style={styles.priceStartingText}>{formatCurrency(club.minPrice)}</Text>
                </View>
                <View style={styles.viewCourtsButton}>
                  <Text style={styles.viewCourtsLink}>Ver canchas</Text>
                  <Text style={styles.viewCourtsArrow}>↗</Text>
                </View>
              </View>
            </View>
          </DoubleBezelCard>
        ))}

        {clubs.length > visibleClubsLimit ? (
          <TouchableOpacity
            style={styles.loadMoreClubsButton}
            onPress={() => {
              triggerHaptic('light');
              setVisibleClubsLimit((prev) => prev + 5);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.loadMoreClubsText}>
              {`Ver más complejos (${clubs.length - visibleClubsLimit} más) ↓`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

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
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 16,
    paddingBottom: 95,
  },

  /* Top Greeting Row */
  topGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTitle: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontFamily: fonts.medium,
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  profileBadge: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0b0e14',
    borderWidth: 1.5,
    borderColor: '#fc1c46',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profileBadgeText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 18,
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fc1c46',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  /* Segmented Structured Search Bar (Brand Velocity Red & Jet Black) */
  segmentedSearchOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0e14',
    borderRadius: 18,
    paddingVertical: 9,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    marginBottom: 16,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  searchSegmentLocation: {
    flex: 1.25,
    justifyContent: 'center',
  },
  searchSegmentSport: {
    flex: 0.95,
    justifyContent: 'center',
  },
  searchSegmentDate: {
    flex: 1.15,
    justifyContent: 'center',
  },
  searchSegmentLabel: {
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 9.5,
    marginBottom: 3,
  },
  searchSegmentValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  searchSegmentValueText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 11.5,
    flexShrink: 1,
  },
  searchSegmentDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 6,
  },
  searchSegmentBtn: {
    backgroundColor: '#fc1c46',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  searchSegmentBtnText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.2,
  },

  /* Sports Selector */
  sportsScroll: {
    marginBottom: 18,
  },
  sportsScrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sportPillActive: {
    backgroundColor: '#0b0e14',
    borderColor: '#fc1c46',
  },
  sportLabel: {
    fontFamily: fonts.medium,
    color: '#475569',
    fontSize: 12.5,
  },
  sportLabelActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },

  /* Upcoming Booking Widget (Red Variant Card) */
  upcomingBookingSection: {
    marginBottom: 18,
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fc1c46',
  },
  upcomingSectionTitle: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  upcomingLinkText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12,
  },
  upcomingCardOuter: {
    width: '100%',
  },
  upcomingCardInner: {
    backgroundColor: '#fc1c46',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 15,
  },
  upcomingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  upcomingSportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingSportTagText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  upcomingTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upcomingTimeBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 11,
  },
  upcomingClubName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  upcomingBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 10,
  },
  avatarPileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPileImg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fc1c46',
  },
  avatarPileBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0b0e14',
    borderWidth: 2,
    borderColor: '#fc1c46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPileBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 10,
  },
  avatarPileLabel: {
    fontFamily: fonts.bold,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
  },
  upcomingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0b0e14',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  upcomingActionText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12,
  },
  upcomingActionArrow: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 13,
  },

  /* Hero Black Card with Red Accents */
  heroBannerOuter: {
    marginBottom: 22,
  },
  heroBannerInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    padding: 16,
    minHeight: 160,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContentLeft: {
    flex: 1.2,
    zIndex: 2,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroTagText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  heroDiscountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroDiscountText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 9.5,
  },
  heroTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 14,
  },
  heroCtaBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fc1c46',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
  },
  heroCtaText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12,
  },
  heroCtaCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaArrow: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  heroImageContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  hero3DImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  /* Sections General */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  seeAllText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: '#fc1c46',
  },

  /* Slots Para Jugar Hoy (Black Cards) */
  slotsScroll: {
    marginBottom: 24,
  },
  slotCardOuter: {
    width: 220,
    marginRight: 12,
  },
  slotCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 14,
  },
  slotCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  slotTimeText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 11.5,
  },
  slotArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotArrowText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  slotCourtName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 3,
  },
  courtSpecBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  courtSpecBadgeText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  slotClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  slotClubName: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12,
  },
  slotAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  avatarPileRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPileImgMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#0b0e14',
  },
  avatarPileBadgeMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fc1c46',
    borderWidth: 1.5,
    borderColor: '#0b0e14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPileBadgeTextMini: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 8,
  },
  slotPlayersRemaining: {
    fontFamily: fonts.medium,
    color: '#cbd5e1',
    fontSize: 10.5,
  },
  slotPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  slotPriceLabel: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 9.5,
    textTransform: 'uppercase',
  },
  slotPrice: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
  },
  reserveButton: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reserveButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#0b0e14',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 13,
  },

  /* Clubes Cerca Tuyo (Black Cards) */
  clubCardOuter: {
    marginBottom: 16,
  },
  clubCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    overflow: 'hidden',
  },
  clubImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  clubImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clubImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 20, 0.35)',
  },
  clubFloatingBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubSportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clubSportTagText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: fonts.bold,
    color: '#FACC15',
    fontSize: 11,
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
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: -0.2,
    flex: 1,
  },
  clubArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubArrowText: {
    color: '#fc1c46',
    fontSize: 13,
    fontWeight: '800',
  },
  clubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  clubAddress: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#cbd5e1',
  },
  clubFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  priceStartingLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  priceStartingText: {
    fontFamily: fonts.headingBold,
    fontSize: 15,
    color: '#ffffff',
  },
  viewCourtsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fc1c46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewCourtsLink: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: '#ffffff',
  },
  viewCourtsArrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#ffffff',
  },
  loadMoreClubsButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
  },
  loadMoreClubsText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 13,
  },
});
