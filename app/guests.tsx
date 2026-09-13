import React, { useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Clock3, Plus, Search, Send, UserRoundX, Users } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton, VellureTextInput } from '../components/ui/VellureControls';

type GuestStatus = 'Confirmed' | 'Awaiting' | 'Declined';
const guestList: Array<{ initials: string; name: string; group: string; party: number; status: GuestStatus }> = [
  { initials: 'RS', name: 'Rajesh Sharma', group: 'Family', party: 4, status: 'Confirmed' },
  { initials: 'PS', name: 'Priya Sharma', group: 'Family', party: 2, status: 'Confirmed' },
  { initials: 'AK', name: 'Ananya Kapoor', group: 'Friends', party: 1, status: 'Awaiting' },
  { initials: 'RV', name: 'Rohan Verma', group: 'Colleagues', party: 1, status: 'Confirmed' },
  { initials: 'NP', name: 'Neha Patel', group: 'Friends', party: 3, status: 'Declined' },
];

export default function GuestsScreen() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('All Guests');
  const visible = useMemo(() => guestList.filter((guest) => guest.name.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Guests" subtitle="Keep every invitation beautifully organized." />
      <View style={styles.tabs}>
        {['All Guests', 'RSVP Status', 'Groups'].map((item) => (
          <VellureButton key={item} style={[styles.tab, active === item && styles.tabActive]} onPress={() => setActive(item)}>
            <Text style={[styles.tabText, active === item && styles.tabTextActive]}>{item}</Text>
          </VellureButton>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Stat icon={Users} value="248" label="Total" tone="plum" />
        <Stat icon={CheckCircle2} value="180" label="Confirmed" tone="green" />
        <Stat icon={Clock3} value="42" label="Awaiting" tone="gold" />
        <Stat icon={UserRoundX} value="26" label="Declined" tone="rose" />
      </View>

      <View style={styles.searchBar}>
        <Search size={17} color={colors.textMuted} />
        <VellureTextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search guests by name or group…"
          style={styles.searchInput}
        />
      </View>

      <LuxuryCard style={styles.list}>
        {visible.map((guest, index) => (
          <VellureButton key={guest.name} style={[styles.guestRow, index === visible.length - 1 && styles.lastRow]} onPress={() => router.push('/guest-detail')}>
            <View style={styles.initials}><Text style={styles.initialsText}>{guest.initials}</Text></View>
            <View style={styles.guestCopy}>
              <Text style={styles.guestName}>{guest.name}</Text>
              <Text style={styles.guestMeta}>{guest.group} · {guest.party} {guest.party === 1 ? 'guest' : 'guests'}</Text>
            </View>
            <View style={[styles.status, statusStyles[guest.status]]}>
              <Text style={[styles.statusText, statusTextStyles[guest.status]]}>{guest.status}</Text>
            </View>
          </VellureButton>
        ))}
      </LuxuryCard>

      <View style={styles.actions}>
        <PrimaryPill label="Add Guest" icon={<Plus size={17} color="#FFFFFF" />} style={styles.actionButton} />
        <VellureButton style={styles.inviteButton}>
          <Send size={16} color={colors.primary} />
          <Text style={styles.inviteText}>Send Invites</Text>
        </VellureButton>
      </View>
    </LuxuryScreen>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: any; value: string; label: string; tone: 'plum' | 'green' | 'gold' | 'rose' }) {
  const toneColor = { plum: colors.primary, green: colors.success, gold: colors.goldDark, rose: colors.error }[tone];
  return (
    <View style={styles.stat}>
      <Icon size={16} color={toneColor} strokeWidth={1.7} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const statusStyles = StyleSheet.create({
  Confirmed: { backgroundColor: '#E2F0E8' }, Awaiting: { backgroundColor: '#F8E8C8' }, Declined: { backgroundColor: '#F8DFE2' },
});
const statusTextStyles = StyleSheet.create({
  Confirmed: { color: colors.success }, Awaiting: { color: colors.warning }, Declined: { color: colors.error },
});
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 18, backgroundColor: colors.surfaceMuted },
  tab: { flex: 1, minHeight: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 10.5 },
  tabTextActive: { color: colors.textInverse, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 7, marginTop: 13 },
  stat: { flex: 1, minHeight: 77, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  statValue: { color: colors.primary, fontFamily: typography.serif, fontSize: 17, marginTop: 3 },
  statLabel: { color: colors.textSecondary, fontSize: 8.5, marginTop: 1 },
  searchBar: { height: 47, borderRadius: 16, paddingHorizontal: 14, marginVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  searchInput: { flex: 1, height: '100%', fontSize: 12, color: colors.textPrimary },
  list: { overflow: 'hidden' },
  guestRow: { minHeight: 68, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  lastRow: { borderBottomWidth: 0 },
  initials: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight },
  initialsText: { color: colors.primary, fontFamily: typography.serif, fontSize: 13 },
  guestCopy: { flex: 1 },
  guestName: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '600' },
  guestMeta: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  status: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 9, marginTop: 15 },
  actionButton: { flex: 1 },
  inviteButton: { flex: 1, minHeight: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderLight },
  inviteText: { color: colors.primary, fontFamily: typography.serif, fontSize: 14 },
});
