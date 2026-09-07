import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import {
  Package,
  PackagePlus,
  X,
  CheckCircle2,
  Plus,
  Sparkles,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  ChevronRight,
  Trash2,
  FolderKanban,
  Check,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { VellureButton, VellureFieldTrigger } from '../ui/VellureControls';
import { PriceDisplay } from '../ui/PriceDisplay';
import { CelebrationTypePickerModal } from '../ui/CelebrationTypePickerModal';
import { EVENT_TYPE_OPTIONS as CELEBRATION_TYPES } from '../../constants/eventTypes';
import {
  CustomPackage,
  getAllCustomPackages,
  getCustomPackage,
  subscribeAllCustomPackages,
  createNewCustomPackage,
  addVendorToCustomPackage,
  removeVendorFromCustomPackage,
  isVendorInCustomPackage,
  setActivePackage,
} from '../../services/customPackageStore';

export interface AddToPackageVendorTarget {
  id: string;
  businessName?: string;
  name?: string;
  category?: string;
  city?: string;
  locality?: string;
  image?: string;
  basePrice?: number;
  priceNumeric?: number;
  priceType?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: number;
}

export interface AddToPackageModalProps {
  visible: boolean;
  vendor: AddToPackageVendorTarget | null;
  onClose: () => void;
  onSuccess?: (packageId: string, packageName: string) => void;
}

export function AddToPackageModal({
  visible,
  vendor,
  onClose,
  onSuccess,
}: AddToPackageModalProps) {
  const [allPackages, setAllPackages] = useState<CustomPackage[]>(getAllCustomPackages());
  const [activePkg, setActivePkg] = useState<CustomPackage>(getCustomPackage());

  // Inline "Create New Suite" Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState('');
  const [newEventType, setNewEventType] = useState('Wedding');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [newCity, setNewCity] = useState('Patiala');
  const [newBudgetLakhs, setNewBudgetLakhs] = useState('20');

  // Success Feedback State
  const [successBanner, setSuccessBanner] = useState<{
    packageId: string;
    packageName: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAllCustomPackages((packages, active) => {
      setAllPackages(packages);
      setActivePkg(active);
    });
    return unsubscribe;
  }, []);

  // Reset states when modal is opened
  useEffect(() => {
    if (visible && vendor) {
      setSuccessBanner(null);
      setShowCreateForm(false);
      const vName = vendor.businessName || vendor.name || 'Specialist';
      setNewSuiteName(`${vendor.category || 'Celebration'} Suite`);
      if (vendor.city) setNewCity(vendor.city);
    }
  }, [visible, vendor]);

  if (!visible || !vendor) return null;

  const vendorId = String(vendor.id || '');
  const vendorName = vendor.businessName || vendor.name || 'Specialist';
  const vendorImg =
    vendor.image ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';

  const handleAddToExistingPackage = (pkg: CustomPackage) => {
    const res = addVendorToCustomPackage(
      {
        id: vendorId,
        businessName: vendorName,
        category: vendor.category || 'Specialist',
        city: vendor.city || pkg.city,
        image: vendorImg,
        basePrice: vendor.basePrice || vendor.priceNumeric || 45000,
        priceType: vendor.priceType || 'STARTING_PRICE',
        rating: vendor.rating || 4.9,
        reviewsCount: vendor.reviewsCount || vendor.reviews || 24,
      },
      pkg.id
    );

    if (res.success) {
      setActivePackage(pkg.id);
      setSuccessBanner({
        packageId: pkg.id,
        packageName: pkg.name,
        message: `Added ${vendorName} to "${pkg.name}"`,
      });
      onSuccess?.(pkg.id, pkg.name);
    }
  };

  const handleRemoveFromPackage = (pkg: CustomPackage) => {
    removeVendorFromCustomPackage(vendorId, pkg.id);
    setSuccessBanner(null);
  };

  const handleCreateAndAdd = () => {
    const budgetNum = (parseFloat(newBudgetLakhs) || 20) * 100000;
    const createdPkg = createNewCustomPackage({
      name: newSuiteName.trim() || `${newEventType} Suite`,
      eventType: newEventType,
      city: newCity.trim() || 'Patiala',
      targetBudget: budgetNum,
    });

    const res = addVendorToCustomPackage(
      {
        id: vendorId,
        businessName: vendorName,
        category: vendor.category || 'Specialist',
        city: vendor.city || createdPkg.city,
        image: vendorImg,
        basePrice: vendor.basePrice || vendor.priceNumeric || 45000,
        priceType: vendor.priceType || 'STARTING_PRICE',
        rating: vendor.rating || 4.9,
        reviewsCount: vendor.reviewsCount || vendor.reviews || 24,
      },
      createdPkg.id
    );

    setShowCreateForm(false);
    setActivePackage(createdPkg.id);

    setSuccessBanner({
      packageId: createdPkg.id,
      packageName: createdPkg.name,
      message: `Created "${createdPkg.name}" and added ${vendorName}!`,
    });
    onSuccess?.(createdPkg.id, createdPkg.name);
  };

  const handleOpenSuite = (packageId: string) => {
    onClose();
    router.push({ pathname: '/custom-package', params: { id: packageId } });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ──── 1. HEADER ──── */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <PackagePlus size={18} color="#641E3D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Add to Celebration Suite</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Choose which package to assign this specialist
                </Text>
              </View>
            </View>
            <VellureButton
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close package selection modal"
            >
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {/* ──── 2. VENDOR SUMMARY STRIP ──── */}
          <View style={styles.vendorPreviewCard}>
            <Image source={{ uri: vendorImg }} style={styles.vendorThumb} />
            <View style={styles.vendorInfo}>
              <View style={styles.vendorCatRow}>
                <Text style={styles.vendorCatText}>{vendor.category || 'Specialist'}</Text>
                {vendor.city && (
                  <Text style={styles.vendorCityText}>• {vendor.city}</Text>
                )}
              </View>
              <Text style={styles.vendorNameText} numberOfLines={1}>
                {vendorName}
              </Text>
              <PriceDisplay
                price={vendor.basePrice || vendor.priceNumeric}
                priceType={vendor.priceType}
                size="small"
              />
            </View>
          </View>

          {/* ──── 3. SUCCESS BANNER ──── */}
          {successBanner && (
            <View style={styles.successToast}>
              <CheckCircle2 size={16} color="#287857" />
              <Text style={styles.successToastText} numberOfLines={2}>
                {successBanner.message}
              </Text>
              <VellureButton
                style={styles.toastCtaBtn}
                onPress={() => handleOpenSuite(successBanner.packageId)}
              >
                <Text style={styles.toastCtaText}>Open Suite →</Text>
              </VellureButton>
            </View>
          )}

          {/* ──── 4. PACKAGES LIST & CREATE FLOW ──── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* INLINE CREATE FORM */}
            {showCreateForm ? (
              <View style={styles.createCard}>
                <View style={styles.createCardHeader}>
                  <Sparkles size={14} color="#8A6A23" />
                  <Text style={styles.createCardTitle}>Create New Custom Suite</Text>
                </View>

                {/* Suite Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Suite Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSuiteName}
                    onChangeText={setNewSuiteName}
                    placeholder="e.g. Royal Wedding Suite, Sangeet Night"
                    placeholderTextColor="#A4959B"
                  />
                </View>

                {/* Celebration Type Dropdown with Search */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Celebration Type</Text>
                  <VellureFieldTrigger
                    value={newEventType}
                    placeholder="Select Celebration Type..."
                    kind="dropdown"
                    onPress={() => setShowTypePicker(true)}
                    accessibilityLabel={`Celebration Type: ${newEventType}`}
                  />
                </View>

                {/* City & Budget Row */}
                <View style={styles.twoColRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newCity}
                      onChangeText={setNewCity}
                      placeholder="e.g. Patiala"
                      placeholderTextColor="#A4959B"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Budget (₹ Lakhs)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newBudgetLakhs}
                      onChangeText={setNewBudgetLakhs}
                      keyboardType="numeric"
                      placeholder="20"
                      placeholderTextColor="#A4959B"
                    />
                  </View>
                </View>

                {/* Form Actions */}
                <View style={styles.formActionsRow}>
                  <VellureButton
                    style={styles.cancelFormBtn}
                    onPress={() => setShowCreateForm(false)}
                  >
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </VellureButton>

                  <VellureButton
                    variant="primary"
                    style={styles.confirmCreateBtn}
                    onPress={handleCreateAndAdd}
                  >
                    <Plus size={14} color="#FFFFFF" />
                    <Text style={styles.confirmCreateText}>Create & Add Specialist</Text>
                  </VellureButton>
                </View>
              </View>
            ) : (
              /* CREATE TRIGGER BUTTON */
              <VellureButton
                style={styles.createTriggerCard}
                onPress={() => setShowCreateForm(true)}
                activeOpacity={0.85}
              >
                <View style={styles.createTriggerIconWrap}>
                  <Plus size={16} color="#641E3D" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createTriggerTitle}>+ Create New Celebration Suite</Text>
                  <Text style={styles.createTriggerSubtitle}>
                    Start a fresh package and add this specialist as lead
                  </Text>
                </View>
              </VellureButton>
            )}

            {/* EXISTING CELEBRATION SUITES LIST */}
            <View style={styles.sectionTitleRow}>
              <Package size={13} color="#641E3D" />
              <Text style={styles.sectionTitle}>
                Your Celebration Suites ({allPackages.length})
              </Text>
            </View>

            {allPackages.map((pkg) => {
              const inThisPackage = isVendorInCustomPackage(vendorId, pkg.id);
              const isActive = pkg.id === activePkg.id;

              return (
                <View
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    inThisPackage && styles.packageCardAdded,
                    isActive && styles.packageCardActive,
                  ]}
                >
                  <View style={styles.packageCardTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgName} numberOfLines={1}>
                          {pkg.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgMetaText}>
                        {pkg.eventType || 'Celebration'} • {pkg.city || 'Patiala'} • {pkg.guestCount || 300} Guests
                      </Text>
                    </View>

                    <View style={styles.pkgPriceCol}>
                      <Text style={styles.pkgPriceTotal}>
                        ₹{(pkg.totalPrice / 100000).toFixed(1)}L
                      </Text>
                      <Text style={styles.pkgSpecialistsCount}>
                        {pkg.vendors.length} {pkg.vendors.length === 1 ? 'Specialist' : 'Specialists'}
                      </Text>
                    </View>
                  </View>

                  {/* Card Action Row */}
                  <View style={styles.packageActionRow}>
                    {inThisPackage ? (
                      <View style={styles.inPackageStatusRow}>
                        <View style={styles.addedBadge}>
                          <Check size={11} color="#287857" strokeWidth={3} />
                          <Text style={styles.addedBadgeText}>Already in Suite</Text>
                        </View>
                        <VellureButton
                          style={styles.removePkgBtn}
                          onPress={() => handleRemoveFromPackage(pkg)}
                          accessibilityLabel={`Remove ${vendorName} from ${pkg.name}`}
                        >
                          <Trash2 size={12} color="#B63A4A" />
                          <Text style={styles.removePkgText}>Remove</Text>
                        </VellureButton>
                      </View>
                    ) : (
                      <VellureButton
                        variant="primary"
                        style={styles.addPkgBtn}
                        onPress={() => handleAddToExistingPackage(pkg)}
                        accessibilityLabel={`Add ${vendorName} to ${pkg.name}`}
                      >
                        <Plus size={13} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.addPkgBtnText}>Add to this Suite</Text>
                      </VellureButton>
                    )}

                    <VellureButton
                      style={styles.openPkgBtn}
                      onPress={() => handleOpenSuite(pkg.id)}
                    >
                      <Text style={styles.openPkgBtnText}>View Suite</Text>
                      <ChevronRight size={11} color="#641E3D" />
                    </VellureButton>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <CelebrationTypePickerModal
        visible={showTypePicker}
        selectedType={newEventType}
        onClose={() => setShowTypePicker(false)}
        onSelect={(selected) => {
          setNewEventType(selected);
          setShowTypePicker(false);
        }}
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
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CF',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  headerTitle: {
    color: '#2A121E',
    fontSize: 16,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#786B70',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  vendorPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CF',
  },
  vendorThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorCatText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  vendorCityText: {
    color: '#786B70',
    fontSize: 9,
    fontWeight: '600',
  },
  vendorNameText: {
    color: '#2A121E',
    fontSize: 13,
    fontWeight: '900',
    marginVertical: 1,
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF8F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C3ECD8',
  },
  successToastText: {
    color: '#287857',
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  toastCtaBtn: {
    backgroundColor: '#287857',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toastCtaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  createTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#ECD8B5',
    borderStyle: 'dashed',
  },
  createTriggerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTriggerTitle: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '900',
  },
  createTriggerSubtitle: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECD8B5',
    gap: 10,
  },
  createCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  createCardTitle: {
    color: '#641E3D',
    fontSize: 12.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    color: '#8A7A70',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2A121E',
    fontWeight: '700',
  },
  typeChipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  typeChip: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
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
    fontSize: 10.5,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cancelFormBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  cancelFormText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '800',
  },
  confirmCreateBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  confirmCreateText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 10,
  },
  packageCardAdded: {
    borderColor: '#C3ECD8',
    backgroundColor: '#FCFDFD',
  },
  packageCardActive: {
    borderWidth: 1.5,
  },
  packageCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  pkgTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pkgName: {
    color: '#2A121E',
    fontSize: 13.5,
    fontWeight: '900',
  },
  activeTag: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  activeTagText: {
    color: '#8A6A23',
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pkgMetaText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  pkgPriceCol: {
    alignItems: 'flex-end',
  },
  pkgPriceTotal: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '900',
  },
  pkgSpecialistsCount: {
    color: '#8A7A70',
    fontSize: 9.5,
    fontWeight: '700',
  },
  packageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE4',
  },
  inPackageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#EBF8F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C3ECD8',
  },
  addedBadgeText: {
    color: '#287857',
    fontSize: 10,
    fontWeight: '800',
  },
  removePkgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  removePkgText: {
    color: '#B63A4A',
    fontSize: 10,
    fontWeight: '800',
  },
  addPkgBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPkgBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  openPkgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  openPkgBtnText: {
    color: '#641E3D',
    fontSize: 10.5,
    fontWeight: '800',
  },
});
