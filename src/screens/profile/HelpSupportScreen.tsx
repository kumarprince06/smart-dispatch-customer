import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, PhoneCall, Mail, FileText, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <MessageSquare size={48} color="#3B82F6" style={{ marginBottom: 16 }} />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroDesc}>Our support team is available 24/7 to resolve your issues.</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
              <MessageSquare size={24} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Live Chat</Text>
            <Text style={styles.cardDesc}>Start a conversation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
              <PhoneCall size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Call Us</Text>
            <Text style={styles.cardDesc}>Speak to an agent</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.listCard}>
          <View style={styles.listLeft}>
            <Mail size={24} color="#64748B" />
            <Text style={styles.listTitle}>Email Support</Text>
          </View>
          <ExternalLink size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.listCard}>
          <View style={styles.listLeft}>
            <FileText size={24} color="#64748B" />
            <Text style={styles.listTitle}>FAQs</Text>
          </View>
          <ExternalLink size={20} color="#CBD5E1" />
        </TouchableOpacity>
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
  hero: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  heroDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  grid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  listCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3 },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' }
});
