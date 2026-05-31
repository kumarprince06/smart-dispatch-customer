import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, CheckCircle, Navigation, Info, ChevronRight, Map } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';
import LocationPickerModal from '../../components/LocationPickerModal';

const { width } = Dimensions.get('window');

export default function CreateOrderScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  
  const [pickupLat, setPickupLat] = useState(28.6139);
  const [pickupLng, setPickupLng] = useState(77.2090);
  const [dropLat, setDropLat] = useState(28.5355);
  const [dropLng, setDropLng] = useState(77.2410);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  
  // Map Modal State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapType, setMapType] = useState<'pickup' | 'drop'>('pickup');
  
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

  // Fetch estimate whenever coordinates or package type changes
  React.useEffect(() => {
    if (formData.pickupAddress.length > 3 && formData.dropAddress.length > 3) {
      fetchEstimate();
    }
  }, [pickupLat, pickupLng, dropLat, dropLng, formData.packageType]);

  const searchAddress = async (text: string, isPickup: boolean) => {
    if (isPickup) setFormData({ ...formData, pickupAddress: text });
    else setFormData({ ...formData, dropAddress: text });

    if (text.length > 3) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`);
        const data = await res.json();
        if (isPickup) setPickupSuggestions(data);
        else setDropSuggestions(data);
      } catch (e) {}
    } else {
      if (isPickup) setPickupSuggestions([]);
      else setDropSuggestions([]);
    }
  };

  const fetchEstimate = async () => {
    setEstimateLoading(true);
    try {
      const res = await api.post('/pricing/estimate', {
        pickupLat: pickupLat,
        pickupLng: pickupLng,
        dropoffLat: dropLat, 
        dropoffLng: dropLng,
        priority: 'STANDARD',
        packageType: formData.packageType
      });
      if (res.data.success) {
        setPriceEstimate(res.data.data);
      }
    } catch (e) {
      console.log('Failed to fetch estimate', e);
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!formData.pickupAddress || !formData.dropAddress) {
      Alert.alert('Missing Details', 'Please provide both pickup and drop addresses.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        pickupAddress: formData.pickupAddress,
        pickupLatitude: pickupLat, pickupLongitude: pickupLng,
        pickupContactName: formData.pickupContactName, pickupContactPhone: formData.pickupContactPhone,
        dropAddress: formData.dropAddress,
        dropLatitude: dropLat, dropLongitude: dropLng,
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

  const openMapSelector = (type: 'pickup' | 'drop') => {
    setMapType(type);
    setMapModalVisible(true);
  };

  const confirmMapSelection = (address: string, lat: number, lng: number) => {
    if (mapType === 'pickup') {
      setFormData({ ...formData, pickupAddress: address });
      setPickupLat(lat);
      setPickupLng(lng);
    } else {
      setFormData({ ...formData, dropAddress: address });
      setDropLat(lat);
      setDropLng(lng);
    }
    setMapModalVisible(false);
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
                <View style={[styles.input, { padding: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput style={{ flex: 1, height: '100%', fontSize: 15, color: '#0F172A' }} placeholder="Search Pickup Address" placeholderTextColor="#94A3B8" value={formData.pickupAddress} onChangeText={(t) => searchAddress(t, true)} />
                  <TouchableOpacity onPress={() => openMapSelector('pickup')} style={{ padding: 8, backgroundColor: '#EFF6FF', borderRadius: 8, marginLeft: 8 }}>
                    <Map size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                {pickupSuggestions.length > 0 && (
                  <View style={styles.suggestionsCard}>
                    {pickupSuggestions.map((item, idx) => (
                      <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => {
                        setFormData({ ...formData, pickupAddress: item.display_name });
                        setPickupLat(parseFloat(item.lat));
                        setPickupLng(parseFloat(item.lon));
                        setPickupSuggestions([]);
                      }}>
                        <MapPin size={16} color="#64748B" />
                        <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
                <View style={[styles.input, { padding: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput style={{ flex: 1, height: '100%', fontSize: 15, color: '#0F172A' }} placeholder="Search Drop-off Address" placeholderTextColor="#94A3B8" value={formData.dropAddress} onChangeText={(t) => searchAddress(t, false)} />
                  <TouchableOpacity onPress={() => openMapSelector('drop')} style={{ padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8, marginLeft: 8 }}>
                    <Map size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                {dropSuggestions.length > 0 && (
                  <View style={styles.suggestionsCard}>
                    {dropSuggestions.map((item, idx) => (
                      <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => {
                        setFormData({ ...formData, dropAddress: item.display_name });
                        setDropLat(parseFloat(item.lat));
                        setDropLng(parseFloat(item.lon));
                        setDropSuggestions([]);
                      }}>
                        <MapPin size={16} color="#64748B" />
                        <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {priceEstimate && (
          <View style={{ padding: 16, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#64748B' }}>Distance ({priceEstimate.distanceKm} km)</Text>
              <Text style={{ fontSize: 14, color: '#64748B' }}>{priceEstimate.currency}{priceEstimate.baseFee}</Text>
            </View>
            {priceEstimate.surgeMultiplier > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#F59E0B' }}>High Demand Surge</Text>
                <Text style={{ fontSize: 14, color: '#F59E0B' }}>x{priceEstimate.surgeMultiplier}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Total Estimated</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#3B82F6' }}>
                {priceEstimate.currency}{priceEstimate.estimatedFee}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, (isLoading || estimateLoading) && styles.disabledButton]}
            onPress={handleCreateOrder}
            disabled={isLoading || estimateLoading}
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

        <LocationPickerModal
          visible={mapModalVisible}
          onClose={() => setMapModalVisible(false)}
          onConfirm={confirmMapSelection}
          title={mapType === 'pickup' ? "Set Pickup Location" : "Set Drop-off Location"}
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  timelineContainer: { position: 'relative' },
  timelineLine: { position: 'absolute', left: 45, top: 40, bottom: 40, width: 2, backgroundColor: '#E2E8F0', zIndex: -1 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
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
  suggestionsCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: -8, marginBottom: 12, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  suggestionText: { flex: 1, fontSize: 13, color: '#334155' }
});
