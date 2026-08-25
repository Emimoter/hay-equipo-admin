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
  Alert
} from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
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
  WalletIcon
} from '../components/AppIcons';
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
  onNavigateMyBookings
}) => {
  const { userProfile, creditWallet } = useAuth();
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
  const [refundInfo, setRefundInfo] = useState<{ amount: number; newWalletBalance: number } | null>(null);

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (booking.splitToken) {
      loadSplit();
    }
  }, [booking]);

  // Countdown timer with automatic timeout trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // When timer hits 0 and game is not complete, trigger timeout modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When timeLeft becomes 0, open rescue modal if room is incomplete
  useEffect(() => {
    if (timeLeft === 0 && splitData && !splitData.isComplete) {
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
    const message = `🏆 ¡Hay Equipo! Te sumé al partido en ${booking.clubName}.\n\n📅 Fecha: ${booking.date}\n⏰ Horario: ${booking.startTime} hs\n💵 Tu cuota: ${formatCurrency(perShare)}\n\n📲 Entrá a la sala de espera y aboná en 1 clic: ${shareUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Share.share({ message });
    });
  };

  const handleCopyLink = () => {
    Share.share({
      title: `Sala de Espera - Partido en ${booking.clubName}`,
      message: `Sumate a la sala y pagá tu parte para el partido en ${booking.clubName}: ${shareUrl}`
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenSlotSimulation = (participant: any) => {
    setSelectedSlotForSim(participant);
    setFriendNameInput(`Jugador ${participant.id ? participant.id.slice(-1) : ''}`);
    setShowSimulateModal(true);
  };

  const handleConfirmFriendPayment = async () => {
    if (!selectedSlotForSim) return;
    setIsSimulating(true);

    await mobileApi.paySplitShare(shareToken, selectedSlotForSim.id, friendNameInput.trim() || 'Amigo');
    await loadSplit();

    setIsSimulating(false);
    setShowSimulateModal(false);
    setSelectedSlotForSim(null);
  };

  const handleSimulateAllRemaining = async () => {
    setIsSimulating(true);
    const pending = splitData?.participants?.filter((p: any) => p.status === 'PENDING') || [];
    const mockNames = ['Martín Gómez', 'Lucas Peralta', 'Facundo Martínez', 'Rodrigo Díaz', 'Agustín Rossi', 'Matías Silva'];

    for (let i = 0; i < pending.length; i++) {
      const p = pending[i];
      const name = mockNames[i % mockNames.length];
      await mobileApi.paySplitShare(shareToken, p.id, name);
    }

    await loadSplit();
    setIsSimulating(false);
  };

  // Host Rescue Option 1: Cover all remaining quotas
  const handleCoverRemaining = async () => {
    setIsSimulating(true);
    const res = await mobileApi.payRemainingSplitShares(shareToken, userProfile?.displayName || 'Organizador');
    await loadSplit();
    setIsSimulating(false);
    setShowTimeoutModal(false);
  };

  // Host Rescue Option 2: Cancel split and refund deposited quotas to In-App Wallet
  const handleCancelAndRefund = async () => {
    setIsSimulating(true);
    const res = await mobileApi.cancelSplitAndRefundToWallet(shareToken);
    setIsSimulating(false);
    setShowTimeoutModal(false);

    if (res.success) {
      // Credit wallet of host with their share / collected amount
      const refunded = res.totalRefunded || perShare;
      const newBal = await creditWallet(refunded, `Devolución sala ${shareToken} cancelada`);
      setRefundInfo({
        amount: refunded,
        newWalletBalance: newBal
      });
      setRefundSuccessModal(true);
    }
  };

  // Host Rescue Option 3: Extend timer by 5 minutes
  const handleExtend5Min = () => {
    setTimeLeft(prev => prev + 300);
    setShowTimeoutModal(false);
  };

  const renderSportIcon = () => {
    const s = (booking.sportType || 'PADEL').toUpperCase();
    if (s.includes('FUTBOL')) return <FootballIcon size={20} color="#fc1c46" />;
    if (s.includes('TENIS')) return <TennisIcon size={20} color="#fc1c46" />;
    return <PadelIcon size={20} color="#fc1c46" />;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Room Header */}
      <View style={styles.topHeader}>
        <View style={styles.roomBadge}>
          <Text style={styles.roomBadgeLabel}>SALA DE ESPERA</Text>
          <Text style={styles.roomBadgeCode}>#{shareToken}</Text>
        </View>

        <View style={styles.timerBadge}>
          <ClockIcon size={13} color={timeLeft < 180 ? '#ef4444' : '#22c55e'} strokeWidth={2.2} />
          <Text style={[styles.timerText, { color: timeLeft < 180 ? '#ef4444' : '#22c55e' }]}>
            {timeString}
          </Text>
        </View>
      </View>

      {/* Hero Match Details Card */}
      <View style={styles.matchHeroCard}>
        <View style={styles.matchHeroTop}>
          <View style={styles.sportIconCircle}>{renderSportIcon()}</View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.matchClubName}>{booking.clubName}</Text>
            <Text style={styles.matchCourtName}>{booking.courtName || 'Cancha Central'}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {isComplete ? 'SALA COMPLETA' : 'ESPERANDO PAGOS'}
            </Text>
          </View>
        </View>

        <View style={styles.matchDivider} />

        <View style={styles.matchInfoRow}>
          <View style={styles.matchInfoCol}>
            <Text style={styles.matchInfoLabel}>Fecha y Hora</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <CalendarIcon size={12} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.matchInfoVal}>{booking.date} · {booking.startTime} hs</Text>
            </View>
          </View>

          <View style={styles.matchInfoColRight}>
            <Text style={styles.matchInfoLabel}>Cuota por Jugador</Text>
            <Text style={styles.matchInfoPrice}>{formatCurrency(perShare)}</Text>
          </View>
        </View>
      </View>

      {/* Live Pot & Progress Section */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeaderRow}>
          <View>
            <Text style={styles.progressTitle}>Recaudación en Vivo</Text>
            <Text style={styles.progressSubtitle}>
              {paidCount} de {totalSlots} jugadores listos ({progressPercent}%)
            </Text>
          </View>
          <View style={styles.progressAmountBadge}>
            <Text style={styles.progressAmountCollected}>
              {formatCurrency(paidCount * perShare)}
            </Text>
            <Text style={styles.progressAmountTotal}> / {formatCurrency(booking.totalPrice)}</Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
              isComplete && { backgroundColor: '#22c55e' }
            ]}
          />
        </View>
      </View>

      {/* Interactive Player Slots Grid (Game Lobby style) */}
      <View style={styles.lobbySectionHeader}>
        <Text style={styles.sectionTitle}>Formación del Partido</Text>
        <Text style={styles.sectionSubtitle}>
          Cada jugador asegura su lugar pagando su parte
        </Text>
      </View>

      <View style={styles.slotsContainer}>
        {splitData?.participants?.map((participant: any, index: number) => {
          const isPaid = participant.status === 'PAID';
          const isOrg = participant.isOrganizer || index === 0;
          const cleanName = (participant.name || `Jugador ${index + 1}`).replace(/\s*\(Organizador\)/gi, '');

          return (
            <View
              key={participant.id || index}
              style={[
                styles.slotCard,
                isPaid ? styles.slotCardPaid : styles.slotCardPending
              ]}
            >
              <View
                style={[
                  styles.slotAvatar,
                  isPaid ? styles.slotAvatarPaid : styles.slotAvatarPending
                ]}
              >
                {isPaid ? (
                  <CheckCircleIcon size={18} color="#22c55e" strokeWidth={2.4} />
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
                  >
                    <Text style={styles.simulateFriendBtnText}>Pagar Cuota</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Share / Invite Shortcuts */}
      {!isComplete && (
        <View style={styles.shareSection}>
          <TouchableOpacity style={styles.whatsappBtn} onPress={handleShareWhatsApp}>
            <WhatsAppIcon size={18} color="#ffffff" strokeWidth={2.2} />
            <Text style={styles.whatsappBtnText}>Invitar Jugadores por WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.shareSubRow}>
            <TouchableOpacity style={styles.copyLinkBtn} onPress={handleCopyLink}>
              <LinkIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.copyLinkBtnText}>
                {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoSimulateBtn}
              onPress={handleSimulateAllRemaining}
              disabled={isSimulating}
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
              onPress={() => setShowTimeoutModal(true)}
            >
              <ShieldCheckIcon size={15} color="#38bdf8" strokeWidth={2} />
              <Text style={styles.rescueOptionsBtnText}>¿Qué pasa si no pagan? / Opciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoTimeoutBtn}
              onPress={() => setTimeLeft(0)}
            >
              <ClockIcon size={13} color="#ef4444" strokeWidth={2} />
              <Text style={styles.demoTimeoutBtnText}>Simular Fin de Tiempo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full Room Celebration Card */}
      {isComplete && (
        <View style={styles.celebrationCard}>
          <View style={{ marginBottom: 12, alignItems: 'center' }}>
            <TrophyIcon size={48} color="#22c55e" strokeWidth={2} />
          </View>
          <Text style={styles.celebrationTitle}>¡SALA COMPLETA!</Text>
          <Text style={styles.celebrationSubtitle}>
            Todos los {totalSlots} jugadores pagaron su parte. La cancha ha sido confirmada automáticamente y registrada en el sistema del club.
          </Text>

          <View style={styles.celebrationNavRow}>
            <TouchableOpacity style={styles.primaryNavBtn} onPress={onNavigateMyBookings}>
              <Text style={styles.primaryNavBtnText}>Ver en Mis Reservas</Text>
              <ArrowRightIcon size={14} color="#07080a" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryNavBtn} onPress={onNavigateHome}>
              <Text style={styles.secondaryNavBtnText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal 1: Simular Pago de Amigo */}
      <Modal
        visible={showSimulateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSimulateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simular Pago de Amigo</Text>
              <TouchableOpacity onPress={() => setShowSimulateModal(false)}>
                <CloseIcon size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBodyText}>
              Ingresá el nombre del jugador para registrar su cuota de{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {formatCurrency(perShare)}
              </Text>{' '}
              en esta sala:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del amigo (ej: Martín Gómez)"
              placeholderTextColor={colors.textMuted}
              value={friendNameInput}
              onChangeText={setFriendNameInput}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleConfirmFriendPayment}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <ActivityIndicator size="small" color="#07080a" />
              ) : (
                <Text style={styles.modalConfirmBtnText}>Confirmar Pago de Amigo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Host Timeout Resolution & Protection Modal */}
      <Modal
        visible={showTimeoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rescueModalCard}>
            <View style={styles.rescueModalHeader}>
              <View style={styles.rescueWarningIcon}>
                <ClockIcon size={24} color="#f59e0b" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rescueModalTitle}>
                  {timeLeft === 0 ? '¡Tiempo de Sala Agotado!' : 'Gestión de Sala de Espera'}
                </Text>
                <Text style={styles.rescueModalSubtitle}>
                  {paidCount} de {totalSlots} cuotas abonadas ({formatCurrency(totalCollected)})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTimeoutModal(false)}>
                <CloseIcon size={20} color={colors.textSecondary} />
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
            >
              <View style={styles.rescueOptionTopRow}>
                <Text style={styles.rescueOptionTitlePrimary}>
                  💳 Cubrir Faltante ({formatCurrency(remainingAmount)}) y Confirmar Cancha
                </Text>
              </View>
              <Text style={styles.rescueOptionDescPrimary}>
                Abonás las {pendingCount} cuotas restantes. La cancha se confirma de inmediato en el club y tus amigos te transfieren luego.
              </Text>
            </TouchableOpacity>

            {/* Option B: Cancel and Refund to Wallet */}
            <TouchableOpacity
              style={styles.rescueOptionCardSecondary}
              onPress={handleCancelAndRefund}
              disabled={isSimulating}
            >
              <View style={styles.rescueOptionTopRow}>
                <Text style={styles.rescueOptionTitleSecondary}>
                  💸 Cancelar Turno y Devolver a Billetera ({formatCurrency(totalCollected)})
                </Text>
              </View>
              <Text style={styles.rescueOptionDescSecondary}>
                La reserva se cancela y se te acredita el 100% de lo abonado a tu Saldo de Billetera Hay Equipo para usar en futuros turnos.
              </Text>
            </TouchableOpacity>

            {/* Option C: Extend 5 minutes */}
            <TouchableOpacity
              style={styles.rescueOptionCardGrace}
              onPress={handleExtend5Min}
            >
              <Text style={styles.rescueOptionTitleGrace}>
                ⏱️ Pedir +5 Minutos Extra de Tolerancia
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Wallet Refund Success Notification */}
      <Modal
        visible={refundSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRefundSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.refundSuccessCard}>
            <View style={styles.refundSuccessIconCircle}>
              <WalletIcon size={38} color="#22c55e" />
            </View>

            <Text style={styles.refundSuccessTitle}>¡SALDO ACREDITADO!</Text>
            <Text style={styles.refundSuccessAmount}>
              +{formatCurrency(refundInfo?.amount || perShare)}
            </Text>
            <Text style={styles.refundSuccessDesc}>
              El dinero fue devuelto con éxito a tu Billetera Hay Equipo. Podés usarlo para pagar total o parcialmente cualquier próximo turno.
            </Text>

            <View style={styles.walletBalanceBadge}>
              <Text style={styles.walletBalanceBadgeLabel}>Saldo total en tu billetera:</Text>
              <Text style={styles.walletBalanceBadgeVal}>
                {formatCurrency(refundInfo?.newWalletBalance || userProfile?.walletBalance || 0)}
              </Text>
            </View>

            <View style={styles.refundNavCol}>
              <TouchableOpacity
                style={styles.primaryNavBtn}
                onPress={() => {
                  setRefundSuccessModal(false);
                  onNavigateMyBookings();
                }}
              >
                <Text style={styles.primaryNavBtnText}>Ver Mis Reservas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryNavBtn}
                onPress={() => {
                  setRefundSuccessModal(false);
                  onNavigateHome();
                }}
              >
                <Text style={styles.secondaryNavBtnText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131722',
    borderWidth: 1,
    borderColor: '#242b3d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6
  },
  roomBadgeLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  roomBadgeCode: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800'
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800'
  },
  matchHeroCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  matchHeroTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sportIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)'
  },
  matchClubName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  matchCourtName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  statusPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  matchDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  matchInfoCol: {
    flex: 1
  },
  matchInfoColRight: {
    alignItems: 'flex-end'
  },
  matchInfoLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  matchInfoVal: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  matchInfoPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800'
  },
  progressCard: {
    backgroundColor: '#0d111a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2738',
    padding: 16,
    marginBottom: 20
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  progressTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800'
  },
  progressSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  progressAmountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  progressAmountCollected: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800'
  },
  progressAmountTotal: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#182030',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  lobbySectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  slotsContainer: {
    gap: 10,
    marginBottom: 20
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  slotCardPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  slotCardPending: {
    backgroundColor: '#0c0f17',
    borderColor: '#1f2739',
    borderStyle: 'dashed'
  },
  slotAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  slotAvatarPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e'
  },
  slotAvatarPending: {
    backgroundColor: '#182030',
    borderWidth: 1,
    borderColor: '#29354d'
  },
  slotAvatarNumber: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800'
  },
  slotCenterInfo: {
    flex: 1
  },
  slotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  slotPlayerName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  slotPlayerNamePaid: {
    color: '#ffffff'
  },
  orgTag: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)'
  },
  orgTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800'
  },
  slotPlayerStatus: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  slotActionCol: {
    marginLeft: 8
  },
  badgePaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e'
  },
  badgePaidText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '800'
  },
  simulateFriendBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  simulateFriendBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700'
  },
  shareSection: {
    gap: 10,
    marginBottom: 20
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8
  },
  whatsappBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  shareSubRow: {
    flexDirection: 'row',
    gap: 10
  },
  copyLinkBtn: {
    flex: 1,
    backgroundColor: '#131722',
    borderWidth: 1,
    borderColor: '#242b3d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  copyLinkBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  demoSimulateBtn: {
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  demoSimulateBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  rescueActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  rescueOptionsBtn: {
    flex: 1.2,
    backgroundColor: '#0c1322',
    borderWidth: 1,
    borderColor: '#1e3050',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  rescueOptionsBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700'
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
    gap: 6
  },
  demoTimeoutBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700'
  },
  celebrationCard: {
    backgroundColor: '#0a1610',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  celebrationTitle: {
    color: '#22c55e',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  celebrationSubtitle: {
    color: '#a7f3d0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  celebrationNavRow: {
    width: '100%',
    gap: 10
  },
  primaryNavBtn: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8
  },
  primaryNavBtnText: {
    color: '#07080a',
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryNavBtn: {
    backgroundColor: '#131722',
    borderWidth: 1,
    borderColor: '#242b3d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12
  },
  secondaryNavBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#0f131c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242b3d',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  modalBodyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  modalInput: {
    backgroundColor: '#182030',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#29354d',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20
  },
  modalConfirmBtn: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  rescueModalCard: {
    backgroundColor: '#0d121c',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    padding: 20
  },
  rescueModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  rescueWarningIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rescueModalTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '900'
  },
  rescueModalSubtitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  rescueModalBody: {
    color: colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 16
  },
  rescueOptionCardPrimary: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  rescueOptionTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rescueOptionTitlePrimary: {
    color: '#22c55e',
    fontSize: 13.5,
    fontWeight: '800'
  },
  rescueOptionDescPrimary: {
    color: '#a7f3d0',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16
  },
  rescueOptionCardSecondary: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  rescueOptionTitleSecondary: {
    color: '#38bdf8',
    fontSize: 13.5,
    fontWeight: '800'
  },
  rescueOptionDescSecondary: {
    color: '#bae6fd',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16
  },
  rescueOptionCardGrace: {
    backgroundColor: '#161c2b',
    borderWidth: 1,
    borderColor: '#29354d',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  rescueOptionTitleGrace: {
    color: colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '700'
  },
  refundSuccessCard: {
    backgroundColor: '#0a1610',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    padding: 24,
    alignItems: 'center'
  },
  refundSuccessIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  refundSuccessTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  refundSuccessAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 4
  },
  refundSuccessDesc: {
    color: '#a7f3d0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  walletBalanceBadge: {
    backgroundColor: '#122319',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  walletBalanceBadgeLabel: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '600'
  },
  walletBalanceBadgeVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2
  },
  refundNavCol: {
    width: '100%',
    gap: 10
  }
});
