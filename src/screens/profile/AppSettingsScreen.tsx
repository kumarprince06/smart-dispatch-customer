import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Moon, Globe, Shield, Smartphone, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import { CustomAlert } from '../../components/common/CustomAlert';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/theme';
import * as Notifications from 'expo-notifications';

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  
  const [pushNotif, setPushNotif] = useState(user?.notificationsEnabled !== false);
  const [smsNotif, setSmsNotif] = useState(user?.smsEnabled !== false);
  const [darkMode, setDarkMode] = useState(user?.darkMode === true);
  
  const [serverSettings, setServerSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Custom Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({ title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title: string, message: string, type: 'info' | 'error' | 'logout' = 'info', buttons?: any[]) => {
    setAlertConfig({
      title,
      message,
      type,
      buttons: buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/app-settings/public');
        if (res.data.success) {
          setServerSettings(res.data.data || []);
        }
      } catch (e) {
        console.log('Failed to fetch app settings from backend', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/app-settings/public');
      if (res.data.success) setServerSettings(res.data.data || []);
    } catch (e) {} finally { setRefreshing(false); }
  }, []);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      if (key === 'push') {
        if (value) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            showAlert('Permission Required', 'Please enable notifications in your phone settings to receive live tracking updates.', 'error');
            return; // Don't enable it if permission denied
          }
        }
        setPushNotif(value);
      }
      if (key === 'sms') setSmsNotif(value);
      if (key === 'dark') setDarkMode(value);

      const payload: any = {};
      if (key === 'push') payload.notificationsEnabled = value;
      if (key === 'sms') payload.smsEnabled = value;
      if (key === 'dark') payload.darkMode = value;

      const res = await api.put('/customers/preferences', payload);
      if (res.data.success) {
        await updateUser(payload);
      }
    } catch (e) {
      console.log('Failed to update preference', e);
      // Revert on failure
      if (key === 'push') setPushNotif(!value);
      if (key === 'sms') setSmsNotif(!value);
      if (key === 'dark') setDarkMode(!value);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>App Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <Switch value={pushNotif} onValueChange={(v) => updatePreference('push', v)} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Smartphone size={20} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>SMS Alerts</Text>
            </View>
            <Switch value={smsNotif} onValueChange={(v) => updatePreference('sms', v)} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>General</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.rowAction}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Language</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.primary }]}>{user?.preferredLanguage || 'English'}</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Moon size={20} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch value={darkMode} onValueChange={(v) => updatePreference('dark', v)} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
          </View>
        </View>

        {serverSettings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Global Configurations</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {serverSettings.map((setting, index) => (
                <View key={setting.key}>
                  <TouchableOpacity style={styles.rowAction} onPress={() => {
                    showAlert(setting.key, `${setting.description}\n\nCurrent Value: ${setting.value}`);
                  }}>
                    <View style={styles.rowLeft}>
                      <Settings size={20} color={colors.textMuted} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>{setting.key.replace(/_/g, ' ')}</Text>
                    </View>
                    <Text style={[styles.rowValue, { color: colors.primary }]} numberOfLines={1}>{setting.value.substring(0, 15)}{setting.value.length > 15 ? '...' : ''}</Text>
                  </TouchableOpacity>
                  {index < serverSettings.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.rowAction}>
            <View style={styles.rowLeft}>
              <Shield size={20} color={colors.textMuted} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  card: { borderRadius: 24, paddingHorizontal: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowValue: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1 }
});
