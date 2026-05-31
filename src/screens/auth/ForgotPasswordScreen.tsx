import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setIsLoading(true);
    // Simulate API call for password reset
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Email Sent',
        'If an account exists with this email, you will receive password reset instructions.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBlob} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#0F172A" size={24} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send you instructions to reset your password.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Mail color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, isLoading && styles.disabledButton]}
              onPress={handleReset}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.gradientButton}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    <Send color="#FFFFFF" size={18} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  topBlob: { position: 'absolute', top: -100, right: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: '#FEE2E2', opacity: 0.6 },
  
  content: { padding: 32, flex: 1, justifyContent: 'center' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 32, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748B', fontWeight: '500', lineHeight: 24 },
  
  formContainer: { gap: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 20, height: 60,
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  
  resetButton: { marginTop: 16, borderRadius: 24, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 12 },
  disabledButton: { opacity: 0.7 },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
