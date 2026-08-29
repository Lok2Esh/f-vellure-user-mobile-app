import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { StyleSheet,
  Text,
  View,
} from 'react-native';
import { Scale, X } from 'lucide-react-native';

type Props = {
  count: number;
  category?: string;
  onCompare: () => void;
  onClear: () => void;
};

export function VendorCompareTray({ count, category, onCompare, onClear }: Props) {
  if (count === 0) return null;

  return (
    <View style={styles.tray}>
      <View style={styles.copyRow}>
        <View style={styles.iconCircle}>
          <Scale size={17} color="#641E3D" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{count} partner{count === 1 ? '' : 's'} selected</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {category ? `${category} comparison` : 'Select similar services to compare'}
          </Text>
        </View>
      </View>
      <VellureButton accessibilityLabel="Clear comparison" onPress={onClear} style={styles.clearButton}>
        <X size={16} color="#786B70" />
      </VellureButton>
      <VellureButton
        accessibilityRole="button"
        disabled={count < 2}
        onPress={onCompare}
        style={[styles.compareButton, count < 2 && styles.compareButtonDisabled]}
      >
        <Text style={styles.compareText}>{count < 2 ? 'Add one more' : 'Compare'}</Text>
      </VellureButton>
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D2C8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3E1428',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  copyRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5E9EE' },
  copy: { flex: 1 },
  title: { color: '#2D2025', fontSize: 12, fontWeight: '900' },
  subtitle: { color: '#8B7B81', fontSize: 9, marginTop: 2 },
  clearButton: { width: 32, height: 38, alignItems: 'center', justifyContent: 'center' },
  compareButton: { height: 42, minWidth: 84, borderRadius: 13, backgroundColor: '#641E3D', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  compareButtonDisabled: { backgroundColor: '#AB929C' },
  compareText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
});
