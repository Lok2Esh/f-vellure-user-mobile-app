import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';

export function PlannerEvidenceCard({ result }: { result: any }) {
  const [showSources, setShowSources] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>What this plan is based on</Text>
      <Text style={styles.body}>{result.feasibility === 'needs-quotes' ? 'Local quotes are needed to confirm this plan.' : 'Listed starting estimates fit. Final quotes are still needed.'}</Text>
      {(result.gaps || []).map((gap: string, i: number) => <Text key={`gap-${i}`} style={styles.gap}>{gap}</Text>)}
      {(result.lineItems || []).filter((item: any) => item.service !== 'buffer').map((item: any) => (
        <Text key={item.id} style={styles.body}><Text style={styles.label}>{item.name}: </Text>{item.basis}</Text>
      ))}
      <Text style={styles.label}>Assumptions to confirm</Text>
      {(result.assumptions || []).map((note: string, i: number) => <Text key={i} style={styles.body}>{note}</Text>)}
      <Pressable onPress={() => setShowSources(!showSources)} accessibilityRole="button">
        <Text style={styles.link}>{showSources ? 'Hide sources' : `View ${(result.sources || []).length} planning sources`}</Text>
      </Pressable>
      {showSources ? (result.sources || []).map((source: any) => (
        <View key={source.id} style={styles.source}>
          <Text style={styles.label}>{source.title}</Text>
          <Text style={styles.body}>{source.type === 'vendor' ? `Starting estimate · ${source.checkedAt ? `checked ${source.checkedAt.slice(0, 10)}` : 'check date unknown'}` : 'Internal planning guide · indicative guidance'}</Text>
          {typeof source.sourceUrl === 'string' && /^https?:\/\//.test(source.sourceUrl) ? (
            <Pressable onPress={() => { void Linking.openURL(source.sourceUrl).catch(() => {}); }} accessibilityRole="link"><Text style={styles.link}>Open price source</Text></Pressable>
          ) : null}
        </View>
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 16, padding: 18, backgroundColor: '#FFFDF9', borderRadius: 20, borderWidth: 1, borderColor: '#EFE3CF', gap: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#641E3D' },
  body: { fontSize: 13, lineHeight: 20, color: '#65564E' },
  label: { fontSize: 13, fontWeight: '600', color: '#49362D' },
  gap: { fontSize: 13, lineHeight: 20, color: '#8A5A12' },
  link: { fontSize: 13, color: '#641E3D', fontWeight: '600', paddingVertical: 5 },
  source: { borderTopWidth: 1, borderTopColor: '#EFE3CF', paddingTop: 10 },
});
