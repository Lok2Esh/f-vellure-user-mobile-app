import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Check, RefreshCw, Search, Sparkles } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const states = ['Loading', 'Empty', 'No Results', 'Error', 'Success'] as const;
export default function StatesScreen() {
  const [active, setActive] = useState<(typeof states)[number]>('Loading');
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="System States" subtitle="Polished feedback for every moment." />
      <View style={styles.tabs}>{states.map((item) => <VellureButton key={item} style={[styles.tab, active === item && styles.tabActive]} onPress={() => setActive(item)}><Text style={[styles.tabText, active === item && styles.tabTextActive]}>{item}</Text></VellureButton>)}</View>
      <LuxuryCard style={styles.preview}>
        {active === 'Loading' ? <LoadingState /> : active === 'Empty' ? <State icon={Sparkles} title="Your saved collection awaits" copy="Save venues and partners you love to find them here." action="Explore Partners" /> : active === 'No Results' ? <State icon={Search} title="No beautiful match yet" copy="Try adjusting your filters, city, or budget range." action="Clear Filters" /> : active === 'Error' ? <State icon={AlertCircle} title="A small pause in the celebration" copy="We couldn’t load this page. Your planning details are safe." action="Try Again" /> : <State icon={Check} title="Beautifully done" copy="Your booking request has been shared with The Leela Palace." action="View Booking" />}
      </LuxuryCard>
    </LuxuryScreen>
  );
}
function LoadingState() { return <View style={styles.loading}><View style={styles.skeletonHero} /><View style={styles.skeletonTitle} /><View style={styles.skeletonCopy} /><View style={styles.skeletonRow}><View style={styles.skeletonCard} /><View style={styles.skeletonCard} /></View><View style={styles.loadingLabel}><RefreshCw size={14} color={colors.goldDark} /><Text style={styles.loadingText}>Curating something beautiful…</Text></View></View>; }
function State({ icon: Icon, title, copy, action }: { icon: any; title: string; copy: string; action: string }) { return <View style={styles.state}><View style={styles.stateIcon}><Icon size={29} color={colors.primary} /></View><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateCopy}>{copy}</Text><PrimaryPill label={action} style={styles.action} /></View>; }
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 15 }, tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, backgroundColor: colors.blushLight }, tabActive: { backgroundColor: colors.primary }, tabText: { color: colors.textSecondary, fontSize: 9 }, tabTextActive: { color: colors.textInverse, fontWeight: '700' }, preview: { minHeight: 430, padding: 18 }, loading: { flex: 1 }, skeletonHero: { height: 170, borderRadius: 18, backgroundColor: colors.surfaceMuted }, skeletonTitle: { width: '63%', height: 20, borderRadius: 7, marginTop: 17, backgroundColor: colors.blush }, skeletonCopy: { width: '88%', height: 10, borderRadius: 5, marginTop: 10, backgroundColor: colors.surfaceMuted }, skeletonRow: { flexDirection: 'row', gap: 10, marginTop: 18 }, skeletonCard: { flex: 1, height: 82, borderRadius: 15, backgroundColor: colors.blushLight }, loadingLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 23 }, loadingText: { color: colors.textSecondary, fontSize: 10 }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 }, stateIcon: { width: 78, height: 78, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderGold }, stateTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 22, textAlign: 'center', marginTop: 18 }, stateCopy: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 7 }, action: { width: '100%', marginTop: 22 },
});
