import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { loadToken } = useAuthStore();

  useEffect(() => {
    // Parallel animation for fade and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Init App
    const initApp = async () => {
      // Simulate splash time for brand exposure
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isAuthenticated = await loadToken();
      if (isAuthenticated) {
        // Navigate to Main Stack (Handled by RootNavigator logic)
      } else {
        navigation.replace('Login');
      }
    };

    initApp();
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Zap size={80} color="#38BDF8" />
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim, marginTop: 20, alignItems: 'center' }}>
          <Text style={styles.title}>Fatafat</Text>
          <Text style={styles.subtitle}>Lightning Fast Deliveries</Text>
        </Animated.View>
      </View>
      
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Powered by Smart Dispatch</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#38BDF8', // Electric Blue
    letterSpacing: 1.5,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  }
});
