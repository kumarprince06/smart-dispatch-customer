import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
  duration?: number;
}

export function Snackbar({ visible, message, type = 'error', onDismiss, duration = 3000 }: SnackbarProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: insets.top > 0 ? insets.top + 10 : Platform.OS === 'ios' ? 50 : 40,
        useNativeDriver: true,
        tension: 40,
        friction: 5,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const bgColor = type === 'error' ? '#EF4444' : '#10B981';
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], backgroundColor: bgColor }]}>
      <Icon color="#FFFFFF" size={20} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <X color="#FFFFFF" size={18} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: SIZES.xl,
    right: SIZES.xl,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    zIndex: 9999,
    ...SHADOWS.lg,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: SIZES.sm,
    marginRight: SIZES.sm,
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  }
});
