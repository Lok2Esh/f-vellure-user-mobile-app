import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Sliders, CheckCircle2, Sparkles, MapPin, Calendar, Users, IndianRupee } from 'lucide-react-native';
import { VellureInputField } from '../ui/VellureInputField';
import { CityPickerModal, CityEntry } from '../ui/CityPickerModal';
import { CalendarModal } from '../ui/CalendarModal';
import { colors } from '../../constants/theme';

export interface QuickValidationValues {
  eventType: string;
  city: string;
  guestCount: number;
  totalBudget: number;
  theme: string;
  date: string;
  requiredServices: string[];
}

interface QuickValidationSheetProps {
  visible: boolean;
  initialValues: QuickValidationValues;
  cities: CityEntry[];
  onClose: () => void;
  onApply: (updated: QuickValidationValues) => void;
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
  'Baby Shower',
  'Housewarming',
];

const ALL_SERVICES = [
  'Venue & Catering',
  'Decor & Lighting',
  'Photography',
  'Entertainment',
  'Attire & Makeup',
  'Miscellaneous & Rituals',
];

export function QuickValidationSheet({
  visible,
  initialValues,
  cities,
  onClose,
  onApply,
}: QuickValidationSheetProps) {
  const [eventType, setEventType] = useState(initialValues.eventType);
  const [city, setCity] = useState(initialValues.city);
  const [guestCount, setGuestCount] = useState(String(initialValues.guestCount));
  const [budget, setBudget] = useState(String(initialValues.totalBudget));
  const [theme, setTheme] = useState(initialValues.theme);
  const [date, setDate] = useState(initialValues.date || '');
  const [services, setServices] = useState<string[]>(initialValues.requiredServices || []);

  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setEventType(initialValues.eventType);
      setCity(initialValues.city);
      setGuestCount(String(initialValues.guestCount));
      setBudget(String(initialValues.totalBudget));
      setTheme(initialValues.theme);
      setDate(initialValues.date || '');
      setServices(initialValues.requiredServices || []);
    }
  }, [visible, initialValues]);

  const toggleService = (srv: string) => {
    if (services.includes(srv)) {
      setServices(services.filter((s) => s !== srv));
    } else {
      setServices([...services, srv]);
    }
  };

  const handleConfirm = () => {
    onApply({
      eventType,
      city,
      guestCount: parseInt(guestCount.replace(/[^0-9]/g, ''), 10) || 150,
      totalBudget: parseInt(budget.replace(/[^0-9]/g, ''), 10) || 400000,
      theme,
      date,
      requiredServices: services.length > 0 ? services : ['Venue & Catering', 'Decor & Lighting'],
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Adjust AI Blueprint</Text>
              <Text style={styles.subtitle}>Fine-tune celebration parameters & re-optimize</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Event Type Options */}
            <Text style={styles.inputLabel}>Celebration Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeScroll}
            >
              {EVENT_TYPE_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, eventType === t && styles.typeChipActive]}
                  onPress={() => setEventType(t)}
                >
                  <Text style={[styles.typeChipText, eventType === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* City & Date */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <VellureInputField
                  label="Host City"
                  icon={<MapPin size={13} color="#D2AD6B" />}
                  value={city}
                  isReadOnly
                  onPress={() => setShowCityPicker(true)}
                  placeholder="Select City"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <VellureInputField
                  label="Celebration Date"
                  icon={<Calendar size={13} color="#D2AD6B" />}
                  value={date || 'Flexible'}
                  isReadOnly
                  onPress={() => setShowDatePicker(true)}
                  placeholder="Select Date"
                />
              </View>
            </View>

            {/* Guests & Budget */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <VellureInputField
                  label="Guest Count"
                  icon={<Users size={13} color="#D2AD6B" />}
                  value={guestCount}
                  onChangeText={setGuestCount}
                  keyboardType="number-pad"
                  placeholder="150"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <VellureInputField
                  label="Total Budget (₹)"
                  icon={<IndianRupee size={13} color="#D2AD6B" />}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="number-pad"
                  placeholder="400000"
                />
              </View>
            </View>

            {/* Theme */}
            <VellureInputField
              label="Theme / Atmosphere Vibe"
              value={theme}
              onChangeText={setTheme}
              placeholder="e.g. Outdoor Floral, Royal Heritage, Modern Chic"
            />

            {/* Service Toggle Chips */}
            <Text style={styles.inputLabel}>Required Services</Text>
            <View style={styles.servicesGrid}>
              {ALL_SERVICES.map((srv) => {
                const isSelected = services.includes(srv);
                return (
                  <TouchableOpacity
                    key={srv}
                    style={[styles.serviceTogglePill, isSelected && styles.serviceTogglePillActive]}
                    onPress={() => toggleService(srv)}
                    activeOpacity={0.75}
                  >
                    <CheckCircle2 size={12} color={isSelected ? '#FFFFFF' : '#8A7A70'} />
                    <Text
                      style={[
                        styles.serviceToggleText,
                        isSelected && styles.serviceToggleTextActive,
                      ]}
                    >
                      {srv}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={handleConfirm} activeOpacity={0.88}>
              <Sparkles size={15} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Apply & Re-Calculate Blueprint</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <CityPickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        onSelect={(c) => setCity(c)}
        cities={cities}
      />

      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(dateString: string) => {
          setDate(dateString);
          setShowDatePicker(false);
        }}
        currentDate={date}
      />
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
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    paddingBottom: 24,
  },
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 2,
  },
  typeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  typeChipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  typeChipText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  serviceTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  serviceTogglePillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  serviceToggleText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
