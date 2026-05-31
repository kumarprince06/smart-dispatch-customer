import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phoneNo || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call to save profile
    setTimeout(() => {
      setSaving(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{firstName[0] || 'U'}</Text>
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#94A3B8" />
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Enter first name" />
          </View>

          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#94A3B8" />
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Enter last name" />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputContainer, styles.inputDisabled]}>
            <Mail size={20} color="#CBD5E1" />
            <TextInput style={[styles.input, { color: '#94A3B8' }]} value={user?.email} editable={false} />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#94A3B8" />
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#FFFFFF' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  form: { gap: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 4, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E2E8F0' },
  inputDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A', fontWeight: '600' },
  footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#0F172A', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
