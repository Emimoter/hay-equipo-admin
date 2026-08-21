import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { colors, fonts, formatCurrency } from './theme';
import {
  FootballIcon,
  PadelIcon,
  TennisIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
} from './AppIcons';
import { mobileApi } from '../services/api';
import { UserLocationState, calculateDistanceKm } from '../services/location';
import { TimeSlot, Club } from '@hay-equipo/contracts';

interface QuickBookingFinderModalProps {
  visible: boolean;
  onClose: () => void;
  userLocation: UserLocationState;
  onSelectSlot: (slot: TimeSlot) => void;
  onOpenMap: (sport: string) => void;
}

type SportType = 'FUTBOL' | 'PADEL' | 'TENIS';
type DateOption = 'TODAY' | 'TOMORROW' | 'AFTER_TOMORROW';

export const QuickBookingFinderModal: React.FC<QuickBookingFinderModalProps> = ({
  visible,
  onClose,
  userLocation,
  onSelectSlot,
  onOpenMap,
}) => {
  // Step 1: ¿Qué querés jugar?
  const [sport, setSport] = useState<SportType>('FUTBOL');

  // Step 2: ¿Cuántos juegan?
  const [playerCount, setPlayerCount] = useState<number>(10);

  // Step 3: ¿Cuándo? (Fecha y Hora)
  const [dateChoice, setDateChoice] = useState<DateOption>('TOMORROW');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');

  // Step 4: ¿Dónde?
  const [locationType, setLocationType] = useState<'NEARBY' | 'ANY'>('NEARBY');

  // Results state
  const [searching, setSearching] = useState<boolean>(false);
  const [results, setResults] = useState<TimeSlot[] | null>(null);
  const [matchedClubs, setMatchedClubs] = useState<Club[]>([]);

  // Update default player count when sport changes
  const handleSelectSport = (newSport: SportType) => {
    setSport(newSport);
    if (newSport === 'FUTBOL') {
      setPlayerCount(10);
    } else {
      setPlayerCount(4);
    }
  };

  const getDateString = (choice: DateOption): string => {
    const d = new Date();
    if (choice === 'TOMORROW') {
      d.setDate(d.getDate() + 1);
    } else if (choice === 'AFTER_TOMORROW') {
      d.setDate(d.getDate() + 2);
    }
    return d.toISOString().split('T')[0];
  };

  const getDateLabel = (choice: DateOption): string => {
    const d = new Date();
    if (choice === 'TOMORROW') {
      d.setDate(d.getDate() + 1);
    } else if (choice === 'AFTER_TOMORROW') {
      d.setDate(d.getDate() + 2);
    }
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${days[d.getDay()]} ${d.getDate()}`;
  };

  const handleSearch = async () => {
    setSearching(true);

    const targetDate = getDateString(dateChoice);
    const sportName =
      sport === 'FUTBOL'
        ? `Fútbol ${playerCount / 2 || 5} Césped Pro`
        : sport === 'PADEL'
        ? 'Pádel Panorámica Cristal'
        : 'Tenis Polvo de Ladrillo';
    const basePrice = sport === 'FUTBOL' ? 24000 : 18000;
    const endHour = (parseInt(selectedTime.split(':')[0], 10) + (sport === 'FUTBOL' ? 1 : 1)) % 24;
    const endMin = sport === 'FUTBOL' ? '00' : '30';

    // Immediate instant results
    const sampleSlots: TimeSlot[] = [
      {
        courtId: 'court-1',
        courtName: `Cancha 1 (${sportName})`,
        clubId: 'club-1',
        clubName: 'Club Padel & Fútbol Center',
        sportType: sport === 'FUTBOL' ? 'FUTBOL_5' : sport === 'PADEL' ? 'PADEL' : 'TENIS',
        date: targetDate,
        startTime: selectedTime,
        endTime: `${endHour < 10 ? '0' : ''}${endHour}:${endMin}`,
        durationMinutes: sport === 'FUTBOL' ? 60 : 90,
        price: basePrice,
        fixedSlotPrice: Math.round(basePrice * 0.85),
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-2',
        courtName: `Cancha 2 (Techada Climatizada)`,
        clubId: 'club-2',
        clubName: 'Complejo Deportivo Norte',
        sportType: sport === 'FUTBOL' ? 'FUTBOL_5' : sport === 'PADEL' ? 'PADEL' : 'TENIS',
        date: targetDate,
        startTime: selectedTime,
        endTime: `${endHour < 10 ? '0' : ''}${endHour}:${endMin}`,
        durationMinutes: sport === 'FUTBOL' ? 60 : 90,
        price: basePrice + 2000,
        fixedSlotPrice: Math.round((basePrice + 2000) * 0.85),
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-3',
        courtName: `Cancha 3 (Iluminación LED Pro)`,
        clubId: 'club-3',
        clubName: 'Arena Sports Park',
        sportType: sport === 'FUTBOL' ? 'FUTBOL_5' : sport === 'PADEL' ? 'PADEL' : 'TENIS',
        date: targetDate,
        startTime: `${(parseInt(selectedTime.split(':')[0], 10) + 1) % 24}:00`,
        endTime: `${(parseInt(selectedTime.split(':')[0], 10) + 2) % 24}:00`,
        durationMinutes: 60,
        price: basePrice,
        fixedSlotPrice: Math.round(basePrice * 0.85),
        status: 'AVAILABLE',
      },
    ];

    setResults(sampleSlots);
    setSearching(false);
  };

  const handleReset = () => {
    setResults(null);
  };

  if (!visible) return null;

  return (
    <View style={styles.sheetOverlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Encontrar cancha</Text>
            <Text style={styles.modalSubtitle}>Mini cuestionario de búsqueda rápida</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
            {results === null ? (
              <>
                {/* ════════════════════════════════════════════════
                    PREGUNTA 1: ¿QUÉ QUERÉS JUGAR?
                    ════════════════════════════════════════════════ */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>¿Qué querés jugar?</Text>
                  <View style={styles.sportsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.sportOption, sport === 'FUTBOL' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('FUTBOL')}
                    >
                      <FootballIcon
                        size={22}
                        color={sport === 'FUTBOL' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.sportOptionText,
                          sport === 'FUTBOL' && styles.sportOptionTextActive,
                        ]}
                      >
                        Fútbol
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.sportOption, sport === 'PADEL' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('PADEL')}
                    >
                      <PadelIcon
                        size={22}
                        color={sport === 'PADEL' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.sportOptionText,
                          sport === 'PADEL' && styles.sportOptionTextActive,
                        ]}
                      >
                        Pádel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.sportOption, sport === 'TENIS' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('TENIS')}
                    >
                      <TennisIcon
                        size={22}
                        color={sport === 'TENIS' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.sportOptionText,
                          sport === 'TENIS' && styles.sportOptionTextActive,
                        ]}
                      >
                        Tenis
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ════════════════════════════════════════════════
                    PREGUNTA 2: ¿CUÁNTOS JUEGAN?
                    ════════════════════════════════════════════════ */}
                <View style={styles.questionSection}>
                  <View style={styles.questionRow}>
                    <Text style={styles.questionTitle}>¿Cuántos juegan?</Text>
                    <View style={styles.counterChip}>
                      <UsersIcon size={13} color="#fc1c46" strokeWidth={2} />
                      <Text style={styles.counterChipText}>
                        {sport === 'FUTBOL' ? `Fútbol ${playerCount / 2}` : 'Dobles / Singles'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setPlayerCount(Math.max(2, playerCount - 2))}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stepperBtnSymbol}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.stepperValueBox}>
                      <Text style={styles.stepperValueText}>{playerCount}</Text>
                      <Text style={styles.stepperValueLabel}>jugadores</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setPlayerCount(Math.min(22, playerCount + 2))}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stepperBtnSymbol}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ════════════════════════════════════════════════
                    PREGUNTA 3: ¿CUÁNDO? (FECHA & HORA)
                    ════════════════════════════════════════════════ */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>¿Cuándo?</Text>

                  {/* Selector de Días */}
                  <View style={styles.daysRow}>
                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'TODAY' && styles.datePillActive]}
                      onPress={() => setDateChoice('TODAY')}
                    >
                      <CalendarIcon
                        size={13}
                        color={dateChoice === 'TODAY' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.datePillText,
                          dateChoice === 'TODAY' && styles.datePillTextActive,
                        ]}
                      >
                        Hoy ({getDateLabel('TODAY')})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'TOMORROW' && styles.datePillActive]}
                      onPress={() => setDateChoice('TOMORROW')}
                    >
                      <CalendarIcon
                        size={13}
                        color={dateChoice === 'TOMORROW' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.datePillText,
                          dateChoice === 'TOMORROW' && styles.datePillTextActive,
                        ]}
                      >
                        Mañana ({getDateLabel('TOMORROW')})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'AFTER_TOMORROW' && styles.datePillActive]}
                      onPress={() => setDateChoice('AFTER_TOMORROW')}
                    >
                      <CalendarIcon
                        size={13}
                        color={dateChoice === 'AFTER_TOMORROW' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.datePillText,
                          dateChoice === 'AFTER_TOMORROW' && styles.datePillTextActive,
                        ]}
                      >
                        {getDateLabel('AFTER_TOMORROW')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Selector de Horarios */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timesScroll}
                  >
                    {['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => {
                      const isSelected = selectedTime === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.timeChip, isSelected && styles.timeChipActive]}
                          onPress={() => setSelectedTime(t)}
                        >
                          <ClockIcon
                            size={12}
                            color={isSelected ? '#fc1c46' : '#94a3b8'}
                            strokeWidth={2}
                          />
                          <Text
                            style={[
                              styles.timeChipText,
                              isSelected && styles.timeChipTextActive,
                            ]}
                          >
                            {t} hs
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* ════════════════════════════════════════════════
                    PREGUNTA 4: ¿DÓNDE?
                    ════════════════════════════════════════════════ */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>¿Dónde?</Text>
                  <View style={styles.locationOptionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.locationOption,
                        locationType === 'NEARBY' && styles.locationOptionActive,
                      ]}
                      onPress={() => setLocationType('NEARBY')}
                    >
                      <MapPinIcon
                        size={15}
                        color={locationType === 'NEARBY' ? '#fc1c46' : '#94a3b8'}
                        strokeWidth={2}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.locationOptionTitle,
                            locationType === 'NEARBY' && styles.locationOptionTitleActive,
                          ]}
                        >
                          Cerca mío
                        </Text>
                        <Text style={styles.locationOptionSub}>
                          {userLocation.formattedLocation || 'Mar del Plata'} · GPS activo
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.locationOption,
                        locationType === 'ANY' && styles.locationOptionActive,
                      ]}
                      onPress={() => setLocationType('ANY')}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.locationOptionTitle,
                            locationType === 'ANY' && styles.locationOptionTitleActive,
                          ]}
                        >
                          Toda la ciudad
                        </Text>
                        <Text style={styles.locationOptionSub}>Cualquier zona disponible</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ════════════════════════════════════════════════
                    BOTÓN GRANDE FINAL: ENCONTRAR CANCHA
                    ════════════════════════════════════════════════ */}
                <TouchableOpacity
                  style={styles.searchBigBtn}
                  onPress={handleSearch}
                  activeOpacity={0.88}
                  disabled={searching}
                >
                  {searching ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Circle cx="11" cy="11" r="7" stroke="#ffffff" strokeWidth={2.5} />
                        <Line
                          x1="16.5"
                          y1="16.5"
                          x2="21.5"
                          y2="21.5"
                          stroke="#ffffff"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      </Svg>
                      <Text style={styles.searchBigBtnText}>Encontrar cancha</Text>
                      <View style={styles.searchBigBtnArrow}>
                        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>→</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* ════════════════════════════════════════════════
                 RESULTADOS ENCONTRADOS
                 ════════════════════════════════════════════════ */
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeaderRow}>
                  <View>
                    <Text style={styles.resultsCountText}>
                      {results.length} canchas disponibles
                    </Text>
                    <Text style={styles.resultsFilterSummary}>
                      {sport === 'FUTBOL' ? 'Fútbol' : sport === 'PADEL' ? 'Pádel' : 'Tenis'} · {selectedTime} hs · {getDateLabel(dateChoice)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.modifySearchBtn} onPress={handleReset}>
                    <Text style={styles.modifySearchBtnText}>Modificar</Text>
                  </TouchableOpacity>
                </View>

                {results.length === 0 ? (
                  <View style={styles.emptyResultsBox}>
                    <Text style={styles.emptyResultsTitle}>No se encontraron turnos exactos</Text>
                    <Text style={styles.emptyResultsSub}>
                      Probá cambiando el horario o buscando para otro día.
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
                      <Text style={styles.retryBtnText}>Volver al cuestionario</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  results.map((slot, idx) => {
                    const pricePerPlayer = Math.round(slot.price / (playerCount || 10));
                    return (
                      <View key={idx} style={styles.resultCard}>
                        <View style={styles.resultCardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resultCourtName}>{slot.courtName}</Text>
                            <View style={styles.resultClubRow}>
                              <MapPinIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
                              <Text style={styles.resultClubName}>
                                {slot.clubName} · a 0.8 km
                              </Text>
                            </View>
                          </View>
                          <View style={styles.resultTimeBadge}>
                            <ClockIcon size={12} color="#fc1c46" strokeWidth={2} />
                            <Text style={styles.resultTimeText}>{slot.startTime} hs</Text>
                          </View>
                        </View>

                        <View style={styles.resultCardFooter}>
                          <View>
                            <Text style={styles.resultPricePerPlayer}>
                              {formatCurrency(pricePerPlayer)} / jugador
                            </Text>
                            <Text style={styles.resultTotalPrice}>
                              Total: {formatCurrency(slot.price)} ({playerCount} jug.)
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.bookResultBtn}
                            onPress={() => {
                              onClose();
                              onSelectSlot(slot);
                            }}
                          >
                            <Text style={styles.bookResultBtnText}>Reservar →</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}

                <TouchableOpacity
                  style={styles.openMapBtn}
                  onPress={() => {
                    onClose();
                    onOpenMap(sport);
                  }}
                >
                  <MapPinIcon size={14} color="#fc1c46" strokeWidth={2} />
                  <Text style={styles.openMapBtnText}>Ver opciones en el mapa interactivo →</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  modalContainer: {
    backgroundColor: '#0c0e14',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 30,
    zIndex: 100000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },

  /* Secciones de Preguntas */
  questionSection: {
    marginBottom: 22,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionTitle: {
    fontFamily: fonts.headingBold,
    color: '#f8fafc',
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: 10,
  },

  /* Pregunta 1: Deportes */
  sportsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sportOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  sportOptionActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderColor: '#fc1c46',
  },
  sportOptionText: {
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 13,
  },
  sportOptionTextActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },

  /* Pregunta 2: Stepper Jugadores */
  counterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  counterChipText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 11,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 6,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnSymbol: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 22,
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  stepperValueLabel: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 11,
  },

  /* Pregunta 3: Fecha y Horarios */
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  datePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  datePillActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderColor: '#fc1c46',
  },
  datePillText: {
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 11.5,
  },
  datePillTextActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },
  timesScroll: {
    gap: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeChipActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderColor: '#fc1c46',
  },
  timeChipText: {
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 12.5,
  },
  timeChipTextActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },

  /* Pregunta 4: Ubicación */
  locationOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  locationOptionActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderColor: '#fc1c46',
  },
  locationOptionTitle: {
    fontFamily: fonts.bold,
    color: '#94a3b8',
    fontSize: 13,
  },
  locationOptionTitleActive: {
    color: '#ffffff',
  },
  locationOptionSub: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 10.5,
    marginTop: 2,
  },

  /* Botón Grande CTA Sticky Footer */
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0c0e14',
  },
  searchBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fc1c46',
    borderRadius: 16,
    paddingVertical: 15,
    gap: 10,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  searchBigBtnText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  searchBigBtnArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Resultados */
  resultsContainer: {
    paddingBottom: 10,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCountText: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 17,
  },
  resultsFilterSummary: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  modifySearchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modifySearchBtnText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resultCourtName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 2,
  },
  resultClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultClubName: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  resultTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultTimeText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12,
  },
  resultCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  resultPricePerPlayer: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 15,
  },
  resultTotalPrice: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 10.5,
  },
  bookResultBtn: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookResultBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12.5,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  openMapBtnText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 13,
  },
  emptyResultsBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyResultsTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 6,
  },
  emptyResultsSub: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12.5,
  },
});
