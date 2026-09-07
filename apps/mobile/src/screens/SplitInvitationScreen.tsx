import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import {
  PadelIcon,
  FootballIcon,
  TennisIcon,
  CalendarIcon,
  ClockIcon,
  WhatsAppIcon,
  LinkIcon,
  TrophyIcon,
  CheckCircleIcon,
  ZapIcon,
  ArrowRightIcon,
  CloseIcon,
  ShieldCheckIcon,
  WalletIcon,
} from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking } from '@hay-equipo/contracts';

interface SplitInvitationScreenProps {
  booking: Booking;
  onNavigateHome: () => void;
  onNavigateMyBookings: () => void;
}

export const SplitInvitationScreen: React.FC<SplitInvitationScreenProps> = ({
  booking,
  onNavigateHome,
  onNavigateMyBookings,
}) => {
  const { userProfile } = useAuth();
  const [splitData, setSplitData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [friendNameInput, setFriendNameInput] = useState<string>('');
  const [selectedSlotForSim, setSelectedSlotForSim] = useState<any>(null);

  // Host Rescue & Timeout States
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false);
  const [refundSuccessModal, setRefundSuccessModal] = useState<boolean>(false);
  const [refundInfo, setRefundInfo] = useState<{ amount: number } | null>(null);

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (booking.splitToken) {
      loadSplit();
    }
  }, [booking]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && splitData && !splitData.isComplete) {
      triggerHaptic('warning');
      setShowTimeoutModal(true);
    }
  }, [timeLeft, splitData]);

  const loadSplit = async () => {
    if (!booking.splitToken) return;
    const res = await mobileApi.getSplitDetails(booking.splitToken);
    if (res?.data) {
      setSplitData(res.data);
    }
  };

  const shareToken = booking.splitToken || 'HE-7492';
  const shareUrl = `https://hayequipo.com/split/${shareToken}`;
  const totalSlots = splitData?.totalSlots || 4;
  const paidCount = splitData?.paidCount || 1;
  const pendingCount = splitData?.pendingCount || (totalSlots - paidCount);
  const perShare = splitData?.participants?.[0]?.amount || Math.round(booking.totalPrice / totalSlots);
  const totalCollected = splitData?.totalCollected || (paidCount * perShare);
  const remainingAmount = splitData?.remainingAmount || (pendingCount * perShare);
  const progressPercent = Math.min(100, Math.round((paidCount / totalSlots) * 100));
  const isComplete = splitData?.isComplete || paidCount === totalSlots;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const message = `🏆 ¡Hay Equipo! Te sumé al partido en ${booking.clubName}.\n\n📅 Fecha: ${booking.date}\n⏰ Horario: ${booking.startTime} hs\n💵 Tu cuota: ${formatCurrency(perShare)}\n\n📲 Entrá a la sala de espera y aboná en 1 clic: ${shareUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Share.share({ message });
    });
  };

  const handleCopyLink = () => {
    triggerHaptic('light');
    Share.share({
      title: `Sala de Espera - Partido en ${booking.clubName}`,
      message: `Sumate a la sala y pagá tu parte para el partido en ${booking.clubName}: ${shareUrl}`,
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenSlotSimulation = (participant: any) => {
    triggerHaptic('light');
    setSelectedSlotForSim(participant);
    setFriendNameInput(participant.name.includes('Jugador') ? '' : participant.name);
    setShowSimulateModal(true);
  };

  const handleConfirmFriendPayment = async () => {
    if (!selectedSlotForSim) return;
    triggerHaptic('medium');
    setIsSimulating(true);
    const finalName = friendNameInput.trim() || `Jugador ${selectedSlotForSim.slotNumber}`;
    await mobileApi.paySplitShare(booking.splitToken || 'HE-7492', selectedSlotForSim.id, finalName);
    await loadSplit();
    setIsSimulating(false);
    setShowSimulateModal(false);
    triggerHaptic('success');
  };

  const handleSimulateAllRemaining = async () => {
    triggerHaptic('medium');
    setIsSimulating(true);
    await mobileApi.payRemainingSplitShares(booking.splitToken || 'HE-7492');
    await loadSplit();
    setIsSimulating(false);
    triggerHaptic('success');
  };

  const handleCoverRemaining = async () => {
    triggerHaptic('medium');
    setIsSimulating(true);
    await mobileApi.confirmBooking(booking.id);
    await mobileApi.payRemainingSplitShares(booking.splitToken || 'HE-7492');
    await loadSplit();
    setIsSimulating(false);
    setShowTimeoutModal(false);
    triggerHaptic('success');
    Alert.alert('¡Cancha Asegurada!', 'Abonaste el saldo pendiente. La cancha quedó confirmada para tu grupo.');
  };

  const handleCancelAndRefund = async () => {
    triggerHaptic('warning');
    setIsSimulating(true);
    const refundAmount = totalCollected;
    await mobileApi.cancelSplitAndRefundToWallet(booking.splitToken || 'HE-7492');
    setRefundInfo({ amount: refundAmount });
    setShowTimeoutModal(false);
    setIsSimulating(false);
    triggerHaptic('success');
    setRefundSuccessModal(true);
  };

  const handleExtend5Min = () => {
    triggerHaptic('light');
    setTimeLeft(prev => prev + 300);
    setShowTimeoutModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ═══════════════════════════════════════════════════════
          TOP BAR & TIMEOUT BADGE
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.topHeader}>
        <View style={styles.roomBadge}>
          <Text style={styles.roomBadgeLabel}>SALA</Text>
          <Text style={styles.roomBadgeCode}>#{shareToken}</Text>
        </View>

        {!isComplete ? (
          <Animated.View style={[styles.timerBadge, { transform: [{ scale: timeLeft < 120 ? pulseAnim : 1 }] }]}>
            <ClockIcon size={13} color="#fc1c46" strokeWidth={2.4} />
            <Text style={[styles.timerText, { color: timeLeft < 120 ? '#ef4444' : '#fc1c46' }]}>
              {timeString}
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.timerBadgeComplete}>
            <CheckCircleIcon size={14} color="#fc1c46" strokeWidth={2.2} />
            <Text style={styles.timerTextComplete}>CONFIRMADO</Text>
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════
          HERO MATCH DETAILS CARD (BLACK CARD)
          ═══════════════════════════════════════════════════════ */}
      <DoubleBezelCard variant="black" style={styles.matchHeroOuter} innerStyle={styles.matchHeroInner}>
        <View style={styles.matchHeroTop}>
          <View style={styles.sportIconCircle}>
            <PadelIcon size={20} color="#fc1c46" strokeWidth={2} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.matchClubName}>{booking.clubName || 'Arena Pádel Palermo'}</Text>
            <Text style={styles.matchCourtName}>{booking.courtName || 'Cancha 1 Panorámica'}</Text>
          </View>
          <View style={[styles.statusPill, isComplete && styles.statusPillComplete]}>
            <Text style={[styles.statusPillText, isComplete && styles.statusPillTextComplete]}>
              {isComplete ? 'CONFIRMADO' : 'BLOQUEADA'}
            </Text>
          </View>
        </View>

        <View style={styles.matchDivider} />

        <View style={styles.matchInfoRow}>
          <View style={styles.matchInfoCol}>
            <Text style={styles.matchInfoLabel}>FECHA Y HORA</Text>
            <Text style={styles.matchInfoVal}>{booking.date} · {booking.startTime} hs</Text>
          </View>
          <View style={[styles.matchInfoCol, styles.matchInfoColRight]}>
            <Text style={styles.matchInfoLabel}>CUOTA POR JUGADOR</Text>
            <Text style={styles.matchInfoPrice}>{formatCurrency(perShare)}</Text>
          </View>
        </View>
      </DoubleBezelCard>

      {/* ═══════════════════════════════════════════════════════
          PROGRESS CARD (RED / BLACK DUAL TONE)
          ═══════════════════════════════════════════════════════ */}
      <DoubleBezelCard variant="black" style={styles.progressOuter} innerStyle={styles.progressInner}>
        <View style={styles.progressHeaderRow}>
          <View>
            <Text style={styles.progressTitle}>
              {isComplete ? '¡Cupos Completados!' : `Jugadores Confirmados (${paidCount}/${totalSlots})`}
            </Text>
            <Text style={styles.progressSubtitle}>
              {isComplete
                ? 'Todos los jugadores pagaron su cuota.'
                : `Faltan ${pendingCount} cuotas de ${formatCurrency(perShare)}`}
            </Text>
          </View>
          <View style={styles.progressAmountBadge}>
            <Text style={styles.progressAmountCollected}>{formatCurrency(totalCollected)}</Text>
            <Text style={styles.progressAmountTotal}> / {formatCurrency(booking.totalPrice)}</Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </DoubleBezelCard>

      {/* ═══════════════════════════════════════════════════════
          LOBBY PLAYERS LIST (BLACK CARDS)
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.lobbySectionHeader}>
        <Text style={styles.sectionTitle}>Jugadores en la Sala</Text>
        <Text style={styles.sectionSubtitle}>
          Cada amigo entra al link y paga con su Mercado Pago
        </Text>
      </View>

      <View style={styles.slotsContainer}>
        {(splitData?.participants || [
          { slotNumber: 1, name: 'Emiliano (Organizador)', isPaid: true, isOrganizer: true },
          { slotNumber: 2, name: 'Jugador 2', isPaid: false, isOrganizer: false },
          { slotNumber: 3, name: 'Jugador 3', isPaid: false, isOrganizer: false },
          { slotNumber: 4, name: 'Jugador 4', isPaid: false, isOrganizer: false },
        ]).map((participant: any, index: number) => {
          const isPaid = participant.isPaid;
          const isOrg = participant.isOrganizer || index === 0;
          const cleanName = participant.name || `Jugador ${index + 1}`;

          return (
            <DoubleBezelCard
              key={index}
              variant="black"
              style={styles.slotItemOuter}
              innerStyle={[
                styles.slotItemInner,
                isPaid ? styles.slotCardPaid : styles.slotCardPending,
              ]}
            >
              <View
                style={[
                  styles.slotAvatar,
                  isPaid ? styles.slotAvatarPaid : styles.slotAvatarPending,
                ]}
              >
                {isPaid ? (
                  <CheckCircleIcon size={18} color="#fc1c46" strokeWidth={2.4} />
                ) : (
                  <Text style={styles.slotAvatarNumber}>{index + 1}</Text>
                )}
              </View>

              <View style={styles.slotCenterInfo}>
                <View style={styles.slotNameRow}>
                  <Text style={[styles.slotPlayerName, isPaid && styles.slotPlayerNamePaid]}>
                    {cleanName}
                  </Text>
                  {isOrg && (
                    <View style={styles.orgTag}>
                      <Text style={styles.orgTagText}>ORGANIZADOR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.slotPlayerStatus}>
                  {isPaid
                    ? `Abonó su cuota de ${formatCurrency(participant.amount || perShare)}`
                    : `Cuota pendiente: ${formatCurrency(participant.amount || perShare)}`}
                </Text>
              </View>

              <View style={styles.slotActionCol}>
                {isPaid ? (
                  <View style={styles.badgePaid}>
                    <Text style={styles.badgePaidText}>PAGADO</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.simulateFriendBtn}
                    onPress={() => handleOpenSlotSimulation(participant)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.simulateFriendBtnText}>Pagar Cuota</Text>
                  </TouchableOpacity>
                )}
              </View>
            </DoubleBezelCard>
          );
        })}
      </View>

      {/* ═══════════════════════════════════════════════════════
          SHARE / INVITE SHORTCUTS
          ═══════════════════════════════════════════════════════ */}
      {!isComplete && (
        <View style={styles.shareSection}>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleShareWhatsApp}
            activeOpacity={0.88}
          >
            <WhatsAppIcon size={18} color="#ffffff" strokeWidth={2.2} />
            <Text style={styles.whatsappBtnText}>Invitar Jugadores por WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.shareSubRow}>
            <TouchableOpacity
              style={styles.copyLinkBtn}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <LinkIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.copyLinkBtnText}>
                {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoSimulateBtn}
              onPress={handleSimulateAllRemaining}
              disabled={isSimulating}
              activeOpacity={0.8}
            >
              {isSimulating ? (
                <ActivityIndicator size="small" color="#fc1c46" />
              ) : (
                <>
                  <ZapIcon size={14} color="#fc1c46" strokeWidth={2.2} />
                  <Text style={styles.demoSimulateBtnText}>Simular Todos</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Host Rescue & Timeout Buttons */}
          <View style={styles.rescueActionsRow}>
            <TouchableOpacity
              style={styles.rescueOptionsBtn}
              onPress={() => {
                triggerHaptic('light');
                setShowTimeoutModal(true);
              }}
              activeOpacity={0.8}
            >
              <ShieldCheckIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.rescueOptionsBtnText}>¿Qué pasa si no pagan? / Opciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoTimeoutBtn}
              onPress={() => {
                triggerHaptic('warning');
                setTimeLeft(0);
              }}
              activeOpacity={0.8}
            >
              <ClockIcon size={13} color="#ef4444" strokeWidth={2} />
              <Text style={styles.demoTimeoutBtnText}>Simular Fin de Tiempo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════
          FULL ROOM CELEBRATION CARD (RED CARD)
          ═══════════════════════════════════════════════════════ */}
      {isComplete && (
        <DoubleBezelCard variant="red" style={styles.celebrationOuter} innerStyle={styles.celebrationInner} glow>
          <View style={{ marginBottom: 12, alignItems: 'center' }}>
            <TrophyIcon size={48} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.celebrationTitle}>¡SALA COMPLETA!</Text>
          <Text style={styles.celebrationSubtitle}>
            Todos los {totalSlots} jugadores pagaron su parte. La cancha ha sido confirmada automáticamente y registrada en el sistema del club.
          </Text>

          <View style={styles.celebrationNavRow}>
            <TouchableOpacity
              style={styles.primaryNavBtn}
              onPress={() => {
                triggerHaptic('medium');
                onNavigateMyBookings();
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryNavBtnText}>Ver en Mis Reservas</Text>
              <ArrowRightIcon size={14} color="#07080a" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryNavBtn}
              onPress={() => {
                triggerHaptic('light');
                onNavigateHome();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryNavBtnText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </DoubleBezelCard>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL 1: SIMULAR PAGO DE AMIGO
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={showSimulateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSimulateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <DoubleBezelCard variant="black" style={styles.modalOuter} innerStyle={styles.modalInner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simular Pago de Amigo</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setShowSimulateModal(false);
                }}
              >
                <CloseIcon size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBodyText}>
              Ingresá el nombre del jugador para registrar su cuota de{' '}
              <Text style={{ color: colors.primary, fontFamily: fonts.bold }}>
                {formatCurrency(perShare)}
              </Text>{' '}
              en esta sala:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del amigo (ej: Martín Gómez)"
              placeholderTextColor="#94a3b8"
              value={friendNameInput}
              onChangeText={setFriendNameInput}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleConfirmFriendPayment}
              disabled={isSimulating}
              activeOpacity={0.88}
            >
              {isSimulating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalConfirmBtnText}>Confirmar Pago de Amigo</Text>
              )}
            </TouchableOpacity>
          </DoubleBezelCard>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL 2: HOST TIMEOUT RESOLUTION & PROTECTION MODAL
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={showTimeoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <DoubleBezelCard variant="black" style={styles.rescueOuter} innerStyle={styles.rescueInner}>
            <View style={styles.rescueModalHeader}>
              <View style={styles.rescueWarningIcon}>
                <ClockIcon size={24} color="#fc1c46" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rescueModalTitle}>
                  {timeLeft === 0 ? '¡Tiempo de Sala Agotado!' : 'Gestión de Sala de Espera'}
                </Text>
                <Text style={styles.rescueModalSubtitle}>
                  {paidCount} de {totalSlots} cuotas abonadas ({formatCurrency(totalCollected)})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setShowTimeoutModal(false);
                }}
              >
                <CloseIcon size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.rescueModalBody}>
              {timeLeft === 0
                ? `El tiempo de bloqueo de la cancha finalizó con ${formatCurrency(remainingAmount)} pendientes. Como organizador, tenés estas opciones antes de liberar la cancha:`
                : `Si algún jugador tarda en pagar, como organizador tenés control total sobre el partido:`}
            </Text>

            {/* Option A: Host Covers Remaining */}
            <TouchableOpacity
              style={styles.rescueOptionCardPrimary}
              onPress={handleCoverRemaining}
              disabled={isSimulating}
              activeOpacity={0.88}
            >
              <Text style={styles.rescueOptionTitlePrimary}>
                💳 Cubrir Faltante ({formatCurrency(remainingAmount)}) y Confirmar Cancha
              </Text>
              <Text style={styles.rescueOptionDescPrimary}>
                Abonás las {pendingCount} cuotas restantes. La cancha se confirma de inmediato en el club.
              </Text>
            </TouchableOpacity>

            {/* Option B: Cancel and Refund via Mercado Pago */}
            <TouchableOpacity
              style={styles.rescueOptionCardSecondary}
              onPress={handleCancelAndRefund}
              disabled={isSimulating}
              activeOpacity={0.88}
            >
              <Text style={styles.rescueOptionTitleSecondary}>
                💸 Cancelar Turno y Reintegrar por Mercado Pago ({formatCurrency(totalCollected)})
              </Text>
              <Text style={styles.rescueOptionDescSecondary}>
                La reserva se cancela y se procesa la devolución directa a cada participante a su cuenta de Mercado Pago.
              </Text>
            </TouchableOpacity>

            {/* Option C: Extend 5 minutes */}
            <TouchableOpacity
              style={styles.rescueOptionCardGrace}
              onPress={handleExtend5Min}
              activeOpacity={0.8}
            >
              <Text style={styles.rescueOptionTitleGrace}>
                ⏱️ Pedir +5 Minutos Extra de Tolerancia
              </Text>
            </TouchableOpacity>
          </DoubleBezelCard>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL 3: MERCADO PAGO REFUND SUCCESS NOTIFICATION
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={refundSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRefundSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <DoubleBezelCard variant="black" style={styles.refundOuter} innerStyle={styles.refundInner}>
            <View style={styles.refundSuccessIconCircle}>
              <ShieldCheckIcon size={38} color="#fc1c46" />
            </View>

            <Text style={styles.refundSuccessTitle}>¡REINTEGRO PROCESADO!</Text>
            <Text style={styles.refundSuccessAmount}>
              {formatCurrency(refundInfo?.amount || perShare)}
            </Text>
            <Text style={styles.refundSuccessDesc}>
              La reserva fue cancelada y se gestionó la devolución directa a cada jugador a través de Mercado Pago. Sin saldos retenidos.
            </Text>

            <View style={styles.walletBalanceBadge}>
              <Text style={styles.walletBalanceBadgeLabel}>Método de devolución:</Text>
              <Text style={styles.walletBalanceBadgeVal}>
                Cuenta de Mercado Pago Original
              </Text>
            </View>

            <View style={styles.refundNavCol}>
              <TouchableOpacity
                style={styles.primaryNavBtnRefund}
                onPress={() => {
                  triggerHaptic('light');
                  setRefundSuccessModal(false);
                  onNavigateHome();
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryNavBtnText}>Volver al Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryNavBtn}
                onPress={() => {
                  triggerHaptic('light');
                  setRefundSuccessModal(false);
                  onNavigateHome();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryNavBtnText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </DoubleBezelCard>
        </View>
      </Modal>
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
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  roomBadgeLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  roomBadgeCode: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.headingBold,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  timerText: {
    fontSize: 13.5,
    fontFamily: fonts.headingBold,
  },
  timerBadgeComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  timerTextComplete: {
    color: '#fc1c46',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  matchHeroOuter: {
    marginBottom: 16,
  },
  matchHeroInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  matchHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
  },
  matchClubName: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  matchCourtName: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillComplete: {
    backgroundColor: '#fc1c46',
  },
  statusPillText: {
    color: '#fc1c46',
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  statusPillTextComplete: {
    color: '#ffffff',
  },
  matchDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfoCol: {
    flex: 1,
  },
  matchInfoColRight: {
    alignItems: 'flex-end',
  },
  matchInfoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: fonts.medium,
    marginBottom: 2,
  },
  matchInfoVal: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  matchInfoPrice: {
    color: '#fc1c46',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  progressOuter: {
    marginBottom: 20,
  },
  progressInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 14.5,
    fontFamily: fonts.headingBold,
  },
  progressSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  progressAmountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressAmountCollected: {
    color: '#fc1c46',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  progressAmountTotal: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fc1c46',
    borderRadius: 4,
  },
  lobbySectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  slotsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  slotItemOuter: {
    width: '100%',
  },
  slotItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
  },
  slotCardPaid: {
    borderColor: '#fc1c46',
  },
  slotCardPending: {
    backgroundColor: '#0b0e14',
  },
  slotAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slotAvatarPaid: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: '#fc1c46',
  },
  slotAvatarPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  slotAvatarNumber: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  slotCenterInfo: {
    flex: 1,
  },
  slotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  slotPlayerName: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  slotPlayerNamePaid: {
    color: '#ffffff',
  },
  orgTag: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
  },
  orgTagText: {
    color: '#fc1c46',
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  slotPlayerStatus: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  slotActionCol: {
    marginLeft: 8,
  },
  badgePaid: {
    backgroundColor: 'rgba(252, 28, 70, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fc1c46',
  },
  badgePaidText: {
    color: '#fc1c46',
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },
  simulateFriendBtn: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simulateFriendBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  shareSection: {
    gap: 10,
    marginBottom: 20,
  },
  whatsappBtn: {
    backgroundColor: '#0b0e14',
    borderWidth: 1.5,
    borderColor: '#fc1c46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  whatsappBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontFamily: fonts.bold,
  },
  shareSubRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyLinkBtn: {
    flex: 1,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  copyLinkBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  demoSimulateBtn: {
    backgroundColor: '#fc1c46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  demoSimulateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  rescueActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rescueOptionsBtn: {
    flex: 1.2,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  rescueOptionsBtnText: {
    color: '#fc1c46',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  demoTimeoutBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  demoTimeoutBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  celebrationOuter: {
    marginBottom: 20,
  },
  celebrationInner: {
    backgroundColor: '#fc1c46',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 20,
    alignItems: 'center',
  },
  celebrationTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: fonts.headingBold,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  celebrationSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  celebrationNavRow: {
    width: '100%',
    gap: 10,
  },
  primaryNavBtn: {
    backgroundColor: '#0b0e14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryNavBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  primaryNavBtnRefund: {
    backgroundColor: '#fc1c46',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryNavBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryNavBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalOuter: {
    width: '100%',
  },
  modalInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  modalBodyText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginBottom: 20,
  },
  modalConfirmBtn: {
    backgroundColor: '#fc1c46',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  rescueOuter: {
    width: '100%',
  },
  rescueInner: {
    backgroundColor: '#0b0e14',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
  },
  rescueModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rescueWarningIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescueModalTitle: {
    color: '#fc1c46',
    fontSize: 16,
    fontFamily: fonts.headingBold,
  },
  rescueModalSubtitle: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },
  rescueModalBody: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: fonts.regular,
    lineHeight: 17,
    marginBottom: 16,
  },
  rescueOptionCardPrimary: {
    backgroundColor: '#fc1c46',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  rescueOptionTitlePrimary: {
    color: '#ffffff',
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  rescueOptionDescPrimary: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
    fontFamily: fonts.regular,
    marginTop: 4,
    lineHeight: 16,
  },
  rescueOptionCardSecondary: {
    backgroundColor: '#0b0e14',
    borderWidth: 1.5,
    borderColor: 'rgba(252, 28, 70, 0.4)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  rescueOptionTitleSecondary: {
    color: '#fc1c46',
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  rescueOptionDescSecondary: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: fonts.regular,
    marginTop: 4,
    lineHeight: 16,
  },
  rescueOptionCardGrace: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rescueOptionTitleGrace: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  refundOuter: {
    width: '100%',
  },
  refundInner: {
    backgroundColor: '#0b0e14',
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fc1c46',
  },
  refundSuccessIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  refundSuccessTitle: {
    color: '#fc1c46',
    fontSize: 18,
    fontFamily: fonts.headingBold,
    letterSpacing: 0.5,
  },
  refundSuccessAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: fonts.headingBold,
    marginVertical: 4,
  },
  refundSuccessDesc: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  walletBalanceBadge: {
    backgroundColor: '#121624',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  walletBalanceBadgeLabel: {
    color: '#ff6b8b',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  walletBalanceBadgeVal: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: fonts.headingBold,
    marginTop: 2,
  },
  refundNavCol: {
    width: '100%',
    gap: 10,
  },
});
