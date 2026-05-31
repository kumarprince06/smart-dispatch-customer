import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, MapPin, Package, Clock, ShieldCheck, Navigation, XCircle } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';

const { width, height } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId || '1';
  const [cancelling, setCancelling] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrderData(res.data.data);
        }
      } catch (e) {
        console.log('Failed to fetch order tracking details', e);
      }
    };

    fetchOrder();
    // Poll every 10 seconds for real-time tracking
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '85%'], []);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this delivery? Cancellation fees may apply.',
      [
        { text: 'Keep Order', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
              Alert.alert('Order Cancelled', 'Your delivery has been cancelled successfully.');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Failed to Cancel', error?.response?.data?.message || 'Something went wrong.');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Simulated Map Background */}
      <View style={styles.mapContainer}>
        <LinearGradient colors={['#E0F2FE', '#F8FAFC']} style={StyleSheet.absoluteFill} />
        {/* Simple map route simulation */}
        <View style={styles.routeLine} />
        <View style={styles.pickupMarker}>
          <Package size={16} color="#FFFFFF" />
        </View>
        <View style={styles.dropoffMarker}>
          <MapPin size={16} color="#FFFFFF" />
        </View>
        <View style={styles.driverMarker}>
          <View style={styles.pulseRing} />
          <Navigation size={20} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
      </View>

      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>Live Tracking</Text>
          </View>
          <TouchableOpacity style={styles.circleBtn}>
            <ShieldCheck size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={styles.indicator}
      >
        <View style={styles.sheetContent}>
          <View style={styles.timeEstContainer}>
            <Text style={styles.timeLabel}>Status</Text>
            <Text style={[styles.timeValue, { fontSize: 24 }]}>
              {orderData?.status ? orderData.status.replace('_', ' ') : 'Locating Driver...'}
            </Text>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>{orderData?.driverName ? orderData.driverName[0] : '?'}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{orderData?.driverName || 'Assigning Rider...'}</Text>
              <Text style={styles.driverRating}>⭐️ {orderData?.driverRating || 'New'} • {orderData?.vehicleNumber || 'Wait'}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <MessageCircle size={20} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnPrimary}>
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderDetailCard}>
            <View style={styles.orderTop}>
              <Text style={styles.orderId}>Order #{orderData?.id || orderId}</Text>
              <Text style={styles.feeText}>₹{orderData?.deliveryFee?.toFixed(0) || '--'}</Text>
            </View>

            <View style={styles.timeline}>
              <View style={styles.timelineRow}>
                <View style={[styles.dot, { borderColor: '#38BDF8' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>PICKUP</Text>
                  <Text style={styles.timelineAddress} numberOfLines={1}>{orderData?.pickupAddress || 'Loading...'}</Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineRow}>
                <View style={[styles.dot, { borderColor: '#10B981', backgroundColor: '#10B981' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>DROPOFF</Text>
                  <Text style={styles.timelineAddress} numberOfLines={1}>{orderData?.dropoffAddress || 'Loading...'}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder} disabled={cancelling}>
            {cancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <XCircle size={20} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Delivery</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2FE' },
  mapContainer: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  routeLine: { position: 'absolute', width: 4, height: 150, backgroundColor: '#3B82F6', opacity: 0.5, transform: [{ rotate: '45deg' }] },
  pickupMarker: { position: 'absolute', top: '40%', left: '30%', width: 32, height: 32, borderRadius: 16, backgroundColor: '#38BDF8', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4 },
  dropoffMarker: { position: 'absolute', top: '60%', left: '70%', width: 32, height: 32, borderRadius: 16, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4 },
  driverMarker: { position: 'absolute', top: '45%', left: '40%', width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, elevation: 8 },
  pulseRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(15,23,42,0.2)', borderWidth: 1, borderColor: 'rgba(15,23,42,0.5)' },

  headerSafeArea: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  circleBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, elevation: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  bottomSheetBg: { backgroundColor: '#F8FAFC', borderRadius: 32 },
  indicator: { width: 48, height: 6, backgroundColor: '#CBD5E1', borderRadius: 3 },
  sheetContent: { flex: 1, padding: 24 },

  timeEstContainer: { alignItems: 'center', marginBottom: 24 },
  timeLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  timeValue: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },

  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#64748B' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  driverRating: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  actionBtnPrimary: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 24 },

  orderDetailCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  feeText: { fontSize: 18, fontWeight: '900', color: '#10B981' },

  timeline: { marginLeft: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 2, borderWidth: 3, backgroundColor: '#FFFFFF', zIndex: 2 },
  timelineContent: { marginLeft: 16, flex: 1 },
  timelineLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  timelineAddress: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 20 },
  timelineLine: { width: 2, height: 32, backgroundColor: '#E2E8F0', marginLeft: 6, marginVertical: 2 },

  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  cancelBtnText: { fontSize: 15, fontWeight: '800', color: '#EF4444' }
});
