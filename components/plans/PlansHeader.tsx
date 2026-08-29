import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
} from 'react-native';
import { Plus, SlidersHorizontal } from 'lucide-react-native';
import { colors } from '../../constants/theme';
import { VellureSearchInput } from '../ui/VellureInputField';

interface PlansHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewPlanPress: () => void;
  onFilterPress?: () => void;
}

export function PlansHeader({
  searchQuery,
  onSearchChange,
  onNewPlanPress,
  onFilterPress,
}: PlansHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.subtitle}>Planning Workspace</Text>
          <Text style={styles.title}>My Event Plans</Text>
        </View>

        <VellureButton
          style={styles.newPlanBtn}
          onPress={onNewPlanPress}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Create a new event plan"
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.newPlanBtnText}>New Plan</Text>
        </VellureButton>
      </View>

      <Text style={styles.description}>
        Plan, compare, and coordinate every part of your celebration.
      </Text>

      {/* Search & Filter Bar */}
      <View style={styles.searchRow}>
        <VellureSearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search plans by name, city, or event type..."
        />

        {onFilterPress && (
          <VellureButton
            style={styles.filterBtn}
            onPress={onFilterPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Filter plans"
          >
            <SlidersHorizontal size={16} color="#641E3D" />
          </VellureButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    backgroundColor: '#FDFBF7',
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    color: '#641E3D',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  newPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  newPlanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  description: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '600',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
});
