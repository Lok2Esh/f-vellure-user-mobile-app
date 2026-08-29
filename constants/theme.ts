/**
 * Vellure Design System Tokens
 * Luxury Indian Event Planning & Marketplace Identity
 */

export const colors = {
  // Brand Colors
  primary: '#641E3D',      // Primary burgundy
  wine: '#78123C',         // Deep wine
  wineDark: '#450D23',     // Deepest wine
  wineLight: '#9E3058',    // Soft burgundy
  gold: '#D2AD6B',         // Premium gold
  goldDark: '#B8924B',     // Rich antique gold
  goldLight: '#F5E8CE',    // Pale gold / shimmer

  // Surfaces & Backgrounds
  cream: '#FDFBF7',        // Main canvas background
  surface: '#FFF8EF',      // Soft warm surface
  surfaceCard: '#FFFFFF',  // Pure card background
  surfaceDark: '#2A121E',  // Dark luxury card
  surfaceMuted: '#F3EDE2', // Muted surface / input background

  // Text & Typography
  textPrimary: '#2D2025',   // Main dark text
  textSecondary: '#786B70', // Secondary subtle text
  textMuted: '#9A8E94',     // Placeholder / tertiary text
  textInverse: '#FFFFFF',   // White text on dark
  textGold: '#D2AD6B',      // Golden highlight text

  // Borders & Accents
  borderLight: '#F1E8DB',
  borderMedium: '#E5DACB',
  borderGold: 'rgba(210, 173, 107, 0.4)',

  // Semantic Feedback
  success: '#2F7D62',
  successLight: '#DCFCE7',
  warning: '#B7791F',
  warningLight: '#FEF3C7',
  error: '#B63A4A',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
};

export const theme = {
  colors: {
    background: {
      primary: colors.cream,
      card: colors.surfaceCard,
      iconContainer: '#FEF6EA',
      cancelBtn: '#FCF5E8',
      modalOverlay: 'rgba(0,0,0,0.5)',
    },
    brand: {
      burgundy: colors.wine,
      burgundyLight: colors.wineLight,
      burgundyDark: colors.primary,
      gold: colors.gold,
      goldDark: colors.goldDark,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      tertiary: colors.textMuted,
      inverse: colors.textInverse,
      disabled: '#A7A38B',
    },
    border: {
      light: colors.borderLight,
      medium: colors.borderMedium,
      goldSoft: colors.borderGold,
    },
  },
};

export const typography = {
  titleLarge: { fontSize: 26, fontWeight: '900' as const, letterSpacing: -0.4 },
  titleMedium: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.2 },
  titleSmall: { fontSize: 16, fontWeight: '800' as const },
  bodyLarge: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 13, fontWeight: '500' as const, lineHeight: 19 },
  bodySmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
  caption: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

export const shadows = {
  subtle: {
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  luxury: {
    shadowColor: '#450D23',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
};
