import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Deep, premium dark mode palette
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceLight: '#334155', // Slate 700
  
  // Neon accents (Glassmorphism friendly)
  primary: '#6366F1', // Indigo 500 (Matches admin panel)
  primaryLight: '#818CF8', 
  primaryDark: '#4338CA',
  
  // Secondary / Gradients
  accent: '#14B8A6', // Teal 500
  
  // Semantic
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#3B82F6', // Blue 500

  // Text
  text: '#F8FAFC', // Slate 50
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#0F172A',

  // Borders & Dividers
  border: 'rgba(255,255,255,0.1)',
  
  // Utilities
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.7)',
  glass: 'rgba(30, 41, 59, 0.7)',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  radius: 16,
  radiusLg: 24,
  radiusXl: 32,
  radiusFull: 9999,
  
  width,
  height,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: COLORS.text, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '700' as const, color: COLORS.text, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600' as const, color: COLORS.text },
  body1: { fontSize: 16, fontWeight: '400' as const, color: COLORS.text },
  body2: { fontSize: 14, fontWeight: '400' as const, color: COLORS.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: COLORS.textMuted },
  button: { fontSize: 16, fontWeight: '600' as const, color: COLORS.textInverse, letterSpacing: 0.5 },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  }
};
