import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BellRing, CalendarCheck, CheckCircle2, MessageCircle, Sparkles, WalletCards } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const activity = [
  { title: 'New decor proposal received', copy: 'Priya Events & Decor shared an updated proposal.', time: '12 min ago', icon: MessageCircle, tone: '#EBD8DD', route: '/chat' as const },
  { title: 'Venue tour confirmed', copy: 'The Leela Palace · Saturday at 11:30 AM.', time: '1 hr ago', icon: CheckCircle2, tone: '#E1EEE8', route: '/bookings' as const },
  { title: 'Budget insight', copy: 'Your decor allocation is 8% above similar celebrations.', time: 'Yesterday', icon: WalletCards, tone: '#F5E6CA', route: '/(tabs)/budget' as const },
  { title: 'Checklist reminder', copy: 'Send save-the-dates by Monday.', time: 'Yesterday', icon: CalendarCheck, tone: '#E8DDDA', route: '/checklist' as const },
];

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('All');
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Notifications" subtitle="Timely updates for every meaningful detail." />
      <View style={styles.tabs}>{['All', 'Planning', 'Messages'].map((item) => <VellureButton key={item} style={[styles.tab, filter === item && styles.tabActive]} onPress={() => setFilter(item)}><Text style={[styles.tabText, filter === item && styles.tabTextActive]}>{item}</Text></VellureButton>)}</View>
      <View style={styles.todayRow}><Text style={styles.today}>TODAY</Text><Text style={styles.markRead}>Mark all as read</Text></View>
      <LuxuryCard style={styles.list}>{activity.map((item, index) => { const Icon = item.icon; return <VellureButton key={item.title} style={[styles.row, index === activity.length - 1 && styles.last]} onPress={() => router.push(item.route)}><View style={[styles.icon, { backgroundColor: item.tone }]}><Icon size={19} color={colors.primary} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title}>{item.title}</Text>{index < 2 ? <View style={styles.unread} /> : null}</View><Text style={styles.description}>{item.copy}</Text><Text style={styles.time}>{item.time}</Text></View></VellureButton>; })}</LuxuryCard>
      <View style={styles.digest}><BellRing size={20} color={colors.goldDark} /><View style={styles.digestCopy}><Text style={styles.digestTitle}>Your planning digest</Text><Text style={styles.digestText}>3 tasks due this week · 2 partner updates</Text></View><Sparkles size={18} color={colors.goldDark} /></View>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 7 }, tab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.blushLight }, tabActive: { backgroundColor: colors.primary }, tabText: { color: colors.textSecondary, fontSize: 9.5 }, tabTextActive: { color: colors.textInverse, fontWeight: '700' }, todayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 19, marginBottom: 9 }, today: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, markRead: { color: colors.primary, fontSize: 9.5, fontWeight: '600' }, list: { overflow: 'hidden' }, row: { minHeight: 91, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, last: { borderBottomWidth: 0 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, title: { color: colors.primary, fontFamily: typography.serif, fontSize: 13.5 }, unread: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.goldDark }, description: { color: colors.textSecondary, fontSize: 9.5, lineHeight: 14, marginTop: 4 }, time: { color: colors.textMuted, fontSize: 8, marginTop: 5 }, digest: { minHeight: 76, marginTop: 15, padding: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.goldLight }, digestCopy: { flex: 1 }, digestTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 13.5 }, digestText: { color: colors.textSecondary, fontSize: 9.5, marginTop: 3 },
});
