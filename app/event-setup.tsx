import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Check, ChevronDown, IndianRupee, MapPin, Sparkles, Users } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

const eventTypes = ['Wedding', 'Engagement', 'Sangeet', 'Reception'];
const themes = ['Royal Heritage', 'Modern Romance', 'Garden Floral', 'Classic Indian'];

export default function EventSetupScreen() {
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState('Wedding');
  const [theme, setTheme] = useState('Royal Heritage');
  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Create Your Event" subtitle="Let’s bring your vision to life." />
      <View style={styles.steps}>
        {['Details', 'Preferences', 'Review'].map((label, index) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepCircle, index <= step && styles.stepCircleActive]}>
              {index < step ? <Check size={12} color="#FFFFFF" /> : <Text style={[styles.stepNumber, index <= step && styles.stepNumberActive]}>{index + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, index === step && styles.stepLabelActive]}>{label}</Text>
            {index < 2 ? <View style={[styles.stepLine, index < step && styles.stepLineActive]} /> : null}
          </View>
        ))}
      </View>

      {step === 0 ? (
        <View>
          <Text style={styles.prompt}>What are you planning?</Text>
          <View style={styles.chipRow}>{eventTypes.map((item) => <Choice key={item} label={item} active={eventType === item} onPress={() => setEventType(item)} />)}</View>
          <Field icon={CalendarDays} label="Event date" value="Saturday, 14 February 2027" />
          <Field icon={MapPin} label="City" value="Jaipur, Rajasthan" />
          <Field icon={Users} label="Expected guests" value="250 guests" />
          <Field icon={IndianRupee} label="Budget range" value="₹20,00,000 – ₹30,00,000" />
        </View>
      ) : step === 1 ? (
        <View>
          <Text style={styles.prompt}>Choose the feeling</Text>
          <Text style={styles.helper}>Select a visual direction. You can refine every detail later.</Text>
          <View style={styles.themeGrid}>{themes.map((item, index) => <ThemeCard key={item} label={item} index={index} active={theme === item} onPress={() => setTheme(item)} />)}</View>
          <Text style={styles.prompt}>What matters most?</Text>
          <View style={styles.chipRow}>{['Venue', 'Food', 'Decor', 'Photography', 'Entertainment'].map((item, index) => <Choice key={item} label={item} active={index < 3} />)}</View>
        </View>
      ) : (
        <View>
          <LuxuryCard style={styles.reviewCard}>
            <View style={styles.reviewIcon}><Sparkles size={24} color={colors.goldDark} /></View>
            <Text style={styles.reviewTitle}>Meera & Arjun’s Wedding</Text>
            <Text style={styles.reviewSubtitle}>{theme} · Jaipur</Text>
            <View style={styles.reviewDivider} />
            <ReviewRow label="Celebration" value={eventType} />
            <ReviewRow label="Date" value="14 Feb 2027" />
            <ReviewRow label="Guests" value="250" />
            <ReviewRow label="Budget" value="₹20L – ₹30L" />
            <ReviewRow label="Priorities" value="Venue, Food, Decor" />
          </LuxuryCard>
          <View style={styles.insightCard}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={styles.insightText}>Vellure will create a tailored checklist, budget plan, and verified partner shortlist for you.</Text>
          </View>
        </View>
      )}

      <PrimaryPill
        label={step === 2 ? 'Create My Event' : step === 1 ? 'Review Event' : 'Continue to Preferences'}
        style={styles.continue}
        onPress={() => step === 2 ? router.replace('/event-created') : setStep(step + 1)}
      />
    </LuxuryScreen>
  );
}

function Choice({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return <VellureButton style={[styles.choice, active && styles.choiceActive]} onPress={onPress}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text></VellureButton>;
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <VellureButton style={styles.field}>
      <View style={styles.fieldIcon}><Icon size={19} color={colors.primary} /></View>
      <View style={styles.fieldCopy}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.fieldValue}>{value}</Text></View>
      <ChevronDown size={16} color={colors.textMuted} />
    </VellureButton>
  );
}

function ThemeCard({ label, index, active, onPress }: { label: string; index: number; active: boolean; onPress: () => void }) {
  const fills = ['#D9BEB9', '#E8DAD4', '#D7C6B1', '#C9ADB4'];
  return (
    <VellureButton style={[styles.themeCard, active && styles.themeCardActive]} onPress={onPress}>
      <View style={[styles.themeArt, { backgroundColor: fills[index] }]}><View style={styles.themeArch} /><Sparkles size={18} color={colors.primary} /></View>
      <Text style={styles.themeLabel}>{label}</Text>
      {active ? <View style={styles.themeCheck}><Check size={11} color="#FFFFFF" /></View> : null}
    </VellureButton>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', marginBottom: 22, paddingHorizontal: 12 },
  stepItem: { flex: 1, alignItems: 'center' },
  stepCircle: { width: 27, height: 27, borderRadius: 14, zIndex: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderMedium },
  stepCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNumber: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  stepNumberActive: { color: colors.textInverse },
  stepLabel: { color: colors.textMuted, fontSize: 8.5, marginTop: 5 },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  stepLine: { position: 'absolute', left: '65%', top: 13, width: '70%', height: 1, backgroundColor: colors.borderMedium },
  stepLineActive: { backgroundColor: colors.primary },
  prompt: { color: colors.textPrimary, fontFamily: typography.serif, fontSize: 17, marginBottom: 10, marginTop: 5 },
  helper: { color: colors.textSecondary, fontSize: 10.5, lineHeight: 16, marginTop: -5, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  choice: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  choiceActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.textSecondary, fontSize: 10.5, fontWeight: '600' },
  choiceTextActive: { color: colors.textInverse },
  field: { minHeight: 65, borderRadius: 17, marginBottom: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  fieldIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight },
  fieldCopy: { flex: 1 },
  fieldLabel: { color: colors.textMuted, fontSize: 9 },
  fieldValue: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '600', marginTop: 3 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  themeCard: { width: '48.6%', overflow: 'hidden', borderRadius: 17, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  themeCardActive: { borderColor: colors.goldDark, borderWidth: 1.5 },
  themeArt: { height: 83, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  themeArch: { position: 'absolute', width: 68, height: 75, bottom: -20, borderTopLeftRadius: 35, borderTopRightRadius: 35, backgroundColor: 'rgba(255,253,252,0.45)' },
  themeLabel: { color: colors.primary, fontFamily: typography.serif, fontSize: 12.5, padding: 10 },
  themeCheck: { position: 'absolute', right: 8, top: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  reviewCard: { padding: 18, alignItems: 'center' },
  reviewIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldLight },
  reviewTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 20, marginTop: 10 },
  reviewSubtitle: { color: colors.textSecondary, fontSize: 10.5, marginTop: 3 },
  reviewDivider: { width: '100%', height: 1, backgroundColor: colors.borderLight, marginVertical: 15 },
  reviewRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  reviewLabel: { color: colors.textSecondary, fontSize: 10.5 },
  reviewValue: { color: colors.textPrimary, fontSize: 10.5, fontWeight: '700' },
  insightCard: { marginTop: 12, padding: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.blushLight },
  insightText: { flex: 1, color: colors.textSecondary, fontSize: 10.5, lineHeight: 16 },
  continue: { marginTop: 18, marginBottom: 6 },
});
