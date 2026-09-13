import React from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { AbstractWaves, VellureMark } from '../components/ui/LuxuryArtwork';
import { PrimaryPill } from '../components/ui/LuxuryLayout';

export default function LaunchScreen() {
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.brandBlock}>
        <VellureMark size={68} />
        <Text style={styles.logo}>Vellure</Text>
        <Text style={styles.tagline}>EVENTS FOR A MORE{`\n`}BEAUTIFUL TOMORROW</Text>
      </View>
      <View style={styles.art}><AbstractWaves /></View>
      <View style={styles.footer}>
        <Text style={styles.promise}>Plan memorable events{`\n`}effortlessly.</Text>
        <PrimaryPill label="Get Started" icon={<ArrowRight size={18} color="#FFFFFF" />} onPress={() => router.push('/onboarding')} />
        <Text style={styles.signoff}>DREAM  ·  PLAN  ·  CELEBRATE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  brandBlock: { alignItems: 'center', paddingTop: 76, zIndex: 2 },
  logo: { color: colors.primary, fontFamily: typography.serif, fontSize: 50, lineHeight: 58, letterSpacing: -1.5 },
  tagline: { color: colors.textPrimary, fontSize: 9, lineHeight: 14, fontWeight: '700', letterSpacing: 3.2, textAlign: 'center', marginTop: 5 },
  art: { position: 'absolute', left: 0, right: 0, top: '33%', height: '38%' },
  footer: { position: 'absolute', left: 24, right: 24, bottom: 34, gap: 18 },
  promise: { color: colors.primary, fontFamily: typography.serif, fontSize: 20, lineHeight: 25, textAlign: 'center' },
  signoff: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 2.6, textAlign: 'center', marginTop: 4 },
});
