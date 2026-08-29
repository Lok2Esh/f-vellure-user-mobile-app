import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, MapPin, RotateCcw, SlidersHorizontal, X } from 'lucide-react-native';

export type VendorSortOption = 'recommended' | 'rating' | 'price_asc' | 'price_desc';

export type ExploreFilters = {
  city: string;
  verifiedOnly: boolean;
  minimumRating: number;
  minimumPrice?: number;
  maximumPrice?: number;
  sortBy: VendorSortOption;
};

type Props = {
  visible: boolean;
  filters: ExploreFilters;
  cities: string[];
  onChange: (filters: ExploreFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const SORT_OPTIONS: Array<{ value: VendorSortOption; label: string }> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const RATING_OPTIONS = [0, 3.5, 4, 4.5];

export function ExploreFilterModal({
  visible,
  filters,
  cities,
  onChange,
  onApply,
  onReset,
  onClose,
}: Props) {
  const update = (patch: Partial<ExploreFilters>) => onChange({ ...filters, ...patch });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <SlidersHorizontal size={18} color="#641E3D" />
              <View>
                <Text style={styles.title}>Filters & sorting</Text>
                <Text style={styles.subtitle}>Refine partners for your event</Text>
              </View>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} style={styles.iconButton}>
              <X size={19} color="#641E3D" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.sectionLabel}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {['all', ...cities].map((city) => {
                const selected = filters.city.toLowerCase() === city.toLowerCase();
                return (
                  <TouchableOpacity
                    key={city}
                    onPress={() => update({ city })}
                    style={[styles.chip, selected && styles.chipSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <MapPin size={12} color={selected ? '#FFFFFF' : '#786B70'} />
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {city === 'all' ? 'All cities' : city}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.switchTitle}>Verified partners only</Text>
                <Text style={styles.switchDescription}>Only show profiles currently verified by Vellure</Text>
              </View>
              <Switch
                value={filters.verifiedOnly}
                onValueChange={(verifiedOnly) => update({ verifiedOnly })}
                trackColor={{ false: '#D8CFC9', true: '#B77994' }}
                thumbColor={filters.verifiedOnly ? '#641E3D' : '#FFFFFF'}
              />
            </View>

            <Text style={styles.sectionLabel}>Minimum rating</Text>
            <View style={styles.chipRowWrap}>
              {RATING_OPTIONS.map((rating) => {
                const selected = filters.minimumRating === rating;
                return (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => update({ minimumRating: rating })}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    {selected && <Check size={12} color="#FFFFFF" />}
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {rating === 0 ? 'Any rating' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Starting-price range</Text>
            <View style={styles.priceRow}>
              <TextInput
                value={filters.minimumPrice == null ? '' : String(filters.minimumPrice)}
                onChangeText={(value) => update({ minimumPrice: value ? Number(value.replace(/\D/g, '')) : undefined })}
                placeholder="Minimum ₹"
                keyboardType="numeric"
                style={styles.priceInput}
                placeholderTextColor="#9B8F93"
              />
              <Text style={styles.priceSeparator}>to</Text>
              <TextInput
                value={filters.maximumPrice == null ? '' : String(filters.maximumPrice)}
                onChangeText={(value) => update({ maximumPrice: value ? Number(value.replace(/\D/g, '')) : undefined })}
                placeholder="Maximum ₹"
                keyboardType="numeric"
                style={styles.priceInput}
                placeholderTextColor="#9B8F93"
              />
            </View>
            <Text style={styles.helperText}>Prices remain estimates until a vendor confirms a quotation.</Text>

            <Text style={styles.sectionLabel}>Sort results</Text>
            <View style={styles.sortList}>
              {SORT_OPTIONS.map((option) => {
                const selected = filters.sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => update({ sortBy: option.value })}
                    style={[styles.sortOption, selected && styles.sortOptionSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.sortText, selected && styles.sortTextSelected]}>{option.label}</Text>
                    {selected && <Check size={16} color="#641E3D" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onReset} style={styles.resetButton}>
              <RotateCcw size={15} color="#641E3D" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onApply} style={styles.applyButton}>
              <Text style={styles.applyText}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31,16,23,0.55)' },
  sheet: { maxHeight: '88%', backgroundColor: '#FDFBF7', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E9DFD9' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  title: { color: '#2D2025', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#786B70', fontSize: 11, marginTop: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E9E3' },
  content: { padding: 20, paddingBottom: 28 },
  sectionLabel: { color: '#2D2025', fontSize: 13, fontWeight: '900', marginTop: 16, marginBottom: 10 },
  chipRow: { gap: 8, paddingRight: 10 },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 18, borderWidth: 1, borderColor: '#E1D6CF', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8 },
  chipSelected: { backgroundColor: '#641E3D', borderColor: '#641E3D' },
  chipText: { color: '#786B70', fontSize: 12, fontWeight: '700' },
  chipTextSelected: { color: '#FFFFFF' },
  switchRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9DFD9', padding: 14 },
  switchCopy: { flex: 1 },
  switchTitle: { color: '#2D2025', fontSize: 13, fontWeight: '800' },
  switchDescription: { color: '#786B70', fontSize: 10, lineHeight: 15, marginTop: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInput: { flex: 1, height: 46, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1D6CF', paddingHorizontal: 12, color: '#2D2025', fontSize: 13, fontWeight: '700', outlineStyle: 'none', outlineWidth: 0 } as any,
  priceSeparator: { color: '#9B8F93', fontSize: 11, fontWeight: '700' },
  helperText: { color: '#9B8F93', fontSize: 10, lineHeight: 15, marginTop: 7 },
  sortList: { gap: 7 },
  sortOption: { height: 45, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: '#E9DFD9', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortOptionSelected: { borderColor: '#B98A9F', backgroundColor: '#FFF6F8' },
  sortText: { color: '#786B70', fontSize: 12, fontWeight: '700' },
  sortTextSelected: { color: '#641E3D', fontWeight: '900' },
  footer: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 26, borderTopWidth: 1, borderTopColor: '#E9DFD9' },
  resetButton: { width: 105, height: 48, borderRadius: 15, borderWidth: 1, borderColor: '#D7C5CC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  resetText: { color: '#641E3D', fontSize: 13, fontWeight: '800' },
  applyButton: { flex: 1, height: 48, borderRadius: 15, backgroundColor: '#641E3D', alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
