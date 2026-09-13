import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Check, Clock3, Music, Sparkles, Utensils } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const schedule = [
  { time: '08:00', title: 'Bridal preparation', detail: 'Makeup suite · Priya Styling', icon: Sparkles, done: true },
  { time: '11:00', title: 'Baraat welcome', detail: 'Palace courtyard · Dhol troupe', icon: Music, done: false },
  { time: '12:30', title: 'Wedding ceremony', detail: 'Garden mandap · Main lawn', icon: CalendarDays, done: false },
  { time: '15:00', title: 'Celebration lunch', detail: 'Royal dining hall · 250 guests', icon: Utensils, done: false },
];

export default function TimelineScreen() {
  const [day, setDay] = useState('Wedding');
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Event Timeline" subtitle="Saturday, 14 February · The Raj Bagh Palace" />
      <View style={styles.dayTabs}>{['Mehendi', 'Sangeet', 'Wedding', 'Reception'].map((item) => <VellureButton key={item} style={[styles.day, day === item && styles.dayActive]} onPress={() => setDay(item)}><Text style={[styles.dayText, day === item && styles.dayTextActive]}>{item}</Text></VellureButton>)}</View>
      <LuxuryCard style={styles.hero}><View><Text style={styles.heroLabel}>THE BIG DAY</Text><Text style={styles.heroTitle}>{day} Celebration</Text><Text style={styles.heroCopy}>4 moments · 8:00 AM to 5:00 PM</Text></View><View style={styles.clock}><Clock3 size={24} color={colors.goldDark} /></View></LuxuryCard>
      <View style={styles.timeline}>
        {schedule.map((item, index) => {
          const Icon = item.icon;
          return <View key={item.title} style={styles.timelineRow}><View style={styles.timeColumn}><Text style={styles.time}>{item.time}</Text><View style={[styles.node, item.done && styles.nodeDone]}>{item.done ? <Check size={11} color="#FFFFFF" /> : null}</View>{index < schedule.length - 1 ? <View style={styles.line} /> : null}</View><LuxuryCard style={styles.event}><View style={styles.eventIcon}><Icon size={18} color={colors.primary} /></View><View style={styles.eventCopy}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.eventDetail}>{item.detail}</Text></View></LuxuryCard></View>;
        })}
      </View>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  dayTabs: { flexDirection: 'row', gap: 6, marginBottom: 13 }, day: { flex: 1, minHeight: 34, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, dayActive: { backgroundColor: colors.primary }, dayText: { color: colors.textSecondary, fontSize: 9 }, dayTextActive: { color: colors.textInverse, fontWeight: '700' },
  hero: { minHeight: 104, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroLabel: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, heroTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 20, marginTop: 4 }, heroCopy: { color: colors.textSecondary, fontSize: 10, marginTop: 5 }, clock: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldLight },
  timeline: { marginTop: 19 }, timelineRow: { minHeight: 91, flexDirection: 'row' }, timeColumn: { width: 58, alignItems: 'center' }, time: { color: colors.textSecondary, fontSize: 9.5, marginBottom: 7 }, node: { width: 20, height: 20, zIndex: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, borderWidth: 1.5, borderColor: colors.primary }, nodeDone: { backgroundColor: colors.primary }, line: { position: 'absolute', top: 48, bottom: -3, width: 1, backgroundColor: colors.borderMedium }, event: { flex: 1, height: 73, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, eventIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, eventCopy: { flex: 1 }, eventTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 14 }, eventDetail: { color: colors.textSecondary, fontSize: 9.5, marginTop: 3 },
});
