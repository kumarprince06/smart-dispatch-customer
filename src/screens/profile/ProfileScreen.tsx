import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings, Heart, HelpCircle, ChevronRight, MapPin, CreditCard, Edit2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { icon: <MapPin size={22} color="#0284C7" />, label: 'Saved Addresses', color: '#E0F2FE', route: 'SavedAddresses' },
    { icon: <CreditCard size={22} color="#F59E0B" />, label: 'Payment Methods', color: '#FEF3C7', route: 'PaymentMethods' },
    { icon: <Heart size={22} color="#EF4444" />, label: 'Favorite Riders', color: '#FEE2E2', route: 'FavoriteRiders' },
    { icon: <Settings size={22} color="#64748B" />, label: 'App Settings', color: '#F1F5F9', route: 'AppSettings' },
    { icon: <HelpCircle size={22} color="#10B981" />, label: 'Help & Support', color: '#D1FAE5', route: 'HelpSupport' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName || 'User'} {user?.lastName || ''}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Fatafat Member</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => (navigation as any).navigate('EditProfile')}>
            <Edit2 size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.menuItem, idx !== menuItems.length - 1 && styles.menuBorder]}
              onPress={() => (navigation as any).navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                  {item.icon}
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FAFAFA' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  scrollContent: { padding: 24, paddingBottom: 60 },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, marginBottom: 32, elevation: 6, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4, letterSpacing: -0.5 },
  profileEmail: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 12 },
  badge: { backgroundColor: '#F0F9FF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0284C7', letterSpacing: 0.5 },
  editBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16, paddingLeft: 4 },
  
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden', marginBottom: 32, elevation: 6, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 18, borderRadius: 24, gap: 10, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 24 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '800' },

  versionText: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#94A3B8' },
});
