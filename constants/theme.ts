/**
 * Vellure Design System Tokens
 * Luxury Indian Event Planning & Marketplace Identity
 */

import { Platform } from 'react-native';

export const colors = {
  // Brand Colors
  primary: '#5B263E',
  wine: '#6D304A',
  wineDark: '#3A1727',
  wineLight: '#A8667D',
  gold: '#C99958',
  goldDark: '#A97637',
  goldLight: '#F4E2C7',

  // Surfaces & Backgrounds
  cream: '#FBF7F2',
  surface: '#F8EFEA',
  surfaceCard: '#FFFDFC',
  surfaceDark: '#412031',
  surfaceMuted: '#F1E7E2',
  blush: '#E9D6D2',
  blushLight: '#F7EEEA',

  // Text & Typography
  textPrimary: '#35262D',
  textSecondary: '#76676D',
  textMuted: '#A09297',
  textInverse: '#FFFFFF',   // White text on dark
  textGold: '#D2AD6B',      // Golden highlight text

  // Borders & Accents
  borderLight: '#EFE4DE',
  borderMedium: '#E3D5CE',
  borderGold: 'rgba(201, 153, 88, 0.38)',

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
  serif: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
  sans: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', web: 'Inter, system-ui, sans-serif' }),
  titleLarge: { fontSize: 30, lineHeight: 35, fontWeight: '500' as const, letterSpacing: -0.7 },
  titleMedium: { fontSize: 22, lineHeight: 27, fontWeight: '500' as const, letterSpacing: -0.35 },
  titleSmall: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  bodyLarge: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  bodySmall: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.7, textTransform: 'uppercase' as const },
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
