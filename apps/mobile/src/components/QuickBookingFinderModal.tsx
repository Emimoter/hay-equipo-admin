import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors, fonts, formatCurrency } from './theme';
import {
  FootballIcon,
  PadelIcon,
  TennisIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from './AppIcons';
import { DoubleBezelCard } from './DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { UserLocationState } from '../services/location';
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
  const [sport, setSport] = useState<SportType>('PADEL');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [dateChoice, setDateChoice] = useState<DateOption>('TODAY');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');
  const [locationType, setLocationType] = useState<'NEARBY' | 'ANY'>('NEARBY');
  const [searching, setSearching] = useState<boolean>(false);
  const [results, setResults] = useState<TimeSlot[] | null>(null);

  const handleSelectSport = (newSport: SportType) => {
    triggerHaptic('selection');
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
    triggerHaptic('medium');
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

    setTimeout(() => {
      setResults(sampleSlots);
      setSearching(false);
      triggerHaptic('success');
    }, 450);
  };

  const handleReset = () => {
    triggerHaptic('light');
    setResults(null);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header Drag handle */}
          <View style={styles.dragHandleRow}>
            <View style={styles.dragHandle} />
          </View>

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Buscador Guiado</Text>
              <Text style={styles.headerSubtitle}>Encontrá tu cancha ideal en 4 preguntas</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {!results ? (
              <>
                {/* PREGUNTA 1: DEPORTE */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>1. ¿Qué querés jugar?</Text>
                  <View style={styles.sportsRow}>
                    <TouchableOpacity
                      style={[styles.sportOption, sport === 'PADEL' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('PADEL')}
                      activeOpacity={0.8}
                    >
                      <PadelIcon size={20} color={sport === 'PADEL' ? '#ffffff' : '#fc1c46'} strokeWidth={2.2} />
                      <Text style={[styles.sportOptionText, sport === 'PADEL' && styles.sportOptionTextActive]}>Pádel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sportOption, sport === 'FUTBOL' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('FUTBOL')}
                      activeOpacity={0.8}
                    >
                      <FootballIcon size={20} color={sport === 'FUTBOL' ? '#ffffff' : '#fc1c46'} strokeWidth={2.2} />
                      <Text style={[styles.sportOptionText, sport === 'FUTBOL' && styles.sportOptionTextActive]}>Fútbol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sportOption, sport === 'TENIS' && styles.sportOptionActive]}
                      onPress={() => handleSelectSport('TENIS')}
                      activeOpacity={0.8}
                    >
                      <TennisIcon size={20} color={sport === 'TENIS' ? '#ffffff' : '#fc1c46'} strokeWidth={2.2} />
                      <Text style={[styles.sportOptionText, sport === 'TENIS' && styles.sportOptionTextActive]}>Tenis</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* PREGUNTA 2: JUGADORES */}
                <View style={styles.questionSection}>
                  <View style={styles.questionRow}>
                    <Text style={styles.questionTitle}>2. ¿Cuántos jugadores son?</Text>
                    <View style={styles.counterChip}>
                      <UsersIcon size={12} color="#fc1c46" strokeWidth={2} />
                      <Text style={styles.counterChipText}>{playerCount} jugadores</Text>
                    </View>
                  </View>

                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        triggerHaptic('light');
                        setPlayerCount(prev => Math.max(2, prev - 2));
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stepperBtnSymbol}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.stepperValueBox}>
                      <Text style={styles.stepperValueText}>{playerCount}</Text>
                      <Text style={styles.stepperValueLabel}>
                        {sport === 'FUTBOL' ? `Fútbol ${playerCount / 2} vs ${playerCount / 2}` : sport === 'PADEL' ? '2 vs 2 (Dobles)' : 'Jugadores'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        triggerHaptic('light');
                        setPlayerCount(prev => Math.min(18, prev + 2));
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stepperBtnSymbol}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* PREGUNTA 3: FECHA Y HORA */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>3. ¿Cuándo quieren jugar?</Text>
                  <View style={styles.daysRow}>
                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'TODAY' && styles.datePillActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setDateChoice('TODAY');
                      }}
                      activeOpacity={0.8}
                    >
                      <CalendarIcon size={13} color={dateChoice === 'TODAY' ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
                      <Text style={[styles.datePillText, dateChoice === 'TODAY' && styles.datePillTextActive]}>Hoy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'TOMORROW' && styles.datePillActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setDateChoice('TOMORROW');
                      }}
                      activeOpacity={0.8}
                    >
                      <CalendarIcon size={13} color={dateChoice === 'TOMORROW' ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
                      <Text style={[styles.datePillText, dateChoice === 'TOMORROW' && styles.datePillTextActive]}>
                        Mañana ({getDateLabel('TOMORROW')})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.datePill, dateChoice === 'AFTER_TOMORROW' && styles.datePillActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setDateChoice('AFTER_TOMORROW');
                      }}
                      activeOpacity={0.8}
                    >
                      <CalendarIcon size={13} color={dateChoice === 'AFTER_TOMORROW' ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
                      <Text style={[styles.datePillText, dateChoice === 'AFTER_TOMORROW' && styles.datePillTextActive]}>
                        {getDateLabel('AFTER_TOMORROW')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Selector de Horarios */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timesScroll}>
                    {['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => {
                      const isSelected = selectedTime === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.timeChip, isSelected && styles.timeChipActive]}
                          onPress={() => {
                            triggerHaptic('selection');
                            setSelectedTime(t);
                          }}
                          activeOpacity={0.8}
                        >
                          <ClockIcon size={12} color={isSelected ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
                          <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>{t} hs</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* PREGUNTA 4: UBICACIÓN */}
                <View style={styles.questionSection}>
                  <Text style={styles.questionTitle}>4. ¿Dónde?</Text>
                  <View style={styles.locationOptionsRow}>
                    <TouchableOpacity
                      style={[styles.locationOption, locationType === 'NEARBY' && styles.locationOptionActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setLocationType('NEARBY');
                      }}
                      activeOpacity={0.8}
                    >
                      <MapPinIcon size={15} color={locationType === 'NEARBY' ? '#ffffff' : '#fc1c46'} strokeWidth={2} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.locationOptionTitle, locationType === 'NEARBY' && styles.locationOptionTitleActive]}>
                          Cerca mío
                        </Text>
                        <Text style={styles.locationOptionSub}>{userLocation.formattedLocation || 'Mar del Plata'} · GPS activo</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.locationOption, locationType === 'ANY' && styles.locationOptionActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setLocationType('ANY');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.locationOptionTitle, locationType === 'ANY' && styles.locationOptionTitleActive]}>
                          Toda la ciudad
                        </Text>
                        <Text style={styles.locationOptionSub}>Cualquier zona disponible</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* BOTÓN GRANDE: ENCONTRAR CANCHA */}
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
                      <Text style={styles.searchBigBtnText}>Encontrar cancha</Text>
                      <View style={styles.searchBigBtnArrow}>
                        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>→</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* RESULTADOS ENCONTRADOS */
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeaderRow}>
                  <View>
                    <Text style={styles.resultsCountText}>{results.length} canchas disponibles</Text>
                    <Text style={styles.resultsFilterSummary}>
                      {sport === 'FUTBOL' ? 'Fútbol' : sport === 'PADEL' ? 'Pádel' : 'Tenis'} · {selectedTime} hs · {getDateLabel(dateChoice)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.modifySearchBtn} onPress={handleReset} activeOpacity={0.8}>
                    <Text style={styles.modifySearchBtnText}>Modificar</Text>
                  </TouchableOpacity>
                </View>

                {results.map((slot, idx) => (
                  <DoubleBezelCard
                    key={idx}
                    variant="black"
                    style={styles.resultCardOuter}
                    innerStyle={styles.resultCardInner}
                    onPress={() => onSelectSlot(slot)}
                  >
                    <View style={styles.resultCardHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.resultCourtName}>{slot.courtName}</Text>
                        <View style={styles.resultClubRow}>
                          <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
                          <Text style={styles.resultClubName}>{slot.clubName}</Text>
                        </View>
                      </View>
                      <View style={styles.resultTimeBadge}>
                        <ClockIcon size={11} color="#fc1c46" strokeWidth={2.2} />
                        <Text style={styles.resultTimeText}>{slot.startTime} – {slot.endTime}</Text>
                      </View>
                    </View>

                    <View style={styles.resultCardFooter}>
                      <View>
                        <Text style={styles.resultPricePerPlayer}>
                          {formatCurrency(Math.round(slot.price / playerCount))} / jugador
                        </Text>
                        <Text style={styles.resultTotalPrice}>Total: {formatCurrency(slot.price)}</Text>
                      </View>
                      <TouchableOpacity style={styles.bookResultBtn} onPress={() => onSelectSlot(slot)} activeOpacity={0.85}>
                        <Text style={styles.bookResultBtnText}>Reservar</Text>
                      </TouchableOpacity>
                    </View>
                  </DoubleBezelCard>
                ))}

                <TouchableOpacity
                  style={styles.openMapBtn}
                  onPress={() => onOpenMap(sport)}
                  activeOpacity={0.85}
                >
                  <MapPinIcon size={15} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.openMapBtnText}>Ver todas en el mapa interactivo →</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0b0e14',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12,
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
  questionSection: {
    marginBottom: 20,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  sportsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sportOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  sportOptionActive: {
    backgroundColor: '#fc1c46',
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
  counterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
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
    backgroundColor: '#121624',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#94a3b8',
    fontSize: 11,
  },
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
    backgroundColor: '#121624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  datePillActive: {
    backgroundColor: '#fc1c46',
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
    backgroundColor: '#121624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeChipActive: {
    backgroundColor: '#fc1c46',
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
  locationOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#121624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  locationOptionActive: {
    backgroundColor: '#fc1c46',
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
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 2,
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
    shadowOpacity: 0.35,
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
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  modifySearchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modifySearchBtnText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 12,
  },
  resultCardOuter: {
    marginBottom: 12,
  },
  resultCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 14,
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
    color: '#94a3b8',
    fontSize: 12,
  },
  resultTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  resultPricePerPlayer: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 15,
  },
  resultTotalPrice: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
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
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: '#fc1c46',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  openMapBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13,
  },
});
