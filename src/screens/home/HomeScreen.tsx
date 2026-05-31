import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Package, Clock, ShieldCheck, ChevronRight, Zap, Bell, Navigation, Search } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [activeOrder, setActiveOrder] = React.useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      api.get('/orders/my-orders?size=1')
        .then(res => {
          const content = res.data?.data?.content || [];
          if (content.length > 0 && ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'].includes(content[0].status)) {
            setActiveOrder(content[0]);
          } else {
            setActiveOrder(null);
          }
        })
        .catch(console.error);
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const floatingStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12]
        })
      }
    ]
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={StyleSheet.absoluteFill} />

      {/* Decorative Background Blobs */}
      <View style={styles.topBlob} />
      <View style={styles.bottomBlob} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user?.profilePictureUrl ? (
                  <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
                ) : (
                  <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'G'}</Text>
                  </LinearGradient>
                )}
              </View>
              <View>
                <Text style={styles.greetingLabel}>Location</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {user?.city ? `${user.city}, ${user.state || 'India'}` : 'Current Location'}
                  </Text>
                  <ChevronRight size={16} color="#0F172A" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7} onPress={() => (navigation as any).navigate('Notifications')}>
              <Bell size={22} color="#0F172A" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          <Text style={styles.mainGreeting}>Hello, {user?.firstName || 'Guest'} 👋</Text>

          {/* Spectacular Hero Banner */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => (navigation as any).navigate('CreateOrder')}>
            <LinearGradient
              colors={['#0F172A', '#312E81']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroGlow1} />
              <View style={styles.heroGlow2} />

              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Zap size={12} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.heroBadgeText}>LIGHTNING FAST</Text>
                </View>
                <Text style={styles.heroTitle}>Send parcels,{'\n'}anywhere.</Text>
                <Text style={styles.heroDesc}>Door-to-door delivery within 45 mins.</Text>

                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Book Now</Text>
                  <View style={styles.heroIconCircle}>
                    <ChevronRight size={16} color="#0F172A" />
                  </View>
                </View>
              </View>

              <Animated.View style={[styles.heroIconWrap, floatingStyle]}>
                 <Package size={140} color="rgba(255,255,255,0.15)" strokeWidth={1} />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Services Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Services')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {[
              { icon: <Package size={28} color="#FFFFFF" strokeWidth={1.5} />, label: 'Package', sub: 'Standard', gradient: ['#3B82F6', '#2563EB'] },
              { icon: <Clock size={28} color="#FFFFFF" strokeWidth={1.5} />, label: 'Express', sub: '< 30 mins', gradient: ['#F59E0B', '#D97706'] },
              { icon: <ShieldCheck size={28} color="#FFFFFF" strokeWidth={1.5} />, label: 'Secure', sub: 'Valuables', gradient: ['#10B981', '#059669'] },
              { icon: <Navigation size={28} color="#FFFFFF" strokeWidth={1.5} />, label: 'Intercity', sub: 'Long range', gradient: ['#8B5CF6', '#7C3AED'] },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.serviceCard} activeOpacity={0.8} onPress={() => (navigation as any).navigate('CreateOrder')}>
                <LinearGradient colors={item.gradient} style={styles.serviceIconWrap}>
                  {item.icon}
                </LinearGradient>
                <Text style={styles.serviceLabel}>{item.label}</Text>
                <Text style={styles.serviceSub}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Active Deliveries */}
          {activeOrder && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Trip</Text>
              </View>
              <TouchableOpacity style={styles.activeOrderCard} activeOpacity={0.9} onPress={() => (navigation as any).navigate('OrderTracking', { orderId: activeOrder.orderId })}>
                <View style={styles.orderTop}>
                  <View style={styles.orderIdBadge}>
                    <Package size={14} color="#2563EB" />
                    <Text style={styles.orderIdText}>#{activeOrder.trackingNumber ?? '?????'}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <View style={styles.statusPulse} />
                    <Text style={styles.statusText}>{activeOrder.status.replace('_', ' ')}</Text>
                  </View>
                </View>

                <View style={styles.timeline}>
                  <View style={styles.timelineRow}>
                    <View style={[styles.dot, { borderColor: '#38BDF8' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>PICKUP</Text>
                      <Text style={styles.timelineAddress} numberOfLines={1}>{activeOrder.pickupAddress}</Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineRow}>
                    <View style={[styles.dot, { borderColor: '#10B981', backgroundColor: '#10B981' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>DROPOFF</Text>
                      <Text style={styles.timelineAddress} numberOfLines={1}>{activeOrder.dropAddress}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBlob: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#E0F2FE', opacity: 0.8, transform: [{ scaleX: 1.2 }] },
  bottomBlob: { position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#F3E8FF', opacity: 0.6 },
  scrollContent: { padding: 24, paddingBottom: 130 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  greetingLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 15, fontWeight: '800', color: '#0F172A', maxWidth: width * 0.4 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFFFFF' },

  mainGreeting: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5, marginBottom: 24 },

  heroCard: { borderRadius: 32, padding: 28, overflow: 'hidden', marginBottom: 36, shadowColor: '#312E81', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 15 },
  heroGlow1: { position: 'absolute', top: -50, right: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.3)' },
  heroGlow2: { position: 'absolute', bottom: -50, left: -20, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(236,72,153,0.2)' },
  heroContent: { zIndex: 2, width: '70%' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: '#FBBF24', marginLeft: 6, letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, lineHeight: 32, letterSpacing: -0.5 },
  heroDesc: { fontSize: 13, color: '#CBD5E1', marginBottom: 24, fontWeight: '500', lineHeight: 20 },
  heroButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroButtonText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  heroIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  heroIconWrap: { position: 'absolute', right: -20, bottom: -20, zIndex: 1, transform: [{ rotate: '-15deg' }] },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  seeAll: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 36 },
  serviceCard: { width: (width - 48 - 16) / 2, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 4 },
  serviceIconWrap: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
  serviceLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  serviceSub: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },

  activeOrderCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  orderIdBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  orderIdText: { fontWeight: '800', color: '#2563EB', fontSize: 13 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },

  timeline: { marginLeft: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 2, borderWidth: 3, backgroundColor: '#FFFFFF', zIndex: 2 },
  timelineContent: { marginLeft: 16, flex: 1 },
  timelineLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  timelineAddress: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 20 },
  timelineLine: { width: 2, height: 24, backgroundColor: '#E2E8F0', marginLeft: 6, marginVertical: 2 },
});
