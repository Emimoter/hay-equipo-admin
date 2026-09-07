import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import { CalendarIcon, ClockIcon, RepeatIcon, UsersIcon, ShieldCheckIcon } from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import { FixedSlotSubscription, RecurringOccurrence } from '@hay-equipo/contracts';

export const FixedSlotScreen: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<FixedSlotSubscription[]>([]);
  const [occurrences, setOccurrences] = useState<RecurringOccurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'MY_SLOTS' | 'NEW_SLOT'>('MY_SLOTS');

  // New Subscription Form State
  const [selectedDay, setSelectedDay] = useState<number>(4); // Jueves
  const [selectedTime, setSelectedTime] = useState<string>('21:00');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadFixedSlots();
  }, []);

  const loadFixedSlots = async () => {
    setLoading(true);
    const data = await mobileApi.getUserFixedSlots('usr-emi');
    setSubscriptions(data.subscriptions || []);
    setOccurrences(data.occurrences || []);
    setLoading(false);
  };

  const handleTabChange = (tab: 'MY_SLOTS' | 'NEW_SLOT') => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const handleDaySelect = (dayIdx: number) => {
    triggerHaptic('selection');
    setSelectedDay(dayIdx);
  };

  const handleTimeSelect = (time: string) => {
    triggerHaptic('selection');
    setSelectedTime(time);
  };

  const handleDurationSelect = (months: number) => {
    triggerHaptic('selection');
    setDurationMonths(months);
  };

  const handleLiberateOccurrence = async (occId: string) => {
    triggerHaptic('warning');
    Alert.alert(
      '¿Liberar esta fecha al marketplace?',
      'Si alguien reserva tu cancha esta semana, no se te cobrará penalización y recibirás el reintegro directo en tu Mercado Pago.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, liberar fecha',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            await mobileApi.liberateOccurrence(occId);
            Alert.alert('¡Fecha liberada!', 'La cancha volvió al marketplace para que otros jugadores puedan reservarla.');
            loadFixedSlots();
          },
        },
      ]
    );
  };

  const handleCreateFixedSlot = async () => {
    triggerHaptic('medium');
    setSubmitting(true);
    const res = await mobileApi.subscribeFixedSlot({
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+5491155550001',
      clubId: 'club-arena-palermo',
      courtId: 'court-arena-1',
      dayOfWeek: selectedDay,
      startTime: selectedTime,
      durationMonths,
    });
    setSubmitting(false);

    if (res.success) {
      triggerHaptic('success');
      Alert.alert('¡Turno Fijo Contratado!', res.message);
      setActiveTab('MY_SLOTS');
      loadFixedSlots();
    } else {
      triggerHaptic('error');
      Alert.alert('Error', res.error || 'No se pudo contratar el turno');
    }
  };

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titleHero}>Turnos Fijos Semanales</Text>
        <Text style={styles.subtitle}>Tu cancha fija asegurada, todos los meses con descuento.</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MY_SLOTS' && styles.tabBtnActive]}
          onPress={() => handleTabChange('MY_SLOTS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'MY_SLOTS' && styles.tabBtnTextActive]}>
            Mis Turnos Activos ({subscriptions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'NEW_SLOT' && styles.tabBtnActive]}
          onPress={() => handleTabChange('NEW_SLOT')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'NEW_SLOT' && styles.tabBtnTextActive]}>
            + Contratar Turno Fijo
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'MY_SLOTS' ? (
        loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : subscriptions.length === 0 ? (
          <DoubleBezelCard variant="black" style={styles.emptyOuter} innerStyle={styles.emptyInner}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aún no tenés turnos fijos</Text>
            <Text style={styles.emptySub}>Contratá un horario semanal para jugar siempre con tu grupo.</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handleTabChange('NEW_SLOT')}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaButtonText}>Buscar Turno Fijo</Text>
            </TouchableOpacity>
          </DoubleBezelCard>
        ) : (
          <View>
            {subscriptions.map(sub => (
              <DoubleBezelCard
                key={sub.id}
                variant="black"
                style={styles.subCardOuter}
                innerStyle={styles.subCardInner}
              >
                <View style={styles.subHeader}>
                  <View>
                    <Text style={styles.subClub}>{sub.clubName}</Text>
                    <Text style={styles.subCourt}>{sub.courtName}</Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVO</Text>
                  </View>
                </View>

                <View style={styles.subScheduleRow}>
                  <Text style={styles.subSchedule}>
                    🗓️ Todos los {daysOfWeek[sub.dayOfWeek]} · ⏰ {sub.startTime} hs
                  </Text>
                  <Text style={styles.subPrice}>
                    {formatCurrency(sub.pricePerOccurrence)} / partido
                  </Text>
                </View>

                <View style={styles.savingsBox}>
                  <Text style={styles.savingsText}>
                    🎉 Ahorrás {formatCurrency(sub.discountMonthlyTotal)} al mes con este turno fijo
                  </Text>
                </View>

                {/* Upcoming occurrences */}
                <Text style={styles.occurrencesTitle}>Próximas fechas:</Text>
                {occurrences
                  .filter(o => o.subscriptionId === sub.id)
                  .slice(0, 3)
                  .map((occ, idx) => {
                    const isLiberated = occ.status === 'RELEASED_TO_MARKETPLACE';
                    return (
                      <View key={occ.id || idx} style={styles.occRow}>
                        <View>
                          <Text style={styles.occDate}>📅 {occ.date} · {occ.startTime} hs</Text>
                          <Text style={styles.occStatus}>
                            {isLiberated ? '🏷️ Liberado al Marketplace' : '✅ Confirmado para tu grupo'}
                          </Text>
                        </View>
                        {!isLiberated ? (
                          <TouchableOpacity
                            style={styles.liberateBtn}
                            onPress={() => handleLiberateOccurrence(occ.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.liberateBtnText}>No vamos esta semana</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.liberatedPill}>
                            <Text style={styles.liberatedPillText}>En Venta</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </DoubleBezelCard>
            ))}
          </View>
        )
      ) : (
        <DoubleBezelCard variant="black" style={styles.newSlotOuter} innerStyle={styles.newSlotInner}>
          <Text style={styles.formTitle}>Configurá tu Turno Semanal</Text>

          {/* Select Club */}
          <Text style={styles.fieldLabel}>Club Seleccionado</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>Arena Pádel Palermo (Cancha 1 Panorámica)</Text>
          </View>

          {/* Select Day */}
          <Text style={styles.fieldLabel}>Día de la semana</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll} contentContainerStyle={{ paddingRight: 16 }}>
            {daysOfWeek.map((dayName, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dayChip, selectedDay === idx && styles.dayChipActive]}
                onPress={() => handleDaySelect(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayChipText, selectedDay === idx && styles.dayChipTextActive]}>
                  {dayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Select Time */}
          <Text style={styles.fieldLabel}>Horario</Text>
          <View style={styles.timeRow}>
            {['19:30', '21:00', '22:30'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeBtn, selectedTime === t && styles.timeBtnActive]}
                onPress={() => handleTimeSelect(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeBtnText, selectedTime === t && styles.timeBtnTextActive]}>
                  {t} hs
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.fieldLabel}>Duración del Turno Fijo</Text>
          <View style={styles.durationRow}>
            {[
              { m: 1, label: '1 Mes' },
              { m: 3, label: '3 Meses (Recomendado)' },
              { m: 6, label: '6 Meses' },
            ].map(d => (
              <TouchableOpacity
                key={d.m}
                style={[styles.durationBtn, durationMonths === d.m && styles.durationBtnActive]}
                onPress={() => handleDurationSelect(d.m)}
                activeOpacity={0.8}
              >
                <Text style={[styles.durationBtnText, durationMonths === d.m && styles.durationBtnTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Savings Calculation */}
          <View style={styles.quoteBox}>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Precio normal por partido:</Text>
              <Text style={styles.quoteValueStrike}>$45.000</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Precio con Turno Fijo (-12%):</Text>
              <Text style={styles.quoteValueDiscount}>$39.600</Text>
            </View>
            <View style={styles.quoteDivider} />
            <Text style={styles.quoteSavings}>¡Ahorrás $21.600 al mes en total!</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreateFixedSlot}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Asegurar Turno Fijo</Text>
            )}
          </TouchableOpacity>
        </DoubleBezelCard>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 95,
  },
  header: {
    marginBottom: 18,
  },
  titleHero: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0b0e14',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#fc1c46',
  },
  tabBtnText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.medium,
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontFamily: fonts.bold,
  },
  subCardOuter: {
    marginBottom: 16,
  },
  subCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subClub: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  subCourt: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
  },
  activeBadgeText: {
    color: '#fc1c46',
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  subScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subSchedule: {
    color: '#fc1c46',
    fontSize: 12.5,
    fontFamily: fonts.semiBold,
  },
  subPrice: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.headingBold,
  },
  savingsBox: {
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  savingsText: {
    color: '#ff6b8b',
    fontSize: 12,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  occurrencesTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },
  occRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  occDate: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  occStatus: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  liberateBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liberateBtnText: {
    color: '#f59e0b',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  liberatedPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liberatedPillText: {
    color: '#f59e0b',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  newSlotOuter: {
    marginBottom: 20,
  },
  newSlotInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  formTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  fieldLabel: {
    color: '#cbd5e1',
    fontSize: 12.5,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
    marginTop: 12,
  },
  readOnlyField: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  readOnlyText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  daysScroll: {
    marginBottom: 6,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayChipActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#fc1c46',
  },
  dayChipText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.medium,
  },
  dayChipTextActive: {
    color: '#ffffff',
    fontFamily: fonts.bold,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeBtnActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#fc1c46',
  },
  timeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  timeBtnTextActive: {
    color: '#ffffff',
    fontFamily: fonts.bold,
  },
  durationRow: {
    gap: 8,
  },
  durationBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationBtnActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.18)',
    borderColor: '#fc1c46',
  },
  durationBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  durationBtnTextActive: {
    color: '#fc1c46',
    fontFamily: fonts.bold,
  },
  quoteBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quoteLabel: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.regular,
  },
  quoteValueStrike: {
    color: '#64748b',
    fontSize: 12.5,
    fontFamily: fonts.medium,
    textDecorationLine: 'line-through',
  },
  quoteValueDiscount: {
    color: '#fc1c46',
    fontSize: 13.5,
    fontFamily: fonts.headingBold,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  quoteSavings: {
    color: '#fc1c46',
    fontSize: 13,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#fc1c46',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  emptyOuter: {
    marginTop: 10,
  },
  emptyInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
