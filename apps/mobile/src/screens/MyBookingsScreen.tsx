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
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import { Booking } from '@hay-equipo/contracts';

interface MyBookingsScreenProps {
  onNavigateSplit: (booking: Booking) => void;
  onNavigateNewBooking: () => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  onNavigateSplit,
  onNavigateNewBooking,
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

  const handleTabChange = (tab: 'UPCOMING' | 'FIXED' | 'PAST' | 'CANCELLED') => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const handleCancelBooking = (bookingId: string) => {
    triggerHaptic('warning');
    Alert.alert(
      '¿Cancelar esta reserva?',
      'Si cancelás con más de 24 hs de anticipación, recibirás un reembolso o crédito del 100%.',
      [
        { text: 'No cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            await fetch(`http://localhost:4000/api/bookings/${bookingId}/cancel`, { method: 'POST' });
            Alert.alert('Reserva cancelada');
            loadBookings();
          },
        },
      ]
    );
  };

  const handleOpenMaps = (clubName: string) => {
    triggerHaptic('light');
    const query = encodeURIComponent(`${clubName} Buenos Aires`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const renderBookingCard = (booking: Booking, isUpcoming = true) => {
    return (
      <DoubleBezelCard
        key={booking.id}
        variant="black"
        style={styles.cardOuter}
        innerStyle={styles.cardInner}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.courtName}>{booking.courtName || 'Cancha Principal'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPinIcon size={12} color="#94a3b8" strokeWidth={1.8} />
              <Text style={styles.clubName}>{booking.clubName || 'Arena Pádel'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, booking.status === 'CONFIRMED' ? styles.badgeConfirmed : styles.badgeHeld]}>
            <Text style={[styles.statusBadgeText, booking.status === 'CONFIRMED' ? styles.statusBadgeTextConfirmed : styles.statusBadgeTextHeld]}>
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
              onPress={() => {
                triggerHaptic('medium');
                onNavigateSplit(booking);
              }}
              activeOpacity={0.85}
            >
              <UsersIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.actionBtnPrimaryText}>Ver Split / Invitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => handleOpenMaps(booking.clubName || 'Arena Padel')}
              activeOpacity={0.8}
            >
              <MapPinIcon size={14} color="#ffffff" strokeWidth={2} />
              <Text style={styles.actionBtnSecondaryText}>Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancelBooking(booking.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </DoubleBezelCard>
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
              onPress={() => handleTabChange(tabKey)}
              activeOpacity={0.8}
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
        <DoubleBezelCard variant="black" style={styles.emptyOuter} innerStyle={styles.emptyInner}>
          <PadelIcon size={36} color="#fc1c46" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No tenés reservas {activeTab === 'UPCOMING' ? 'próximas' : 'en esta sección'}</Text>
          <Text style={styles.emptySub}>Buscá una cancha disponible y reservá en menos de 30 segundos.</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => {
              triggerHaptic('medium');
              onNavigateNewBooking();
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>Buscar Cancha</Text>
          </TouchableOpacity>
        </DoubleBezelCard>
      ) : (
        list.map(b => renderBookingCard(b, activeTab === 'UPCOMING'))
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
  screenTitle: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.medium,
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
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
    fontFamily: fonts.medium,
    color: '#94a3b8',
    fontSize: 13,
  },
  tabBtnTextActive: {
    fontFamily: fonts.bold,
    color: '#ffffff',
  },
  cardOuter: {
    marginBottom: 14,
  },
  cardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courtName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  clubName: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeConfirmed: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
  },
  badgeHeld: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statusBadgeTextConfirmed: {
    color: '#fc1c46',
  },
  statusBadgeTextHeld: {
    color: '#f59e0b',
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  dateTimeText: {
    fontFamily: fonts.medium,
    color: '#ffffff',
    fontSize: 12.5,
  },
  priceText: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 15,
  },
  splitNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  splitNoticeText: {
    fontFamily: fonts.medium,
    color: '#ff6b8b',
    fontSize: 11.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fc1c46',
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnPrimaryText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnSecondaryText: {
    fontFamily: fonts.medium,
    color: '#ffffff',
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    color: '#ef4444',
    fontSize: 12,
  },
  emptyOuter: {
    marginTop: 20,
  },
  emptyInner: {
    padding: 30,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 15,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  ctaBtn: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13,
  },
});
