import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Sliders,
  Store,
  FileText,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { EventPlan, formatPlanStatus } from '../../services/api';
import { colors } from '../../constants/theme';

interface ActivePlanHeroProps {
  plan: EventPlan;
  onResumePress: () => void;
  onViewDetailsPress: () => void;
}

export function ActivePlanHero({
  plan,
  onResumePress,
  onViewDetailsPress,
}: ActivePlanHeroProps) {
  const statusBadge = formatPlanStatus(plan.status);
  const budgetFormatted = `₹${(plan.budgetMin / 100000).toFixed(1)}L – ₹${(plan.budgetMax / 100000).toFixed(1)}L`;

  return (
    <View style={styles.card}>
      {/* Top Badge & Progress */}
      <View style={styles.headerRow}>
        <View style={styles.primaryBadge}>
          <Sparkles size={11} color="#D2AD6B" />
          <Text style={styles.primaryBadgeText}>Primary Active Blueprint</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      <Text style={styles.titleText}>{plan.name}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{plan.eventDate || 'Flexible Date'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Users size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{plan.guestCount} Guests</Text>
        </View>
        <View style={styles.metaItem}>
          <IndianRupee size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{budgetFormatted}</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Planning Progress</Text>
        <Text style={styles.progressValue}>{plan.progress}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(10, plan.progress)}%` }]} />
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCol}>
          <Text style={styles.metricNum}>{plan.servicesCount}</Text>
          <Text style={styles.metricText}>Services</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricNum}>{plan.enquiriesCount}</Text>
          <Text style={styles.metricText}>Enquiries</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricNum}>{plan.quotesCount}</Text>
          <Text style={styles.metricText}>Quotes</Text>
        </View>
      </View>

      {/* Next Step Box */}
      <View style={styles.nextStepBox}>
        <CheckCircle2 size={13} color="#34D399" />
        <Text style={styles.nextStepText} numberOfLines={1}>
          Next: {plan.nextRecommendedStep}
        </Text>
      </View>

      {/* Quick Action Buttons Row 1: Secondary Utilities */}
      <View style={styles.secondaryActionsRow}>
        <TouchableOpacity
          style={styles.secUtilityBtn}
          onPress={() => router.push('/(tabs)/budget')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Edit AI Budget"
        >
          <Sliders size={13} color="#641E3D" />
          <Text style={styles.secUtilityBtnText}>Edit AI Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secUtilityBtn}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/vendors',
              params: { city: plan.city },
            })
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Find More Vendors"
        >
          <Store size={13} color="#641E3D" />
          <Text style={styles.secUtilityBtnText}>Find Vendors</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Action Buttons Row 2 */}
      <View style={styles.primaryActionsRow}>
        <TouchableOpacity
          style={styles.workspaceBtn}
          onPress={onViewDetailsPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open plan workspace details"
        >
          <FolderKanban size={14} color="#641E3D" />
          <Text style={styles.workspaceBtnText}>View Workspace</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resumeBtn}
          onPress={onResumePress}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Resume planning with AI"
        >
          <Text style={styles.resumeBtnText}>Resume Plan</Text>
          <ArrowRight size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A121E',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#4A2333',
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#2A121E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 173, 107, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(210, 173, 107, 0.35)',
  },
  primaryBadgeText: {
    color: '#F4D374',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#D4C6CE',
    fontSize: 11,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#D4C6CE',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressValue: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '900',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D2AD6B',
    borderRadius: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricNum: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  metricText: {
    color: '#D4C6CE',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextStepText: {
    color: '#F4ECEF',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  secUtilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  secUtilityBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  workspaceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF1E3',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  workspaceBtnText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  resumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
