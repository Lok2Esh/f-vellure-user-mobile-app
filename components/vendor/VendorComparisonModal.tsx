import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BadgeCheck, MapPin, Scale, Star, X } from 'lucide-react-native';

export type ComparableVendor = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  basePrice?: number;
  priceType?: string;
  rating?: number;
  reviewsCount?: number;
  verified: boolean;
};

type Props = {
  visible: boolean;
  vendors: ComparableVendor[];
  onClose: () => void;
  onRemove: (vendorId: string) => void;
  onViewVendor: (vendorId: string) => void;
};

function formatPrice(vendor: ComparableVendor) {
  if (!vendor.basePrice || vendor.basePrice <= 0) return 'Request pricing';
  const units: Record<string, string> = {
    PER_PLATE: 'per plate',
    PER_PERSON: 'per person',
    PER_DAY: 'per day',
    PER_EVENT: 'per event',
    PER_HOUR: 'per hour',
    PER_ROOM: 'per room',
    FIXED: 'fixed package',
    FIXED_PACKAGE: 'fixed package',
  };
  return `₹${vendor.basePrice.toLocaleString('en-IN')} ${units[vendor.priceType || ''] || 'starting price'}`;
}

export function VendorComparisonModal({ visible, vendors, onClose, onRemove, onViewVendor }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Scale size={18} color="#641E3D" />
              <View>
                <Text style={styles.title}>Compare partners</Text>
                <Text style={styles.subtitle}>Compare compatible services side by side</Text>
              </View>
            </View>
            <VellureButton accessibilityRole="button" accessibilityLabel="Close comparison" onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#641E3D" />
            </VellureButton>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
            {vendors.map((vendor) => (
              <View key={vendor.id} style={styles.card}>
                <View style={styles.categoryRow}>
                  <Text style={styles.category}>{vendor.category}</Text>
                  {vendor.verified && <BadgeCheck size={15} color="#2F7D62" />}
                </View>
                <Text style={styles.name}>{vendor.businessName}</Text>
                <View style={styles.metricRow}>
                  <MapPin size={13} color="#D2AD6B" />
                  <Text style={styles.metricText}>{vendor.city}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Star size={13} color="#D2AD6B" fill={vendor.rating ? '#D2AD6B' : 'transparent'} />
                  <Text style={styles.metricText}>
                    {vendor.rating ? `${vendor.rating.toFixed(1)} (${vendor.reviewsCount || 0})` : 'New on Vellure'}
                  </Text>
                </View>
                <Text style={styles.price}>{formatPrice(vendor)}</Text>
                <Text style={styles.disclaimer}>Availability and final pricing require confirmation.</Text>
                <VellureButton onPress={() => onViewVendor(vendor.id)} style={styles.viewButton}>
                  <Text style={styles.viewText}>View details</Text>
                </VellureButton>
                <VellureButton onPress={() => onRemove(vendor.id)} style={styles.removeButton}>
                  <Text style={styles.removeText}>Remove</Text>
                </VellureButton>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31,16,23,0.55)' },
  sheet: { maxHeight: '76%', backgroundColor: '#FDFBF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E9DFD9' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#2D2025', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#786B70', fontSize: 10, marginTop: 2 },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#F3E9E3' },
  cards: { padding: 18, gap: 12 },
  card: { width: 245, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9DFD9', padding: 16 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  category: { color: '#8A6B3B', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  name: { color: '#2D2025', fontSize: 17, fontWeight: '900', marginBottom: 13 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  metricText: { color: '#786B70', fontSize: 12, fontWeight: '700' },
  price: { color: '#641E3D', fontSize: 15, fontWeight: '900', marginTop: 5 },
  disclaimer: { color: '#9B8F93', fontSize: 9, lineHeight: 14, marginTop: 5, marginBottom: 14 },
  viewButton: { height: 42, borderRadius: 13, backgroundColor: '#641E3D', alignItems: 'center', justifyContent: 'center' },
  viewText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  removeButton: { height: 36, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#9B4258', fontSize: 11, fontWeight: '800' },
});
