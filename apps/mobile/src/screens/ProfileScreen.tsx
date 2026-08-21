import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { StarIcon, UsersIcon, PadelIcon, ShieldCheckIcon } from '../components/AppIcons';

interface ProfileScreenProps {
  onNavigateLogin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateLogin }) => {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que querés salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            if (onNavigateLogin) onNavigateLogin();
          }
        }
      ]
    );
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Emiliano Martínez';
  const email = userProfile?.email || user?.email || 'emiliano@hayequipo.com.ar';
  const photoURL = userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const phone = userProfile?.phone || '+54 9 11 5555-0001';
  const wallet = userProfile?.walletBalance || 12000;
  const matches = userProfile?.matchesPlayed || 24;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          <View style={styles.googleBadge}>
            <ShieldCheckIcon size={12} color="#ffffff" strokeWidth={2.2} />
          </View>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userPhone}>{phone} · {email}</Text>

        <View style={styles.levelBadge}>
          <PadelIcon size={12} color="#fc1c46" strokeWidth={2} />
          <Text style={styles.levelBadgeText}>PÁDEL 5TA CATEGORÍA · INTERMEDIO</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{matches}</Text>
          <Text style={styles.statLabel}>Partidos jugados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Turno fijo activo</Text>
        </View>
        <View style={styles.statCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.statNumber}>4.9</Text>
            <StarIcon size={13} fill="#FACC15" color="#FACC15" />
          </View>
          <Text style={styles.statLabel}>Rating fair play</Text>
        </View>
      </View>

      {/* Wallet Balance */}
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Saldo en Billetera / Créditos</Text>
          <Text style={styles.walletAmount}>{formatCurrency(wallet)}</Text>
          <Text style={styles.walletSub}>Por fechas liberadas y split payments</Text>
        </View>
        <TouchableOpacity style={styles.walletBtn}>
          <Text style={styles.walletBtnText}>Usar saldo</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <Text style={styles.sectionTitle}>Mi Cuenta</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Rect x="2" y="5" width="20" height="14" rx="3" stroke="#fc1c46" strokeWidth={2} />
              <Line x1="2" y1="10" x2="22" y2="10" stroke="#fc1c46" strokeWidth={1.8} />
            </Svg>
          </View>
          <Text style={styles.menuText}>Métodos de Pago (Mercado Pago vinculado)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <UsersIcon size={16} color="#fc1c46" strokeWidth={2} />
          </View>
          <Text style={styles.menuText}>Mis Grupos (Pádel Jueves, Fútbol Miércoles)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="#fc1c46"
                strokeWidth={2}
                fill="rgba(252,28,70,0.15)"
              />
            </Svg>
          </View>
          <Text style={styles.menuText}>Clubes Favoritos</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.menuText}>Notificaciones y Recordatorios (24h / 2h)</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Polyline points="16 17 21 12 16 7" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Line x1="21" y1="12" x2="9" y2="12" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.menuText, { color: colors.danger, fontFamily: fonts.bold }]}>Cerrar Sesión</Text>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 10
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary
  },
  googleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background
  },
  userName: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 4
  },
  userPhone: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.28)'
  },
  levelBadgeText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 10.5,
    letterSpacing: 0.5
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statNumber: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 4
  },
  statLabel: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center'
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12141c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    marginBottom: 24
  },
  walletLabel: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontSize: 12
  },
  walletAmount: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 22,
    letterSpacing: -0.4,
    marginVertical: 2
  },
  walletSub: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    fontSize: 10.5
  },
  walletBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  walletBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    color: colors.textPrimary,
    fontSize: 16,
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
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(252, 28, 70, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontFamily: fonts.medium,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13.5
  },
  menuArrow: {
    fontFamily: fonts.bold,
    color: colors.textMuted,
    fontSize: 18
  }
});
