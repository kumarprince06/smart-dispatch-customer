import { Dimensions, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  
  primary: '#6366F1',
  primaryLight: '#818CF8', 
  primaryDark: '#4338CA',
  
  accent: '#14B8A6',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  text: '#0F172A',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
  glass: 'rgba(255, 255, 255, 0.7)',
};

export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  
  primary: '#6366F1',
  primaryLight: '#818CF8', 
  primaryDark: '#4338CA',
  
  accent: '#14B8A6',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textInverse: '#0F172A',

  border: 'rgba(255,255,255,0.1)',
  
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.8)',
  glass: 'rgba(30, 41, 59, 0.7)',
};

// Default static fallback for components not yet refactored
export const COLORS = lightColors;

// Hook to get the current theme colors dynamically
export const useTheme = () => {
  const isDarkMode = useAuthStore((state: any) => state.user?.darkMode);
  return {
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode,
  };
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
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: '400' as const },
  body2: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  button: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.5 },
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
