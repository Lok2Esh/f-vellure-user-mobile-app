import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { StyleSheet,
  Text,
  View,
} from 'react-native';
import { Boxes, ChevronRight, PackageOpen } from 'lucide-react-native';

export type VendorServiceOffering = {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  startingPrice?: number;
  priceType?: string;
  customizable?: boolean;
};

export type VendorPackageOffering = VendorServiceOffering & {
  eventTypes?: string[];
  guestMin?: number;
  guestMax?: number;
  includedServices?: string[];
  duration?: string;
  source?: 'VENDOR' | 'VELLURE' | 'SUGGESTED';
};

type Props = {
  mode: 'services' | 'packages';
  services?: VendorServiceOffering[];
  packages?: VendorPackageOffering[];
  onEnquire: () => void;
};

function priceLabel(price?: number, type?: string) {
  if (!price || price <= 0) return 'Request pricing';
  const units: Record<string, string> = {
    PER_PLATE: 'per plate', PER_PERSON: 'per person', PER_DAY: 'per day',
    PER_EVENT: 'per event', PER_HOUR: 'per hour', PER_ROOM: 'per room',
    FIXED_PACKAGE: 'package', FIXED: 'package',
  };
  return `₹${price.toLocaleString('en-IN')} ${units[type || ''] || 'starting price'}`;
}

export function VendorOfferingsSection({ mode, services = [], packages = [], onEnquire }: Props) {
  const items = mode === 'services' ? services : packages;
  const Icon = mode === 'services' ? Boxes : PackageOpen;
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.iconCircle}><Icon size={27} color="#D2AD6B" /></View>
        <Text style={styles.emptyTitle}>No published {mode} yet</Text>
        <Text style={styles.emptyCopy}>
          Ask the partner for current inclusions, customization options, exclusions, and confirmed pricing.
        </Text>
        <VellureButton onPress={onEnquire} style={styles.enquireButton}>
          <Text style={styles.enquireText}>Request {mode === 'services' ? 'service details' : 'package options'}</Text>
          <ChevronRight size={15} color="#FFFFFF" />
        </VellureButton>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const packageItem = item as VendorPackageOffering;
        return (
          <View key={item.id || `${mode}-${index}`} style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{item.name || item.title || `${mode === 'services' ? 'Service' : 'Package'} ${index + 1}`}</Text>
              {item.customizable && <Text style={styles.customPill}>Customizable</Text>}
            </View>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            {mode === 'packages' && (packageItem.guestMin || packageItem.guestMax) ? (
              <Text style={styles.meta}>Guests: {packageItem.guestMin || 'Any'}–{packageItem.guestMax || 'Flexible'}</Text>
            ) : null}
            {mode === 'packages' && packageItem.includedServices?.length ? (
              <Text style={styles.meta}>Includes: {packageItem.includedServices.join(', ')}</Text>
            ) : null}
            <View style={styles.footer}>
              <Text style={styles.price}>{priceLabel(item.startingPrice, item.priceType)}</Text>
              <VellureButton onPress={onEnquire} style={styles.smallButton}><Text style={styles.smallButtonText}>Enquire</Text></VellureButton>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  emptyCard: { alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#E9DFD9', backgroundColor: '#FFFFFF', padding: 24 },
  iconCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FAF1E3', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { color: '#2D2025', fontSize: 15, fontWeight: '900' },
  emptyCopy: { color: '#786B70', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6, marginBottom: 15 },
  enquireButton: { height: 43, borderRadius: 14, backgroundColor: '#641E3D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 16 },
  enquireText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  card: { borderRadius: 18, borderWidth: 1, borderColor: '#E9DFD9', backgroundColor: '#FFFFFF', padding: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, color: '#2D2025', fontSize: 14, fontWeight: '900' },
  customPill: { color: '#2F7D62', fontSize: 9, fontWeight: '900', backgroundColor: '#EAF7F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  description: { color: '#786B70', fontSize: 11, lineHeight: 17, marginTop: 7 },
  meta: { color: '#786B70', fontSize: 10, lineHeight: 16, marginTop: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  price: { color: '#641E3D', fontSize: 13, fontWeight: '900' },
  smallButton: { height: 34, borderRadius: 11, backgroundColor: '#F3E9E3', paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: '#641E3D', fontSize: 10, fontWeight: '900' },
});
