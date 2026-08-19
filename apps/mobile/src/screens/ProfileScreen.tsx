import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, typography, formatCurrency } from '../components/theme';

export const ProfileScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>E</Text>
        </View>
        <Text style={styles.userName}>Emiliano Martínez</Text>
        <Text style={styles.userPhone}>+54 9 11 5555-0001 · Palermo, CABA</Text>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>🎾 PÁDEL 5TA CATEGORÍA · INTERMEDIO</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Partidos jugados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Turno fijo activo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4.9 ★</Text>
          <Text style={styles.statLabel}>Rating fair play</Text>
        </View>
      </View>

      {/* Wallet Balance */}
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Saldo en Billetera / Créditos</Text>
          <Text style={styles.walletAmount}>{formatCurrency(12000)}</Text>
          <Text style={styles.walletSub}>Por fechas liberadas y reembolsos</Text>
        </View>
        <TouchableOpacity style={styles.walletBtn}>
          <Text style={styles.walletBtnText}>Usar saldo</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <Text style={styles.sectionTitle}>Mi Cuenta</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Métodos de Pago (Mercado Pago vinculado)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>Mis Grupos (Pádel Jueves, Fútbol Miércoles)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❤️</Text>
          <Text style={styles.menuText}>Clubes Favoritos</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notificaciones y Recordatorios (24h / 2h)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🛡️</Text>
          <Text style={styles.menuText}>Políticas de Cancelación y Reembolso</Text>
          <Text style={styles.menuArrow}>›</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.elevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  avatarText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800'
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  userPhone: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8
  },
  levelBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  levelBadgeText: {
    color: colors.neonAccent,
    fontSize: 11,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    alignItems: 'center'
  },
  statNumber: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center'
  },
  walletCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4338CA',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  walletLabel: {
    color: '#C7D2FE',
    fontSize: 12
  },
  walletAmount: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2
  },
  walletSub: {
    color: '#A5B4FC',
    fontSize: 11,
    marginTop: 2
  },
  walletBtn: {
    backgroundColor: colors.neonAccent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  walletBtnText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 12
  },
  sectionTitle: {
    ...typography.titleMedium,
    marginBottom: 12
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12
  },
  menuText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500'
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 18
  }
});
