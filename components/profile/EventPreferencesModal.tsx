import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Sparkles, Check, RotateCcw, Info } from 'lucide-react-native';
import { CustomerPreferences, saveUserPreferences } from '../../services/api';
import { colors } from '../../constants/theme';

interface EventPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const EVENT_TYPE_OPTIONS = [
  'Wedding',
  'Engagement',
  'Reception',
  'Sangeet / Mehendi',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Puja / Path',
  'Festival Celebration',
];

const VENUE_STYLE_OPTIONS = [
  'Heritage Palace & Haveli',
  'Luxury 5-Star Resort',
  'Lush Open Farmhouse',
  'Boutique Banquet Hall',
  'Modern Minimalist Space',
];

const DIETARY_OPTIONS = [
  'Pure Vegetarian Feasts',
  'Multi-Cuisine Feasts',
  'Jain Specialties',
  'Live Counter Concepts',
  'Organic & Farm-Fresh',
];

const CEREMONY_OPTIONS = [
  'Hindu Traditions',
  'Sikh Traditions (Anand Karaj)',
  'Muslim Traditions (Nikah)',
  'Christian Ceremonies',
  'Secular & Fusion Celebrations',
  'Prefer not to specify',
];

const SERVICE_PRIORITIES = [
  'Grand Venues',
  'Artisanal Catering',
  'Bespoke Decor & Lighting',
  'Cinematic Photography',
  'Couture Makeup & Styling',
  'Live Entertainment & DJ',
  'Guest Transport & Luxury Cars',
  'Hospitality & Logistics',
];

export function EventPreferencesModal({
  visible,
  onClose,
  onSaved,
}: EventPreferencesModalProps) {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(['Wedding', 'Reception']);
  const [selectedVenueStyle, setSelectedVenueStyle] = useState<string>('Heritage Palace & Haveli');
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Pure Vegetarian Feasts', 'Multi-Cuisine Feasts']);
  const [selectedCeremonies, setSelectedCeremonies] = useState<string[]>(['Sikh Traditions (Anand Karaj)']);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Grand Venues',
    'Artisanal Catering',
    'Bespoke Decor & Lighting',
    'Cinematic Photography',
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleArrayItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleReset = () => {
    setSelectedEventTypes(['Wedding']);
    setSelectedVenueStyle('Heritage Palace & Haveli');
    setSelectedDietary(['Pure Vegetarian Feasts']);
    setSelectedCeremonies(['Prefer not to specify']);
    setSelectedServices(['Grand Venues', 'Artisanal Catering']);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveUserPreferences({
        eventTypes: selectedEventTypes,
        venueStyle: selectedVenueStyle,
        dietaryPreferences: selectedDietary,
        ceremonyPreferences: selectedCeremonies,
        serviceCategories: selectedServices,
      });
      Alert.alert('Preferences Saved', 'Your recommendation profile has been updated.');
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      Alert.alert('Save Failed', 'Unable to save preferences right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Event Planning Preferences</Text>
              <Text style={styles.subtitle}>Curates personalized vendor matches</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          {/* Explanation Banner */}
          <View style={styles.infoBanner}>
            <Info size={14} color="#8A6A23" />
            <Text style={styles.infoText}>
              Vellure uses these preferences exclusively to recommend relevant vendors and packages.
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* 1. Event Types */}
            <Text style={styles.sectionHeading}>Celebration Types of Interest</Text>
            <View style={styles.chipsWrap}>
              {EVENT_TYPE_OPTIONS.map((item) => {
                const isSelected = selectedEventTypes.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleArrayItem(selectedEventTypes, setSelectedEventTypes, item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Venue Style */}
            <Text style={styles.sectionHeading}>Preferred Venue Atmosphere</Text>
            <View style={styles.chipsWrap}>
              {VENUE_STYLE_OPTIONS.map((item) => {
                const isSelected = selectedVenueStyle === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedVenueStyle(item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Food & Feasts */}
            <Text style={styles.sectionHeading}>Catering & Food Priorities</Text>
            <View style={styles.chipsWrap}>
              {DIETARY_OPTIONS.map((item) => {
                const isSelected = selectedDietary.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleArrayItem(selectedDietary, setSelectedDietary, item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Ceremony Traditions (Optional & Inclusive) */}
            <Text style={styles.sectionHeading}>Ceremony Traditions (Optional)</Text>
            <View style={styles.chipsWrap}>
              {CEREMONY_OPTIONS.map((item) => {
                const isSelected = selectedCeremonies.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleArrayItem(selectedCeremonies, setSelectedCeremonies, item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5. Essential Services */}
            <Text style={styles.sectionHeading}>Top Priority Services</Text>
            <View style={styles.chipsWrap}>
              {SERVICE_PRIORITIES.map((item) => {
                const isSelected = selectedServices.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleArrayItem(selectedServices, setSelectedServices, item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.75}>
                <RotateCcw size={13} color="#641E3D" />
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.88}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Preferences</Text>
                )}
              </TouchableOpacity>
            </View>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  infoText: {
    color: '#6A531C',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  scroll: {
    paddingBottom: 28,
  },
  sectionHeading: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  chipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  chipText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FAF5EC',
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  resetBtnText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#641E3D',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
