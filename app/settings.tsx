import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronRight, CircleHelp, CreditCard, Globe2, Heart, LockKeyhole, LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, ScreenHeader, SectionTitle } from '../components/ui/LuxuryLayout';
import { VellureButton, VellureSwitch } from '../components/ui/VellureControls';

const accountItems = [
  { label: 'Personal information', detail: 'Sneha Iyer', icon: UserRound },
  { label: 'Preferred city', detail: 'Jaipur, Rajasthan', icon: MapPin },
  { label: 'Payment methods', detail: 'UPI · Visa ending 4821', icon: CreditCard },
  { label: 'Privacy & security', detail: 'Password and data controls', icon: LockKeyhole },
];

export default function SettingsScreen() {
  const [planning, setPlanning] = useState(true);
  const [messages, setMessages] = useState(true);
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Preferences" subtitle="Make Vellure feel beautifully yours." />
      <SectionTitle title="Account" />
      <LuxuryCard style={styles.list}>{accountItems.map((item, index) => { const Icon = item.icon; return <VellureButton key={item.label} style={[styles.row, index === accountItems.length - 1 && styles.last]}><View style={styles.icon}><Icon size={18} color={colors.primary} /></View><View style={styles.copy}><Text style={styles.label}>{item.label}</Text><Text style={styles.detail}>{item.detail}</Text></View><ChevronRight size={17} color={colors.textMuted} /></VellureButton>; })}</LuxuryCard>
      <SectionTitle title="Notifications" />
      <LuxuryCard style={styles.list}><SettingSwitch icon={Bell} label="Planning reminders" detail="Tasks, payments, and event updates" value={planning} onValueChange={setPlanning} /><SettingSwitch icon={Heart} label="Partner messages" detail="Replies, proposals, and booking updates" value={messages} onValueChange={setMessages} last /></LuxuryCard>
      <SectionTitle title="Vellure" />
      <LuxuryCard style={styles.list}><Menu icon={CircleHelp} label="Help & Support" /><Menu icon={ShieldCheck} label="Trust, safety & policies" /><Menu icon={Globe2} label="About Vellure" last /></LuxuryCard>
      <VellureButton style={styles.logout} onPress={() => router.replace('/auth/welcome')}><LogOut size={17} color={colors.primary} /><Text style={styles.logoutText}>Log Out</Text></VellureButton>
      <Text style={styles.version}>Vellure India · Version 1.0.0</Text>
    </LuxuryScreen>
  );
}

function Menu({ icon: Icon, label, last }: { icon: any; label: string; last?: boolean }) { return <VellureButton style={[styles.row, last && styles.last]}><View style={styles.icon}><Icon size={18} color={colors.primary} /></View><Text style={styles.label}>{label}</Text><ChevronRight size={17} color={colors.textMuted} /></VellureButton>; }
function SettingSwitch({ icon: Icon, label, detail, value, onValueChange, last }: { icon: any; label: string; detail: string; value: boolean; onValueChange: (value: boolean) => void; last?: boolean }) { return <View style={[styles.row, last && styles.last]}><View style={styles.icon}><Icon size={18} color={colors.primary} /></View><View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.detail}>{detail}</Text></View><VellureSwitch value={value} onValueChange={onValueChange} /></View>; }

const styles = StyleSheet.create({
  list: { overflow: 'hidden' }, row: { minHeight: 66, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, last: { borderBottomWidth: 0 }, icon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, copy: { flex: 1 }, label: { flex: 1, color: colors.primary, fontFamily: typography.serif, fontSize: 13.5 }, detail: { color: colors.textSecondary, fontSize: 9, marginTop: 3 }, logout: { minHeight: 50, marginTop: 22, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderLight }, logoutText: { color: colors.primary, fontFamily: typography.serif, fontSize: 14 }, version: { color: colors.textMuted, fontSize: 8.5, textAlign: 'center', marginTop: 13 },
});
