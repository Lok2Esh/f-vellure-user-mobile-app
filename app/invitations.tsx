import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, Flower2, Send, Share2, Sparkles } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { FloralCorner, VellureMark } from '../components/ui/LuxuryArtwork';
import { LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const tabs = ['Templates', 'Design', 'Message', 'Share'];

export default function InvitationsScreen() {
  const [tab, setTab] = useState('Templates');
  const [template, setTemplate] = useState(0);
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Create E-Invite" subtitle="A beautiful first glimpse of your celebration." />
      <View style={styles.tabs}>{tabs.map((item) => <VellureButton key={item} style={[styles.tab, tab === item && styles.tabActive]} onPress={() => setTab(item)}><Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text></VellureButton>)}</View>
      <View style={[styles.invite, template === 1 && styles.inviteRose]}>
        <View style={styles.cornerLeft}><FloralCorner /></View><View style={styles.cornerRight}><FloralCorner mirrored /></View>
        <View style={styles.inviteMark}><VellureMark size={38} /></View>
        <Text style={styles.together}>TOGETHER WITH THEIR FAMILIES</Text>
        <Text style={styles.names}>Meera{`\n`}&{`\n`}Arjun</Text>
        <View style={styles.rule} />
        <Text style={styles.inviteYou}>INVITE YOU TO CELEBRATE{`\n`}THEIR WEDDING</Text>
        <Text style={styles.date}>SAT, 14 FEB 2027 · 4:00 PM</Text>
        <Text style={styles.venue}>THE LEELA PALACE{`\n`}JAIPUR, RAJASTHAN</Text>
        <View style={styles.flower}><Flower2 size={24} color={colors.goldDark} /></View>
      </View>
      <View style={styles.carouselControls}>
        <VellureButton style={styles.arrow} onPress={() => setTemplate(Math.max(0, template - 1))}><ChevronLeft size={18} color={colors.primary} /></VellureButton>
        <View style={styles.dots}>{[0, 1, 2, 3].map((item) => <View key={item} style={[styles.dot, item === template && styles.dotActive]} />)}</View>
        <VellureButton style={styles.arrow} onPress={() => setTemplate(Math.min(3, template + 1))}><ChevronRight size={18} color={colors.primary} /></VellureButton>
      </View>
      <View style={styles.actions}><PrimaryPill label="Customize This Design" style={styles.mainAction} icon={<Sparkles size={17} color="#FFFFFF" />} /><VellureButton style={styles.share}><Share2 size={17} color={colors.primary} /></VellureButton></View>
      <View style={styles.ready}><Check size={13} color={colors.success} /><Text style={styles.readyText}>Mobile-ready · WhatsApp sharing · RSVP tracking</Text><Send size={13} color={colors.success} /></View>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 17, backgroundColor: colors.surfaceMuted }, tab: { flex: 1, minHeight: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: colors.primary }, tabText: { color: colors.textSecondary, fontSize: 9.5 }, tabTextActive: { color: colors.textInverse, fontWeight: '700' },
  invite: { height: 440, marginTop: 14, borderRadius: 22, overflow: 'hidden', alignItems: 'center', paddingTop: 31, backgroundColor: '#F7E9E0', borderWidth: 1, borderColor: '#D9BFAF' }, inviteRose: { backgroundColor: '#F0DCDA' }, cornerLeft: { position: 'absolute', left: -17, bottom: -10, width: 125, height: 188, opacity: 0.7 }, cornerRight: { position: 'absolute', right: -17, top: 5, width: 125, height: 188, opacity: 0.62 }, inviteMark: { height: 40 }, together: { color: colors.textSecondary, fontSize: 7.5, fontWeight: '700', letterSpacing: 1.25, marginTop: 8 }, names: { color: colors.primary, fontFamily: typography.serif, fontSize: 34, lineHeight: 31, textAlign: 'center', marginTop: 17 }, rule: { width: 44, height: 1, backgroundColor: colors.goldDark, marginVertical: 15 }, inviteYou: { color: colors.textPrimary, fontSize: 7.5, fontWeight: '700', letterSpacing: 1.2, lineHeight: 12, textAlign: 'center' }, date: { color: colors.primary, fontFamily: typography.serif, fontSize: 12, marginTop: 20 }, venue: { color: colors.textSecondary, fontSize: 8, fontWeight: '700', letterSpacing: 1, lineHeight: 13, textAlign: 'center', marginTop: 12 }, flower: { marginTop: 19 },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, dots: { flexDirection: 'row', gap: 6 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderMedium }, dotActive: { width: 18, backgroundColor: colors.primary }, actions: { flexDirection: 'row', gap: 9 }, mainAction: { flex: 1 }, share: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, ready: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 13 }, readyText: { color: colors.success, fontSize: 8.5 },
});
