import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Animated, Alert, TouchableOpacity, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Zap } from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Snackbar } from '../../components/common/Snackbar';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' });
  const { login, isLoading } = useAuthStore();
  const navigation = useNavigation<any>();

  // Refs for focusing next input
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    let newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      return;
    }
    setErrors({});

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setSnackbar({ visible: true, message: error?.response?.data?.message || error?.message || 'Invalid credentials. Please try again.', type: 'error' });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#1e1b4b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.blob, { top: -120, right: -120, backgroundColor: COLORS.primary }]} />
      <View style={[styles.blob, { bottom: -120, left: -120, backgroundColor: COLORS.accent }]} />

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Fixed Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.logoRing}>
            <Zap size={44} color="#38BDF8" />
          </View>
          <Text style={styles.brandName}>FataFat</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Animated.View style={{ transform: [{ translateX: shakeAnim }], opacity: fadeAnim }}>
            <View style={[styles.card, SHADOWS.lg]}>
              <Text style={styles.cardTitle}>Welcome back.</Text>
              <Text style={styles.cardSubtitle}>Log in to book your next delivery.</Text>

              <Input
                ref={emailRef}
                label="Email Address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={text => { setEmail(text); setErrors(e => ({ ...e, email: undefined })); }}
                icon={<Mail size={20} color={COLORS.textMuted} />}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                error={errors.email}
              />

              <Input
                ref={passwordRef}
                label="Password"
                placeholder="Your password"
                secureTextEntry
                value={password}
                onChangeText={text => { setPassword(text); setErrors(e => ({ ...e, password: undefined })); }}
                icon={<Lock size={20} color={COLORS.textMuted} />}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                error={errors.password}
              />

              <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                style={{ marginTop: SIZES.sm }}
              />

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>New to Fatafat? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SIZES.xl, paddingBottom: SIZES.xxl },
  blob: { position: 'absolute', width: 320, height: 320, borderRadius: 160, opacity: 0.12 },

  header: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 70 : 80, paddingBottom: SIZES.xl },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.15)', borderWidth: 2, borderColor: 'rgba(56, 189, 248, 0.5)',
    justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md, ...SHADOWS.glow,
  },
  brandName: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -1, marginBottom: SIZES.xs },
  badgeRow: { flexDirection: 'row' },
  badge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs / 2, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.4)' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#38BDF8', letterSpacing: 2 },

  card: { backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: SIZES.radiusXl, padding: SIZES.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { ...TYPOGRAPHY.h2, marginBottom: SIZES.xs },
  cardSubtitle: { ...TYPOGRAPHY.body2, marginBottom: SIZES.xl },

  forgotPasswordBtn: { alignSelf: 'flex-end', marginBottom: SIZES.md, marginTop: -SIZES.sm },
  forgotPasswordText: { ...TYPOGRAPHY.caption, color: COLORS.primaryLight, fontWeight: '600' },

  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.xl },
  footerText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500' },
  footerLink: { color: COLORS.primaryLight, fontSize: 15, fontWeight: '800' },
});
