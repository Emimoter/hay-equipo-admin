import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
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

  const handleLiberateOccurrence = async (occId: string) => {
    Alert.alert(
      '¿Liberar esta fecha al marketplace?',
      'Si alguien reserva tu cancha esta semana, no se te cobrará penalización y recibirás crédito en la app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, liberar fecha',
          style: 'destructive',
          onPress: async () => {
            await mobileApi.liberateOccurrence(occId);
            Alert.alert('¡Fecha liberada!', 'La cancha volvió al marketplace para que otros jugadores puedan reservarla.');
            loadFixedSlots();
          }
        }
      ]
    );
  };

  const handleCreateFixedSlot = async () => {
    setSubmitting(true);
    const res = await mobileApi.subscribeFixedSlot({
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+5491155550001',
      clubId: 'club-arena-palermo',
      courtId: 'court-arena-1',
      dayOfWeek: selectedDay,
      startTime: selectedTime,
      durationMonths
    });
    setSubmitting(false);

    if (res.success) {
      Alert.alert('¡Turno Fijo Contratado!', res.message);
      setActiveTab('MY_SLOTS');
      loadFixedSlots();
    } else {
      Alert.alert('Error', res.error || 'No se pudo contratar el turno');
    }
  };

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.titleLarge}>Turnos Fijos Semanales</Text>
        <Text style={styles.subtitle}>Tu cancha fija asegurada, todos los meses con descuento.</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MY_SLOTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('MY_SLOTS')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'MY_SLOTS' && styles.tabBtnTextActive]}>
            Mis Turnos Activos ({subscriptions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'NEW_SLOT' && styles.tabBtnActive]}
          onPress={() => setActiveTab('NEW_SLOT')}
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
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aún no tenés turnos fijos</Text>
            <Text style={styles.emptySub}>Contratá un horario semanal para jugar siempre con tu grupo.</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => setActiveTab('NEW_SLOT')}>
              <Text style={styles.ctaButtonText}>Buscar Turno Fijo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {subscriptions.map(sub => (
              <View key={sub.id} style={styles.subCard}>
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
              </View>
            ))}
          </View>
        )
      ) : (
        <View style={styles.newSlotCard}>
          <Text style={styles.formTitle}>Configurá tu Turno Semanal</Text>

          {/* Select Club */}
          <Text style={styles.fieldLabel}>Club Seleccionado</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>Arena Pádel Palermo (Cancha 1 Panorámica)</Text>
          </View>

          {/* Select Day */}
          <Text style={styles.fieldLabel}>Día de la semana</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {daysOfWeek.map((dayName, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dayChip, selectedDay === idx && styles.dayChipActive]}
                onPress={() => setSelectedDay(idx)}
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
                onPress={() => setSelectedTime(t)}
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
              { m: 6, label: '6 Meses' }
            ].map(d => (
              <TouchableOpacity
                key={d.m}
                style={[styles.durationBtn, durationMonths === d.m && styles.durationBtnActive]}
                onPress={() => setDurationMonths(d.m)}
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
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitBtnText}>Asegurar Turno Fijo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    marginBottom: 20
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 4
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: colors.primary
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700'
  },
  tabBtnTextActive: {
    color: colors.background
  },
  subCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  subClub: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  subCourt: {
    color: colors.textSecondary,
    fontSize: 13
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  activeBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11
  },
  subScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  subSchedule: {
    color: colors.neonAccent,
    fontSize: 13,
    fontWeight: '700'
  },
  subPrice: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  savingsBox: {
    backgroundColor: '#1E1B4B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14
  },
  savingsText: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  occurrencesTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8
  },
  occRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder
  },
  occDate: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  occStatus: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  liberateBtn: {
    backgroundColor: colors.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  liberateBtnText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700'
  },
  liberatedPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  liberatedPillText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700'
  },
  newSlotCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16
  },
  formTitle: {
    ...typography.titleMedium,
    marginBottom: 16
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10
  },
  readOnlyField: {
    backgroundColor: colors.elevated,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  readOnlyText: {
    color: colors.textPrimary,
    fontSize: 13
  },
  daysScroll: {
    marginBottom: 10
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.elevated,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dayChipText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  dayChipTextActive: {
    color: colors.background,
    fontWeight: '700'
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.elevated,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  timeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  timeBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  timeBtnTextActive: {
    color: colors.background
  },
  durationRow: {
    gap: 8
  },
  durationBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  durationBtnActive: {
    backgroundColor: colors.elevated,
    borderColor: colors.primary
  },
  durationBtnText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  durationBtnTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  quoteBox: {
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  quoteLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  quoteValueStrike: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'line-through'
  },
  quoteValueDiscount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  },
  quoteDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 8
  },
  quoteSavings: {
    color: colors.neonAccent,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center'
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitBtnText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 15
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  ctaButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 13
  }
});
