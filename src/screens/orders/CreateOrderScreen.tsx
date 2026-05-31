import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, CheckCircle, Navigation, Info, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';

const { width } = Dimensions.get('window');

export default function CreateOrderScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupContactName: '',
    pickupContactPhone: '',
    dropAddress: '',
    dropContactName: '',
    dropContactPhone: '',
    packageType: 'DOCUMENTS',
    packageDescription: '',
    packageWeightKg: '1.0'
  });

  const handleCreateOrder = async () => {
    if (!formData.pickupAddress || !formData.dropAddress) {
      Alert.alert('Missing Details', 'Please provide both pickup and drop addresses.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        pickupAddress: formData.pickupAddress,
        pickupLatitude: 28.6139, pickupLongitude: 77.2090,
        pickupContactName: formData.pickupContactName, pickupContactPhone: formData.pickupContactPhone,
        dropAddress: formData.dropAddress,
        dropLatitude: 28.5355, dropLongitude: 77.2410,
        dropContactName: formData.dropContactName, dropContactPhone: formData.dropContactPhone,
        packageType: formData.packageType, packageDescription: formData.packageDescription,
        packageWeightKg: parseFloat(formData.packageWeightKg) || 1.0, priority: 'STANDARD'
      };
      await api.post('/orders', payload);
      Alert.alert('Success', 'Your delivery has been booked successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Deliveries' }) }
      ]);
    } catch (error: any) {
      Alert.alert('Booking Failed', error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#0F172A" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Delivery</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Navigation size={18} color="#0284C7" />
                  </View>
                  <Text style={styles.cardTitle}>Pickup Details</Text>
                </View>
                <TextInput style={styles.input} placeholder="Complete Pickup Address" placeholderTextColor="#94A3B8" value={formData.pickupAddress} onChangeText={t => setFormData({...formData, pickupAddress: t})} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Sender Name" placeholderTextColor="#94A3B8" value={formData.pickupContactName} onChangeText={t => setFormData({...formData, pickupContactName: t})} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Phone No." placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={formData.pickupContactPhone} onChangeText={t => setFormData({...formData, pickupContactPhone: t})} />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <MapPin size={18} color="#EF4444" />
                  </View>
                  <Text style={styles.cardTitle}>Drop-off Details</Text>
                </View>
                <TextInput style={styles.input} placeholder="Complete Drop-off Address" placeholderTextColor="#94A3B8" value={formData.dropAddress} onChangeText={t => setFormData({...formData, dropAddress: t})} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Receiver Name" placeholderTextColor="#94A3B8" value={formData.dropContactName} onChangeText={t => setFormData({...formData, dropContactName: t})} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Phone No." placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={formData.dropContactPhone} onChangeText={t => setFormData({...formData, dropContactPhone: t})} />
                </View>
              </View>
            </View>

            <View style={[styles.card, { marginTop: 8 }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Package size={18} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Package Info</Text>
              </View>
              
              <View style={styles.typeSelector}>
                {['DOCUMENTS', 'FOOD', 'ELECTRONICS', 'OTHER'].map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeBadge, formData.packageType === type && styles.typeBadgeActive]}
                    onPress={() => setFormData({...formData, packageType: type})}
                  >
                    <Text style={[styles.typeText, formData.packageType === type && styles.typeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 16 }]} placeholder="Any specific instructions? (Optional)" placeholderTextColor="#94A3B8" multiline value={formData.packageDescription} onChangeText={t => setFormData({...formData, packageDescription: t})} />
            </View>

            <View style={styles.infoBox}>
              <Info size={16} color="#64748B" />
              <Text style={styles.infoText}>A rider will be assigned immediately after booking.</Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleCreateOrder}
            disabled={isLoading}
          >
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.gradientButton}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Confirm & Book Delivery</Text>
                  <ChevronRight color="#FFFFFF" size={20} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FAFAFA' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  timelineContainer: { position: 'relative' },
  timelineLine: { position: 'absolute', left: 40, top: 40, bottom: 40, width: 2, backgroundColor: '#E2E8F0', borderStyle: 'dashed', zIndex: 0 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, marginBottom: 16, elevation: 6, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, zIndex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 12, fontSize: 15, fontWeight: '500', color: '#0F172A' },
  row: { flexDirection: 'row', gap: 12 },
  
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  typeBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  typeBadgeActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  typeText: { fontSize: 12, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  typeTextActive: { color: '#FFFFFF' },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: '#F1F5F9', borderRadius: 16, marginTop: 8 },
  infoText: { fontSize: 13, fontWeight: '600', color: '#64748B', flex: 1 },
  
  footer: { padding: 24, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitButton: { borderRadius: 24, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  disabledButton: { opacity: 0.7 },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
