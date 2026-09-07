import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import { MapPinIcon, ShieldCheckIcon, ZapIcon, WalletIcon, CheckCircleIcon, UsersIcon } from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  onNavigateSplit,
}) => {
  const { userProfile } = useAuth();
  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('FULL');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);
  const [mpProcessingModal, setMpProcessingModal] = useState<boolean>(false);
  const [mpCheckoutUrl, setMpCheckoutUrl] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(420); // 7 minutes hold

  // Countdown timer for 7min Redis slot lock
  useEffect(() => {
    const timer = setInterval(() => {
      setHoldTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Tiempo agotado', 'El bloqueo temporal de 7 minutos ha expirado. Por favor, selecciona el turno nuevamente.', [
            { text: 'Volver', onPress: onNavigateBack }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const serviceFee = 2000;
  const grandTotal = slot.price + serviceFee;
  const perPersonAmount = Math.round(grandTotal / playerCount);
  const finalPayable = paymentType === 'FULL' ? grandTotal : perPersonAmount;

  const handlePaymentTypeChange = (type: 'FULL' | 'SPLIT') => {
    triggerHaptic('selection');
    setPaymentType(type);
  };

  const handlePlayerCountChange = (count: number) => {
    triggerHaptic('selection');
    setPlayerCount(count);
  };

  const handleCheckout = async () => {
    triggerHaptic('medium');
    setLoading(true);
    const holdRes = await mobileApi.holdBooking({
      courtId: slot.courtId,
      date: slot.date,
      startTime: slot.startTime,
      userId: userProfile?.uid || 'usr-emi',
      userName: userProfile?.displayName || 'Emiliano',
      userPhone: userProfile?.phone || '+5491155550001',
      paymentType,
      splitPlayerCount: paymentType === 'SPLIT' ? playerCount : undefined,
    });

    setLoading(false);

    if (!holdRes.success || !holdRes.booking) {
      triggerHaptic('error');
      Alert.alert('No se pudo reservar', holdRes.error || 'El turno ya fue ocupado');
      return;
    }

    setPendingBooking(holdRes.booking);

    // If we have a Mercado Pago Checkout preference URL
    const checkoutUrl = holdRes.checkout?.initPoint || holdRes.checkout?.sandboxInitPoint;

    if (checkoutUrl) {
      setMpCheckoutUrl(checkoutUrl);
    } else {
      // Fallback local processing
      setMpProcessingModal(true);
      setTimeout(async () => {
        if (paymentType === 'FULL') {
          await mobileApi.confirmBooking(holdRes.booking!.id);
        }
        setMpProcessingModal(false);
        triggerHaptic('success');

        if (paymentType === 'SPLIT') {
          onNavigateSplit(holdRes.booking!);
        } else {
          onNavigateSuccess(holdRes.booking!);
        }
      }, 1200);
    }
  };

  const handleWebViewNavigationChange = async (navState: any) => {
    const { url } = navState;
    if (!url) return;

    // Detect return to app or approval back_url
    if (
      url.includes('hayequipo://') ||
      url.includes('booking') && url.includes('status=approved') ||
      url.includes('status=success')
    ) {
      setMpCheckoutUrl(null);
      triggerHaptic('success');

      if (pendingBooking) {
        if (paymentType === 'FULL') {
          await mobileApi.confirmBooking(pendingBooking.id);
          onNavigateSuccess(pendingBooking);
        } else {
          onNavigateSplit(pendingBooking);
        }
      }
    } else if (url.includes('status=failure')) {
      setMpCheckoutUrl(null);
      triggerHaptic('error');
      Alert.alert('Pago no completado', 'No se pudo procesar el pago con Mercado Pago. Podés intentar nuevamente.');
    }
  };

  const handleDirectDemoSplit = async () => {
    triggerHaptic('medium');
    setLoading(true);
    const holdRes = await mobileApi.holdBooking({
      courtId: slot.courtId,
      date: slot.date,
      startTime: slot.startTime,
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+5491155550001',
      paymentType: 'SPLIT',
      splitPlayerCount: playerCount,
    });
    setLoading(false);
    if (holdRes.booking) {
      onNavigateSplit(holdRes.booking);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ═══════════════════════════════════════════════════════
          TOP HEADER
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            triggerHaptic('light');
            onNavigateBack();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Reserva</Text>
        <View style={styles.holdTimerBadge}>
          <Text style={styles.holdTimerText}>⏱ {formatTimer(holdTimerSeconds)}</Text>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════
          BOOKING DETAILS CARD (BLACK CARD)
          ═══════════════════════════════════════════════════════ */}
      <DoubleBezelCard variant="black" style={styles.summaryCardOuter} innerStyle={styles.summaryCardInner}>
        <View style={styles.courtHeader}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.courtName}>{slot.courtName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
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
      </DoubleBezelCard>

      {/* ═══════════════════════════════════════════════════════
          PAYMENT OPTION SELECTOR (BLACK & RED CARD OPTIONS)
          ═══════════════════════════════════════════════════════ */}
      <Text style={styles.sectionTitle}>¿Cómo querés pagar?</Text>
      <View style={styles.paymentOptions}>
        <DoubleBezelCard
          variant="black"
          style={styles.paymentOptionOuter}
          innerStyle={[styles.paymentOptionInner, paymentType === 'FULL' && styles.paymentOptionInnerActive]}
          highlighted={paymentType === 'FULL'}
          onPress={() => handlePaymentTypeChange('FULL')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, paymentType === 'FULL' && styles.radioCircleActive]}>
              {paymentType === 'FULL' && <View style={styles.radioInnerDot} />}
            </View>
            <Text style={styles.paymentOptionTitle}>Pagar el total ahora (100%)</Text>
          </View>
          <Text style={styles.paymentOptionSubtitle}>Abonás la totalidad de la reserva y asegurás la cancha.</Text>
          <Text style={styles.paymentOptionPrice}>{formatCurrency(grandTotal)}</Text>
        </DoubleBezelCard>

        <DoubleBezelCard
          variant="red"
          style={styles.paymentOptionOuter}
          innerStyle={[styles.paymentOptionInnerRed, paymentType === 'SPLIT' && styles.paymentOptionInnerRedActive]}
          highlighted={paymentType === 'SPLIT'}
          onPress={() => handlePaymentTypeChange('SPLIT')}
          glow
        >
          <View style={styles.splitBadge}>
            <ZapIcon size={10} color="#fc1c46" strokeWidth={2.5} />
            <Text style={[styles.splitBadgeText, { marginLeft: 3 }]}>SALA DE ESPERA</Text>
          </View>
          <View style={styles.radioRow}>
            <View style={[styles.radioCircleWhite, paymentType === 'SPLIT' && styles.radioCircleWhiteActive]}>
              {paymentType === 'SPLIT' && <View style={styles.radioInnerDotWhite} />}
            </View>
            <Text style={styles.paymentOptionTitleWhite}>Dividir entre jugadores (Split Lobby)</Text>
          </View>
          <Text style={styles.paymentOptionSubtitleWhite}>
            Abonás tu parte ({formatCurrency(perPersonAmount)}), se abre la sala y tus amigos pagan la suya por WhatsApp.
          </Text>
          <Text style={styles.splitHighlightWhite}>{formatCurrency(perPersonAmount)} / persona</Text>
        </DoubleBezelCard>
      </View>

      {/* ═══════════════════════════════════════════════════════
          PLAYER COUNT SELECTOR (SPLIT)
          ═══════════════════════════════════════════════════════ */}
      {paymentType === 'SPLIT' ? (
        <DoubleBezelCard variant="black" style={styles.splitConfigOuter} innerStyle={styles.splitConfigInner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <UsersIcon size={14} color="#fc1c46" strokeWidth={2} />
            <Text style={styles.splitConfigTitle}>Cantidad de jugadores en la sala:</Text>
          </View>
          <View style={styles.playerCountRow}>
            {[2, 4, 8, 10, 14].map(num => (
              <TouchableOpacity
                key={num}
                style={[styles.playerCountBtn, playerCount === num && styles.playerCountBtnActive]}
                onPress={() => handlePlayerCountChange(num)}
                activeOpacity={0.8}
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
        </DoubleBezelCard>
      ) : null}

      {/* ═══════════════════════════════════════════════════════
          HOST GUARANTEE NOTICE (SPLIT)
          ═══════════════════════════════════════════════════════ */}
      {paymentType === 'SPLIT' ? (
        <DoubleBezelCard variant="black" style={styles.hostNoticeOuter} innerStyle={styles.hostNoticeInner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldCheckIcon size={16} color="#fc1c46" strokeWidth={2.2} />
            <Text style={styles.hostNoticeTitle}>Garantía del Organizador (Host)</Text>
          </View>
          <Text style={styles.hostNoticeText}>
            Abonás tu cuota inicial ({formatCurrency(perPersonAmount)}) para congelar la cancha y abrir la sala de invitación por WhatsApp.
          </Text>
          <View style={styles.hostWarningBox}>
            <Text style={styles.hostWarningText}>
              ⚠️ <Text style={{ fontFamily: fonts.bold, color: '#ffffff' }}>Regla de Quórum:</Text> Si tus compañeros no completan el pago de los {playerCount - 1} cupos restantes antes del inicio del partido, la diferencia pendiente se debitará automáticamente al Host para garantizar el pago total de la cancha al Club.
            </Text>
          </View>
        </DoubleBezelCard>
      ) : null}

      {/* ═══════════════════════════════════════════════════════
          PRICE BREAKDOWN (BLACK CARD)
          ═══════════════════════════════════════════════════════ */}
      <DoubleBezelCard variant="black" style={styles.breakdownOuter} innerStyle={styles.breakdownInner}>
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
            {paymentType === 'FULL' ? 'Total a Pagar' : 'Tu Cuota como Host'}
          </Text>
          <Text style={styles.totalValue}>
            {formatCurrency(finalPayable)}
          </Text>
        </View>
      </DoubleBezelCard>

      {/* ═══════════════════════════════════════════════════════
          PAY BUTTON & TRUST BADGE
          ═══════════════════════════════════════════════════════ */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handleCheckout}
        disabled={loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.payButtonText}>
            {paymentType === 'FULL'
              ? `Pagar Total · ${formatCurrency(finalPayable)}`
              : `Abonar Mi Parte y Abrir Sala · ${formatCurrency(finalPayable)}`}
          </Text>
        )}
      </TouchableOpacity>

      {paymentType === 'SPLIT' && (
        <TouchableOpacity
          style={styles.directDemoBtn}
          onPress={handleDirectDemoSplit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <ZapIcon size={14} color="#fc1c46" strokeWidth={2.2} />
          <Text style={styles.directDemoBtnText}>
            ⚡ Abrir Sala de Espera Directamente (Demo)
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.guaranteeRow}>
        <ShieldCheckIcon size={13} color="#fc1c46" strokeWidth={2} />
        <Text style={styles.guaranteeText}>Pago 100% seguro y encriptado con Mercado Pago</Text>
      </View>

      {/* ═══════════════════════════════════════════════════════
          MERCADO PAGO CHECKOUT PRO MODAL (WEBVIEW & BROWSER)
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={!!mpCheckoutUrl}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          Alert.alert(
            '¿Interrumpir el pago?',
            'Si cancelás ahora, tu reserva quedará retenida unos minutos antes de liberarse.',
            [
              { text: 'Continuar pagando', style: 'cancel' },
              { text: 'Interrumpir', style: 'destructive', onPress: () => setMpCheckoutUrl(null) }
            ]
          );
        }}
      >
        <View style={styles.mpWebContainer}>
          <View style={styles.mpWebHeader}>
            <TouchableOpacity
              style={styles.mpWebCloseBtn}
              onPress={() => setMpCheckoutUrl(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.mpWebCloseText}>✕ Cerrar</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.mpWebTitle}>Mercado Pago</Text>
              <Text style={styles.mpWebSub}>Checkout Pro Seguro</Text>
            </View>
            <TouchableOpacity
              style={styles.mpWebExternalBtn}
              onPress={() => {
                if (mpCheckoutUrl) {
                  Linking.openURL(mpCheckoutUrl);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.mpWebExternalText}>Navegador ↗</Text>
            </TouchableOpacity>
          </View>

          {mpCheckoutUrl && (
            <WebView
              source={{ uri: mpCheckoutUrl }}
              onNavigationStateChange={handleWebViewNavigationChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.mpWebLoading}>
                  <ActivityIndicator size="large" color="#009EE3" />
                  <Text style={styles.mpWebLoadingText}>Conectando con Mercado Pago...</Text>
                </View>
              )}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MERCADO PAGO LOCAL SIMULATION OVERLAY (FALLBACK)
          ═══════════════════════════════════════════════════════ */}
      {mpProcessingModal ? (
        <View style={styles.mpModalOverlay}>
          <DoubleBezelCard variant="black" style={styles.mpModalOuter} innerStyle={styles.mpModalInner}>
            <View style={{ marginBottom: 14, alignItems: 'center' }}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="3" stroke="#009EE3" strokeWidth={2} />
                <Line x1="2" y1="10" x2="22" y2="10" stroke="#009EE3" strokeWidth={1.8} />
              </Svg>
            </View>
            <Text style={styles.mpModalTitle}>Mercado Pago</Text>
            <Text style={styles.mpModalSub}>Procesando pago seguro...</Text>
            <ActivityIndicator size="large" color="#009EE3" style={{ marginVertical: 20 }} />
            <Text style={styles.mpModalHint}>Acreditación instantánea</Text>
          </DoubleBezelCard>
        </View>
      ) : null}
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
    paddingBottom: 50,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0b0e14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
  },
  backBtnText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  summaryCardOuter: {
    marginBottom: 20,
  },
  summaryCardInner: {
    padding: 16,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courtName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  clubName: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12.5,
  },
  sportBadge: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: {
    color: '#fc1c46',
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: '#0f172a',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  paymentOptions: {
    gap: 12,
    marginBottom: 18,
  },
  paymentOptionOuter: {
    width: '100%',
  },
  paymentOptionInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
    position: 'relative',
  },
  paymentOptionInnerActive: {
    backgroundColor: '#121624',
    borderColor: '#fc1c46',
  },
  paymentOptionInnerRed: {
    backgroundColor: '#fc1c46',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 16,
    position: 'relative',
  },
  paymentOptionInnerRedActive: {
    backgroundColor: '#e11d48',
  },
  splitBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#0b0e14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#64748b',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#fc1c46',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fc1c46',
  },
  radioCircleWhite: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleWhiteActive: {
    borderColor: '#ffffff',
  },
  radioInnerDotWhite: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  paymentOptionTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  paymentOptionSubtitle: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16.5,
    paddingRight: 20,
  },
  paymentOptionPrice: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 16,
  },
  paymentOptionTitleWhite: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  paymentOptionSubtitleWhite: {
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16.5,
    paddingRight: 20,
  },
  splitHighlightWhite: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 16,
  },
  splitConfigOuter: {
    marginBottom: 18,
  },
  splitConfigInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 14,
  },
  splitConfigTitle: {
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    fontSize: 13,
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  playerCountBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerCountBtnActive: {
    backgroundColor: '#fc1c46',
    borderColor: '#fc1c46',
  },
  playerCountBtnText: {
    fontFamily: fonts.bold,
    color: '#cbd5e1',
    fontSize: 14,
  },
  playerCountBtnTextActive: {
    color: '#ffffff',
  },
  splitHelpText: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11.5,
    marginTop: 8,
    lineHeight: 16,
  },
  hostNoticeOuter: {
    marginBottom: 18,
  },
  hostNoticeInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    padding: 14,
  },
  hostNoticeTitle: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13.5,
  },
  hostNoticeText: {
    fontFamily: fonts.regular,
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  hostWarningBox: {
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#fc1c46',
  },
  hostWarningText: {
    fontFamily: fonts.regular,
    color: '#cbd5e1',
    fontSize: 11.5,
    lineHeight: 16,
  },
  breakdownOuter: {
    marginBottom: 20,
  },
  breakdownInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 13,
  },
  breakdownValue: {
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    fontSize: 13,
  },
  totalLabel: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
  },
  totalValue: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 19,
    letterSpacing: -0.3,
  },
  payButton: {
    backgroundColor: '#fc1c46',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  payButtonText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  directDemoBtn: {
    backgroundColor: '#0b0e14',
    borderWidth: 1.5,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  directDemoBtnText: {
    color: '#fc1c46',
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  guaranteeText: {
    fontFamily: fonts.regular,
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
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
    padding: 20,
    zIndex: 999,
  },
  mpModalOuter: {
    width: '90%',
  },
  mpModalInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    padding: 24,
    alignItems: 'center',
  },
  mpModalTitle: {
    color: '#009EE3',
    fontFamily: fonts.headingBold,
    fontSize: 20,
  },
  mpModalSub: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  mpModalHint: {
    fontFamily: fonts.medium,
    color: '#64748b',
    fontSize: 12,
  },
  holdTimerBadge: {
    backgroundColor: '#0b0e14',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.4)',
  },
  holdTimerText: {
    color: '#fc1c46',
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  mpWebContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mpWebHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#0b0e14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mpWebCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mpWebCloseText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  mpWebTitle: {
    color: '#009EE3',
    fontFamily: fonts.headingBold,
    fontSize: 15,
  },
  mpWebSub: {
    color: '#94a3b8',
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  mpWebExternalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#009EE3',
  },
  mpWebExternalText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  mpWebLoading: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mpWebLoadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#64748b',
  },
});
