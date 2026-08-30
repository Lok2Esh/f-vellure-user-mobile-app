import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, MapPin, Plus, Trash2, Home, Building2, Navigation } from 'lucide-react-native';
import { SavedLocationItem, fetchSavedLocations, addSavedLocation, removeSavedLocation } from '../../services/api';
import { getSelectedLocation, setSelectedLocation } from '../../services/locationStore';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';
import { VellureButton } from "@/components/ui/VellureControls";
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface SavedLocationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SavedLocationsModal({ visible, onClose }: SavedLocationsModalProps) {
  const [locations, setLocations] = useState<SavedLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newTag, setNewTag] = useState<'Primary' | 'Venue' | 'Family'>('Venue');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedLocationItem | null>(null);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const list = await fetchSavedLocations();
      setLocations(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadLocations();
    }
  }, [visible]);

  const handleAddLocation = async () => {
    if (!newName.trim() || !newCity.trim()) {
      Alert.alert('Required Fields', 'Please provide a location label and city.');
      return;
    }

    setIsAdding(true);
    try {
      const updated = await addSavedLocation({
        name: newName.trim(),
        city: newCity.trim(),
        state: newState.trim() || 'Punjab',
        tag: newTag,
      });
      setLocations(updated);
      setNewName('');
      setNewCity('');
      setNewState('');
      setShowAddForm(false);
    } catch (e) {
      Alert.alert('Error', 'Could not save location.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmRemoveLocation = async () => {
    if (!deleteTarget) return;
    try {
      const updated = await removeSavedLocation(deleteTarget.id);
      setLocations(updated);
    } catch (e) {
      Alert.alert('Error', 'Could not remove location.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Saved Locations & Cities</Text>
              <Text style={styles.subtitle}>Preferred hosting cities and venues</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color="#641E3D" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {locations.map((loc) => {
                const isActive = getSelectedLocation().city.toLowerCase() === loc.city.toLowerCase();
                return (
                  <VellureButton
                    key={loc.id}
                    style={[styles.locCard, isActive && { borderColor: '#641E3D', backgroundColor: '#FAF5EC' }]}
                    onPress={() => setSelectedLocation(loc.city, loc.state)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.locIconWrap}>
                      {loc.tag === 'Primary' ? (
                        <Home size={16} color="#641E3D" />
                      ) : (
                        <Building2 size={16} color="#641E3D" />
                      )}
                    </View>
                    <View style={styles.locInfo}>
                      <View style={styles.tagRow}>
                        <Text style={styles.locName}>{loc.name}</Text>
                        {isActive && (
                          <View style={[styles.tagBadge, { backgroundColor: '#EBF8F2', borderColor: '#C3ECD8' }]}>
                            <Text style={[styles.tagBadgeText, { color: '#287857' }]}>Active ✓</Text>
                          </View>
                        )}
                        {loc.tag && !isActive && (
                          <View style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{loc.tag}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.locSub}>
                        {loc.city}, {loc.state}
                      </Text>
                    </View>
                    <VellureButton
                      style={styles.deleteBtn}
                      onPress={() => setDeleteTarget(loc)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Remove location ${loc.name}`}
                    >
                      <Trash2 size={15} color="#B63A4A" />
                    </VellureButton>
                  </VellureButton>
                );
              })}

              {/* Add New Location Form or Trigger */}
              {showAddForm ? (
                <View style={styles.addCard}>
                  <Text style={styles.addHeading}>Add New Celebration Location</Text>

                  <VellureInputField
                    label="Location Label"
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Wedding Palace / In-laws Home"
                  />

                  <VellureInputField
                    label="City"
                    value={newCity}
                    onChangeText={setNewCity}
                    placeholder="e.g. Chandigarh, Jaipur"
                  />

                  <VellureInputField
                    label="State"
                    value={newState}
                    onChangeText={setNewState}
                    placeholder="e.g. Punjab, Rajasthan"
                  />

                  <View style={styles.addActionsRow}>
                    <VellureButton
                      style={styles.cancelBtn}
                      onPress={() => setShowAddForm(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </VellureButton>

                    <VellureButton
                      style={styles.confirmAddBtn}
                      onPress={handleAddLocation}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.confirmAddBtnText}>Save Location</Text>
                      )}
                    </VellureButton>
                  </View>
                </View>
              ) : (
                <VellureButton
                  style={styles.addNewTriggerBtn}
                  onPress={() => setShowAddForm(true)}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color="#641E3D" />
                  <Text style={styles.addNewTriggerText}>Add Another Event Location</Text>
                </VellureButton>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ⚠️ Reusable Confirmation Dialog */}
      <ConfirmationModal
        visible={deleteTarget !== null}
        title="Remove Saved Location"
        message={`Are you sure you want to remove "${deleteTarget?.name || 'this location'}" from your saved locations?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive={true}
        icon="trash"
        onConfirm={handleConfirmRemoveLocation}
        onClose={() => setDeleteTarget(null)}
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
    maxHeight: '85%',
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
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 28,
  },
  locCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  locIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locName: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
  },
  tagBadge: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '800',
  },
  locSub: {
    color: '#786B70',
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  addNewTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE3CF',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  addNewTriggerText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginTop: 10,
  },
  addHeading: {
    color: '#641E3D',
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
    marginTop: 6,
  },
  input: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    color: '#2D2025',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  addActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmAddBtn: {
    flex: 2,
    backgroundColor: '#641E3D',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
