import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { VendorQuote } from '../../services/api';
import { colors } from '../../constants/theme';

interface QuoteComparisonModalProps {
  visible: boolean;
  quotes: VendorQuote[];
  onClose: () => void;
  onSelectPreferred: (quote: VendorQuote) => void;
}

export function QuoteComparisonModal({
  visible,
  quotes,
  onClose,
  onSelectPreferred,
}: QuoteComparisonModalProps) {
  if (quotes.length === 0) return null;

  const handleSelect = (quote: VendorQuote) => {
    Alert.alert(
      'Select Preferred Quote',
      `Set "${quote.vendorName}" (₹${quote.totalAmount.toLocaleString('en-IN')}) as your preferred partner for this service? Final arrangements will be confirmed directly with the vendor.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Preferred Choice',
          onPress: () => {
            onSelectPreferred(quote);
            onClose();
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
            <View>
              <Text style={styles.title}>Quotation Comparison</Text>
              <Text style={styles.subtitle}>Side-by-side benchmark & inclusion review</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.tableScroll}
          >
            {quotes.map((q) => {
              const isAccepted = q.status === 'ACCEPTED_BY_CUSTOMER';
              return (
                <View key={q.id} style={[styles.column, isAccepted && styles.columnAccepted]}>
                  {/* Top Vendor Card */}
                  <View style={styles.vendorHeader}>
                    {isAccepted && (
                      <View style={styles.preferredBadge}>
                        <CheckCircle2 size={10} color="#15803D" />
                        <Text style={styles.preferredBadgeText}>Preferred Choice</Text>
                      </View>
                    )}
                    <Text style={styles.vendorName} numberOfLines={1}>
                      {q.vendorName}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Star size={11} color="#D4AF37" fill="#D4AF37" />
                      <Text style={styles.ratingText}>{q.vendorRating.toFixed(1)}</Text>
                      <Text style={styles.cityText}>• {q.vendorCity}</Text>
                    </View>

                    <Text style={styles.totalPrice}>
                      ₹{q.totalAmount.toLocaleString('en-IN')}
                    </Text>
                    {q.priceUnit ? <Text style={styles.unitText}>{q.priceUnit}</Text> : null}
                  </View>

                  {/* Included Items */}
                  <Text style={styles.fieldHeading}>Included Inclusions</Text>
                  <View style={styles.inclusionsList}>
                    {q.includedItems.map((item) => (
                      <View key={item.id} style={styles.incItem}>
                        <Check size={12} color="#2F7D62" />
                        <Text style={styles.incItemText}>{item.title}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Excluded Items */}
                  {q.excludedItems.length > 0 && (
                    <>
                      <Text style={styles.fieldHeading}>Exclusions</Text>
                      <View style={styles.exclusionsList}>
                        {q.excludedItems.map((item, idx) => (
                          <View key={idx} style={styles.excItem}>
                            <X size={11} color="#B63A4A" />
                            <Text style={styles.excItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {/* Partner Perk */}
                  {q.partnerOffer && (
                    <View style={styles.perkBox}>
                      <Sparkles size={11} color="#8A6A23" />
                      <Text style={styles.perkText}>{q.partnerOffer}</Text>
                    </View>
                  )}

                  {/* Policy & Validity */}
                  <View style={styles.policyBox}>
                    <Clock size={11} color="#8A7A70" />
                    <Text style={styles.policyText}>Valid until {q.validUntil}</Text>
                  </View>

                  {/* Accept Button */}
                  <VellureButton
                    style={[styles.selectBtn, isAccepted && styles.selectBtnAccepted]}
                    onPress={() => handleSelect(q)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.selectBtnText, isAccepted && styles.selectBtnTextAccepted]}>
                      {isAccepted ? 'Currently Preferred' : 'Select as Preferred'}
                    </Text>
                  </VellureButton>
                </View>
              );
            })}
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
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
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
  tableScroll: {
    paddingBottom: 28,
    gap: 12,
  },
  column: {
    width: 270,
    backgroundColor: '#FAF5EC',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  columnAccepted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  vendorHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  preferredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 3,
    marginBottom: 4,
  },
  preferredBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  vendorName: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  ratingText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '800',
  },
  cityText: {
    color: '#786B70',
    fontSize: 11,
  },
  totalPrice: {
    color: '#641E3D',
    fontSize: 18,
    fontWeight: '900',
  },
  unitText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
  },
  fieldHeading: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 6,
  },
  inclusionsList: {
    gap: 5,
    marginBottom: 8,
  },
  incItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  incItemText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  exclusionsList: {
    gap: 4,
    marginBottom: 8,
  },
  excItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  excItemText: {
    color: '#8A7A70',
    fontSize: 10,
    flex: 1,
  },
  perkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    padding: 8,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  perkText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
    flex: 1,
  },
  policyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  policyText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
  },
  selectBtn: {
    backgroundColor: '#641E3D',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectBtnAccepted: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  selectBtnTextAccepted: {
    color: '#15803D',
  },
});
