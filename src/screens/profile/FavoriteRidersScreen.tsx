import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Navigation, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const RIDERS = [
  { id: '1', name: 'Raju Kumar', rating: '4.9', rides: 12, car: 'KA 01 AB 1234' },
  { id: '2', name: 'Suresh Menon', rating: '4.8', rides: 5, car: 'KA 03 XY 9876' },
];

export default function FavoriteRidersScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Riders</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={RIDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.stats}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.rides}>{item.rides} deliveries</Text>
              </View>
              <Text style={styles.car}>{item.car}</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  list: { padding: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#64748B' },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginLeft: 4 },
  dot: { fontSize: 13, color: '#94A3B8', marginHorizontal: 6 },
  rides: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  car: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' }
});
