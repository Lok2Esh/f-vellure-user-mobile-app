import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { StyleSheet,
  Text,
  View,
} from 'react-native';
import { MapPin, SearchX, SlidersHorizontal, Sparkles } from 'lucide-react-native';

type Props = {
  query?: string;
  categoryLabel?: string;
  city?: string;
  filterCount: number;
  suggestions: Array<{ key: string; label: string }>;
  onClear: () => void;
  onChangeLocation: () => void;
  onChooseCategory: (key: string) => void;
  onCustomRequest: () => void;
};

export function ExploreEmptyState({
  query,
  categoryLabel,
  city,
  filterCount,
  suggestions,
  onClear,
  onChangeLocation,
  onChooseCategory,
  onCustomRequest,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}><SearchX size={28} color="#D2AD6B" /></View>
      <Text style={styles.title}>No matching partners yet</Text>
      <Text style={styles.copy}>
        {query ? `No results for “${query}”. ` : ''}
        {categoryLabel ? `${categoryLabel} ` : 'Partners '}
        {city && city !== 'all' ? `in ${city} ` : ''}
        did not match {filterCount > 0 ? `${filterCount} active filter${filterCount === 1 ? '' : 's'}.` : 'your current search.'}
      </Text>

      <View style={styles.actionRow}>
        <VellureButton onPress={onClear} style={styles.primaryButton}>
          <SlidersHorizontal size={14} color="#FFFFFF" />
          <Text style={styles.primaryText}>Clear filters</Text>
        </VellureButton>
        <VellureButton onPress={onChangeLocation} style={styles.secondaryButton}>
          <MapPin size={14} color="#641E3D" />
          <Text style={styles.secondaryText}>Change city</Text>
        </VellureButton>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionLabel}>Try another related service</Text>
          <View style={styles.chips}>
            {suggestions.slice(0, 3).map((item) => (
              <VellureButton key={item.key} onPress={() => onChooseCategory(item.key)} style={styles.chip}>
                <Text style={styles.chipText}>{item.label}</Text>
              </VellureButton>
            ))}
          </View>
        </View>
      )}

      <VellureButton onPress={onCustomRequest} style={styles.customButton}>
        <Sparkles size={15} color="#8A6A23" />
        <Text style={styles.customText}>Plan a custom request with AI</Text>
      </VellureButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 22, borderRadius: 22, borderWidth: 1, borderColor: '#E9DFD9', backgroundColor: '#FFFFFF', padding: 22, alignItems: 'center' },
  iconCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FAF1E3', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { color: '#2D2025', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  copy: { color: '#786B70', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 7 },
  actionRow: { width: '100%', flexDirection: 'row', gap: 9, marginTop: 17 },
  primaryButton: { flex: 1, height: 43, borderRadius: 14, backgroundColor: '#641E3D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  secondaryButton: { flex: 1, height: 43, borderRadius: 14, borderWidth: 1, borderColor: '#D7C2CB', backgroundColor: '#FFF8FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secondaryText: { color: '#641E3D', fontSize: 11, fontWeight: '900' },
  suggestions: { width: '100%', marginTop: 18, borderTopWidth: 1, borderTopColor: '#EFE6E1', paddingTop: 15 },
  suggestionLabel: { color: '#786B70', fontSize: 10, fontWeight: '800', textAlign: 'center', marginBottom: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7 },
  chip: { borderRadius: 14, backgroundColor: '#FAF5EC', borderWidth: 1, borderColor: '#ECDCC5', paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { color: '#641E3D', fontSize: 10, fontWeight: '800' },
  customButton: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  customText: { color: '#8A6A23', fontSize: 11, fontWeight: '900' },
});
