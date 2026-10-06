import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bg: '#060E09',
  bgElevated: '#0B1710',
  card: '#0F1B14',
  cardAlt: '#142419',
  border: '#1B2E22',
  borderStrong: '#2B4A35',

  primary: '#4ADE5A',
  primaryDim: '#2E9E3F',
  primarySoft: 'rgba(74, 222, 90, 0.14)',
  onPrimary: '#04210B',

  text: '#F2F7F3',
  textMuted: '#8DA195',
  textFaint: '#5C7064',

  danger: '#FF5D5D',
  dangerSoft: 'rgba(255, 93, 93, 0.12)',
  warning: '#FFB020',
  streak: '#FF7A2F',
  gold: '#FACC15',
  overlay: 'rgba(0, 0, 0, 0.7)',

  /** Accent colours used to give each habit its own identity. */
  accents: ['#4ADE5A', '#A855F7', '#3B9EFF', '#FF8A3D', '#F472B6', '#FACC15'],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 20,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'tiny';

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, lineHeight: 40 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.2 },
  tiny: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
};

export const shadows: Record<'card' | 'glow', ViewStyle> = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
};

export const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};
