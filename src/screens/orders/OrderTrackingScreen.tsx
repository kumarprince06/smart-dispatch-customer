import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, MapPin, Package, Clock, ShieldCheck, Navigation, XCircle, ChevronRight, Tag } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import api from '../../api/axios';

const { width } = Dimensions.get('window');

// Status color mapping for a highly premium look
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  CREATED: { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
  PENDING: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  ASSIGNED: { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7' },
  ACCEPTED: { bg: '#EEF2FF', text: '#3730A3', dot: '#4F46E5' },
  PICKED_UP: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  IN_TRANSIT: { bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9' },
  DELIVERED: { bg: '#ECFDF5', text: '#047857', dot: '#10B981' },
  CANCELLED: { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
};

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId || '1';
  const [cancelling, setCancelling] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          console.log('[ORDER TRACKING] Response:', JSON.stringify(res.data.data, null, 2));
          setOrderData(res.data.data);
        }
      } catch (e) {
        console.log('Failed to fetch order tracking details', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
    // Poll every 10 seconds for real-time tracking
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

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

  // Use real items list from backend (new orders), or empty array for legacy orders
  const orderItems: Array<{ id?: number; name: string; weightKg?: number; lengthCm?: number; widthCm?: number; heightCm?: number; quantity: number }> =
    orderData?.items && orderData.items.length > 0 ? orderData.items : [];

  // Fall back: parse customerNotes for instructions if available
  const deliveryInstructions = orderData?.customerNotes || '';

  // Extract coordinates or fall back to default Kolkata center
  const pickupLat = orderData?.pickupLatitude || 22.6209;
  const pickupLng = orderData?.pickupLongitude || 88.3394;
  const dropLat = orderData?.dropLatitude || 22.6339;
  const dropLng = orderData?.dropLongitude || 88.3706;
  const status = orderData?.status || 'PENDING';
  const hasDriver = !!orderData?.driverName;

  // Simulate/compute driver location based on current status for perfect visual realism
  let driverLat = pickupLat;
  let driverLng = pickupLng;

  if (hasDriver) {
    if (status === 'ASSIGNED' || status === 'ACCEPTED') {
      // Driver approaching pickup (simulate slightly north-west)
      driverLat = pickupLat - 0.004;
      driverLng = pickupLng - 0.004;
    } else if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
      // Driver moving toward dropoff (midpoint)
      driverLat = (pickupLat + dropLat) / 2 + 0.001;
      driverLng = (pickupLng + dropLng) / 2 + 0.001;
    } else if (status === 'DELIVERED') {
      driverLat = dropLat;
      driverLng = dropLng;
    }
  }

  // Generate dynamic Leaflet HTML source
  const mapHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100%; background: #F8FAFC; }
          
          /* Custom styled div pins */
          .marker-pin {
            width: 28px; height: 28px;
            border-radius: 50% 50% 50% 0;
            position: absolute;
            transform: rotate(-45deg);
            left: 50%; top: 50%;
            margin: -14px 0 0 -14px;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex; justify-content: center; align-items: center;
          }
          .marker-pin::after {
            content: '';
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #FFFFFF;
            position: absolute;
          }
          .marker-pin.pickup { background: #38BDF8; }
          .marker-pin.drop { background: #10B981; }
          
          .driver-pin {
            width: 32px; height: 32px;
            border-radius: 50%;
            background: #0F172A;
            border: 3px solid #F97316;
            box-shadow: 0 4px 12px rgba(15,23,42,0.4);
            display: flex; justify-content: center; align-items: center;
            position: relative;
          }
          
          /* Speed Lightning Arrow for Driver */
          .driver-arrow {
            width: 0; height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 10px solid #FFFFFF;
            transform: rotate(45deg);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var pickup = [${pickupLat}, ${pickupLng}];
          var drop = [${dropLat}, ${dropLng}];
          var hasDriver = ${hasDriver};
          var driver = [${driverLat}, ${driverLng}];
          
          var map = L.map('map', {zoomControl: false});
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: ''
          }).addTo(map);

          // Pickup Marker
          var pickupIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='marker-pin pickup'></div>",
            iconSize: [28, 28],
            iconAnchor: [14, 28]
          });
          L.marker(pickup, {icon: pickupIcon}).addTo(map);

          // Dropoff Marker
          var dropIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='marker-pin drop'></div>",
            iconSize: [28, 28],
            iconAnchor: [14, 28]
          });
          L.marker(drop, {icon: dropIcon}).addTo(map);

          var bounds = [pickup, drop];

          if (hasDriver) {
            // Driver Marker
            var driverIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div class='driver-pin'><div class='driver-arrow'></div></div>",
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            L.marker(driver, {icon: driverIcon}).addTo(map);
            bounds.push(driver);
            
            // Draw path: Driver -> Pickup -> Dropoff
            var polyline = L.polyline([driver, pickup, drop], {
              color: '#2563EB',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8'
            }).addTo(map);
          } else {
            // Draw path: Pickup -> Dropoff
            var polyline = L.polyline([pickup, drop], {
              color: '#2563EB',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8'
            }).addTo(map);
          }

          map.fitBounds(bounds, {padding: [30, 30]});
        </script>
      </body>
      </html>
    `;
  }, [pickupLat, pickupLng, dropLat, dropLng, hasDriver, driverLat, driverLng]);

  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching live status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={StyleSheet.absoluteFill} />

      {/* Floating Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Status</Text>
          <TouchableOpacity style={styles.circleBtn}>
            <ShieldCheck size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Status Overview Card */}
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <View style={styles.trackingBadge}>
              <Tag size={16} color="#64748B" />
              <Text style={styles.trackingText}>#{orderData?.trackingNumber || 'PENDING'}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
              <View style={[styles.statusPulse, { backgroundColor: colors.dot }]} />
              <Text style={[styles.statusText, { color: colors.text }]}>{status.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>₹{orderData?.deliveryFee?.toFixed(0) || '0'}</Text>
          </View>
        </View>

        {/* 2. Package Details Card (FIRST in the layout details) */}
        <View style={styles.detailCard}>
          <View style={styles.sectionTitleRow}>
            <Package size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Package Details</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.packageInfoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>CATEGORY</Text>
              <Text style={styles.infoValue}>{orderData?.packageType?.replace('_', ' ') || 'OTHER'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>TOTAL WEIGHT</Text>
              <Text style={styles.infoValue}>{orderData?.packageWeightKg ? `${orderData.packageWeightKg} kg` : '—'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ITEMS</Text>
              <Text style={styles.infoValue}>{orderItems.length > 0 ? orderItems.length : '—'}</Text>
            </View>
          </View>

          {/* Real items from order_items table */}
          {orderItems.length > 0 ? (
            <View style={styles.parsedItemsContainer}>
              <Text style={styles.descLabel}>ITEMS BREAKDOWN</Text>
              {orderItems.map((item, idx) => (
                <View key={item.id ?? idx} style={styles.parsedItemRow}>
                  <View style={styles.bulletDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.parsedItemName}>
                      {item.name}  ×{item.quantity}
                    </Text>
                    <Text style={styles.parsedItemDetail}>
                      {[
                        item.weightKg ? `${item.weightKg} kg` : null,
                        (item.lengthCm && item.widthCm && item.heightCm)
                          ? `${item.lengthCm}×${item.widthCm}×${item.heightCm} cm`
                          : null,
                      ].filter(Boolean).join(' • ')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descLabel}>ITEMS BREAKDOWN</Text>
              <Text style={styles.descText}>• Standard delivery parcel</Text>
            </View>
          )}

          {deliveryInstructions ? (
            <View style={styles.instructionsContainer}>
              <Text style={styles.descLabel}>DELIVERY INSTRUCTIONS</Text>
              <Text style={styles.instructionsText}>{deliveryInstructions}</Text>
            </View>
          ) : null}
        </View>

        {/* 3. Live Map Container */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Navigation size={18} color="#2563EB" />
            <Text style={styles.mapTitle}>Live Movement Map</Text>
          </View>
          <View style={styles.mapFrame}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              scrollEnabled={false}
              style={styles.webView}
            />
          </View>
        </View>

        {/* 4. Delivery Timeline Addresses */}
        <View style={styles.detailCard}>
          <View style={styles.sectionTitleRow}>
            <Clock size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Delivery Route</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.timeline}>
            <View style={styles.timelineRow}>
              <View style={[styles.dot, { borderColor: '#38BDF8' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>PICKUP FROM</Text>
                <Text style={styles.timelineAddress}>{orderData?.pickupAddress || 'Loading...'}</Text>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineRow}>
              <View style={[styles.dot, { borderColor: '#10B981', backgroundColor: '#10B981' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>DELIVER TO</Text>
                <Text style={styles.timelineAddress}>{orderData?.dropAddress || 'Loading...'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Driver Assignment Card */}
        {hasDriver ? (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>{orderData?.driverName[0]}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{orderData.driverName}</Text>
              <Text style={styles.driverRating}>⭐️ {orderData?.customerRating ? orderData.customerRating.toFixed(1) : '5.0'} • {orderData.vehicleNumber}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <MessageCircle size={20} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.assigningCard}>
            <ActivityIndicator size="small" color="#F97316" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.assigningTitle}>Finding a Rider...</Text>
              <Text style={styles.assigningSub}>Searching for nearby FataFat pilots</Text>
            </View>
          </View>
        )}

        {/* 6. Cancel Delivery Action */}
        {['CREATED', 'PENDING', 'ASSIGNED'].includes(status) && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder} disabled={cancelling}>
            {cancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <XCircle size={18} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Delivery</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#64748B' },
  
  headerSafeArea: { zIndex: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 60 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },

  scrollContent: { padding: 16, paddingBottom: 60, gap: 16 },

  // Status Summary Card
  statusCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  trackingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  trackingText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusPulse: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  priceLabel: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  priceValue: { fontSize: 22, fontWeight: '900', color: '#0F172A' },

  // Package & Delivery Cards
  detailCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  packageInfoGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  
  descriptionContainer: { marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 16 },
  descLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  descText: { fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 18 },

  // Map Card
  mapCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 3 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  mapTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  mapFrame: { height: 280, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  webView: { flex: 1 },

  // Timeline
  timeline: { marginLeft: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, borderWidth: 2.5, backgroundColor: '#FFFFFF', zIndex: 2 },
  timelineContent: { marginLeft: 16, flex: 1 },
  timelineLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  timelineAddress: { fontSize: 14, fontWeight: '700', color: '#334155', lineHeight: 20 },
  timelineLine: { width: 2, height: 28, backgroundColor: '#F1F5F9', marginLeft: 5, marginVertical: 2 },

  // Driver Assignment Card
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  driverRating: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: '#2563EB' },

  assigningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#FFEDD5' },
  assigningTitle: { fontSize: 15, fontWeight: '800', color: '#C2410C', marginBottom: 2 },
  assigningSub: { fontSize: 12, fontWeight: '600', color: '#EA580C' },

  // Cancel Button
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', marginTop: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '800', color: '#EF4444' },

  // Parsed Items Styles
  parsedItemsContainer: { marginTop: 16, gap: 8 },
  parsedItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#2563EB' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563EB' },
  parsedItemName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  parsedItemDetail: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 2 },

  // Instructions Styles
  instructionsContainer: { marginTop: 16, padding: 12, backgroundColor: '#EFF6FF', borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#3B82F6' },
  instructionsText: { fontSize: 13, fontWeight: '700', color: '#1D4ED8', lineHeight: 18 }
});
