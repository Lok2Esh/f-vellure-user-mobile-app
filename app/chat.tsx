import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { FileText, MoreHorizontal, Paperclip, Phone, Send } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryScreen, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton, VellureTextInput } from '../components/ui/VellureControls';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  return (
    <LuxuryScreen contentStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Priya Events & Decor" subtitle="Online · Typically replies in 20 minutes" right={<View style={styles.headerActions}><Phone size={18} color={colors.primary} /><MoreHorizontal size={19} color={colors.primary} /></View>} />
      <View style={styles.datePill}><Text style={styles.dateText}>TODAY</Text></View>
      <View style={styles.vendorBubble}><Text style={styles.bubbleText}>Hi Sneha! Thank you for considering us for the wedding. Here’s the decor proposal we discussed.</Text><Text style={styles.bubbleTime}>10:24 AM</Text></View>
      <View style={styles.fileCard}><View style={styles.fileIcon}><FileText size={20} color="#FFFFFF" /></View><View style={styles.fileCopy}><Text style={styles.fileName}>Wedding_Decor_Proposal.pdf</Text><Text style={styles.fileSize}>2.4 MB · PDF</Text></View><Text style={styles.download}>↓</Text></View>
      <View style={styles.userBubble}><Text style={styles.userText}>This looks amazing! Can we add more marigold elements around the mehendi stage?</Text><Text style={styles.userTime}>11:03 AM  ✓✓</Text></View>
      <View style={styles.vendorBubble}><Text style={styles.bubbleText}>Absolutely! I’ll share an updated mood board by this evening.</Text><Text style={styles.bubbleTime}>11:20 AM</Text></View>
      <View style={styles.composer}><VellureButton style={styles.attach}><Paperclip size={19} color={colors.primary} /></VellureButton><VellureTextInput value={message} onChangeText={setMessage} placeholder="Type a message…" style={styles.input} /><VellureButton style={styles.send} onPress={() => setMessage('')}><Send size={18} color="#FFFFFF" /></VellureButton></View>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { minHeight: '100%' }, headerActions: { width: 64, flexDirection: 'row', justifyContent: 'space-between' }, datePill: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: colors.surfaceMuted }, dateText: { color: colors.textMuted, fontSize: 8, fontWeight: '700' }, vendorBubble: { maxWidth: '80%', alignSelf: 'flex-start', marginTop: 13, padding: 12, borderRadius: 17, borderBottomLeftRadius: 5, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, bubbleText: { color: colors.textPrimary, fontSize: 11, lineHeight: 16 }, bubbleTime: { color: colors.textMuted, fontSize: 7.5, marginTop: 6 }, fileCard: { width: '78%', minHeight: 61, marginTop: 8, padding: 9, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, fileIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error }, fileCopy: { flex: 1 }, fileName: { color: colors.textPrimary, fontSize: 9.5, fontWeight: '600' }, fileSize: { color: colors.textMuted, fontSize: 8, marginTop: 3 }, download: { color: colors.primary, fontSize: 20 }, userBubble: { maxWidth: '82%', alignSelf: 'flex-end', marginTop: 13, padding: 12, borderRadius: 17, borderBottomRightRadius: 5, backgroundColor: colors.primary }, userText: { color: colors.textInverse, fontSize: 11, lineHeight: 16 }, userTime: { color: '#DDBFC9', fontSize: 7.5, textAlign: 'right', marginTop: 6 }, composer: { minHeight: 58, marginTop: 'auto', marginBottom: 6, padding: 6, borderRadius: 29, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, attach: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, input: { flex: 1, height: 44, fontSize: 11.5 }, send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
});
