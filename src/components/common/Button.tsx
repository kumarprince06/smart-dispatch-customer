import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const getContainerStyle = () => {
    if (disabled) return styles.disabled;
    if (isOutline) return styles.outlineContainer;
    if (isSecondary) return styles.secondaryContainer;
    if (isDanger) return styles.dangerContainer;
    return {};
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    if (isOutline) return COLORS.primary;
    if (isSecondary) return COLORS.text;
    return COLORS.textInverse;
  };

  const content = (
    <>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[TYPOGRAPHY.button, { color: getTextColor() }, icon ? { marginLeft: SIZES.sm } : {}, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (isPrimary && !isOutline) {
    return (
      <TouchableOpacity onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, SHADOWS.glow, disabled && styles.disabledGradient, style]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.7}
      style={[styles.container, getContainerStyle(), style]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  secondaryContainer: {
    backgroundColor: COLORS.surfaceLight,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dangerContainer: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.5,
  },
  disabledGradient: {
    opacity: 0.7,
  },
});
