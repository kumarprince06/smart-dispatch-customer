import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { AlertTriangle, Info, LogOut } from 'lucide-react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  type?: 'error' | 'info' | 'logout';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {} }],
  onDismiss,
  type = 'info'
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'error': return <AlertTriangle size={32} color={COLORS.error} />;
      case 'logout': return <LogOut size={32} color={COLORS.error} />;
      default: return <Info size={32} color={COLORS.primaryLight} />;
    }
  };

  const getGradientColors = () => {
    if (type === 'error' || type === 'logout') {
      return ['rgba(239, 68, 68, 0.15)', 'transparent'] as const;
    }
    return ['rgba(99, 102, 241, 0.15)', 'transparent'] as const;
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={getGradientColors()}
            style={styles.headerGradient}
          />
          
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    isDestructive && styles.destructiveButton,
                    isCancel && styles.cancelButton,
                    buttons.length > 1 && { flex: 1, marginHorizontal: 4 }
                  ]}
                  onPress={() => {
                    if (onDismiss) onDismiss();
                    btn.onPress?.();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    isDestructive && styles.destructiveText,
                    isCancel && styles.cancelText
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm + 2,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: '#FFF',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.textMuted,
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  destructiveText: {
    color: COLORS.error,
  },
});
