import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  X,
  Sparkles,
  Check,
  PartyPopper,
  Heart,
  Calendar,
  Plus,
} from 'lucide-react-native';
import { VellureButton } from '@/components/ui/VellureControls';
import { VellureSearchInput } from './VellureInputField';
import { EVENT_TYPE_OPTIONS } from '../../constants/eventTypes';

export interface CelebrationTypePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (celebrationType: string) => void;
  selectedType?: string;
  options?: readonly string[];
}

interface CelebrationCategory {
  name: string;
  types: string[];
}

const CELEBRATION_CATEGORIES: CelebrationCategory[] = [
  {
    name: 'Weddings & Nuptials',
    types: [
      'Wedding',
      'Engagement',
      'Reception',
      'Roka / Ring Ceremony',
      'Sangeet & Mehendi',
      'Haldi',
      'Bridal Shower',
    ],
  },
  {
    name: 'Milestones & Birthdays',
    types: [
      'Birthday',
      'Anniversary',
      'Baby Shower',
      'Naming Ceremony',
      'Retirement Party',
    ],
  },
  {
    name: 'Spiritual & Traditional',
    types: [
      'Puja & Path',
      'Ramayan Path',
      'Akhand Path',
      'Sukhmani Sahib Path',
      'Kirtan / Jagran',
      'Nikah',
      'Walima',
      'Christian Wedding',
      'Baptism / Communion',
      'Festival Celebration',
      'Prayer Meeting',
    ],
  },
  {
    name: 'Parties & Social',
    types: ['Cocktail Party', 'Private Party', 'Housewarming'],
  },
  {
    name: 'Corporate & Formal',
    types: [
      'Corporate Event',
      'Conference / Seminar',
      'Product Launch',
      'Other',
    ],
  },
];

const POPULAR_QUICK_PICKS = [
  'Wedding',
  'Birthday',
  'Engagement',
  'Sangeet & Mehendi',
  'Anniversary',
  'Puja & Path',
  'Cocktail Party',
];

export function CelebrationTypePickerModal({
  visible,
  onClose,
  onSelect,
  selectedType = '',
  options = EVENT_TYPE_OPTIONS,
}: CelebrationTypePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Filtered list
  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return null;
    return options.filter((opt) => opt.toLowerCase().includes(trimmedQuery));
  }, [options, trimmedQuery]);

  const hasExactMatch = useMemo(() => {
    if (!trimmedQuery) return true;
    return options.some((opt) => opt.toLowerCase() === trimmedQuery);
  }, [options, trimmedQuery]);

  const handleSelect = (item: string) => {
    setSearchQuery('');
    onSelect(item);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconWrap}>
                <Sparkles size={16} color="#641E3D" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Select Celebration Type</Text>
                <Text style={styles.headerSubtitle}>
                  Choose or search for your event type
                </Text>
              </View>
            </View>

            <VellureButton
              style={styles.closeBtn}
              onPress={handleClose}
              accessibilityLabel="Close celebration type picker"
            >
              <X size={18} color="#641E3D" />
            </VellureButton>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <VellureSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search celebration type (e.g. Wedding, Birthday)..."
            />
          </View>

          {/* Quick Picks (Only shown when not searching) */}
          {!trimmedQuery && (
            <View style={styles.quickPicksWrap}>
              <Text style={styles.sectionHeaderLabel}>POPULAR CELEBRATIONS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickPillsRow}
              >
                {POPULAR_QUICK_PICKS.map((pick) => {
                  const isSelected =
                    selectedType.toLowerCase() === pick.toLowerCase();
                  return (
                    <VellureButton
                      key={pick}
                      style={[
                        styles.quickPill,
                        isSelected && styles.quickPillActive,
                      ]}
                      onPress={() => handleSelect(pick)}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          isSelected && styles.quickPillTextActive,
                        ]}
                      >
                        {pick}
                      </Text>
                    </VellureButton>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* List Content */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          >
            {/* Search Results Mode */}
            {filteredOptions !== null ? (
              <View>
                <View style={styles.resultsCountRow}>
                  <Text style={styles.sectionHeaderLabel}>
                    MATCHING CELEBRATIONS ({filteredOptions.length})
                  </Text>
                </View>

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const isSelected =
                      selectedType.toLowerCase() === opt.toLowerCase();
                    return (
                      <VellureButton
                        key={opt}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemActive,
                        ]}
                        onPress={() => handleSelect(opt)}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.optionDot,
                              isSelected && styles.optionDotActive,
                            ]}
                          />
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextActive,
                            ]}
                          >
                            {opt}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={styles.checkWrap}>
                            <Check size={14} color="#641E3D" strokeWidth={2.5} />
                          </View>
                        )}
                      </VellureButton>
                    );
                  })
                ) : (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>
                      No celebration found matching "{searchQuery}"
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      You can add it directly as a custom celebration type below.
                    </Text>
                  </View>
                )}

                {/* Allow Custom Celebration Name if not exactly matching */}
                {!hasExactMatch && trimmedQuery.length > 1 && (
                  <VellureButton
                    style={styles.customAddBtn}
                    onPress={() => handleSelect(searchQuery.trim())}
                  >
                    <Plus size={16} color="#641E3D" strokeWidth={2.2} />
                    <Text style={styles.customAddBtnText}>
                      Use "{searchQuery.trim()}" as Celebration Type
                    </Text>
                  </VellureButton>
                )}
              </View>
            ) : (
              /* Categorized Groups Mode */
              CELEBRATION_CATEGORIES.map((category) => (
                <View key={category.name} style={styles.categoryBlock}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                  </View>

                  <View style={styles.categoryItemsGrid}>
                    {category.types.map((type) => {
                      const isSelected =
                        selectedType.toLowerCase() === type.toLowerCase();
                      return (
                        <VellureButton
                          key={type}
                          style={[
                            styles.optionItem,
                            isSelected && styles.optionItemActive,
                          ]}
                          onPress={() => handleSelect(type)}
                        >
                          <View style={styles.optionLeft}>
                            <View
                              style={[
                                styles.optionDot,
                                isSelected && styles.optionDotActive,
                              ]}
                            />
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextActive,
                              ]}
                            >
                              {type}
                            </Text>
                          </View>

                          {isSelected && (
                            <View style={styles.checkWrap}>
                              <Check
                                size={14}
                                color="#641E3D"
                                strokeWidth={2.5}
                              />
                            </View>
                          )}
                        </VellureButton>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    minHeight: 480,
    borderTopWidth: 1,
    borderColor: '#EFE3CF',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E6DCCE',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECE1',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#2A121E',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    color: '#7D6F75',
    fontSize: 11.5,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  quickPicksWrap: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#D2AD6B',
    marginBottom: 8,
  },
  quickPillsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  quickPillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E44',
  },
  quickPillTextActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  categoryBlock: {
    marginBottom: 16,
  },
  categoryHeader: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECE1',
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#A4959B',
  },
  categoryItemsGrid: {
    gap: 2,
  },
  resultsCountRow: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginVertical: 2,
    backgroundColor: '#FFFFFF',
  },
  optionItemActive: {
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D7CEC7',
  },
  optionDotActive: {
    backgroundColor: '#D2AD6B',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#3B2D33',
    flex: 1,
  },
  optionTextActive: {
    color: '#641E3D',
    fontWeight: '800',
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4D58D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4A3E44',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8D7F85',
    textAlign: 'center',
  },
  customAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#D2AD6B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  customAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#641E3D',
  },
});
