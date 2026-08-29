import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import { View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Calendar,
  Users,
  IndianRupee,
  ChevronRight,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Sparkles,
  ArrowRight,
  Store,
  FolderKanban,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { EventPlan, formatPlanStatus } from '../../services/api';
import { colors } from '../../constants/theme';

interface PlanCardProps {
  plan: EventPlan;
  onOpenPlan: () => void;
  onDuplicatePlan: () => void;
  onArchivePlan: () => void;
  onDeletePlan: () => void;
}

export function PlanCard({
  plan,
  onOpenPlan,
  onDuplicatePlan,
  onArchivePlan,
  onDeletePlan,
}: PlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusBadge = formatPlanStatus(plan.status);
  const budgetFormatted = `₹${(plan.budgetMin / 100000).toFixed(1)}L – ₹${(plan.budgetMax / 100000).toFixed(1)}L`;

  const handleConfirmDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      'Delete Plan Draft',
      `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDeletePlan },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
            <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
          <Text style={styles.typeText}>• {plan.eventType}</Text>
        </View>

        <VellureButton
          style={styles.moreBtn}
          onPress={() => setMenuOpen(!menuOpen)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="More plan actions"
        >
          <MoreVertical size={16} color="#8A7A70" />
        </VellureButton>
      </View>

      {/* Overflow Menu */}
      {menuOpen && (
        <View style={styles.menuDropdown}>
          <VellureButton
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              onDuplicatePlan();
            }}
          >
            <Copy size={13} color="#641E3D" />
            <Text style={styles.menuItemText}>Duplicate Plan Structure</Text>
          </VellureButton>

          {plan.status !== 'ARCHIVED' && (
            <VellureButton
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                onArchivePlan();
              }}
            >
              <Archive size={13} color="#641E3D" />
              <Text style={styles.menuItemText}>Archive Plan</Text>
            </VellureButton>
          )}

          <VellureButton
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleConfirmDelete}
          >
            <Trash2 size={13} color="#B63A4A" />
            <Text style={[styles.menuItemText, { color: '#B63A4A' }]}>Delete Plan</Text>
          </VellureButton>
        </View>
      )}

      {/* Title & Metadata */}
      <Text style={styles.titleText}>{plan.name}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={11} color="#8A7A70" />
          <Text style={styles.metaText}>{plan.eventDate || 'Date flexible'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Users size={11} color="#8A7A70" />
          <Text style={styles.metaText}>{plan.guestCount} Guests</Text>
        </View>
        <View style={styles.metaItem}>
          <IndianRupee size={11} color="#8A7A70" />
          <Text style={styles.metaText}>{budgetFormatted}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{plan.progress}% Complete</Text>
        <Text style={styles.countsText}>
          {plan.servicesCount} Services • {plan.enquiriesCount} Enquiries • {plan.quotesCount} Quotes
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${plan.progress}%` }]} />
      </View>

      {/* Bottom CTA Buttons Row */}
      <View style={styles.cardActionsRow}>
        <VellureButton
          style={styles.findVendorsBtn}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/vendors',
              params: { city: plan.city },
            })
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Find partners for this plan"
        >
          <Store size={12} color="#641E3D" />
          <Text style={styles.findVendorsBtnText}>Find Partners</Text>
        </VellureButton>

        <VellureButton
          style={styles.openBtn}
          onPress={onOpenPlan}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open workspace"
        >
          <FolderKanban size={13} color="#641E3D" />
          <Text style={styles.openBtnText}>Open Workspace</Text>
          <ArrowRight size={12} color="#641E3D" />
        </VellureButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  typeText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  moreBtn: {
    padding: 4,
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 100,
    paddingVertical: 4,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  menuItemText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '700',
  },
  titleText: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    color: '#2F7D62',
    fontSize: 10,
    fontWeight: '800',
  },
  countsText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#FAF5EC',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#641E3D',
    borderRadius: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  findVendorsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5,
  },
  findVendorsBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  openBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF1E3',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5,
  },
  openBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
  },
});
