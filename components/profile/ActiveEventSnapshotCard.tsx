import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
} from 'react-native';
import { Sparkles, Calendar, Users, IndianRupee, ArrowRight, CheckCircle2, Wand2 } from 'lucide-react-native';
import { ActiveEventPlan } from '../../services/api';
import { colors } from '../../constants/theme';

interface ActiveEventSnapshotCardProps {
  plan: ActiveEventPlan | null;
  onResumePlan: () => void;
  onViewDetails: () => void;
  onPlanNew: () => void;
}

export function ActiveEventSnapshotCard({
  plan,
  onResumePlan,
  onViewDetails,
  onPlanNew,
}: ActiveEventSnapshotCardProps) {
  if (!plan) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconWrap}>
          <Sparkles size={20} color="#D2AD6B" />
        </View>
        <Text style={styles.emptyTitle}>Start Planning Something Memorable</Text>
        <Text style={styles.emptySub}>
          Use our conversational AI planner to estimate budget and discover verified local partners.
        </Text>
        <VellureButton
          style={styles.emptyActionBtn}
          onPress={onPlanNew}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Start planning with AI"
        >
          <Wand2 size={14} color="#FFFFFF" />
          <Text style={styles.emptyActionBtnText}>Plan with AI</Text>
        </VellureButton>
      </View>
    );
  }

  const budgetLabel = `₹${plan.budgetMin.toLocaleString('en-IN')} – ₹${plan.budgetMax.toLocaleString('en-IN')}`;

  return (
    <View style={styles.card}>
      {/* Top Badge & Progress */}
      <View style={styles.headerRow}>
        <View style={styles.liveBadge}>
          <Sparkles size={11} color="#D2AD6B" />
          <Text style={styles.liveBadgeText}>Active Celebration</Text>
        </View>
        <Text style={styles.progressText}>{plan.completionPercentage}% Planned</Text>
      </View>

      {/* Title & Metadata */}
      <Text style={styles.titleText}>{plan.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{plan.date || 'Flexible Date'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Users size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{plan.guestCount} Guests</Text>
        </View>
        <View style={styles.metaItem}>
          <IndianRupee size={12} color="#D4C6CE" />
          <Text style={styles.metaText}>{budgetLabel}</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(10, plan.completionPercentage)}%` },
          ]}
        />
      </View>

      {/* Next Step Recommendation */}
      <View style={styles.nextStepBox}>
        <CheckCircle2 size={13} color="#34D399" />
        <Text style={styles.nextStepText} numberOfLines={1}>
          Next: {plan.nextRecommendedStep}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <VellureButton
          style={styles.detailsBtn}
          onPress={onViewDetails}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="View celebration details"
        >
          <Text style={styles.detailsBtnText}>View Details</Text>
        </VellureButton>

        <VellureButton
          style={styles.resumeBtn}
          onPress={onResumePlan}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Resume planning with AI"
        >
          <Text style={styles.resumeBtnText}>Resume Plan</Text>
          <ArrowRight size={13} color="#FFFFFF" />
        </VellureButton>
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
    marginBottom: 16,
    shadowColor: '#2A121E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liveBadge: {
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
  liveBadgeText: {
    color: '#F4D374',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '900',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.2,
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
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF1E3',
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailsBtnText: {
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
    paddingVertical: 10,
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 16,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF2E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    color: '#786B70',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
