import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Snackbar } from '../../components/common/Snackbar';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' });
  const { register, isLoading } = useAuthStore();

  // Refs for input focus
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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

  const handleRegister = async () => {
    let newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) newErrors.email = 'Enter a valid email address';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password
      });
      setSnackbar({ visible: true, message: 'Account created successfully!', type: 'success' });
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error: any) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setSnackbar({ visible: true, message: error?.response?.data?.message || 'Failed to create account.', type: 'error' });
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.brandName}>Join FataFat</Text>
            <Text style={styles.subtitle}>Create an account to start shipping today.</Text>
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Animated.View style={{ transform: [{ translateX: shakeAnim }], opacity: fadeAnim }}>
            <View style={[styles.card, SHADOWS.lg]}>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: SIZES.sm }}>
                  <Input
                    ref={firstNameRef}
                    label="First Name"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChangeText={t => { setFormData({ ...formData, firstName: t }); setErrors(e => ({ ...e, firstName: '' })); }}
                    icon={<User size={20} color={COLORS.textMuted} />}
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    blurOnSubmit={false}
                    error={errors.firstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    ref={lastNameRef}
                    label="Last Name"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChangeText={t => { setFormData({ ...formData, lastName: t }); setErrors(e => ({ ...e, lastName: '' })); }}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Input
                ref={emailRef}
                label="Email Address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={t => { setFormData({ ...formData, email: t }); setErrors(e => ({ ...e, email: '' })); }}
                icon={<Mail size={20} color={COLORS.textMuted} />}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
                error={errors.email}
              />

              <Input
                ref={phoneRef}
                label="Phone Number"
                placeholder="+1 234 567 890"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={t => { setFormData({ ...formData, phoneNumber: t }); setErrors(e => ({ ...e, phoneNumber: '' })); }}
                icon={<Phone size={20} color={COLORS.textMuted} />}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                error={errors.phoneNumber}
              />

              <Input
                ref={passwordRef}
                label="Password"
                placeholder="Create password"
                secureTextEntry
                value={formData.password}
                onChangeText={t => { setFormData({ ...formData, password: t }); setErrors(e => ({ ...e, password: '' })); }}
                icon={<Lock size={20} color={COLORS.textMuted} />}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
                error={errors.password}
              />

              <Input
                ref={confirmPasswordRef}
                label="Confirm Password"
                placeholder="Confirm password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={t => { setFormData({ ...formData, confirmPassword: t }); setErrors(e => ({ ...e, confirmPassword: '' })); }}
                icon={<Lock size={20} color={COLORS.textMuted} />}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                error={errors.confirmPassword}
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                disabled={isLoading}
                style={{ marginTop: SIZES.md }}
              />

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Log in</Text>
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
  scrollContent: { paddingHorizontal: SIZES.xl, paddingBottom: 100 },
  blob: { position: 'absolute', width: 320, height: 320, borderRadius: 160, opacity: 0.12 },

  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 70 : 60, paddingHorizontal: SIZES.xl, paddingBottom: SIZES.lg },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  headerTextContainer: { flex: 1 },
  brandName: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -1, marginBottom: 4 },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },

  card: { backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: SIZES.radiusXl, padding: SIZES.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row' },

  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.xl },
  footerText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500' },
  footerLink: { color: COLORS.primaryLight, fontSize: 15, fontWeight: '800' },
});
