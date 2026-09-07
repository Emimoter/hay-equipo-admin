export const colors = {
  // App Canvas (Crisp White / Modern Luxury Light Canvas)
  background: '#f8fafc',
  backgroundElevated: '#ffffff',
  backgroundSurface: '#f1f5f9',
  
  // High-Contrast Dual-Tone Card System
  // 1. Black Cards (Deep Pitch Black with Red Accents & White Typography)
  cardBlack: '#0b0e14',
  cardBlackInner: '#121622',
  cardBlackOuter: 'rgba(11, 14, 20, 0.12)',
  cardBlackBorder: 'rgba(252, 28, 70, 0.35)',
  cardBlackBorderSubtle: 'rgba(255, 255, 255, 0.1)',

  // 2. Red Cards (Vibrant Crimson Red with Black Accents & White Typography)
  cardRed: '#fc1c46',
  cardRedDark: '#be123c',
  cardRedInner: '#e11d48',
  cardRedOuter: 'rgba(252, 28, 70, 0.22)',
  cardRedBorder: 'rgba(255, 255, 255, 0.22)',

  // Default Card fallbacks for general components
  card: '#0b0e14',
  cardOuter: 'rgba(15, 23, 42, 0.08)',
  cardInner: '#121622',
  cardBorder: 'rgba(252, 28, 70, 0.25)',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(252, 28, 70, 0.6)',
  elevated: '#ffffff',

  // Primary Brand Identity (Crimson Red / Velocity)
  primary: '#fc1c46',
  primaryLight: '#ff335c',
  primaryDark: '#d9143a',
  primaryMuted: 'rgba(252, 28, 70, 0.12)',
  primaryBorder: 'rgba(252, 28, 70, 0.35)',
  primaryGlow: 'rgba(252, 28, 70, 0.3)',
  neonAccent: '#ff2e56',

  // Typography for White Canvas
  textCanvasPrimary: '#0f172a',
  textCanvasSecondary: '#475569',
  textCanvasMuted: '#64748b',
  textCanvasDim: '#94a3b8',

  // Typography for Inside Black & Red Cards (Always Crisp White)
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textDim: '#64748b',

  // Accent Tiers (Strictly Red, Black, White & Gold - NO Green)
  accentRed: '#fc1c46',
  accentRedMuted: 'rgba(252, 28, 70, 0.15)',
  accentGold: '#facc15',
  accentGoldMuted: 'rgba(250, 204, 21, 0.15)',

  // Feedback Signals (Red / Amber / Dark - NO Green)
  danger: '#ef4444',
  dangerMuted: 'rgba(239, 68, 68, 0.14)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245, 158, 11, 0.14)',
  success: '#fc1c46', // Red brand confirmation
  successMuted: 'rgba(252, 28, 70, 0.14)',
  
  // Neutral Solids & Dock Overlays
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(11, 14, 20, 0.75)',
  glassDock: 'rgba(11, 14, 20, 0.94)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};

export const fonts = {
  // Headings: Outfit (Geometric, athletic, ultra-modern)
  headingSemiBold: 'Outfit-SemiBold',
  headingBold: 'Outfit-Bold',
  
  // UI and Body: Plus Jakarta Sans (Crisp, high-end editorial)
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
};

export const typography = {
  titleHero: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.textCanvasPrimary,
    letterSpacing: -0.7,
  },
  titleLarge: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.textCanvasPrimary,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontFamily: fonts.headingBold,
    fontSize: 19,
    color: colors.textCanvasPrimary,
    letterSpacing: -0.3,
  },
  titleSmall: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textCanvasPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textCanvasSecondary,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.7,
  },
  priceBig: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  glowPrimary: {
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 7,
  },
  glowSubtle: {
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-AR')}`;
};
