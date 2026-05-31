import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Plus, CheckCircle2, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'menu' | 'topup' | 'addCard'>('menu');
  const [amount, setAmount] = useState('');
  
  const [cardTitle, setCardTitle] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  
  const [toppingUp, setToppingUp] = useState(false);

  const fetchPayments = async () => {
    try {
      // Fetch user profile to get real wallet balance
      const [profileRes, methodsRes] = await Promise.all([
        api.get('/customers/me'),
        api.get('/payment-methods')
      ]);
      
      let walletBalance = 0;
      if (profileRes.data.success) {
        walletBalance = profileRes.data.data.walletBalance || 0;
      }
      
      const newPayments: any[] = [
        { id: 'wallet', title: 'Fatafat Wallet', desc: `Balance: ₹${walletBalance.toFixed(2)}`, type: 'wallet', default: true }
      ];
      
      if (methodsRes.data.success && methodsRes.data.data) {
        const savedMethods = methodsRes.data.data.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          desc: m.type === 'upi' ? m.last4 : `**** **** **** ${m.last4 || '0000'}`,
          type: m.type,
          default: m.isDefault
        }));
        
        // If there's a default saved method, make wallet non-default
        if (savedMethods.some((m: any) => m.default)) {
          newPayments[0].default = false;
        }
        
        newPayments.push(...savedMethods);
      }
      
      setPayments(newPayments);
    } catch (e) {
      console.log('Failed to fetch payment info', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddCard = async () => {
    if (!cardTitle.trim() || cardNumber.trim().length < 4) {
      Alert.alert('Invalid Input', 'Please enter valid details.');
      return;
    }
    setToppingUp(true);
    try {
      const last4 = cardNumber.slice(-4);
      const res = await api.post('/payment-methods', {
        title: cardTitle,
        type: 'card',
        last4: last4,
        isDefault: payments.length === 1 // Only wallet exists
      });
      if (res.data.success) {
        Alert.alert('Success', 'Card added successfully');
        setModalVisible(false);
        setCardTitle('');
        setCardNumber('');
        fetchPayments();
      }
    } catch (error: any) {
      Alert.alert('Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setToppingUp(false);
    }
  };

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setToppingUp(true);
    try {
      // Assuming a wallet topup endpoint exists or this is mocked
      const res = await api.post('/customers/wallet/topup', { amount: parseFloat(amount) });
      if (res.data.success) {
        Alert.alert('Success', `₹${amount} added to your wallet!`);
        setModalVisible(false);
        setAmount('');
        fetchPayments();
      }
    } catch (error: any) {
      Alert.alert('Top Up Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setToppingUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setModalType('menu'); setModalVisible(true); }}>
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {modalType === 'menu' && (
              <>
                <Text style={styles.modalTitle}>What would you like to do?</Text>
                <TouchableOpacity style={styles.menuItem} onPress={() => setModalType('topup')}>
                  <Wallet size={24} color="#0284C7" />
                  <Text style={styles.menuItemText}>Top Up Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => setModalType('addCard')}>
                  <CreditCard size={24} color="#10B981" />
                  <Text style={styles.menuItemText}>Add New Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'topup' && (
              <>
                <Text style={styles.modalTitle}>Top Up Wallet</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={toppingUp}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleTopUp} disabled={toppingUp}>
                    {toppingUp ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Add Funds</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === 'addCard' && (
              <>
                <Text style={[styles.modalTitle, { textAlign: 'left', marginBottom: 16 }]}>Add New Card</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Card Title (e.g. HDFC Bank)"
                  placeholderTextColor="#94A3B8"
                  value={cardTitle}
                  onChangeText={setCardTitle}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Card Number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  maxLength={16}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={toppingUp}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard} disabled={toppingUp}>
                    {toppingUp ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Card</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  desc: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 24, textAlign: 'center' },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  menuItemText: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 16 },

  textInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 15, color: '#0F172A', marginBottom: 16 },

  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  currencySymbol: { fontSize: 48, fontWeight: '800', color: '#0F172A', marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '800', color: '#0F172A', minWidth: 60, padding: 0 },
  modalActions: { flexDirection: 'row', gap: 16 },
  cancelBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  saveBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' }
});
