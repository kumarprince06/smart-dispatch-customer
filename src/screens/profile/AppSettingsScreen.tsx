import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Moon, Globe, Shield, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color="#64748B" />
              <Text style={styles.rowLabel}>Push Notifications</Text>
            </View>
            <Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ true: '#10B981', false: '#E2E8F0' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Smartphone size={20} color="#64748B" />
              <Text style={styles.rowLabel}>SMS Alerts</Text>
            </View>
            <Switch value={smsNotif} onValueChange={setSmsNotif} trackColor={{ true: '#10B981', false: '#E2E8F0' }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowAction}>
            <View style={styles.rowLeft}>
              <Globe size={20} color="#64748B" />
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <Text style={styles.rowValue}>English</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Moon size={20} color="#64748B" />
              <Text style={styles.rowLabel}>Dark Mode</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#10B981', false: '#E2E8F0' }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowAction}>
            <View style={styles.rowLeft}>
              <Shield size={20} color="#64748B" />
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, marginBottom: 32, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  rowValue: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
  divider: { height: 1, backgroundColor: '#F1F5F9' }
});
