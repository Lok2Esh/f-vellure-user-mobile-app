import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  Sparkles,
  MapPin,
  Users,
  IndianRupee,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { ParsedEventPlan } from '../../services/aiParser';
import { colors } from '../../constants/theme';

export interface AiInterpretationCardProps {
  plan: ParsedEventPlan;
  onEditPress: () => void;
  onServiceToggle?: (serviceName: string) => void;
}

export function AiInterpretationCard({
  plan,
  onEditPress,
  onServiceToggle,
}: AiInterpretationCardProps) {
  const budgetFormatted =
    plan.totalBudget >= 100000
      ? `₹${(plan.totalBudget / 100000).toFixed(1)} Lakh`
      : `₹${plan.totalBudget.toLocaleString('en-IN')}`;
  const perGuest = Math.round(plan.totalBudget / (plan.guestCount || 1));

  return (
    <View style={styles.card}>
      {/* Header Badge */}
      <View style={styles.topRow}>
        <View style={styles.aiBadge}>
          <Sparkles size={12} color="#D2AD6B" />
          <Text style={styles.aiBadgeText}>AI Event Blueprint Interpretation</Text>
        </View>

        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>
            Review event details
          </Text>
        </View>
      </View>

      {/* Main Event Title */}
      <Text style={styles.titleText}>
        {plan.theme} {plan.eventType}
      </Text>
      <Text style={styles.subtitleText}>
        Check the event details and service scope before using the allocations.
      </Text>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricTile}>
          <View style={styles.metricHeader}>
            <MapPin size={12} color="#D2AD6B" />
            <Text style={styles.metricLabel}>City</Text>
          </View>
          <Text style={styles.metricValue}>{plan.city}</Text>
        </View>

        <View style={styles.metricTile}>
          <View style={styles.metricHeader}>
            <Users size={12} color="#D2AD6B" />
            <Text style={styles.metricLabel}>Guests</Text>
          </View>
          <Text style={styles.metricValue}>{plan.guestCount}</Text>
        </View>

        <View style={styles.metricTile}>
          <View style={styles.metricHeader}>
            <IndianRupee size={12} color="#D2AD6B" />
            <Text style={styles.metricLabel}>Budget</Text>
          </View>
          <Text style={styles.metricValue}>{budgetFormatted}</Text>
        </View>

        <View style={styles.metricTile}>
          <View style={styles.metricHeader}>
            <Calendar size={12} color="#D2AD6B" />
            <Text style={styles.metricLabel}>Per Guest</Text>
          </View>
          <Text style={styles.metricValue}>₹{perGuest.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Extracted Service Tags */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionLabel}>Identified Service Requirements ({plan.requiredServices.length})</Text>
        <View style={styles.servicesWrap}>
          {plan.requiredServices.map((srv, idx) => (
            <VellureButton
              key={idx}
              style={styles.serviceChip}
              onPress={() => onServiceToggle && onServiceToggle(srv)}
              activeOpacity={0.75}
            >
              <CheckCircle2 size={11} color="#2F7D62" />
              <Text style={styles.serviceChipText}>{srv}</Text>
            </VellureButton>
          ))}
        </View>
      </View>

      {/* AI Assumptions & Transparent Guardrails */}
      {plan.assumptions.length > 0 && (
        <View style={styles.assumptionsBox}>
          <View style={styles.assumptionsHeader}>
            <Info size={12} color="#8A6A23" />
            <Text style={styles.assumptionsHeading}>AI Assumptions & Benchmarks</Text>
          </View>
          {plan.assumptions.map((ass, i) => (
            <Text key={i} style={styles.assumptionItem}>
              • {ass}
            </Text>
          ))}
        </View>
      )}

      {/* Edit Trigger CTA */}
      <VellureButton
        style={styles.editBar}
        onPress={onEditPress}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Edit AI interpretation parameters"
      >
        <View style={styles.editBarLeft}>
          <Sliders size={13} color="#641E3D" />
          <Text style={styles.editBarText}>Need to adjust dates, guests, or budget?</Text>
        </View>
        <View style={styles.editBtnPill}>
          <Text style={styles.editBtnPillText}>Edit Blueprint</Text>
          <ChevronRight size={12} color="#641E3D" />
        </View>
      </VellureButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  aiBadgeText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  confidencePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  titleText: {
    color: '#2D2025',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  subtitleText: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricTile: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  metricLabel: {
    color: '#8A7A70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '900',
  },
  servicesSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 5,
  },
  serviceChipText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '700',
  },
  assumptionsBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F7EFE2',
    marginBottom: 14,
  },
  assumptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  assumptionsHeading: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  assumptionItem: {
    color: '#786B70',
    fontSize: 10,
    lineHeight: 15,
  },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  editBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  editBarText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '700',
  },
  editBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  editBtnPillText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '900',
  },
});
