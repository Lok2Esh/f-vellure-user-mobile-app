import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useEffect,
  useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  X,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  IndianRupee,
  Phone,
  Mail,
  User,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react-native';
import { createEventInquiry, fetchCustomerProfile } from '../../services/api';
import { VellureInputField } from '../ui/VellureInputField';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Sangeet / Mehendi',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Puja / Path',
  'Nikah',
  'Church Ceremony',
  'Festival Celebration',
  'Baby Shower',
  'Housewarming',
  'Other',
];

export interface EventInquiryModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetCategory: string;
  isPackage?: boolean;
  initialCity?: string;
  initialBudget?: number;
  initialGuestCount?: number;
  initialEventType?: string;
  onSuccess?: (inquiryId: string) => void;
}

export function EventInquiryModal({
  visible,
  onClose,
  targetId,
  targetName,
  targetCategory,
  isPackage = false,
  initialCity = '',
  initialBudget,
  initialGuestCount,
  initialEventType = 'Wedding',
  onSuccess,
}: EventInquiryModalProps) {
  const [eventType, setEventType] = useState(initialEventType);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState(initialGuestCount ? String(initialGuestCount) : '');
  const [city, setCity] = useState(initialCity);
  const [budget, setBudget] = useState(initialBudget ? String(initialBudget) : '');
  const [notes, setNotes] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) return;
    setEventType(initialEventType);
    setCity(initialCity);
    setBudget(initialBudget ? String(initialBudget) : '');
    setGuestCount(initialGuestCount ? String(initialGuestCount) : '');
    fetchCustomerProfile()
      .then((profile) => {
        setUserName(profile.fullName || '');
        setUserPhone(profile.phone || '');
        setUserEmail(profile.email || '');
        if (!initialCity) setCity(profile.primaryCity || '');
      })
      .catch(() => undefined);
  }, [visible, initialBudget, initialCity, initialEventType, initialGuestCount]);

  const handleClose = () => {
    setSubmittedInquiryId(null);
    setErrorMessage('');
    setIsReviewing(false);
    onClose();
  };

  const handleReview = () => {
    if (!userName.trim() || !userPhone.trim()) {
      setErrorMessage('Please enter your full name and contact phone number.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('Please enter the event city.');
      return;
    }
    setErrorMessage('');
    setIsReviewing(true);
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!userPhone.trim()) {
      setErrorMessage('Please enter your contact phone number');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const created = await createEventInquiry({
        targetId,
        targetName,
        targetCategory,
        isPackage,
        eventType,
        eventDate,
        guestCount: parseInt(guestCount, 10) || 0,
        city,
        estimatedBudget: parseInt(budget, 10) || 0,
        specialNotes: notes,
        userName,
        userPhone,
        userEmail,
      });

      setSubmittedInquiryId(created.id);
      if (onSuccess) {
        onSuccess(created.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badge}>
                <Sparkles size={11} color="#D4AF37" />
                <Text style={styles.badgeText}>
                  {isPackage ? 'Curated Package Inquiry' : 'Direct Vendor Consultation'}
                </Text>
              </View>
              <Text style={styles.targetName} numberOfLines={1}>
                {targetName}
              </Text>
              <Text style={styles.targetCategory}>{targetCategory} • Availability enquiry</Text>
            </View>
            <VellureButton
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={18} color="#641E3D" />
            </VellureButton>
          </View>

          {submittedInquiryId ? (
            /* Success Confirmation Screen */
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={54} color="#15803D" strokeWidth={2.2} />
              </View>
              <Text style={styles.successTitle}>Inquiry Sent Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your request has been forwarded to{' '}
                <Text style={styles.successHighlight}>{targetName}</Text>.
              </Text>

              <View style={styles.referenceCard}>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Reference Code</Text>
                  <Text style={styles.refCode}>{submittedInquiryId}</Text>
                </View>
                <View style={styles.refDivider} />
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Event</Text>
                  <Text style={styles.refVal}>{eventType} ({guestCount} Guests)</Text>
                </View>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Target Date</Text>
                  <Text style={styles.refVal}>{eventDate || 'Flexible'}</Text>
                </View>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Status</Text>
                  <View style={styles.statusPill}>
                    <Clock size={10} color="#641E3D" />
                    <Text style={styles.statusText}>Under Review</Text>
                  </View>
                </View>
              </View>

              <View style={styles.guaranteeBox}>
                <ShieldCheck size={16} color="#641E3D" />
                <Text style={styles.guaranteeText}>
                  Your enquiry is saved in My Plans. Response timing and final pricing depend on the partner.
                </Text>
              </View>

              <VellureButton
                style={styles.primaryBtn}
                onPress={handleClose}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryBtnText}>Done & View My Inquiries</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </VellureButton>
            </View>
          ) : (
            /* Inquiry Form */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollForm}
              keyboardShouldPersistTaps="handled"
            >
              {/* Event Type Selector */}
              <Text style={styles.fieldLabel}>Event Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {EVENT_TYPES.map((type) => {
                  const isSelected = eventType === type;
                  return (
                    <VellureButton
                      key={type}
                      onPress={() => setEventType(type)}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {type}
                      </Text>
                    </VellureButton>
                  );
                })}
              </ScrollView>

              {/* Event Date & Guest Count Row */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <VellureInputField
                    label="Event Date"
                    icon={<Calendar size={14} color="#D2AD6B" />}
                    value={eventDate}
                    onChangeText={setEventDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.halfInput}>
                  <VellureInputField
                    label="Expected Guests"
                    icon={<Users size={14} color="#D2AD6B" />}
                    value={guestCount}
                    onChangeText={setGuestCount}
                    placeholder="e.g. 300"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* City & Budget Row */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <VellureInputField
                    label="Event City"
                    icon={<MapPin size={14} color="#D2AD6B" />}
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Patiala"
                  />
                </View>

                <View style={styles.halfInput}>
                  <VellureInputField
                    label="Approx. Budget (₹)"
                    icon={<IndianRupee size={14} color="#D2AD6B" />}
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="e.g. 500000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Special Requirements / Notes */}
              <VellureInputField
                label="Special Requirements & Preferences"
                value={notes}
                onChangeText={setNotes}
                placeholder="Share your theme, timing, catering preferences, or any specific customizations..."
                multiline
                numberOfLines={3}
              />

              {/* Contact Information */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Contact Details</Text>
                <Text style={styles.sectionSubtitle}>For quotation & consultation coordination</Text>
              </View>

              <VellureInputField
                label="Full Name *"
                icon={<User size={14} color="#D2AD6B" />}
                value={userName}
                onChangeText={setUserName}
                placeholder="Full Name *"
              />

              <VellureInputField
                label="Phone Number (WhatsApp) *"
                icon={<Phone size={14} color="#D2AD6B" />}
                value={userPhone}
                onChangeText={setUserPhone}
                placeholder="Phone Number *"
                keyboardType="phone-pad"
              />

              <VellureInputField
                label="Email Address"
                icon={<Mail size={14} color="#D2AD6B" />}
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {isReviewing && (
                <View style={styles.reviewPanel}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewTitle}>Review your enquiry</Text>
                      <Text style={styles.reviewSubtitle}>Confirm these details before sending.</Text>
                    </View>
                    <VellureButton onPress={() => setIsReviewing(false)} style={styles.editButton}>
                      <Text style={styles.editText}>Edit</Text>
                    </VellureButton>
                  </View>
                  <Text style={styles.reviewLine}>{eventType} · {eventDate || 'Flexible date'}</Text>
                  <Text style={styles.reviewLine}>{city} · {guestCount || 'Guest count not shared'} guests</Text>
                  <Text style={styles.reviewLine}>
                    {budget ? `Budget ₹${Number(budget).toLocaleString('en-IN')}` : 'Budget not shared'}
                  </Text>
                  <Text style={styles.reviewLine}>Contact: {userName} · {userPhone}</Text>
                </View>
              )}

              {/* Trust Banner */}
              <View style={styles.trustBanner}>
                <ShieldCheck size={18} color="#15803D" />
                <Text style={styles.trustBannerText}>
                  Zero commitment. Get official quote & check calendar availability directly.
                </Text>
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Submit CTA */}
              <VellureButton
                style={styles.primaryBtn}
                onPress={isReviewing ? handleSubmit : handleReview}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {isReviewing ? 'Send Enquiry' : 'Review Enquiry'}
                    </Text>
                    <ArrowRight size={17} color="#FFFFFF" />
                  </>
                )}
              </VellureButton>
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
    backgroundColor: 'rgba(26, 12, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE5D5',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ECD8B5',
    gap: 4,
  },
  badgeText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetName: {
    color: '#26111A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  targetCategory: {
    color: '#7A6B63',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E9DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollForm: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  fieldLabel: {
    color: '#38202A',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3EFE7',
    borderWidth: 1,
    borderColor: '#E6DCCF',
  },
  chipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  chipText: {
    color: '#5C4E44',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DACB',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: '#26111A',
    fontSize: 14,
    fontWeight: '600',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DACB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#26111A',
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 16,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  sectionHeader: {
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#26111A',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#8A7A70',
    fontSize: 11,
    fontWeight: '500',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
    gap: 10,
  },
  trustBannerText: {
    flex: 1,
    color: '#166534',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  reviewPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCC7D0',
    backgroundColor: '#FFF7FA',
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 },
  reviewTitle: { color: '#2D2025', fontSize: 14, fontWeight: '900' },
  reviewSubtitle: { color: '#8B7B81', fontSize: 10, marginTop: 2 },
  reviewLine: { color: '#5F5056', fontSize: 11, fontWeight: '700', lineHeight: 17 },
  editButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F2E3E9' },
  editText: { color: '#641E3D', fontSize: 10, fontWeight: '900' },
  primaryBtn: {
    backgroundColor: '#641E3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 18,
    gap: 8,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#26111A',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#6A5A50',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  successHighlight: {
    color: '#641E3D',
    fontWeight: '800',
  },
  referenceCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBDDC9',
    marginBottom: 16,
    gap: 8,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    color: '#8A7A70',
    fontSize: 12,
    fontWeight: '700',
  },
  refCode: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  refVal: {
    color: '#26111A',
    fontSize: 13,
    fontWeight: '800',
  },
  refDivider: {
    height: 1,
    backgroundColor: '#F3E8DB',
    marginVertical: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF4EB',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  guaranteeText: {
    flex: 1,
    color: '#543D46',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
