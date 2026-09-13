import React, { useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Building2, Camera, Check, ChevronDown, Flower2, IndianRupee, Music, Sparkles, Utensils, Wand2 } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { createNewCustomPackage } from '../services/customPackageStore';
import { createLocalBudgetPlan } from '../services/localBudgetPlanner';
import { VenueArchArtwork } from '../components/ui/LuxuryArtwork';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton, VellureTextInput } from '../components/ui/VellureControls';

const services = [
  { key: 'venue', label: 'Venue', icon: Building2 }, { key: 'catering', label: 'Catering', icon: Utensils },
  { key: 'decor', label: 'Decor', icon: Flower2 }, { key: 'photography', label: 'Photography', icon: Camera },
  { key: 'live_music', label: 'Music', icon: Music },
];
const tiers = [{ key: 'essential', label: 'Essential', factor: 0.75 }, { key: 'signature', label: 'Signature', factor: 1 }, { key: 'luxury', label: 'Luxury', factor: 1.35 }];

export default function PackageBuilderScreen() {
  const [name, setName] = useState('Meera & Arjun Signature Wedding');
  const [tier, setTier] = useState('signature');
  const [selected, setSelected] = useState(['venue', 'catering', 'decor', 'photography']);
  const [budget] = useState(2500000);
  const factor = tiers.find((item) => item.key === tier)?.factor || 1;
  const plan = useMemo(() => createLocalBudgetPlan({ totalBudget: Math.round(budget * factor), guestCount: 250, city: 'Jaipur', vibe: tier, eventType: 'Wedding', services: selected, confirmedDetails: true }), [budget, factor, selected, tier]);
  const createPackage = () => {
    const created = createNewCustomPackage({ name, eventType: 'Grand Wedding', city: 'Jaipur', guestCount: 250, targetBudget: plan.totalBudget, eventDate: '14 February 2027' });
    router.replace({ pathname: '/custom-package', params: { id: created.id } });
  };
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Create Your Package" subtitle="Build a celebration suite around your priorities." />
      <View style={styles.hero}><VenueArchArtwork /><View style={styles.heroBadge}><Wand2 size={13} color={colors.goldDark} /><Text style={styles.heroBadgeText}>AI-ASSISTED PACKAGE STUDIO</Text></View><View style={styles.heroCopy}><Text style={styles.heroTitle}>A package as unique as your story.</Text><Text style={styles.heroSubtitle}>Jaipur · 250 guests · Wedding</Text></View></View>
      <Text style={styles.label}>PACKAGE NAME</Text>
      <View style={styles.nameField}><Sparkles size={17} color={colors.goldDark} /><VellureTextInput value={name} onChangeText={setName} style={styles.nameInput} /></View>
      <Text style={styles.sectionTitle}>Choose your experience</Text>
      <View style={styles.tiers}>{tiers.map((item) => <VellureButton key={item.key} style={[styles.tier, tier === item.key && styles.tierActive]} onPress={() => setTier(item.key)}><Text style={[styles.tierText, tier === item.key && styles.tierTextActive]}>{item.label}</Text>{tier === item.key ? <Check size={12} color="#FFFFFF" /> : null}</VellureButton>)}</View>
      <Text style={styles.sectionTitle}>Included services</Text>
      <View style={styles.serviceGrid}>{services.map(({ key, label, icon: Icon }) => { const active = selected.includes(key); return <VellureButton key={key} style={[styles.service, active && styles.serviceActive]} onPress={() => setSelected((current) => active ? current.filter((item) => item !== key) : [...current, key])}><View style={[styles.serviceIcon, active && styles.serviceIconActive]}><Icon size={19} color={active ? colors.textInverse : colors.primary} /></View><Text style={styles.serviceLabel}>{label}</Text>{active ? <View style={styles.check}><Check size={9} color="#FFFFFF" /></View> : null}</VellureButton>; })}</View>
      <LuxuryCard style={styles.pricing}>
        <View style={styles.pricingTop}><View><Text style={styles.pricingLabel}>AI PLANNING ESTIMATE</Text><Text style={styles.price}>₹{plan.totalBudget.toLocaleString('en-IN')}</Text></View><View style={styles.confidence}><Sparkles size={12} color={colors.success} /><Text style={styles.confidenceText}>Market calibrated</Text></View></View>
        {plan.categories.slice(0, 4).map((category) => <View key={category.id} style={styles.allocation}><View style={[styles.dot, { backgroundColor: category.color }]} /><Text style={styles.allocationName}>{category.name}</Text><Text style={styles.allocationPrice}>₹{category.amount.toLocaleString('en-IN')}</Text></View>)}
        <View style={styles.pricingNote}><IndianRupee size={14} color={colors.goldDark} /><Text style={styles.pricingNoteText}>Includes a protected contingency. Final pricing is confirmed through verified partner quotes.</Text></View>
      </LuxuryCard>
      <PrimaryPill label="Create Package & Choose Partners" style={styles.cta} onPress={createPackage} />
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 205, borderRadius: 22, overflow: 'hidden', marginBottom: 18 }, heroBadge: { position: 'absolute', top: 13, left: 13, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,253,252,0.9)' }, heroBadgeText: { color: colors.goldDark, fontSize: 7.5, fontWeight: '800', letterSpacing: 0.7 }, heroCopy: { position: 'absolute', left: 16, right: 16, bottom: 14, padding: 12, borderRadius: 15, backgroundColor: 'rgba(58,23,39,0.82)' }, heroTitle: { color: '#FFF8F3', fontFamily: typography.serif, fontSize: 16 }, heroSubtitle: { color: '#DCCBD1', fontSize: 9.5, marginTop: 3 },
  label: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 }, nameField: { height: 50, borderRadius: 16, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, nameInput: { flex: 1, height: '100%', color: colors.primary, fontFamily: typography.serif, fontSize: 13 }, sectionTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 17, marginTop: 18, marginBottom: 9 }, tiers: { flexDirection: 'row', padding: 4, borderRadius: 18, backgroundColor: colors.surfaceMuted }, tier: { flex: 1, minHeight: 37, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, tierActive: { backgroundColor: colors.primary }, tierText: { color: colors.textSecondary, fontSize: 10 }, tierTextActive: { color: colors.textInverse, fontWeight: '700' }, serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, service: { width: '31.7%', minHeight: 86, padding: 9, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight }, serviceActive: { borderColor: colors.goldDark }, serviceIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight }, serviceIconActive: { backgroundColor: colors.primary }, serviceLabel: { color: colors.textPrimary, fontSize: 9.5, marginTop: 6 }, check: { position: 'absolute', right: 7, top: 7, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldDark },
  pricing: { marginTop: 18, padding: 15 }, pricingTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, pricingLabel: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 }, price: { color: colors.primary, fontFamily: typography.serif, fontSize: 24, marginTop: 3 }, confidence: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 11, backgroundColor: '#E2F0E8' }, confidenceText: { color: colors.success, fontSize: 8, fontWeight: '700' }, allocation: { flexDirection: 'row', alignItems: 'center', paddingTop: 9 }, dot: { width: 7, height: 7, borderRadius: 4 }, allocationName: { flex: 1, color: colors.textSecondary, fontSize: 9.5, marginLeft: 7 }, allocationPrice: { color: colors.textPrimary, fontSize: 9.5, fontWeight: '700' }, pricingNote: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, padding: 10, borderRadius: 13, backgroundColor: colors.goldLight }, pricingNoteText: { flex: 1, color: colors.textSecondary, fontSize: 8.5, lineHeight: 13 }, cta: { marginTop: 16 },
});
