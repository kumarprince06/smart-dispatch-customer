import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SIZES, TYPOGRAPHY } from '../../theme/theme';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, icon, secureTextEntry, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        
        <TextInput
          ref={ref}
          style={[styles.input, TYPOGRAPHY.body1]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={COLORS.textMuted} />
            ) : (
              <Eye size={20} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SIZES.xs,
    marginLeft: SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelFocused: {
    color: COLORS.primaryLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    height: 60,
    paddingHorizontal: SIZES.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  iconWrapper: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    height: '100%',
  },
  eyeIcon: {
    padding: SIZES.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  }
});
