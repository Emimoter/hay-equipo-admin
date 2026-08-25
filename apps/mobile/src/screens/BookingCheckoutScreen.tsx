import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import { colors, typography, formatCurrency } from '../components/theme';
import { MapPinIcon, ShieldCheckIcon, ZapIcon } from '../components/AppIcons';
import { mobileApi } from '../services/api';
import { TimeSlot, Booking } from '@hay-equipo/contracts';

interface BookingCheckoutScreenProps {
  slot: TimeSlot;
  onNavigateBack: () => void;
  onNavigateSuccess: (booking: Booking) => void;
  onNavigateSplit: (booking: Booking) => void;
}

export const BookingCheckoutScreen: React.FC<BookingCheckoutScreenProps> = ({
  slot,
  onNavigateBack,
  onNavigateSuccess,
  onNavigateSplit
}) => {
  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('FULL');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);
  const [mpProcessingModal, setMpProcessingModal] = useState<boolean>(false);

  const serviceFee = 2000;
  const grandTotal = slot.price + serviceFee;
  const perPersonAmount = Math.round(grandTotal / playerCount);

  const handleCheckout = async () => {
    setLoading(true);
    const holdRes = await mobileApi.holdBooking({
      courtId: slot.courtId,
      date: slot.date,
      startTime: slot.startTime,
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+5491155550001',
      paymentType,
      splitPlayerCount: paymentType === 'SPLIT' ? playerCount : undefined
    });

    setLoading(false);

    if (!holdRes.success || !holdRes.booking) {
      Alert.alert('No se pudo reservar', holdRes.error || 'El turno ya fue ocupado');
      return;
    }

    // Open Mercado Pago Simulation Modal
    setMpProcessingModal(true);

    setTimeout(async () => {
      if (paymentType === 'FULL') {
        await mobileApi.confirmBooking(holdRes.booking!.id);
      }
      setMpProcessingModal(false);

      if (paymentType === 'SPLIT') {
        onNavigateSplit(holdRes.booking!);
      } else {
        onNavigateSuccess(holdRes.booking!);
      }
    }, 1200);
  };

  const handleDirectDemoSplit = async () => {
    setLoading(true);
    const holdRes = await mobileApi.holdBooking({
      courtId: slot.courtId,
      date: slot.date,
      startTime: slot.startTime,
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+5491155550001',
      paymentType: 'SPLIT',
      splitPlayerCount: playerCount
    });
    setLoading(false);
    if (holdRes.booking) {
      onNavigateSplit(holdRes.booking);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onNavigateBack}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={typography.titleMedium}>Confirmar Reserva</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Booking Details Card */}
      <View style={styles.summaryCard}>
        <View style={styles.courtHeader}>
          <View>
            <Text style={styles.courtName}>{slot.courtName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPinIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
              <Text style={styles.clubName}>{slot.clubName}</Text>
            </View>
          </View>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{slot.sportType}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailValue}>{slot.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Horario</Text>
            <Text style={styles.detailValue}>{slot.startTime} – {slot.endTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duración</Text>
            <Text style={styles.detailValue}>{slot.durationMinutes} min</Text>
          </View>
        </View>
      </View>

      {/* Payment Option Selector */}
      <Text style={styles.sectionTitle}>¿Cómo querés pagar?</Text>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentOptionCard, paymentType === 'FULL' && styles.paymentOptionCardActive]}
          onPress={() => setPaymentType('FULL')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, paymentType === 'FULL' && styles.radioCircleActive]} />
            <Text style={styles.paymentOptionTitle}>Pagar el total ahora</Text>
          </View>
          <Text style={styles.paymentOptionSubtitle}>Abonás la totalidad de la reserva y asegurás la cancha.</Text>
          <Text style={styles.paymentOptionPrice}>{formatCurrency(grandTotal)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOptionCard, paymentType === 'SPLIT' && styles.paymentOptionCardActive]}
          onPress={() => setPaymentType('SPLIT')}
        >
          <View style={styles.splitBadge}>
            <ZapIcon size={10} color="#fc1c46" strokeWidth={2.5} />
            <Text style={[styles.splitBadgeText, { marginLeft: 3 }]}>SALA DE ESPERA</Text>
          </View>
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, paymentType === 'SPLIT' && styles.radioCircleActive]} />
            <Text style={styles.paymentOptionTitle}>Dividir entre jugadores (Split Lobby)</Text>
          </View>
          <Text style={styles.paymentOptionSubtitle}>
            Abonás tu parte ({formatCurrency(perPersonAmount)}), se abre la sala de espera y tus amigos pagan la suya por WhatsApp.
          </Text>
          <Text style={styles.splitHighlight}>{formatCurrency(perPersonAmount)} / persona</Text>
        </TouchableOpacity>
      </View>

      {/* Player Count Selector for Split */}
      {paymentType === 'SPLIT' ? (
        <View style={styles.splitConfigCard}>
          <Text style={styles.splitConfigTitle}>Cantidad de jugadores en la sala:</Text>
          <View style={styles.playerCountRow}>
            {[2, 4, 8, 10, 14].map(num => (
              <TouchableOpacity
                key={num}
                style={[styles.playerCountBtn, playerCount === num && styles.playerCountBtnActive]}
                onPress={() => setPlayerCount(num)}
              >
                <Text style={[styles.playerCountBtnText, playerCount === num && styles.playerCountBtnTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.splitHelpText}>
            Cada jugador pagará {formatCurrency(perPersonAmount)}. La cancha se confirmará en el club una vez que todos abonen.
          </Text>
        </View>
      ) : null}

      {/* Price Breakdown */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Alquiler de Cancha</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(slot.price)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Cargo de servicio Hay Equipo</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(serviceFee)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>
            {paymentType === 'FULL' ? 'Total a Pagar' : 'Tu Cuota a Pagar'}
          </Text>
          <Text style={styles.totalValue}>
            {paymentType === 'FULL' ? formatCurrency(grandTotal) : `${formatCurrency(perPersonAmount)} (tu parte)`}
          </Text>
        </View>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.payButtonText}>
            {paymentType === 'FULL'
              ? `Pagar Total · ${formatCurrency(grandTotal)}`
              : `Abonar Mi Parte y Abrir Sala · ${formatCurrency(perPersonAmount)}`}
          </Text>
        )}
      </TouchableOpacity>

      {/* Provisional Direct Button to open Split Lobby instantly */}
      {paymentType === 'SPLIT' && (
        <TouchableOpacity
          style={styles.directDemoBtn}
          onPress={handleDirectDemoSplit}
          disabled={loading}
        >
          <ZapIcon size={14} color="#fc1c46" strokeWidth={2.2} />
          <Text style={styles.directDemoBtnText}>
            ⚡ Abrir Sala de Espera Directamente (Demo)
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
        <ShieldCheckIcon size={13} color="#10B981" strokeWidth={2} />
        <Text style={styles.guaranteeText}>Pago 100% seguro y encriptado con Mercado Pago</Text>
      </View>

      {/* Simulated MP Checkout Modal Overlay */}
      {mpProcessingModal ? (
        <View style={styles.mpModalOverlay}>
          <View style={styles.mpModalCard}>
            <View style={{ marginBottom: 12, alignItems: 'center' }}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="3" stroke="#009EE3" strokeWidth={2} />
                <Line x1="2" y1="10" x2="22" y2="10" stroke="#009EE3" strokeWidth={1.8} />
              </Svg>
            </View>
            <Text style={styles.mpModalTitle}>Mercado Pago</Text>
            <Text style={styles.mpModalSub}>Procesando pago seguro...</Text>
            <ActivityIndicator size="large" color="#009EE3" style={{ marginVertical: 20 }} />
            <Text style={styles.mpModalHint}>Acreditación instantánea</Text>
          </View>
        </View>
      ) : null}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    padding: 8
  },
  backBtnText: {
    color: colors.primary,
    fontWeight: '700'
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 20
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  courtName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700'
  },
  clubName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  sportBadge: {
    backgroundColor: colors.elevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  sportBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    alignItems: 'center'
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 2
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  sectionTitle: {
    ...typography.titleMedium,
    marginBottom: 12
  },
  paymentOptions: {
    gap: 12,
    marginBottom: 20
  },
  paymentOptionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    position: 'relative'
  },
  paymentOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.elevated
  },
  splitBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  splitBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '800'
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: 10
  },
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  paymentOptionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  paymentOptionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16
  },
  paymentOptionPrice: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  splitHighlight: {
    color: colors.neonAccent,
    fontSize: 16,
    fontWeight: '800'
  },
  splitConfigCard: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20
  },
  splitConfigTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 10
  },
  playerCountBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.elevated,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  playerCountBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  playerCountBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14
  },
  playerCountBtnTextActive: {
    color: colors.background
  },
  splitHelpText: {
    color: colors.textMuted,
    fontSize: 11.5,
    marginTop: 8,
    lineHeight: 16
  },
  breakdownCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 20
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  breakdownLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  totalValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800'
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  payButtonText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 16
  },
  directDemoBtn: {
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12
  },
  directDemoBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14
  },
  guaranteeText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center'
  },
  mpModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  mpModalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  mpModalTitle: {
    color: '#009EE3',
    fontSize: 20,
    fontWeight: '800'
  },
  mpModalSub: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4
  },
  mpModalHint: {
    color: colors.textMuted,
    fontSize: 12
  }
});
