export const colors = {
  background: '#07080a',
  card: '#10131c',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  elevated: '#171b26',
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
  overlay: 'rgba(7, 8, 10, 0.88)',
};

export const fonts = {
  // Headings: Outfit (Geometric, modern sporty, distinctive)
  headingSemiBold: 'Outfit-SemiBold',
  headingBold: 'Outfit-Bold',
  
  // UI and Body: Plus Jakarta Sans (Clean, high-end, premium editorial)
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
};

export const typography = {
  titleLarge: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  titleMedium: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  caption: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-AR')}`;
};
