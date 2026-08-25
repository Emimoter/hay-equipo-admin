import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
import {
  CalendarIcon,
  ClockIcon,
  WhatsAppIcon,
  LinkIcon,
  TrophyIcon,
  CheckCircleIcon,
  ZapIcon,
} from '../components/AppIcons';
import { mobileApi } from '../services/api';
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
  const [splitData, setSplitData] = useState<any>(null);

  useEffect(() => {
    if (booking.splitToken) {
      loadSplit();
    }
  }, [booking]);

  const loadSplit = async () => {
    const data = await mobileApi.getSplitDetails(booking.splitToken!);
    if (data?.data) {
      setSplitData(data.data);
    }
  };

  const shareUrl = `https://hayequipo.com/split/${booking.splitToken}`;
  const perShare = splitData?.participants?.[0]?.amount || Math.round(booking.totalPrice / 4);

  const handleShareWhatsApp = () => {
    const message = `¡Hola! Te sumé al partido de Pádel del ${booking.date} a las ${booking.startTime} hs en ${booking.clubName}.\n\nTu parte es de ${formatCurrency(perShare)}.\n\nPodés pagarla directamente acá en 1 clic: ${shareUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Share.share({ message });
    });
  };

  const handleCopyLink = () => {
    Share.share({
      title: 'Invitación a Partido en Hay Equipo',
      message: `Sumate al partido en ${booking.clubName}: ${shareUrl}`
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Badge */}
      <View style={styles.successBox}>
        <View style={{ marginBottom: 12, alignItems: 'center' }}>
          <TrophyIcon size={44} color="#fc1c46" strokeWidth={1.8} />
        </View>
        <Text style={styles.successTitle}>¡Cancha Asegurada!</Text>
        <Text style={styles.successSubtitle}>
          Tu parte ya está abonada. Ahora invitá a tus amigos para que paguen su cuota.
        </Text>
      </View>

      {/* Match Summary */}
      <View style={styles.matchCard}>
        <Text style={styles.matchClub}>{booking.clubName}</Text>
        <Text style={styles.matchCourt}>{booking.courtName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <CalendarIcon size={12} color="#fc1c46" strokeWidth={2} />
          <Text style={styles.matchDateTime}>{booking.date}</Text>
          <Text style={styles.matchDateTime}>·</Text>
          <ClockIcon size={12} color="#fc1c46" strokeWidth={2} />
          <Text style={styles.matchDateTime}>{booking.startTime} – {booking.endTime} hs</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Estado de recaudación</Text>
          <Text style={styles.progressValue}>
            {formatCurrency(splitData?.totalCollected || perShare)} / {formatCurrency(booking.totalPrice)}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Share Buttons */}
      <TouchableOpacity style={styles.whatsappBtn} onPress={handleShareWhatsApp}>
        <WhatsAppIcon size={18} color="#ffffff" strokeWidth={2.2} />
        <Text style={[styles.whatsappBtnText, { marginLeft: 8 }]}>Invitar por WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
        <LinkIcon size={16} color="#ffffff" strokeWidth={2} />
        <Text style={[styles.copyBtnText, { marginLeft: 8 }]}>Copiar enlace para compartir</Text>
      </TouchableOpacity>

      {/* Participants List */}
      <Text style={styles.sectionTitle}>Jugadores del partido</Text>
      <View style={styles.participantsCard}>
        {splitData?.participants?.map((p: any, i: number) => {
          const isPaid = p.status === 'PAID';
          return (
            <View key={p.id || i} style={styles.participantRow}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.name}</Text>
                <Text style={styles.participantAmount}>{formatCurrency(p.amount)}</Text>
              </View>
              <View style={[styles.statusBadge, isPaid ? styles.statusBadgePaid : styles.statusBadgePending]}>
                {isPaid ? (
                  <CheckCircleIcon size={12} color="#10B981" strokeWidth={2.2} />
                ) : (
                  <ClockIcon size={12} color="#f59e0b" strokeWidth={2.2} />
                )}
                <Text style={[styles.statusBadgeText, isPaid ? styles.statusBadgeTextPaid : styles.statusBadgeTextPending, { marginLeft: 4 }]}>
                  {isPaid ? 'Pagado' : 'Pendiente'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Web Fallback Info */}
      <View style={styles.webFallbackCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <ZapIcon size={14} color="#fc1c46" strokeWidth={2.2} />
          <Text style={styles.webFallbackTitle}>Tus amigos no necesitan la app para pagar</Text>
        </View>
        <Text style={styles.webFallbackText}>
          Al abrir el link desde WhatsApp pueden pagar su parte en 30 segundos con Mercado Pago directo desde el navegador.
        </Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navSecondaryBtn} onPress={onNavigateHome}>
          <Text style={styles.navSecondaryBtnText}>Ir al Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navPrimaryBtn} onPress={onNavigateMyBookings}>
          <Text style={styles.navPrimaryBtnText}>Ver Mis Reservas</Text>
        </TouchableOpacity>
      </View>
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
  successBox: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 20
  },
  successTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6
  },
  successSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  matchClub: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  matchCourt: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2
  },
  matchDateTime: {
    color: colors.neonAccent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  progressValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.elevated,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  whatsappBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15
  },
  copyBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  copyBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13
  },
  sectionTitle: {
    ...typography.titleMedium,
    marginBottom: 12
  },
  participantsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  participantInfo: {
    flex: 1
  },
  participantName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  participantAmount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgePaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)'
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  statusBadgeTextPaid: {
    color: colors.primary
  },
  statusBadgeTextPending: {
    color: '#F59E0B'
  },
  webFallbackCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155'
  },
  webFallbackTitle: {
    color: colors.neonAccent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  webFallbackText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16
  },
  navRow: {
    flexDirection: 'row',
    gap: 12
  },
  navSecondaryBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  navSecondaryBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14
  },
  navPrimaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  navPrimaryBtnText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14
  }
});
