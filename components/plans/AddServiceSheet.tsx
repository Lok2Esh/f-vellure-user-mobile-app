import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Plus, Search, Check, Sparkles } from 'lucide-react-native';
import { PlanServiceRequirement } from '../../services/api';
import { colors } from '../../constants/theme';
import { VellureInputField, VellureSearchInput } from '../ui/VellureInputField';

interface AddServiceSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddService: (service: {
    categoryName: string;
    categoryKey: string;
    requirement: PlanServiceRequirement;
    allocatedBudget: number;
    notes?: string;
  }) => void;
}

const AVAILABLE_CATEGORIES = [
  { name: 'Grand Venue & Lawns', key: 'venue', defaultBudget: 800000 },
  { name: 'Artisanal Feast & Catering', key: 'catering', defaultBudget: 500000 },
  { name: 'Bespoke Decor & Lighting', key: 'decor', defaultBudget: 350000 },
  { name: 'Cinematic Photography & Film', key: 'photography', defaultBudget: 250000 },
  { name: 'Bridal Makeup & Styling', key: 'makeup', defaultBudget: 100000 },
  { name: 'DJ & Sound Production', key: 'entertainment_dj', defaultBudget: 120000 },
  { name: 'Live Band & Folk Troupe', key: 'entertainment_live', defaultBudget: 150000 },
  { name: 'Dhol & Royal Welcome', key: 'entertainment_dhol', defaultBudget: 40000 },
  { name: 'Pandit Ji / Religious Officiant', key: 'priest', defaultBudget: 30000 },
  { name: 'Guest Transport & Luxury Cars', key: 'transport', defaultBudget: 100000 },
  { name: 'Guest Accommodation / Rooms', key: 'accommodation', defaultBudget: 200000 },
  { name: 'Designer Invitations & Stationery', key: 'invitations', defaultBudget: 40000 },
  { name: 'Custom Service / Misc', key: 'custom', defaultBudget: 50000 },
];

export function AddServiceSheet({ visible, onClose, onAddService }: AddServiceSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(AVAILABLE_CATEGORIES[0]);
  const [customName, setCustomName] = useState('');
  const [requirement, setRequirement] = useState<PlanServiceRequirement>('REQUIRED');
  const [budget, setBudget] = useState('350000');
  const [notes, setNotes] = useState('');

  const filteredCategories = AVAILABLE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleConfirm = () => {
    const finalName =
      selectedCategory.key === 'custom' && customName.trim()
        ? customName.trim()
        : selectedCategory.name;

    const numericBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10) || 50000;

    onAddService({
      categoryName: finalName,
      categoryKey: selectedCategory.key,
      requirement,
      allocatedBudget: numericBudget,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Service to Plan</Text>
              <Text style={styles.subtitle}>Select celebration service & allocate budget</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Search */}
            <VellureSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search service categories..."
              containerStyle={{ marginBottom: 12 }}
            />

            {/* Categories List */}
            <Text style={styles.inputLabel}>Choose Category</Text>
            <View style={styles.catGrid}>
              {filteredCategories.map((c) => {
                const isSelected = selectedCategory.key === c.key;
                return (
                  <VellureButton
                    key={c.key}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => {
                      setSelectedCategory(c);
                      setBudget(String(c.defaultBudget));
                    }}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {c.name}
                    </Text>
                  </VellureButton>
                );
              })}
            </View>

            {selectedCategory.key === 'custom' && (
              <View style={{ marginTop: 8 }}>
                <VellureInputField
                  label="Custom Service Name"
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="e.g. Drone Light Show / Fireworks"
                />
              </View>
            )}

            {/* Requirement Level */}
            <Text style={styles.inputLabel}>Requirement Priority</Text>
            <View style={styles.reqRow}>
              {(['REQUIRED', 'RECOMMENDED', 'OPTIONAL'] as const).map((r) => {
                const isSelected = requirement === r;
                return (
                  <VellureButton
                    key={r}
                    style={[styles.reqPill, isSelected && styles.reqPillActive]}
                    onPress={() => setRequirement(r)}
                  >
                    <Text style={[styles.reqPillText, isSelected && styles.reqPillTextActive]}>
                      {r}
                    </Text>
                  </VellureButton>
                );
              })}
            </View>

            {/* Budget */}
            <VellureInputField
              label="Allocated Budget (₹)"
              value={budget}
              onChangeText={setBudget}
              keyboardType="number-pad"
              placeholder="350000"
            />

            {/* Notes */}
            <VellureInputField
              label="Special Requirements / Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              placeholder="e.g. Needs pure vegetarian setup, outdoor lawn coverage..."
            />

            <VellureButton style={styles.addBtn} onPress={handleConfirm} activeOpacity={0.88}>
              <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add Service to Plan</Text>
            </VellureButton>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#641E3D',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingBottom: 28,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 10,
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
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 5,
    marginTop: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catChipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  catChipText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  reqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reqPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  reqPillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  reqPillText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '800',
  },
  reqPillTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    color: '#2D2025',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  descInput: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#2D2025',
    minHeight: 56,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
    marginTop: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
