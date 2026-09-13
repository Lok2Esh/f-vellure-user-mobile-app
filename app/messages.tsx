import React from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, MessageCircle, Search } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const chats = [
  { initials: 'PE', name: 'Priya Events & Decor', message: 'I’ll share the updated mood board by this evening.', time: '11:20 AM', unread: 2, online: true },
  { initials: 'LP', name: 'The Leela Palace', message: 'Your venue tour is confirmed for Saturday.', time: 'Yesterday', unread: 0, online: true },
  { initials: 'MM', name: 'The Moment Makers', message: 'Proposal.pdf · 2.4 MB', time: 'Mon', unread: 0, online: false },
  { initials: 'SA', name: 'Spice Affairs Catering', message: 'Would you like to schedule a tasting?', time: 'Sun', unread: 1, online: false },
];

export default function MessagesScreen() {
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Messages" subtitle="Conversations with your celebration partners." />
      <VellureButton style={styles.search}><Search size={17} color={colors.textMuted} /><Text style={styles.searchText}>Search conversations…</Text></VellureButton>
      <LuxuryCard style={styles.list}>{chats.map((chat, index) => <VellureButton key={chat.name} style={[styles.row, index === chats.length - 1 && styles.last]} onPress={() => router.push('/chat')}><View style={styles.avatar}><Text style={styles.initials}>{chat.initials}</Text>{chat.online ? <View style={styles.online} /> : null}</View><View style={styles.copy}><View style={styles.nameRow}><Text style={styles.name}>{chat.name}</Text><Text style={styles.time}>{chat.time}</Text></View><View style={styles.messageRow}>{chat.message.includes('.pdf') ? <Camera size={12} color={colors.goldDark} /> : null}<Text style={styles.message} numberOfLines={1}>{chat.message}</Text>{chat.unread ? <View style={styles.unread}><Text style={styles.unreadText}>{chat.unread}</Text></View> : null}</View></View></VellureButton>)}</LuxuryCard>
      <View style={styles.assurance}><MessageCircle size={18} color={colors.goldDark} /><Text style={styles.assuranceText}>Your conversations and shared proposals stay organized with each booking.</Text></View>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  search: { height: 48, borderRadius: 16, paddingHorizontal: 14, marginBottom: 13, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, searchText: { color: colors.textMuted, fontSize: 11.5 }, list: { overflow: 'hidden' }, row: { minHeight: 77, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, last: { borderBottomWidth: 0 }, avatar: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, initials: { color: colors.primary, fontFamily: typography.serif, fontSize: 14 }, online: { position: 'absolute', right: -1, bottom: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.surfaceCard }, copy: { flex: 1 }, nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, name: { flex: 1, color: colors.primary, fontFamily: typography.serif, fontSize: 13.5 }, time: { color: colors.textMuted, fontSize: 8.5 }, messageRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }, message: { flex: 1, color: colors.textSecondary, fontSize: 9.5 }, unread: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, unreadText: { color: colors.textInverse, fontSize: 8, fontWeight: '700' }, assurance: { marginTop: 15, padding: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.goldLight }, assuranceText: { flex: 1, color: colors.textSecondary, fontSize: 9.5, lineHeight: 14 },
});
