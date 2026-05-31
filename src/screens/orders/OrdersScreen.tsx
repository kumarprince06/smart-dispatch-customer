import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MapPin, Clock, ArrowRight, Navigation } from 'lucide-react-native';
import api from '../../api/axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export interface Order {
  id: number;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  createdAt: string;
  deliveryFee: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; pulse: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#D97706', pulse: '#F59E0B' },
  ACCEPTED: { bg: '#E0E7FF', text: '#4338CA', pulse: '#6366F1' },
  IN_TRANSIT: { bg: '#DBEAFE', text: '#1D4ED8', pulse: '#3B82F6' },
  DELIVERED: { bg: '#D1FAE5', text: '#047857', pulse: '#10B981' },
  CANCELLED: { bg: '#FEE2E2', text: '#B91C1C', pulse: '#EF4444' }
};

export default function OrdersScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data.content || []);
    } catch (e) {
      console.log('Failed to fetch customer orders', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ACTIVE') {
      return !['DELIVERED', 'CANCELLED'].includes(order.status);
    }
    return ['DELIVERED', 'CANCELLED'].includes(order.status);
  });

  const renderItem = ({ item }: { item: Order }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.PENDING;

    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        activeOpacity={0.9} 
        onPress={() => (navigation as any).navigate('OrderTracking', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idBadge}>
            <Package size={14} color="#0F172A" />
            <Text style={styles.idText}>#{item.id.toString().padStart(5, '0')}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
            <View style={[styles.statusPulse, { backgroundColor: colors.pulse }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineRow}>
            <View style={[styles.dot, { backgroundColor: '#38BDF8' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>PICKUP</Text>
              <Text style={styles.timelineAddress} numberOfLines={1}>{item.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>DROPOFF</Text>
              <Text style={styles.timelineAddress} numberOfLines={1}>{item.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Clock size={14} color="#94A3B8" />
            <Text style={styles.footerText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.feeText}>₹{item.deliveryFee?.toFixed(0) || 50}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Deliveries</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ACTIVE' && styles.tabActive]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'PAST' && styles.tabActive]}
          onPress={() => setActiveTab('PAST')}
        >
          <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Navigation size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} deliveries</Text>
          <Text style={styles.emptyDesc}>Your {activeTab.toLowerCase()} bookings will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0F172A" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FAFAFA' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 12 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabActive: { backgroundColor: '#0F172A' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },

  listContent: { padding: 24, paddingBottom: 100 },

  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, marginBottom: 20, elevation: 6, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  idBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  idText: { fontWeight: '800', color: '#0F172A', fontSize: 13 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusPulse: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  timeline: { marginLeft: 4, marginBottom: 24 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  timelineContent: { marginLeft: 16, flex: 1 },
  timelineLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 2 },
  timelineAddress: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  timelineLine: { width: 2, height: 24, backgroundColor: '#F1F5F9', marginLeft: 5, marginVertical: 4 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  feeText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', fontWeight: '500' },
});
