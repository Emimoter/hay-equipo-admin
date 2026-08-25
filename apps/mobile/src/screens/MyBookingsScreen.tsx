import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ZapIcon,
  PadelIcon,
} from '../components/AppIcons';
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPinIcon size={12} color={colors.textSecondary} strokeWidth={1.8} />
              <Text style={styles.clubName}>{booking.clubName || 'Arena Pádel'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, booking.status === 'CONFIRMED' ? styles.badgeConfirmed : styles.badgeHeld]}>
            <Text style={styles.statusBadgeText}>
              {booking.status === 'CONFIRMED' ? 'CONFIRMADA' : 'PENDIENTE'}
            </Text>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={13} color="#fc1c46" strokeWidth={2} />
            <Text style={styles.dateTimeText}>{booking.date}</Text>
            <Text style={styles.dateTimeText}>·</Text>
            <ClockIcon size={13} color="#fc1c46" strokeWidth={2} />
            <Text style={styles.dateTimeText}>{booking.startTime} – {booking.endTime} hs</Text>
          </View>
          <Text style={styles.priceText}>{formatCurrency(booking.totalPrice)}</Text>
        </View>

        {booking.paymentType === 'SPLIT' ? (
          <View style={styles.splitNoticeBox}>
            <ZapIcon size={12} color="#fc1c46" strokeWidth={2} />
            <Text style={styles.splitNoticeText}>Pago Dividido (Split) activo entre jugadores</Text>
          </View>
        ) : null}

        {isUpcoming ? (
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => onNavigateSplit(booking)}
            >
              <UsersIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.actionBtnPrimaryText}>Ver Split / Invitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => handleOpenMaps(booking.clubName || 'Arena Padel')}
            >
              <MapPinIcon size={14} color={colors.textPrimary} strokeWidth={2} />
              <Text style={styles.actionBtnSecondaryText}>Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelBooking(booking.id)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Mis Reservas</Text>
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
          <PadelIcon size={36} color="#fc1c46" strokeWidth={1.5} />
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
  screenTitle: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 13,
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
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 13
  },
  tabBtnTextActive: {
    fontFamily: fonts.bold,
    color: '#ffffff'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  courtName: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: -0.2
  },
  clubName: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12.5
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeConfirmed: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  badgeHeld: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)'
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    color: '#22c55e',
    fontSize: 10,
    letterSpacing: 0.5
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12
  },
  dateTimeText: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    fontSize: 12.5
  },
  priceText: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 15
  },
  splitNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252, 28, 70, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12
  },
  splitNoticeText: {
    fontFamily: fonts.medium,
    color: '#fc1c46',
    fontSize: 11.5
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 10
  },
  actionBtnPrimaryText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 9,
    borderRadius: 10
  },
  actionBtnSecondaryText: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    fontSize: 12
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    color: colors.danger,
    fontSize: 12
  },
  emptyCard: {
    padding: 30,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    marginTop: 20
  },
  emptyTitle: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 15,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySub: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  ctaBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13
  }
});
