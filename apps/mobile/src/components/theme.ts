export const colors = {
  background: '#0B0F17',
  card: '#161F30',
  cardBorder: '#23324A',
  elevated: '#1E293B',
  primary: '#22C55E', // Electric sports green
  primaryLight: '#4ADE80',
  neonAccent: '#CCFF00',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accentBlue: '#38BDF8',
  accentPurple: '#A855F7',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  white: '#FFFFFF',
  overlay: 'rgba(11, 15, 23, 0.85)'
};

export const typography = {
  titleLarge: { fontSize: 26, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  titleMedium: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: '500' as const, color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  bodyMuted: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  badge: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const }
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-AR')}`;
};
