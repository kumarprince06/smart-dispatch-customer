import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Default coordinates (Delhi)
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
        /* Custom Marker CSS */
        .custom-marker {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pin {
          width: 24px;
          height: 24px;
          background-color: #0F172A;
          border-radius: 12px 12px 12px 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: false}).setView([${lat}, ${lng}], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: ''
        }).addTo(map);
        
        var customIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="pin"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });
        
        var marker = L.marker([${lat}, ${lng}], {icon: customIcon, draggable: true}).addTo(map);
        
        // Update marker when map is dragged
        map.on('move', function () {
          marker.setLatLng(map.getCenter());
        });
        
        // Send coordinates back to React Native when movement stops
        map.on('moveend', function () {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: center.lat,
            lng: center.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  }, []);

  const openAddModal = async () => {
    setModalVisible(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLat(location.coords.latitude);
        setLng(location.coords.longitude);
      }
    } catch (e) {
      console.log('Location permission failed', e);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter an address');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/addresses', {
        label: newLabel,
        addressLine1: newAddress,
        latitude: lat,
        longitude: lng,
        isDefault: addresses.length === 0
      });
      if (res.data.success) {
        setModalVisible(false);
        setNewAddress('');
        fetchAddresses();
      }
    } catch (error: any) {
      Alert.alert('Failed to save', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : addresses.length === 0 ? (
        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <MapPin size={48} color="#CBD5E1" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>No saved addresses yet.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F172A" />}
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            
            <View style={styles.labelSelector}>
              {['Home', 'Office', 'Other'].map(l => (
                <TouchableOpacity key={l} style={[styles.labelBadge, newLabel === l && styles.labelBadgeActive]} onPress={() => setNewLabel(l)}>
                  <Text style={[styles.labelText, newLabel === l && styles.labelTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter full address"
              placeholderTextColor="#94A3B8"
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
            />

            <View style={styles.mapWrap}>
              <WebView
                source={{ html: mapHtml }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    setLat(data.lat);
                    setLng(data.lng);
                  } catch (e) {}
                }}
              />
              <View style={styles.mapOverlayTextWrap}>
                <Text style={styles.mapOverlayText}>Drag map to pin location</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  labelSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  labelBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  labelBadgeActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  labelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  labelTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, height: 80, fontSize: 15, color: '#0F172A', textAlignVertical: 'top', marginBottom: 16 },
  
  mapWrap: { height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  mapOverlayTextWrap: { position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mapOverlayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  
  modalActions: { flexDirection: 'row', gap: 16 },
  cancelBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  saveBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' }
});
