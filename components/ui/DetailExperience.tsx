import React from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, CheckCircle2, Clock3, FileText, IndianRupee, MapPin, Sparkles, UserRound, Users } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';
import { VenueArchArtwork } from './LuxuryArtwork';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader, SectionTitle } from './LuxuryLayout';

type DetailKind = 'task' | 'guest' | 'booking' | 'payment';
const content = {
  task: { title: 'Book Photographer', subtitle: 'Wedding checklist · Due 16 August', badge: 'IN PROGRESS', cta: 'Mark as Completed', rows: [['Category', 'Vendors'], ['Due date', 'Friday, 16 August'], ['Assigned to', 'Sneha Iyer'], ['Priority', 'Important']] },
  guest: { title: 'Rajesh Sharma', subtitle: 'Family · Party of 4', badge: 'RSVP CONFIRMED', cta: 'Send a Message', rows: [['Group', 'Bride’s Family'], ['Meal preference', 'Vegetarian'], ['Invitation', 'Delivered on WhatsApp'], ['Table', 'Royal Garden · Table 4']] },
  booking: { title: 'The Leela Palace', subtitle: 'Venue · Bengaluru', badge: 'BOOKING CONFIRMED', cta: 'Message Venue', rows: [['Event date', '14 February 2027'], ['Package', 'Royal Wedding Celebration'], ['Guests', 'Up to 300'], ['Booking value', '₹6,00,000']] },
  payment: { title: 'Payment Details', subtitle: 'The Leela Palace · Venue', badge: '2 INSTALLMENTS LEFT', cta: 'Pay Next Installment', rows: [['Total amount', '₹6,00,000'], ['Amount paid', '₹3,00,000'], ['Next payment', '₹1,50,000'], ['Due date', '15 November 2026']] },
} satisfies Record<DetailKind, { title: string; subtitle: string; badge: string; cta: string; rows: string[][] }>;

export function DetailExperience({ kind }: { kind: DetailKind }) {
  const detail = content[kind];
  const Icon = kind === 'task' ? CalendarDays : kind === 'guest' ? UserRound : kind === 'booking' ? MapPin : IndianRupee;
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={detail.title} subtitle={detail.subtitle} />
      <View style={styles.hero}>
        {kind === 'booking' ? <VenueArchArtwork /> : <><View style={styles.heroGlow} /><View style={styles.heroIcon}><Icon size={35} color={colors.primary} /></View><Sparkles size={22} color={colors.goldDark} style={styles.sparkle} /></>}
        <View style={styles.badge}><CheckCircle2 size={12} color={colors.success} /><Text style={styles.badgeText}>{detail.badge}</Text></View>
      </View>
      <SectionTitle title="Details" />
      <LuxuryCard style={styles.info}>{detail.rows.map(([label, value], index) => <View key={label} style={[styles.row, index === detail.rows.length - 1 && styles.last]}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</LuxuryCard>
      {kind === 'payment' ? <View style={styles.receipt}><FileText size={18} color={colors.goldDark} /><View style={styles.receiptCopy}><Text style={styles.receiptTitle}>Payment receipt available</Text><Text style={styles.receiptText}>Receipt VL-2027-00482 · Download PDF</Text></View></View> : null}
      <View style={styles.timeline}><Clock3 size={17} color={colors.goldDark} /><Text style={styles.timelineText}>{kind === 'task' ? 'Reminder scheduled 2 days before the due date.' : 'Last updated today at 11:20 AM.'}</Text></View>
      <PrimaryPill label={detail.cta} style={styles.cta} onPress={() => kind === 'booking' ? router.push('/chat') : undefined} />
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderLight }, heroGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: colors.blush }, heroIcon: { width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,252,0.78)', borderWidth: 1, borderColor: colors.borderGold }, sparkle: { position: 'absolute', top: 32, right: 62 }, badge: { position: 'absolute', left: 14, bottom: 13, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surfaceCard }, badgeText: { color: colors.success, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 }, info: { overflow: 'hidden' }, row: { minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.borderLight }, last: { borderBottomWidth: 0 }, label: { color: colors.textSecondary, fontSize: 10.5 }, value: { maxWidth: '60%', color: colors.primary, fontFamily: typography.serif, fontSize: 12.5, textAlign: 'right' }, receipt: { marginTop: 13, padding: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.goldLight }, receiptCopy: { flex: 1 }, receiptTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 13 }, receiptText: { color: colors.textSecondary, fontSize: 9, marginTop: 3 }, timeline: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginTop: 13 }, timelineText: { color: colors.textSecondary, fontSize: 9.5 }, cta: { marginTop: 12 },
});
