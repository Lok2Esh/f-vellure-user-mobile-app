import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Building2, CalendarCheck, HeartHandshake, Users } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { FloralCorner, VenueArchArtwork } from '../components/ui/LuxuryArtwork';
import { PrimaryPill } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const slides = [
  { title: 'Discover remarkable venues', copy: 'Explore heritage palaces, intimate lawns, and modern spaces curated for your celebration.', icon: Building2 },
  { title: 'Book partners you can trust', copy: 'Meet verified decorators, photographers, caterers, artists, and planners near you.', icon: HeartHandshake },
  { title: 'Guests and budgets, beautifully organized', copy: 'Keep RSVPs, expenses, payments, and every thoughtful detail in one calm workspace.', icon: Users },
  { title: 'Create unforgettable celebrations', copy: 'Let Vellure guide your journey from the first idea to the final joyful moment.', icon: CalendarCheck },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Icon = slide.icon;
  const next = () => index === slides.length - 1 ? router.replace('/auth/welcome') : setIndex(index + 1);
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topRow}>
        <Text style={styles.wordmark}>Vellure</Text>
        <VellureButton onPress={() => router.replace('/auth/welcome')}><Text style={styles.skip}>Skip</Text></VellureButton>
      </View>
      <View style={styles.artCard}>
        <VenueArchArtwork />
        <View style={styles.iconBadge}><Icon size={26} color={colors.primary} /></View>
        <View style={styles.floral}><FloralCorner /></View>
      </View>
      <View style={styles.copyBlock}>
        <Text style={styles.kicker}>THE VELLURE EXPERIENCE</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
        <View style={styles.dots}>{slides.map((_, dot) => <View key={dot} style={[styles.dot, dot === index && styles.dotActive]} />)}</View>
      </View>
      <View style={styles.footer}>
        <PrimaryPill label={index === slides.length - 1 ? 'Begin Your Journey' : 'Continue'} icon={<ArrowRight size={18} color="#FFFFFF" />} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, backgroundColor: colors.cream },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingBottom: 18 },
  wordmark: { color: colors.primary, fontFamily: typography.serif, fontSize: 26 },
  skip: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', padding: 8 },
  artCard: { height: '42%', minHeight: 300, borderRadius: 30, overflow: 'hidden', backgroundColor: colors.blushLight },
  iconBadge: { position: 'absolute', left: 20, top: 20, width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,252,0.9)' },
  floral: { position: 'absolute', right: -12, bottom: -8, width: 120, height: 180, opacity: 0.55 },
  copyBlock: { alignItems: 'center', paddingHorizontal: 15, paddingTop: 28 },
  kicker: { color: colors.goldDark, fontSize: 8.5, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.primary, fontFamily: typography.serif, fontSize: 29, lineHeight: 35, textAlign: 'center', marginTop: 9 },
  copy: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginTop: 10 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 22 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderMedium },
  dotActive: { width: 24, backgroundColor: colors.primary },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 32 },
});
