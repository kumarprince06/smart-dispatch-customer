import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Plus, CheckCircle2, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Fetch wallet transactions or balance if available
        const res = await api.get('/payments/my-transactions');
        // Currently setting mock cards, but structure is ready for backend real cards
        setPayments([
          { id: '1', title: 'HDFC Bank Credit Card', desc: '**** **** **** 4321', type: 'card', default: true },
          { id: '2', title: 'Fatafat Wallet', desc: 'Balance: ₹1,250.00', type: 'wallet', default: false },
          { id: '3', title: 'UPI', desc: 'user@okhdfcbank', type: 'upi', default: false },
        ]);
      } catch (e) {
        console.log('Failed to fetch payment info', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, item.default && styles.cardActive]}>
              <View style={[styles.iconWrap, item.default ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F1F5F9' }]}>
                {item.type === 'wallet' ? <Wallet size={24} color={item.default ? '#0284C7' : '#64748B'} /> : <CreditCard size={24} color={item.default ? '#0284C7' : '#64748B'} />}
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, item.default && { color: '#FFFFFF' }]}>{item.title}</Text>
                <Text style={[styles.desc, item.default && { color: '#E0F2FE' }]}>{item.desc}</Text>
              </View>
              {item.default && <CheckCircle2 size={24} color="#FFFFFF" />}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  list: { padding: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  cardActive: { backgroundColor: '#0284C7', shadowColor: '#0284C7', shadowOpacity: 0.3 },
  iconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  desc: { fontSize: 13, color: '#64748B', fontWeight: '500' }
});
