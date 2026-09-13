import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, ChevronRight, Plus } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

type BookingTab = 'Confirmed' | 'Pending' | 'Payments';
const bookings = [
  { name: 'The Leela Palace', category: 'Venue', paid: '₹3,00,000', total: '₹6,00,000', status: 'Confirmed', image: require('../assets/images/celebrations/wedding.jpg') },
  { name: 'Priya Events & Decor', category: 'Decor & Styling', paid: '₹2,00,000', total: '₹4,00,000', status: 'Confirmed', image: require('../assets/images/celebrations/reception.jpg') },
  { name: 'Spice Affairs Catering', category: 'Catering', paid: '₹1,00,000', total: '₹5,00,000', status: 'Pending', image: require('../assets/images/celebrations/private-party.jpg') },
  { name: 'The Moment Makers', category: 'Photography', paid: 'Paid in full', total: '₹2,00,000', status: 'Confirmed', image: require('../assets/images/celebrations/engagement.jpg') },
];

export default function BookingsScreen() {
  const [tab, setTab] = useState<BookingTab>('Confirmed');
  const visible = tab === 'Payments' ? bookings : bookings.filter((booking) => booking.status === tab);
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Bookings & Payments" subtitle="All your celebration partners, in one place." />
      <View style={styles.tabs}>
        {(['Confirmed', 'Pending', 'Payments'] as BookingTab[]).map((item) => (
          <VellureButton key={item} style={[styles.tab, tab === item && styles.tabActive]} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </VellureButton>
        ))}
      </View>

      <LuxuryCard style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Total celebration value</Text>
          <Text style={styles.summaryValue}>₹17,00,000</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Paid to date</Text>
          <Text style={styles.summaryPaid}>₹8,00,000</Text>
        </View>
      </LuxuryCard>

      <LuxuryCard style={styles.list}>
        {visible.map((booking, index) => (
          <VellureButton key={booking.name} style={[styles.bookingRow, index === visible.length - 1 && styles.lastRow]} onPress={() => router.push(tab === 'Payments' ? '/payment-detail' : '/booking-detail')}>
            <Image source={booking.image} style={styles.image} />
            <View style={styles.copy}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{booking.name}</Text>
                {booking.status === 'Confirmed' ? <CheckCircle2 size={13} color={colors.success} /> : null}
              </View>
              <Text style={styles.category}>{booking.category}</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.total}>{booking.total}</Text>
                <Text style={styles.paid}>{booking.paid}</Text>
              </View>
            </View>
            <ChevronRight size={17} color={colors.textMuted} />
          </VellureButton>
        ))}
        {visible.length === 0 ? <Text style={styles.empty}>No bookings in this stage yet.</Text> : null}
      </LuxuryCard>
      <PrimaryPill label="Book a Vendor" icon={<Plus size={18} color="#FFFFFF" />} style={styles.button} onPress={() => router.push('/(tabs)/vendors')} />
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 18, backgroundColor: colors.surfaceMuted },
  tab: { flex: 1, minHeight: 37, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 10.5 },
  tabTextActive: { color: colors.textInverse, fontWeight: '600' },
  summary: { marginTop: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryLabel: { color: colors.textSecondary, fontSize: 9.5 },
  summaryValue: { color: colors.primary, fontFamily: typography.serif, fontSize: 21, marginTop: 3 },
  summaryPaid: { color: colors.success, fontFamily: typography.serif, fontSize: 18, marginTop: 3 },
  summaryDivider: { width: 1, height: 38, backgroundColor: colors.borderMedium },
  list: { marginTop: 14, overflow: 'hidden' },
  bookingRow: { minHeight: 82, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  lastRow: { borderBottomWidth: 0 },
  image: { width: 58, height: 58, borderRadius: 13 },
  copy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { maxWidth: '88%', color: colors.primary, fontFamily: typography.serif, fontSize: 14 },
  category: { color: colors.textSecondary, fontSize: 9.5, marginTop: 2 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  total: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  paid: { color: colors.success, fontSize: 9, fontWeight: '600' },
  empty: { padding: 30, color: colors.textSecondary, textAlign: 'center' },
  button: { marginTop: 16 },
});
