import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  // Fondos claros
  bg: '#F4F8FA',
  surface: '#FFFFFF',
  surfaceHigh: '#EBF3F8',
  border: '#D0E1FD',

  // Paleta celeste y azul
  accent: '#0088FF',       // Celeste principal
  accentLight: '#4DACFF',  // Celeste claro
  accentDim: 'rgba(0, 136, 255, 0.12)',

  mint: '#00B4D8',         // Celeste turquesa
  mintDim: 'rgba(0, 180, 216, 0.12)',

  // Semánticos
  success: '#2EC4B6',
  warning: '#FF9F1C',
  danger: '#FF5A5F',

  // Textos
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
} as const;

export const Fonts = {
  // Configuración de Comic Sans multiplataforma
  comic: Platform.OS === 'ios' ? 'Comic Sans MS' : 'sans-serif-cursive',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const globalStyles = StyleSheet.create({
  fontComic: {
    fontFamily: Fonts.comic,
  },
});