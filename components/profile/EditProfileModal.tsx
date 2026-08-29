import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, User, Phone, Mail, MapPin, Globe, Check } from 'lucide-react-native';
import { CustomerProfile, saveCustomerProfile } from '../../services/api';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';

interface EditProfileModalProps {
  visible: boolean;
  profile: CustomerProfile;
  onClose: () => void;
  onProfileUpdated: (updated: CustomerProfile) => void;
}

export function EditProfileModal({
  visible,
  profile,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [primaryCity, setPrimaryCity] = useState(profile.primaryCity || 'Patiala');
  const [state, setState] = useState(profile.state || 'Punjab');
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage || 'English / Punjabi');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await saveCustomerProfile({
        fullName: fullName.trim(),
        displayName: displayName.trim() || fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        primaryCity: primaryCity.trim(),
        state: state.trim(),
        preferredLanguage: preferredLanguage.trim(),
        isAuthenticated: true,
      });
      onProfileUpdated(updated);
      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
      onClose();
    } catch (e) {
      Alert.alert('Save Failed', 'Unable to save profile changes right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Customer Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <VellureInputField
              label="Full Name"
              icon={<User size={14} color="#D2AD6B" />}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Karan Sharma"
            />

            <VellureInputField
              label="Preferred Display Name"
              icon={<User size={14} color="#D2AD6B" />}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Karan"
            />

            <VellureInputField
              label="Phone Number"
              icon={<Phone size={14} color="#D2AD6B" />}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
            />

            <VellureInputField
              label="Email Address"
              icon={<Mail size={14} color="#D2AD6B" />}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="host@vellure.in"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <VellureInputField
                  label="Primary City"
                  icon={<MapPin size={14} color="#D2AD6B" />}
                  value={primaryCity}
                  onChangeText={setPrimaryCity}
                  placeholder="e.g. Patiala"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <VellureInputField
                  label="State"
                  icon={<MapPin size={14} color="#D2AD6B" />}
                  value={state}
                  onChangeText={setState}
                  placeholder="e.g. Punjab"
                />
              </View>
            </View>

            <VellureInputField
              label="Preferred Language"
              icon={<Globe size={14} color="#D2AD6B" />}
              value={preferredLanguage}
              onChangeText={setPreferredLanguage}
              placeholder="English / Hindi / Punjabi"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile</Text>
              )}
            </TouchableOpacity>
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
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  title: {
    color: '#641E3D',
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingBottom: 28,
  },
  label: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 5,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '600',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#641E3D',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22,
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
