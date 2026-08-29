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
import { X, AlertTriangle, ShieldAlert, Check } from 'lucide-react-native';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';

interface ReportVendorModalProps {
  visible: boolean;
  onClose: () => void;
}

const ISSUE_CATEGORIES = [
  'Inaccurate Pricing or Hidden Fees',
  'Unresponsive to Consultation Requests',
  'Unprofessional Conduct or Communication',
  'Date Availability Misrepresentation',
  'Copyright or Portfolio Infringement',
  'Other Safety or Trust Concern',
];

export function ReportVendorModal({ visible, onClose }: ReportVendorModalProps) {
  const [vendorName, setVendorName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ISSUE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!vendorName.trim() || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please provide the vendor name and details of the issue.');
      return;
    }

    Alert.alert(
      'Confirm Submission',
      'Are you sure you wish to submit this report to Vellure Trust & Safety?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          onPress: () => {
            setIsSubmitting(true);
            setTimeout(() => {
              setIsSubmitting(false);
              Alert.alert(
                'Report Submitted',
                'Thank you for helping keep Vellure safe and transparent. Our Trust & Safety team will review this partner.'
              );
              setVendorName('');
              setDescription('');
              onClose();
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <ShieldAlert size={18} color="#B63A4A" />
              <Text style={styles.title}>Report a Vendor or Listing</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {/* Safety Notice */}
          <View style={styles.warningBox}>
            <AlertTriangle size={14} color="#B45309" />
            <Text style={styles.warningText}>
              For emergency situations, please contact local emergency authorities immediately.
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <VellureInputField
              label="Partner / Vendor Business Name"
              value={vendorName}
              onChangeText={setVendorName}
              placeholder="e.g. Fort Patiala or Studio Name"
            />

            <Text style={styles.inputLabel}>Issue Category</Text>
            <View style={styles.categoriesList}>
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <VellureButton
                    key={cat}
                    style={[styles.catOption, isSelected && styles.catOptionActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.catOptionText, isSelected && styles.catOptionTextActive]}>
                      {cat}
                    </Text>
                    {isSelected && <Check size={14} color="#641E3D" />}
                  </VellureButton>
                );
              })}
            </View>

            <VellureInputField
              label="Detailed Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Please describe what occurred, including dates and specific quotes or interactions..."
            />

            <VellureButton
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              <Text style={styles.submitBtnText}>Review & Submit Report</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  scroll: {
    paddingBottom: 28,
  },
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    color: '#2D2025',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 8,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  categoriesList: {
    gap: 6,
    marginBottom: 10,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catOptionActive: {
    borderColor: '#641E3D',
    backgroundColor: '#FAF1E3',
  },
  catOptionText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  catOptionTextActive: {
    color: '#641E3D',
    fontWeight: '800',
  },
  descInput: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#2D2025',
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  submitBtn: {
    backgroundColor: '#B63A4A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
