import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  title?: string;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onConfirm,
  title = "Set Location",
  initialLat = 28.6139,
  initialLng = 77.2090
}: LocationPickerModalProps) {
  
  const webViewRef = useRef<WebView>(null);
  const searchTimeoutRef = useRef<any>(null);
  
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      fetchCurrentLocation();
    }
  }, [visible]);

  const fetchCurrentLocation = async () => {
    setIsLocating(true);
    setAddress('Fetching location...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const currentLat = location.coords.latitude;
        const currentLng = location.coords.longitude;
        setLat(currentLat);
        setLng(currentLng);
        
        const geocode = await Location.reverseGeocodeAsync({ latitude: currentLat, longitude: currentLng });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const readableAddress = `${place.street || place.name || ''}, ${place.city || ''}, ${place.region || ''} ${place.postalCode || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').trim();
          setAddress(readableAddress);
        } else {
          setAddress('');
        }
      } else {
        setAddress('');
      }
    } catch (e) {
      console.log('Location error', e);
      setAddress('');
    } finally {
      setIsLocating(false);
    }
  };

  const searchAddress = (text: string) => {
    setAddress(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.length > 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`, {
            headers: {
              'User-Agent': 'SmartDispatchApp/1.0',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          
          if (!res.ok) {
            const errorText = await res.text();
            console.log('Nominatim Error:', errorText);
            return;
          }
          
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.log('Search error', error);
        }
      }, 500); // 500ms debounce
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    
    setLat(newLat);
    setLng(newLng);
    setAddress(item.display_name);
    setSuggestions([]);

    // Dynamically pan the map without reloading the HTML
    webViewRef.current?.injectJavaScript(`
      if (typeof map !== 'undefined' && typeof marker !== 'undefined') {
        map.setView([${newLat}, ${newLng}], 15);
        marker.setLatLng([${newLat}, ${newLng}]);
      }
      true;
    `);
  };

  const mapHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100%; }
          .custom-marker { display: flex; justify-content: center; align-items: center; }
          .pin {
            width: 24px; height: 24px; background-color: #0F172A;
            border-radius: 12px 12px 12px 0; transform: rotate(-45deg);
            border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
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
          
          map.on('move', function () {
            marker.setLatLng(map.getCenter());
          });
          
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
  }, [visible, isLocating]);

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setLat(data.lat);
      setLng(data.lng);
      
      const geocode = await Location.reverseGeocodeAsync({ latitude: data.lat, longitude: data.lng });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const readableAddress = `${place.street || place.name || ''}, ${place.city || ''}, ${place.region || ''} ${place.postalCode || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').trim();
        setAddress(readableAddress);
      }
    } catch (e) {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <View style={{ zIndex: 10 }}>
            <TextInput
              style={styles.modalInput}
              value={address}
              onChangeText={searchAddress}
              multiline
              placeholder="Search or drag pin..."
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestionsCard}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.mapWrap}>
            {isLocating ? (
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Pinpointing your location...</Text>
              </View>
            ) : (
              <>
                <WebView
                  ref={webViewRef}
                  source={{ html: mapHtml }}
                  style={{ flex: 1 }}
                  scrollEnabled={false}
                  onMessage={handleMessage}
                />
                <View style={styles.mapOverlayTextWrap}>
                  <Text style={styles.mapOverlayText}>Drag map to pin location</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => onConfirm(address, lat, lng)}>
              <Text style={styles.saveBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, height: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, height: 80, fontSize: 15, color: '#0F172A', textAlignVertical: 'top', marginBottom: 16 },
  mapWrap: { flex: 1, minHeight: 350, borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', zIndex: 1 },
  mapOverlayTextWrap: { position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mapOverlayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 16 },
  cancelBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  saveBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  
  suggestionsCard: { position: 'absolute', top: 90, left: 0, right: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 10, zIndex: 100 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  suggestionText: { flex: 1, fontSize: 13, color: '#334155' }
});
