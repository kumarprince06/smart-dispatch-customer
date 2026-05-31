import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, onPress }) => {
  const cardStyle = [styles.card, style];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: [string, string];
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, sub }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statIconBg}
    >
      {icon}
    </LinearGradient>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {sub && <Text style={styles.statSub}>{sub}</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.md,
  },
  statCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    flex: 1,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 4,
  },
});
