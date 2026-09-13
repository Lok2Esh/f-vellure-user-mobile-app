import React from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';
import { FloralCorner, VenueArchArtwork, VellureMark } from '../../components/ui/LuxuryArtwork';
import { PrimaryPill } from '../../components/ui/LuxuryLayout';
import { VellureButton } from '../../components/ui/VellureControls';

export default function WelcomeScreen() {
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.art}>
        <VenueArchArtwork />
        <View style={styles.floral}><FloralCorner mirrored /></View>
        <View style={styles.logoBadge}><VellureMark size={48} /></View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>WELCOME TO VELLURE</Text>
        <Text style={styles.title}>Beautiful events,{`\n`}thoughtfully planned.</Text>
        <Text style={styles.subtitle}>Discover trusted partners and bring every celebration detail together in one graceful place.</Text>
        <PrimaryPill label="Sign In" icon={<ArrowRight size={18} color="#FFFFFF" />} onPress={() => router.push('/auth/sign-in')} style={styles.primary} />
        <VellureButton style={styles.secondary} onPress={() => router.push('/auth/create-account')}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.secondaryText}>Create an account</Text>
        </VellureButton>
        <VellureButton onPress={() => router.replace('/(tabs)')}><Text style={styles.guest}>Continue as guest</Text></VellureButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  art: { height: '48%', overflow: 'hidden' },
  floral: { position: 'absolute', right: -10, top: 30, width: 120, height: 180, opacity: 0.55 },
  logoBadge: { position: 'absolute', left: 26, top: 62, width: 74, height: 74, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,252,0.9)' },
  copy: { flex: 1, marginTop: -25, paddingHorizontal: 24, paddingTop: 29, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.cream },
  kicker: { color: colors.goldDark, fontSize: 8.5, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.primary, fontFamily: typography.serif, fontSize: 31, lineHeight: 37, marginTop: 7 },
  subtitle: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 19, marginTop: 9 },
  primary: { marginTop: 22 },
  secondary: { minHeight: 50, marginTop: 10, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderLight },
  secondaryText: { color: colors.primary, fontFamily: typography.serif, fontSize: 15 },
  guest: { color: colors.textSecondary, fontSize: 10.5, fontWeight: '600', textAlign: 'center', padding: 14 },
});
