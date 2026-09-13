import React, { useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Building2, CakeSlice, Clock3, Flower2, Heart, Search, Sparkles, TrendingUp, Utensils, X } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, ScreenHeader, SectionTitle } from '../components/ui/LuxuryLayout';
import { VellureButton, VellureTextInput } from '../components/ui/VellureControls';

const popular = [
  { name: 'Heritage venues', icon: Building2 }, { name: 'Wedding decor', icon: Flower2 },
  { name: 'Luxury catering', icon: Utensils }, { name: 'Birthday styling', icon: CakeSlice },
];
const results = ['The Raj Bagh Palace', 'Royal Blush Decor', 'Jaipur Heritage Caterers', 'The Moment Makers'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => results.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Discover" subtitle="Find something extraordinary for your celebration." />
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textMuted} />
        <VellureTextInput value={query} onChangeText={setQuery} placeholder="Search venues, services, or ideas…" autoFocus style={styles.input} />
        {query ? <VellureButton onPress={() => setQuery('')} style={styles.clear}><X size={15} color={colors.textSecondary} /></VellureButton> : null}
      </View>
      {query ? (
        <View>
          <SectionTitle title="Search results" />
          <LuxuryCard style={styles.resultList}>
            {matches.map((item, index) => <VellureButton key={item} style={[styles.resultRow, index === matches.length - 1 && styles.last]} onPress={() => router.push('/(tabs)/vendors')}><View style={styles.resultIcon}><Sparkles size={17} color={colors.primary} /></View><Text style={styles.resultName}>{item}</Text><Text style={styles.view}>View</Text></VellureButton>)}
            {!matches.length ? <View style={styles.noResult}><Search size={28} color={colors.blush} /><Text style={styles.noResultTitle}>No beautiful match yet</Text><Text style={styles.noResultCopy}>Try a city, category, or partner name.</Text></View> : null}
          </LuxuryCard>
        </View>
      ) : (
        <>
          <SectionTitle title="Trending now" />
          <View style={styles.trendingWrap}>{['Palace wedding Jaipur', 'Pastel floral mandap', 'Sangeet DJ', 'Wedding photographer'].map((item) => <VellureButton key={item} style={styles.trendChip} onPress={() => setQuery(item)}><TrendingUp size={12} color={colors.goldDark} /><Text style={styles.trendText}>{item}</Text></VellureButton>)}</View>
          <SectionTitle title="Recent searches" action="Clear" />
          <LuxuryCard>{['Udaipur lake venues', 'Mehendi decor', 'Candid photography'].map((item, index) => <VellureButton key={item} style={[styles.recentRow, index === 2 && styles.last]} onPress={() => setQuery(item)}><Clock3 size={15} color={colors.textMuted} /><Text style={styles.recentText}>{item}</Text></VellureButton>)}</LuxuryCard>
          <SectionTitle title="Popular categories" />
          <View style={styles.popularGrid}>{popular.map(({ name, icon: Icon }) => <VellureButton key={name} style={styles.popularCard} onPress={() => router.push('/(tabs)/vendors')}><View style={styles.popularIcon}><Icon size={21} color={colors.primary} /></View><Text style={styles.popularName}>{name}</Text></VellureButton>)}</View>
          <View style={styles.consult}><Heart size={24} color={colors.goldLight} /><View style={styles.consultCopy}><Text style={styles.consultTitle}>Not sure where to begin?</Text><Text style={styles.consultText}>Ask our event concierge for a thoughtful shortlist.</Text></View><Text style={styles.consultArrow}>→</Text></View>
        </>
      )}
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: { height: 52, borderRadius: 17, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  input: { flex: 1, height: '100%', fontSize: 12.5 }, clear: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, trendChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: colors.goldLight }, trendText: { color: colors.textPrimary, fontSize: 10.5 },
  recentRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, last: { borderBottomWidth: 0 }, recentText: { color: colors.textPrimary, fontSize: 11.5 },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, popularCard: { width: '48.6%', minHeight: 86, borderRadius: 17, padding: 13, justifyContent: 'space-between', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, popularIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, popularName: { color: colors.primary, fontFamily: typography.serif, fontSize: 13 },
  consult: { minHeight: 90, borderRadius: 19, padding: 16, marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceDark }, consultCopy: { flex: 1 }, consultTitle: { color: '#FFF7F2', fontFamily: typography.serif, fontSize: 15 }, consultText: { color: '#DCCBD1', fontSize: 9.5, marginTop: 3 }, consultArrow: { color: colors.goldLight, fontSize: 22 },
  resultList: { overflow: 'hidden' }, resultRow: { minHeight: 60, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, resultIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, resultName: { flex: 1, color: colors.primary, fontFamily: typography.serif, fontSize: 13.5 }, view: { color: colors.goldDark, fontSize: 9.5, fontWeight: '700' },
  noResult: { alignItems: 'center', padding: 38 }, noResultTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 17, marginTop: 10 }, noResultCopy: { color: colors.textSecondary, fontSize: 10.5, marginTop: 4 },
});
