import {
  VellureButton,
  VellureFieldTrigger,
} from "@/components/ui/VellureControls";
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { VellureSearchInput } from './VellureInputField';

interface FormDropdownProps {
  label: string;
  icon?: React.ReactNode;
  width?: string | number;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function FormDropdown({
  label,
  icon,
  width = '100%',
  value,
  options,
  onChange,
  placeholder = 'Select...',
  searchable,
  searchPlaceholder,
}: FormDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSearchEnabled = searchable ?? options.length >= 6;

  const filteredOptions = React.useMemo(() => {
    if (!isSearchEnabled || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, isSearchEnabled, searchQuery]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearchQuery('');
    setModalVisible(false);
  };

  const handleOpen = () => {
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleClose = () => {
    setSearchQuery('');
    setModalVisible(false);
  };

  return (
    <View style={{ width: width as any }}>
      {/* Label & Icon */}
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.labelText}>
          {label}
        </Text>
      </View>

      {/* Dropdown Trigger Field */}
      <VellureFieldTrigger
        value={value}
        placeholder={placeholder}
        kind="dropdown"
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityLabel={`${label}: ${value || placeholder}`}
      />

      {/* Selection Modal Sheet - Renders above all views, modals, and scrollviews */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleClose}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                {icon}
                <Text style={styles.modalTitle}>{label}</Text>
              </View>
              <VellureButton
                style={styles.closeBtn}
                onPress={handleClose}
                accessibilityLabel="Close options"
              >
                <X size={18} color="#641E3D" />
              </VellureButton>
            </View>

            {/* Search Input */}
            {isSearchEnabled && (
              <View style={styles.searchWrap}>
                <VellureSearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
                  size="compact"
                />
              </View>
            )}

            {/* Options List */}
            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredOptions.length === 0 ? (
                <View style={styles.emptyOptions}>
                  <Text style={styles.emptyOptionsText}>No matches found</Text>
                </View>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = value === opt;
                  return (
                    <VellureButton
                      key={opt}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                        idx === filteredOptions.length - 1 && styles.optionItemLast,
                      ]}
                      onPress={() => handleSelect(opt)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkWrap}>
                          <Check size={14} color="#641E3D" strokeWidth={2.5} />
                        </View>
                      )}
                    </VellureButton>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 2,
    gap: 4,
  },
  labelText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DB',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    color: '#2A121E',
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECE1',
    marginBottom: 6,
  },
  emptyOptions: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOptionsText: {
    color: '#8D7F85',
    fontSize: 13,
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: 320,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EC',
    borderRadius: 12,
    marginVertical: 2,
  },
  optionItemSelected: {
    backgroundColor: '#FAF5EC',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    color: '#4A3E44',
    fontSize: 13.5,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#641E3D',
    fontWeight: '900',
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4D58D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
