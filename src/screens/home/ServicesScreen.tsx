import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, ShieldCheck, Navigation, FileText, ShoppingBag, Truck, ArrowLeft, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SERVICES = [
  { id: 1, icon: <Package size={32} color="#FFFFFF" />, title: 'Standard Package', desc: 'Up to 5kg, delivered in 2 hours', bg: ['#3B82F6', '#2563EB'] },
  { id: 2, icon: <Clock size={32} color="#FFFFFF" />, title: 'Express Delivery', desc: 'Under 30 mins delivery', bg: ['#F59E0B', '#D97706'] },
  { id: 3, icon: <ShieldCheck size={32} color="#FFFFFF" />, title: 'Secure & Valuables', desc: 'OTP protected, insured', bg: ['#10B981', '#059669'] },
  { id: 4, icon: <Navigation size={32} color="#FFFFFF" />, title: 'Intercity Courier', desc: 'Out of station deliveries', bg: ['#8B5CF6', '#7C3AED'] },
  { id: 5, icon: <FileText size={32} color="#FFFFFF" />, title: 'Documents', desc: 'Confidential file transport', bg: ['#64748B', '#475569'] },
  { id: 6, icon: <ShoppingBag size={32} color="#FFFFFF" />, title: 'Groceries', desc: 'From store to your door', bg: ['#EC4899', '#DB2777'] },
  { id: 7, icon: <Truck size={32} color="#FFFFFF" />, title: 'Freight & Heavy', desc: 'Above 50kg logistics', bg: ['#0F172A', '#1E293B'] },
];

export default function ServicesScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>What do you need to send today?</Text>
        
        <View style={styles.grid}>
          {SERVICES.map((srv) => (
            <TouchableOpacity 
              key={srv.id} 
              style={styles.card} 
              activeOpacity={0.9}
              onPress={() => (navigation as any).navigate('CreateOrder')}
            >
              <LinearGradient colors={srv.bg as any} style={styles.iconWrap}>
                {srv.icon}
              </LinearGradient>
              <Text style={styles.cardTitle}>{srv.title}</Text>
              <Text style={styles.cardDesc}>{srv.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 24, paddingBottom: 100 },
  subtitle: { fontSize: 16, color: '#64748B', fontWeight: '600', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  card: { width: (width - 48 - 16) / 2, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 4 },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  cardDesc: { fontSize: 12, fontWeight: '500', color: '#94A3B8', lineHeight: 18 }
});
