export const colors = {
  background: '#08090d',
  card: '#12151d',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  elevated: '#181c26',
  primary: '#fc1c46', // Brand Crimson Red
  primaryLight: '#ff335c',
  primaryDark: '#d9143a',
  primaryMuted: 'rgba(252, 28, 70, 0.15)',
  primaryBorder: 'rgba(252, 28, 70, 0.35)',
  neonAccent: '#ff2e56',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  accentBlue: '#38bdf8',
  accentPurple: '#a855f7',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  white: '#ffffff',
  overlay: 'rgba(8, 9, 13, 0.88)',
};

export const typography = {
  titleLarge: { fontSize: 26, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  titleMedium: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: '500' as const, color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  bodyMuted: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  badge: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const },
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-AR')}`;
};
