import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft, Bell, ChevronRight, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, shadows, typography } from '../../constants/theme';
import { VellureButton } from './VellureControls';

export const luxury = {
  colors,
  serif: typography.serif,
  sans: typography.sans,
};

export function LuxuryScreen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.wordmarkRow}>
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>Vellure</Text>
      <Sparkles size={compact ? 13 : 16} color={colors.goldDark} strokeWidth={1.5} />
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {back ? (
          <VellureButton style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.7} />
          </VellureButton>
        ) : (
          <BrandWordmark compact />
        )}
        {right || <View style={styles.iconButtonPlaceholder} />}
      </View>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function NotificationButton() {
  return (
    <VellureButton style={styles.iconButton} accessibilityLabel="Notifications">
      <Bell size={19} color={colors.primary} strokeWidth={1.7} />
      <View style={styles.notificationDot} />
    </VellureButton>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <VellureButton style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </VellureButton>
      ) : null}
    </View>
  );
}

export function LuxuryCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryPill({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <VellureButton style={[styles.primaryPill, style]} onPress={onPress}>
      <Text style={styles.primaryPillText}>{label}</Text>
      {icon || <ChevronRight size={17} color={colors.textInverse} />}
    </VellureButton>
  );
}

export function ProgressBar({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.progressTrack, style]}>
      <View style={[styles.progressFill, { width: `${safeValue}%` }]} />
    </View>
  );
}

export function SerifText({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.serifText, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 18 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  wordmark: { color: colors.primary, fontFamily: typography.serif, fontSize: 31, letterSpacing: -1 },
  wordmarkCompact: { fontSize: 25 },
  header: { paddingTop: Platform.OS === 'android' ? 14 : 8, paddingBottom: 18 },
  headerTop: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconButtonPlaceholder: { width: 40, height: 40 },
  notificationDot: { position: 'absolute', right: 9, top: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.goldDark, borderWidth: 1, borderColor: colors.cream },
  pageTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 28, lineHeight: 34, textAlign: 'center', letterSpacing: -0.5 },
  pageSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 11 },
  sectionTitle: { color: colors.textPrimary, fontFamily: typography.serif, fontSize: 18, lineHeight: 23 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 5 },
  sectionActionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: colors.surfaceCard, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, ...shadows.subtle },
  primaryPill: { minHeight: 50, borderRadius: 25, paddingHorizontal: 22, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, ...shadows.subtle },
  primaryPillText: { color: colors.textInverse, fontFamily: typography.serif, fontSize: 16 },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  serifText: { color: colors.primary, fontFamily: typography.serif },
});
