import React from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Sparkles } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { FloralCorner } from '../components/ui/LuxuryArtwork';
import { PrimaryPill } from '../components/ui/LuxuryLayout';

export default function EventCreatedScreen() {
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.floralLeft}><FloralCorner /></View><View style={styles.floralRight}><FloralCorner mirrored /></View>
      <View style={styles.successMark}><View style={styles.successInner}><Check size={28} color="#FFFFFF" strokeWidth={2.4} /></View><Sparkles size={22} color={colors.goldDark} style={styles.sparkle} /></View>
      <Text style={styles.kicker}>YOUR JOURNEY BEGINS</Text>
      <Text style={styles.title}>Your event is ready{`\n`}to be beautifully planned.</Text>
      <Text style={styles.copy}>We’ve created your personalized workspace for Meera & Arjun’s wedding in Jaipur.</Text>
      <View style={styles.summary}><Text style={styles.summaryLabel}>NEXT STEP</Text><Text style={styles.summaryTitle}>Explore your curated venue shortlist</Text><Text style={styles.summaryCopy}>12 verified partners match your celebration style and budget.</Text></View>
      <View style={styles.footer}><PrimaryPill label="Open My Event" onPress={() => router.replace('/(tabs)')} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, backgroundColor: colors.cream, overflow: 'hidden' },
  floralLeft: { position: 'absolute', left: -24, top: 70, width: 130, height: 195, opacity: 0.35 },
  floralRight: { position: 'absolute', right: -25, bottom: 70, width: 130, height: 195, opacity: 0.35 },
  successMark: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderGold },
  successInner: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sparkle: { position: 'absolute', right: -8, top: 2 },
  kicker: { color: colors.goldDark, fontSize: 8.5, fontWeight: '800', letterSpacing: 1.5, marginTop: 24 },
  title: { color: colors.primary, fontFamily: typography.serif, fontSize: 29, lineHeight: 35, textAlign: 'center', marginTop: 8 },
  copy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 10 },
  summary: { width: '100%', borderRadius: 20, padding: 17, marginTop: 25, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  summaryLabel: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  summaryTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 16, marginTop: 5 },
  summaryCopy: { color: colors.textSecondary, fontSize: 10.5, lineHeight: 16, marginTop: 4 },
  footer: { position: 'absolute', left: 24, right: 24, bottom: 34 },
});
