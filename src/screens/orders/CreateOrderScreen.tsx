import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, CheckCircle, Navigation, Info, ChevronRight, Map, Wallet, CreditCard, Banknote, ShieldCheck, Globe, Smartphone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import RazorpayCheckout from 'react-native-razorpay';
import api from '../../api/axios';
import LocationPickerModal from '../../components/LocationPickerModal';
import { SIZES, lightColors } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { Snackbar } from '../../components/common/Snackbar';
import { useSnackbar } from '../../hooks/useSnackbar';

const { width } = Dimensions.get('window');

// Maps backend provider keys to icons, colors for the payment selector
const getProviderVisuals = (provider: string) => {
  const map: Record<string, { icon: React.ReactNode; bgColor: string; activeColor: string }> = {
    WALLET:           { icon: <Wallet size={22} color="#3B82F6" />,       bgColor: '#EFF6FF', activeColor: '#3B82F6' },
    RAZORPAY:         { icon: <ShieldCheck size={22} color="#10B981" />,  bgColor: '#F0FDF4', activeColor: '#10B981' },
    PAYU:             { icon: <CreditCard size={22} color="#D946EF" />,   bgColor: '#FDF4FF', activeColor: '#D946EF' },
    STRIPE:           { icon: <CreditCard size={22} color="#4338CA" />,   bgColor: '#E0E7FF', activeColor: '#4338CA' },
    PAYSTACK:         { icon: <Globe size={22} color="#0EA5E9" />,        bgColor: '#E0F2FE', activeColor: '#0EA5E9' },
    CASHFREE:         { icon: <Smartphone size={22} color="#6366F1" />,   bgColor: '#EEF2FF', activeColor: '#6366F1' },
    CASH_ON_DELIVERY: { icon: <Banknote size={22} color="#F97316" />,     bgColor: '#FFF7ED', activeColor: '#F97316' },
  };
  return map[provider] || { icon: <CreditCard size={22} color="#64748B" />, bgColor: '#F1F5F9', activeColor: '#64748B' };
};

export default function CreateOrderScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);

  // Map Modal State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapType, setMapType] = useState<'pickup' | 'drop'>('pickup');

  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropAddress: '',
    dropContactName: '',
    dropContactPhone: '',
    packageType: 'DOCUMENT',
    packageDescription: ''
  });

  
  const [items, setItems] = useState([{
    name: '', quantity: '1', weight: '1.0', length: '', width: '', height: ''
  }]);

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('WALLET');
  const [walletBalance, setWalletBalance] = useState(0);

  // Dynamic providers from backend
  const [providers, setProviders] = useState<{provider: string, displayName: string}[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  React.useEffect(() => {
    // Fetch wallet balance and payment providers on mount
    api.get('/customers/me').then(res => {
      if (res.data.success && res.data.data.walletBalance) {
        setWalletBalance(res.data.data.walletBalance);
      }
    }).catch(e => console.log('Error fetching wallet', e));

    // Fetch available payment providers from backend
    setProvidersLoading(true);
    api.get('/payments/providers').then(res => {
      if (res.data.success && res.data.data) {
        setProviders(res.data.data);
        // Default to first provider if available
        if (res.data.data.length > 0) {
          setSelectedPaymentMethod(res.data.data[0].provider);
        }
      }
    }).catch(e => console.log('Error fetching providers', e))
     .finally(() => setProvidersLoading(false));
  }, []);


  // Fetch estimate only when item details or package type changes (coordinates must already be set)
  React.useEffect(() => {
    if (pickupLat !== null && dropLat !== null) {
      fetchEstimate();
    }
  }, [items, formData.packageType]);

  const searchAddress = (text: string, isPickup: boolean) => {
    if (isPickup) setFormData({ ...formData, pickupAddress: text });
    else setFormData({ ...formData, dropAddress: text });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.length > 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`, {
            headers: {
              'User-Agent': 'SmartDispatchApp/1.0',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });

          if (!res.ok) {
            console.log('Nominatim Error:', await res.text());
            return;
          }

          const data = await res.json();
          if (isPickup) setPickupSuggestions(data);
          else setDropSuggestions(data);
        } catch (e) {
          console.log('Search error', e);
        }
      }, 500); // 500ms debounce
    } else {
      if (isPickup) setPickupSuggestions([]);
      else setDropSuggestions([]);
    }
  };

  const fetchEstimate = async () => {
    setEstimateLoading(true);
    try {
      const payload = {
        pickupLat: pickupLat,
        pickupLng: pickupLng,
        dropoffLat: dropLat,
        dropoffLng: dropLng,
        priority: 'STANDARD',
        packageType: formData.packageType,
        items: items.map(item => ({
          weightKg: parseFloat(item.weight) || 1.0,
          lengthCm: parseFloat(item.length) || 0,
          widthCm: parseFloat(item.width) || 0,
          heightCm: parseFloat(item.height) || 0,
          quantity: parseInt(item.quantity) || 1
        }))
      };
      const res = await api.post('/pricing/estimate', payload);
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
      showSnackbar('Please provide both pickup and drop-off addresses.', 'error');
      return;
    }
    
    // Open payment modal instead of directly creating
    setPaymentModalVisible(true);
  };

  const processPaymentAndOrder = async () => {
    setPaymentModalVisible(false);
    setIsLoading(true);
    try {
      const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0.0) * (parseInt(item.quantity) || 1), 0);
      
      const formattedItemsDesc = items.map(item => 
        `• ${item.name || 'Package'} (${item.quantity}x) — ${item.weight} kg ${item.length ? `(${item.length}x${item.width}x${item.height} cm)` : ''}`
      ).join('\\n');
      
      const finalDescription = [
        formattedItemsDesc,
        formData.packageDescription ? `Instructions: ${formData.packageDescription}` : ''
      ].filter(Boolean).join('\\n\\n');

      const payload = {
        pickupAddress: formData.pickupAddress,
        pickupLatitude: pickupLat || 0, pickupLongitude: pickupLng || 0,
        pickupContactName: user?.name || user?.fullName || '',
        pickupContactPhone: user?.phone || user?.phoneNumber || '',
        dropAddress: formData.dropAddress,
        dropLatitude: dropLat || 0, dropLongitude: dropLng || 0,
        dropContactName: formData.dropContactName, dropContactPhone: formData.dropContactPhone,
        packageType: formData.packageType, 
        packageDescription: finalDescription,
        packageWeightKg: totalWeight || 1.0,
        priority: 'STANDARD',
        items: items.map(item => ({
          name: item.name,
          weightKg: parseFloat(item.weight) || 1.0,
          lengthCm: parseFloat(item.length) || 0,
          widthCm: parseFloat(item.width) || 0,
          heightCm: parseFloat(item.height) || 0,
          quantity: parseInt(item.quantity) || 1
        }))
      };
      
      // 1. Create the Order
      const orderRes = await api.post('/orders', payload);
      
      if (orderRes.data.success) {
        const newOrder = orderRes.data.data;
        
        // 2. Process Payment
        if (selectedPaymentMethod === 'CASH_ON_DELIVERY') {
          // COD — no payment needed upfront
          showSnackbar('Order placed! Pay rider on delivery. 🎉', 'success');
          setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 1500);
        } else {
          // Gateway or Wallet payment
          try {
            // Create payment session
            const sessionRes = await api.post('/payments/create-session', {
              orderId: newOrder.orderId,
              provider: selectedPaymentMethod
            });

            if (sessionRes.data.success) {
              const sessionData = sessionRes.data.data;

              if (selectedPaymentMethod === 'RAZORPAY') {
                // Razorpay Flow
                const options = {
                  description: 'Delivery Payment',
                  image: 'https://i.imgur.com/3g7nmJC.png',
                  currency: sessionData.currency,
                  key: sessionData.key,
                  amount: Math.round(sessionData.amount * 100),
                  name: 'Smart Dispatch',
                  order_id: sessionData.paymentSessionId, // Razorpay Order ID
                  theme: { color: '#0F172A' }
                };

                RazorpayCheckout.open(options)
                  .then(async (data: any) => {
                    // Verify Payment
                    try {
                      await api.post('/payments/verify', {
                        razorpayPaymentId: data.razorpay_payment_id,
                        razorpayOrderId: data.razorpay_order_id,
                        razorpaySignature: data.razorpay_signature
                      });
                      showSnackbar('Payment verified and confirmed! 🎉', 'success');
                      setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 1500);
                    } catch (verifyErr) {
                      showSnackbar('Payment verification failed.', 'error');
                      setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 2000);
                    }
                  })
                  .catch((error: any) => {
                    showSnackbar('Payment cancelled or failed.', 'error');
                    setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 2000);
                  });
              } else if (selectedPaymentMethod === 'PAYSTACK') {
                // Paystack Flow — redirect to authorization_url
                if (sessionData.paymentUrl) {
                  Linking.openURL(sessionData.paymentUrl);
                  showSnackbar('Redirecting to Paystack Checkout...');
                  setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 1500);
                } else {
                  showSnackbar('Could not retrieve Paystack checkout link.', 'error');
                }
              } else if (selectedPaymentMethod === 'STRIPE' || selectedPaymentMethod === 'PAYU') {
                if (sessionData.paymentUrl) {
                  Linking.openURL(sessionData.paymentUrl);
                  showSnackbar('Redirecting to payment gateway...');
                  setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 1500);
                } else {
                  showSnackbar('Could not retrieve payment link.', 'error');
                }
              } else {
                // Wallet flow — instantly deducted
                showSnackbar('Payment successful! Delivery booked! 🎉', 'success');
                setTimeout(() => navigation.navigate('Main', { screen: 'Deliveries' }), 1500);
              }
            }
          } catch (paymentErr: any) {
            console.log('Payment session error', paymentErr);
            showSnackbar(paymentErr?.response?.data?.message || 'Payment failed.', 'error');
          }
        }
      }
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Booking failed. Please try again.', 'error');
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
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Receiver Name" placeholderTextColor="#94A3B8" value={formData.dropContactName} onChangeText={t => setFormData({ ...formData, dropContactName: t })} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Phone No." placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={formData.dropContactPhone} onChangeText={t => setFormData({ ...formData, dropContactPhone: t })} />
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
                {['DOCUMENT', 'FOOD', 'ELECTRONICS', 'OTHER'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBadge, formData.packageType === type && styles.typeBadgeActive]}
                    onPress={() => setFormData({ ...formData, packageType: type })}
                  >
                    <Text style={[styles.typeText, formData.packageType === type && styles.typeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {items.map((item, index) => (
                <View key={index} style={{ marginBottom: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>ITEM {index + 1}</Text>
                    {items.length > 1 && (
                      <TouchableOpacity onPress={() => {
                        const newItems = [...items];
                        newItems.splice(index, 1);
                        setItems(newItems);
                      }}>
                        <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 2, backgroundColor: '#FFFFFF' }]} placeholder="Item Name (e.g. Laptop)" placeholderTextColor="#94A3B8" value={item.name} onChangeText={t => { const newItems = [...items]; newItems[index].name = t; setItems(newItems); }} />
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: '#FFFFFF' }]} placeholder="Qty" placeholderTextColor="#94A3B8" keyboardType="number-pad" value={item.quantity} onChangeText={t => { const newItems = [...items]; newItems[index].quantity = t; setItems(newItems); }} />
                  </View>
                  <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: '#FFFFFF' }]} placeholder="Weight (kg)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={item.weight} onChangeText={t => { const newItems = [...items]; newItems[index].weight = t; setItems(newItems); }} />
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: '#FFFFFF' }]} placeholder="L (cm)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={item.length} onChangeText={t => { const newItems = [...items]; newItems[index].length = t; setItems(newItems); }} />
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: '#FFFFFF' }]} placeholder="W (cm)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={item.width} onChangeText={t => { const newItems = [...items]; newItems[index].width = t; setItems(newItems); }} />
                    <TextInput style={[styles.input, { flex: 1, backgroundColor: '#FFFFFF' }]} placeholder="H (cm)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={item.height} onChangeText={t => { const newItems = [...items]; newItems[index].height = t; setItems(newItems); }} />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 12, marginBottom: 16 }}
                onPress={() => setItems([...items, { name: '', quantity: '1', weight: '1.0', length: '', width: '', height: '' }])}
              >
                <Text style={{ color: '#3B82F6', fontWeight: '700' }}>+ Add Another Item</Text>
              </TouchableOpacity>

              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Any specific instructions? (Optional)" placeholderTextColor="#94A3B8" multiline value={formData.packageDescription} onChangeText={t => setFormData({ ...formData, packageDescription: t })} />
            </View>

            {priceEstimate && (
              <View style={[styles.card, { marginTop: 8 }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Navigation size={18} color="#10B981" />
                  </View>
                  <Text style={styles.cardTitle}>Price Estimate</Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 15, color: '#64748B', fontWeight: '500' }}>Distance ({priceEstimate.distanceKm} km)</Text>
                    <Text style={{ fontSize: 15, color: '#0F172A', fontWeight: '600' }}>
                      {priceEstimate.currency}{priceEstimate.baseFee}
                    </Text>
                  </View>

                  {priceEstimate.surgeMultiplier > 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ fontSize: 15, color: '#F59E0B', fontWeight: '600' }}>High Demand Surge</Text>
                      <Text style={{ fontSize: 15, color: '#F59E0B', fontWeight: '700' }}>
                        x{priceEstimate.surgeMultiplier}
           </Text>
                    </View>
                  )}

                  <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Total Amount</Text>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#10B981' }}>
                      {priceEstimate.currency}{priceEstimate.estimatedFee}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.infoBox}>
              <Info size={16} color="#64748B" />
              <Text style={styles.infoText}>A rider will be assigned immediately after booking.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (!pickupLat || !dropLat || isLoading) && styles.disabledButton]}
            disabled={!pickupLat || !dropLat || isLoading}
            onPress={handleCreateOrder}
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
          initialLat={mapType === 'pickup' ? (pickupLat || 28.6139) : (dropLat || 28.6139)}
          initialLng={mapType === 'pickup' ? (pickupLng || 77.2090) : (dropLng || 77.2090)}
        />

      
        <Modal visible={paymentModalVisible} transparent animationType="slide" onRequestClose={() => setPaymentModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.paymentModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Payment Method</Text>
                <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={styles.closeBtn}>
                  <Text style={{color: '#64748B', fontSize: 20}}>×</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total to Pay</Text>
                <Text style={styles.amountValue}>{priceEstimate?.currency || '₹'}{priceEstimate?.estimatedFee || '--'}</Text>
              </View>

              <ScrollView style={{maxHeight: 300, marginBottom: 20}} showsVerticalScrollIndicator={false}>
                {providersLoading ? (
                  <View style={{paddingVertical: 40, alignItems: 'center'}}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={{fontSize: 13, color: '#94A3B8', marginTop: 8}}>Loading payment methods...</Text>
                  </View>
                ) : (
                  providers.map((p) => {
                    const config = getProviderVisuals(p.provider);
                    const isSelected = selectedPaymentMethod === p.provider;
                    const isWallet = p.provider === 'WALLET';
                    const isDisabled = isWallet && walletBalance < (priceEstimate?.estimatedFee || 0);

                    return (
                      <TouchableOpacity
                        key={p.provider}
                        style={[styles.paymentOption, isSelected && styles.paymentOptionActive, isDisabled && { opacity: 0.5 }]}
                        disabled={isDisabled}
                        onPress={() => setSelectedPaymentMethod(p.provider)}
                      >
                        <View style={[styles.iconCircle, { backgroundColor: config.bgColor, width: 44, height: 44, borderRadius: 22 }]}>
                          {config.icon}
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={[styles.paymentOptionTitle, isSelected && {color: config.activeColor}]}>{p.displayName}</Text>
                          {isWallet && <Text style={styles.paymentOptionSub}>Balance: ₹{walletBalance.toFixed(2)}</Text>}
                        </View>
                        <View style={styles.radioOuter}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.payConfirmBtn}
                onPress={processPaymentAndOrder}
              >
                <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.payGradientBtn}>
                  <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '800'}}>Pay & Confirm Order</Text>
                  <ChevronRight color="#FFFFFF" size={20} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={hideSnackbar}
      />
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

  footer: { paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 28, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitButton: { borderRadius: 24, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  disabledButton: { opacity: 0.7 },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  suggestionsCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: -8, marginBottom: 12, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    suggestionText: { flex: 1, fontSize: 13, color: '#334155' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  paymentModalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, minHeight: 450 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  amountContainer: { alignItems: 'center', paddingVertical: 16, backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  amountLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  amountValue: { fontSize: 32, color: '#0F172A', fontWeight: '900' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  paymentOptionActive: { borderColor: '#3B82F6', backgroundColor: '#F0F9FF', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  paymentOptionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  paymentOptionSub: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6' },
  payConfirmBtn: { borderRadius: 24, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  payGradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 12 }
});
