import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Headphones,
  Phone,
  MessageSquare,
  Sparkles,
  CalendarCheck,
  Building2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react-native';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';

interface ConciergeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ConciergeModal({ visible, onClose }: ConciergeModalProps) {
  const [requestType, setRequestType] = useState('Vendor Discovery');
  const [notes, setNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCallback = () => {
    if (!notes.trim()) {
      Alert.alert('Details Needed', 'Please describe what you would like concierge assistance with.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Concierge Request Logged',
        'Thank you! A Vellure Senior Event Advisor will connect with you during advisory hours (9:00 AM – 9:00 PM IST).'
      );
      setNotes('');
      onClose();
    }, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconWrap}>
                <Headphones size={18} color="#D2AD6B" />
              </View>
              <View>
                <Text style={styles.title}>Vellure Event Concierge</Text>
                <Text style={styles.subtitle}>Bespoke advice & vendor coordination</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Advisory Hours & Scope Card */}
            <View style={styles.scopeCard}>
              <Text style={styles.scopeHeading}>What our advisors can assist you with:</Text>
              <View style={styles.scopeList}>
                <View style={styles.scopeItem}>
                  <Building2 size={13} color="#641E3D" />
                  <Text style={styles.scopeText}>Palace & banquet date availability checks</Text>
                </View>
                <View style={styles.scopeItem}>
                  <Sparkles size={13} color="#641E3D" />
                  <Text style={styles.scopeText}>Multi-day itinerary coordination (Mehendi to Reception)</Text>
                </View>
                <View style={styles.scopeItem}>
                  <CalendarCheck size={13} color="#641E3D" />
                  <Text style={styles.scopeText}>Package customisation & quote comparison</Text>
                </View>
                <View style={styles.scopeItem}>
                  <ShieldCheck size={13} color="#641E3D" />
                  <Text style={styles.scopeText}>Special guest hospitality & dietary requirements</Text>
                </View>
              </View>

              <View style={styles.hoursBox}>
                <Clock size={12} color="#8A6A23" />
                <Text style={styles.hoursText}>
                  Advisory Hours: 9:00 AM – 9:00 PM IST (Mon – Sun)
                </Text>
              </View>
            </View>

            {/* Direct Helpline Action */}
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert('Helpline Call', 'Connecting to Vellure Advisory Desk at +91 1800 200 4500 (Toll Free)')}
              activeOpacity={0.85}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Concierge Desk: 1800 200 4500</Text>
            </TouchableOpacity>

            {/* Request Advisor Consultation Form */}
            <View style={styles.formCard}>
              <Text style={styles.formHeading}>Request a Callback / Consultation</Text>

              <Text style={styles.inputLabel}>Assistance Area</Text>
              <View style={styles.typePillsRow}>
                {['Vendor Discovery', 'Multi-Day Itinerary', 'Quote Review'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typePill, requestType === t && styles.typePillActive]}
                    onPress={() => setRequestType(t)}
                  >
                    <Text style={[styles.typePillText, requestType === t && styles.typePillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <VellureInputField
                label="Contact Phone (Optional if profile linked)"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
              />

              <VellureInputField
                label="Event Details & Specific Questions"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="e.g. Planning a 3-day royal wedding in Patiala in November with 300 guests. Need verified recommendations for live musicians and drone cinema."
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitCallback}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Submit Consultation Request</Text>
                  </>
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
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A121E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#641E3D',
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingBottom: 28,
  },
  scopeCard: {
    backgroundColor: '#FAF5EC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
  },
  scopeHeading: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  scopeList: {
    gap: 6,
  },
  scopeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scopeText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '600',
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    padding: 8,
    borderRadius: 10,
    gap: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  hoursText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F7D62',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  formHeading: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  typePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  typePillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  typePillText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '700',
  },
  typePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  notesInput: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#2D2025',
    minHeight: 64,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
    marginTop: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
