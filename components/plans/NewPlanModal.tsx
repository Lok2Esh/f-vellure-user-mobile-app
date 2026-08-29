import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Sparkles,
  Edit3,
  Calendar,
  Users,
  MapPin,
  IndianRupee,
  ChevronRight,
  Send,
  Plus,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { createNewPlan, EventPlan } from '../../services/api';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';

interface NewPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanCreated: (plan: EventPlan) => void;
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
  'Other',
];

export function NewPlanModal({ visible, onClose, onPlanCreated }: NewPlanModalProps) {
  const [mode, setMode] = useState<'choice' | 'manual'>('choice');

  // Manual Form State
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [city, setCity] = useState('Patiala');
  const [date, setDate] = useState('');
  const [guestCount, setGuestCount] = useState('250');
  const [budget, setBudget] = useState('1500000');
  const [theme, setTheme] = useState('Grand & Royal');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handlePlanWithAi = () => {
    onClose();
    router.push('/(tabs)/budget');
  };

  const handleCreateManual = async () => {
    if (!name.trim()) {
      Alert.alert('Plan Name Needed', 'Please provide a name for your celebration (e.g. Wedding in Patiala).');
      return;
    }

    setIsCreating(true);
    try {
      const numericBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10) || 1500000;
      const numericGuests = parseInt(guestCount.replace(/[^0-9]/g, ''), 10) || 200;

      const plan = await createNewPlan({
        name: name.trim(),
        eventType,
        city: city.trim() || 'Patiala',
        date: date.trim() || undefined,
        guestCount: numericGuests,
        budgetMax: numericBudget,
        theme: theme.trim(),
        description: description.trim(),
      });

      onPlanCreated(plan);
      Alert.alert('Plan Created', `"${plan.name}" has been added to your planning workspace.`);
      setMode('choice');
      setName('');
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Could not create plan right now.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {mode === 'choice' ? 'Create a New Event Plan' : 'Manual Plan Setup'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'choice'
                  ? 'Choose your preferred planning path'
                  : 'Enter celebration details to initialize your workspace'}
              </Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {mode === 'choice' ? (
            <View style={styles.choiceBody}>
              {/* Option 1: AI Planner */}
              <VellureButton
                style={styles.choiceCard}
                onPress={handlePlanWithAi}
                activeOpacity={0.85}
              >
                <View style={styles.choiceIconWrapAi}>
                  <Sparkles size={20} color="#D2AD6B" />
                </View>
                <View style={styles.choiceInfo}>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>AI-Powered</Text>
                  </View>
                  <Text style={styles.choiceTitle}>Plan with AI Concierge</Text>
                  <Text style={styles.choiceDesc}>
                    Describe your celebration in natural language. Our AI extracts requirements, optimizes local budget allocations, and shortlists verified partners.
                  </Text>
                </View>
                <ChevronRight size={18} color="#641E3D" />
              </VellureButton>

              {/* Option 2: Manual Setup */}
              <VellureButton
                style={styles.choiceCard}
                onPress={() => setMode('manual')}
                activeOpacity={0.85}
              >
                <View style={styles.choiceIconWrapManual}>
                  <Edit3 size={20} color="#641E3D" />
                </View>
                <View style={styles.choiceInfo}>
                  <Text style={styles.choiceTitle}>Start Manually</Text>
                  <Text style={styles.choiceDesc}>
                    Define custom dates, guest counts, and service categories step-by-step for complete manual control.
                  </Text>
                </View>
                <ChevronRight size={18} color="#641E3D" />
              </VellureButton>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <VellureInputField
                label="Celebration Name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Royal Anand Karaj & Reception"
              />

              <Text style={styles.inputLabel}>Event Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeScroll}
              >
                {EVENT_TYPE_OPTIONS.map((t) => (
                  <VellureButton
                    key={t}
                    style={[styles.typeChip, eventType === t && styles.typeChipActive]}
                    onPress={() => setEventType(t)}
                  >
                    <Text style={[styles.typeChipText, eventType === t && styles.typeChipTextActive]}>
                      {t}
                    </Text>
                  </VellureButton>
                ))}
              </ScrollView>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <VellureInputField
                    label="Host City"
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Patiala"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <VellureInputField
                    label="Target Date (Optional)"
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <VellureInputField
                    label="Expected Guests"
                    value={guestCount}
                    onChangeText={setGuestCount}
                    keyboardType="number-pad"
                    placeholder="250"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <VellureInputField
                    label="Total Budget (₹)"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="number-pad"
                    placeholder="1500000"
                  />
                </View>
              </View>

              <VellureInputField
                label="Celebration Theme"
                value={theme}
                onChangeText={setTheme}
                placeholder="e.g. Grand & Royal, Rustic Garden, Heritage"
              />

              <VellureInputField
                label="Special Notes / Priorities"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="e.g. Focus on royal palace setup, gourmet live catering, and candid cinema..."
              />

              <View style={styles.manualActionsRow}>
                <VellureButton
                  style={styles.backBtn}
                  onPress={() => setMode('choice')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backBtnText}>Back</Text>
                </VellureButton>

                <VellureButton
                  style={styles.createBtn}
                  onPress={handleCreateManual}
                  disabled={isCreating}
                  activeOpacity={0.88}
                >
                  {isCreating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.createBtnText}>Initialize Plan Workspace</Text>
                    </>
                  )}
                </VellureButton>
              </View>
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
  choiceBody: {
    gap: 12,
    paddingBottom: 20,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  choiceIconWrapAi: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A121E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  choiceIconWrapManual: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  choiceInfo: {
    flex: 1,
    paddingRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  recommendedBadgeText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  choiceTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  choiceDesc: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
  },
  scroll: {
    paddingBottom: 28,
  },
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 12,
    color: '#2D2025',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 6,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  typeScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  typeChipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  typeChipText: {
    color: '#786B70',
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
  descInput: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#2D2025',
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  manualActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '800',
  },
  createBtn: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
