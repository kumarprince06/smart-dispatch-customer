import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

export interface Address {
  id: number;
  label: string;
  addressLine1: string;
  isDefault: boolean;
}

export default function SavedAddressesScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.data.success) {
          setAddresses(res.data.data || []);
        }
      } catch (e) {
        console.log('Failed to fetch addresses', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MapPin size={48} color="#CBD5E1" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>No saved addresses yet.</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: item.label?.toLowerCase() === 'home' ? '#EFF6FF' : item.label?.toLowerCase() === 'office' ? '#FEF3C7' : '#ECFDF5' }]}>
                {item.label?.toLowerCase() === 'home' ? <Home size={20} color="#3B82F6" /> : item.label?.toLowerCase() === 'office' ? <Briefcase size={20} color="#F59E0B" /> : <MapPin size={20} color="#10B981" />}
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.label || 'Other'} {item.isDefault ? '(Default)' : ''}</Text>
                <Text style={styles.address}>{item.addressLine1}</Text>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                <MoreVertical size={20} color="#94A3B8" />
              </TouchableOpacity>
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
  iconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  address: { fontSize: 13, color: '#64748B', fontWeight: '500', lineHeight: 20 },
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' }
});
