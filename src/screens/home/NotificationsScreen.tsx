import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ArrowLeft, CheckCircle, Package, Zap, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data.content || []);
        }
      } catch (e) {
        console.log('Failed to fetch notifications', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    const t = type?.toUpperCase() || 'INFO';
    if (t === 'SUCCESS') return <CheckCircle size={20} color="#10B981" />;
    if (t === 'PROMO') return <Zap size={20} color="#F59E0B" />;
    if (t === 'ORDER_UPDATE') return <Package size={20} color="#3B82F6" />;
    return <Info size={20} color="#64748B" />;
  };

  const getBgColor = (type: string) => {
    const t = type?.toUpperCase() || 'INFO';
    if (t === 'SUCCESS') return '#ECFDF5';
    if (t === 'PROMO') return '#FEF3C7';
    if (t === 'ORDER_UPDATE') return '#EFF6FF';
    return '#F1F5F9';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.backBtn}>
          <Bell size={20} color="#0F172A" />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Bell size={48} color="#CBD5E1" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.isRead && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 }]}>
              <View style={[styles.iconWrap, { backgroundColor: getBgColor(item.type) }]}>
                {getIcon(item.type)}
              </View>
              <View style={styles.content}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.body}>{item.message}</Text>
              </View>
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
  list: { padding: 24 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  time: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  body: { fontSize: 14, color: '#64748B', lineHeight: 20 }
});
