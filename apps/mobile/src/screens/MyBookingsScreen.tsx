import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';
import { mobileApi } from '../services/api';
import { Booking } from '@hay-equipo/contracts';

interface MyBookingsScreenProps {
  onNavigateSplit: (booking: Booking) => void;
  onNavigateNewBooking: () => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  onNavigateSplit,
  onNavigateNewBooking
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'FIXED' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [cancelled, setCancelled] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const data = await mobileApi.getUserBookings('usr-emi');
    setUpcoming(data.upcoming || []);
    setPast(data.past || []);
    setCancelled(data.cancelled || []);
    setLoading(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      '¿Cancelar esta reserva?',
      'Si cancelás con más de 24 hs de anticipación, recibirás un reembolso o crédito del 100%.',
      [
        { text: 'No cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            await fetch(`http://localhost:4000/api/bookings/${bookingId}/cancel`, { method: 'POST' });
            Alert.alert('Reserva cancelada');
            loadBookings();
          }
        }
      ]
    );
  };

  const handleOpenMaps = (clubName: string) => {
    const query = encodeURIComponent(`${clubName} Buenos Aires`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    }) || `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const renderBookingCard = (booking: Booking, isUpcoming = true) => {
    return (
      <View key={booking.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.courtName}>{booking.courtName || 'Cancha Principal'}</Text>
            <Text style={styles.clubName}>📍 {booking.clubName || 'Arena Pádel'}</Text>
          </View>
          <View style={[styles.statusBadge, booking.status === 'CONFIRMED' ? styles.badgeConfirmed : styles.badgeHeld]}>
            <Text style={styles.statusBadgeText}>{booking.status === 'CONFIRMED' ? '✓ CONFIRMADA' : '⏳ PENDIENTE'}</Text>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <Text style={styles.dateTimeText}>📅 {booking.date} · ⏰ {booking.startTime} – {booking.endTime} hs</Text>
          <Text style={styles.priceText}>{formatCurrency(booking.totalPrice)}</Text>
        </View>

        {booking.paymentType === 'SPLIT' && (
          <View style={styles.splitNoticeBox}>
            <Text style={styles.splitNoticeText}>⚡ Pago Dividido (Split) activo entre jugadores</Text>
          </View>
        )}

        {isUpcoming && (
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => onNavigateSplit(booking)}
            >
              <Text style={styles.actionBtnPrimaryText}>👥 Ver Split / Invitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => handleOpenMaps(booking.clubName || 'Arena Padel')}
            >
              <Text style={styles.actionBtnSecondaryText}>🧭 Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelBooking(booking.id)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'UPCOMING':
        return upcoming;
      case 'PAST':
        return past;
      case 'CANCELLED':
        return cancelled;
      default:
        return upcoming;
    }
  };

  const list = getActiveList();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.titleLarge}>Mis Reservas</Text>
      <Text style={styles.subtitle}>Historial, partidos próximos y gestión de grupos.</Text>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map(tabKey => {
          const labels = { UPCOMING: 'Próximas', PAST: 'Pasadas', CANCELLED: 'Canceladas' };
          const isSelected = activeTab === tabKey;
          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveTab(tabKey)}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {labels[tabKey]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : list.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🎾</Text>
          <Text style={styles.emptyTitle}>No tenés reservas {activeTab === 'UPCOMING' ? 'próximas' : 'en esta sección'}</Text>
          <Text style={styles.emptySub}>Buscá una cancha disponible y reservá en menos de 30 segundos.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={onNavigateNewBooking}>
            <Text style={styles.ctaBtnText}>Buscar Cancha</Text>
          </TouchableOpacity>
        </View>
      ) : (
        list.map(b => renderBookingCard(b, activeTab === 'UPCOMING'))
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
  subtitle: {
    ...typography.subtitle,
    marginTop: 4,
    marginBottom: 20
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  courtName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  clubName: {
    color: colors.textSecondary,
    fontSize: 13
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeConfirmed: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)'
  },
  badgeHeld: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  statusBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  dateTimeText: {
    color: colors.neonAccent,
    fontSize: 13,
    fontWeight: '700'
  },
  priceText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800'
  },
  splitNoticeBox: {
    backgroundColor: colors.elevated,
    padding: 8,
    borderRadius: 6,
    marginBottom: 14
  },
  splitNoticeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12
  },
  actionBtnPrimary: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnPrimaryText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12
  },
  actionBtnSecondary: {
    flex: 2,
    backgroundColor: colors.elevated,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  actionBtnSecondaryText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
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
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  ctaBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 13
  }
});
