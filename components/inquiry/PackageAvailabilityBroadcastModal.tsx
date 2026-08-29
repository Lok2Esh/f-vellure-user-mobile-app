import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  X,
  Sparkles,
  Calendar,
  Send,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import {
  CustomPackage,
  sendAvailabilityBroadcastToAllVendors,
} from '../../services/customPackageStore';
import { fetchCustomerProfile } from '../../services/api';
import { VellureButton } from '../ui/VellureControls';
import { VellureInputField } from '../ui/VellureInputField';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PackageAvailabilityBroadcastModalProps {
  visible: boolean;
  packageItem: CustomPackage | null;
  onClose: () => void;
  onSuccess?: (result: { vendorsCount: number; message: string }) => void;
}

export function PackageAvailabilityBroadcastModal({
  visible,
  packageItem,
  onClose,
  onSuccess,
}: PackageAvailabilityBroadcastModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ vendorsCount: number; message: string } | null>(null);

  useEffect(() => {
    if (visible && packageItem) {
      setIsSuccess(false);
      setEventDate(packageItem.eventDate || '');

      // Load profile info
      fetchCustomerProfile()
        .then((profile) => {
          if (profile) {
            if (profile.fullName) setClientName(profile.fullName);
            if (profile.phone) setClientPhone(profile.phone);
            if (profile.email) setClientEmail(profile.email);
          }
        })
        .catch(() => {});
    }
  }, [visible, packageItem]);

  if (!packageItem) return null;

  const handleSubmitBroadcast = async () => {
    if (!clientName.trim()) {
      Alert.alert('Name Required', 'Please enter your name for the availability inquiry.');
      return;
    }
    if (!clientPhone.trim() && !clientEmail.trim()) {
      Alert.alert('Contact Required', 'Please provide a mobile number or email so specialists can respond.');
      return;
    }
    if (!eventDate.trim()) {
      Alert.alert('Date Required', 'Please specify your tentative celebration date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendAvailabilityBroadcastToAllVendors(packageItem.id, {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        date: eventDate.trim(),
        note: customNote.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessInfo(res);
        if (onSuccess) onSuccess(res);
      } else {
        Alert.alert('Inquiry Notice', res.message || 'Unable to broadcast message.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send availability broadcast. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.lightningBadge}>
                <Zap size={11} color="#2A121E" fill="#2A121E" />
                <Text style={styles.lightningBadgeText}>1-Click Broadcast</Text>
              </View>
              <Text style={styles.title}>Check All Availability</Text>
              <Text style={styles.subtitle}>
                Simultaneously ping all {packageItem.vendors.length} specialists in {packageItem.name}
              </Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {isSuccess && successInfo ? (
            // Success State
            <View style={styles.successBox}>
              <View style={styles.successIconWrap}>
                <CheckCircle2 size={42} color="#287857" />
              </View>
              <Text style={styles.successTitle}>Availability Broadcast Sent!</Text>
              <Text style={styles.successMessage}>
                Your inquiry has been sent to all <Text style={{ fontWeight: 'bold' }}>{successInfo.vendorsCount} specialists</Text>. They will verify their calendar availability for <Text style={{ fontWeight: 'bold' }}>{eventDate}</Text> and respond shortly.
              </Text>

              <View style={styles.successSummaryCard}>
                <View style={styles.summaryItem}>
                  <Clock size={14} color="#8A6A23" />
                  <Text style={styles.summaryText}>Average partner response SLA: 2 to 4 hours</Text>
                </View>
                <View style={styles.summaryItem}>
                  <ShieldCheck size={14} color="#287857" />
                  <Text style={styles.summaryText}>Zero advance payment required to check dates</Text>
                </View>
              </View>

              <VellureButton
                style={styles.doneBtn}
                onPress={onClose}
              >
                <Text style={styles.doneBtnText}>View My Packages</Text>
              </VellureButton>
            </View>
          ) : (
            // Form State
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {/* Package Summary Card */}
              <View style={styles.packagePreviewCard}>
                <View style={styles.packagePreviewTop}>
                  <Text style={styles.previewName}>{packageItem.name}</Text>
                  <Text style={styles.previewPrice}>₹{packageItem.totalPrice.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.previewMeta}>
                  <View style={styles.previewMetaItem}>
                    <MapPin size={11} color="#D2AD6B" />
                    <Text style={styles.previewMetaText}>{packageItem.city}</Text>
                  </View>
                  <View style={styles.previewMetaItem}>
                    <Users size={11} color="#D2AD6B" />
                    <Text style={styles.previewMetaText}>{packageItem.guestCount} Guests</Text>
                  </View>
                  <View style={styles.previewMetaItem}>
                    <Sparkles size={11} color="#D2AD6B" />
                    <Text style={styles.previewMetaText}>{packageItem.vendors.length} Specialists</Text>
                  </View>
                </View>

                {/* Vendors thumbnail strip */}
                <View style={styles.vendorsStrip}>
                  {packageItem.vendors.map((v, i) => (
                    <View key={i} style={styles.vendorThumbWrap}>
                      <Image
                        source={{
                          uri:
                            v.image ||
                            'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                        }}
                        style={styles.vendorThumb}
                      />
                      <Text style={styles.vendorThumbName} numberOfLines={1}>
                        {v.businessName}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Form inputs using Reusable VellureInputField */}
              <VellureInputField
                label="Celebration Date *"
                icon={<Calendar size={14} color="#641E3D" />}
                value={eventDate}
                onChangeText={setEventDate}
                placeholder="e.g. 15 Nov 2025"
                variant="filled"
              />

              <VellureInputField
                label="Your Full Name *"
                value={clientName}
                onChangeText={setClientName}
                placeholder="Enter your name"
                variant="filled"
              />

              <View style={styles.rowInputs}>
                <VellureInputField
                  label="Phone / WhatsApp *"
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  containerStyle={{ flex: 1 }}
                  variant="filled"
                />
                <VellureInputField
                  label="Email"
                  value={clientEmail}
                  onChangeText={setClientEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={{ flex: 1.2 }}
                  variant="filled"
                />
              </View>

              <VellureInputField
                label="Optional Message / Timings"
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="e.g. Evening reception, need photography & catering team on-site by 4 PM"
                multiline
                numberOfLines={3}
                variant="filled"
              />

              {/* Submit CTA */}
              <VellureButton
                style={styles.submitBtn}
                onPress={handleSubmitBroadcast}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.submitBtnText}>
                      Broadcast to All {packageItem.vendors.length} Specialists
                    </Text>
                  </>
                )}
              </VellureButton>

              <Text style={styles.guaranteeText}>
                🛡️ Verified calendar check with zero obligation or advance fees
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleWrap: { flex: 1, marginRight: 10 },
  lightningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4D58D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  lightningBadgeText: {
    color: '#2A121E',
    fontSize: 9.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: { color: '#2A121E', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#786B70', fontSize: 11, marginTop: 2, lineHeight: 15 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: { paddingBottom: 20 },
  packagePreviewCard: {
    backgroundColor: '#641E3D',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D2AD6B',
  },
  packagePreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewName: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', flex: 1 },
  previewPrice: { color: '#F4D58D', fontSize: 16, fontWeight: '900' },
  previewMeta: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  previewMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  previewMetaText: { color: '#E0D4DC', fontSize: 10.5, fontWeight: '600' },
  vendorsStrip: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  vendorThumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vendorThumb: { width: 16, height: 16, borderRadius: 8 },
  vendorThumbName: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', maxWidth: 100 },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  singleInput: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#2A121E',
    fontSize: 13,
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  inputField: { flex: 1, color: '#2A121E', fontSize: 13, fontWeight: '600', padding: 0 },
  rowInputs: { flexDirection: 'row', gap: 10 },
  textArea: { height: 68, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#641E3D',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  guaranteeText: {
    color: '#786B70',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  successBox: { alignItems: 'center', paddingVertical: 24 },
  successIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECF8F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: { color: '#2A121E', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  successMessage: {
    color: '#786B70',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  successSummaryCard: {
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { color: '#2A121E', fontSize: 11, fontWeight: '600' },
  doneBtn: {
    backgroundColor: '#641E3D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
