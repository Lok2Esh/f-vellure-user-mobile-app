import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  FileEdit,
  Flower,
  FolderHeart,
  HeartHandshake,
  IndianRupee,
  Lock,
  MapPin,
  Music,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Scissors,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UserCheck,
  Users,
  Utensils,
  X,
  Zap,
} from 'lucide-react-native';
import { VellureButton } from '../components/ui/VellureControls';
import { VellureInputField, VellureSearchInput } from '../components/ui/VellureInputField';
import { FormDropdown } from '../components/ui/FormDropdown';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { RatingDisplay } from '../components/ui/RatingDisplay';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { CityPickerModal, CityEntry } from '../components/ui/CityPickerModal';
import { CalendarModal } from '../components/ui/CalendarModal';
import { EventInquiryModal } from '../components/inquiry/EventInquiryModal';
import { PackageAvailabilityBroadcastModal } from '../components/inquiry/PackageAvailabilityBroadcastModal';
import { getServiceMetadata } from '../constants/services';
import {
  CustomPackage,
  CustomPackageVendorItem,
  clearCustomPackage,
  getCustomPackage,
  getAllCustomPackages,
  getPackageById,
  setActivePackage,
  createNewCustomPackage,
  duplicateCustomPackage,
  savePackageAsDraft,
  deleteCustomPackage,
  removeVendorFromCustomPackage,
  subscribeAllCustomPackages,
  updateCustomPackageSettings,
  addVendorToCustomPackage,
  getCategoryBudget,
  updateCategoryBudget,
} from '../services/customPackageStore';
import { fetchVendorsData } from '../services/api';

type VendorChoiceItem = {
  id: string;
  businessName?: string;
  name?: string;
  category?: string;
  city?: string;
  image?: string;
  basePrice?: number;
  priceType?: string;
  rating?: number;
  reviewsCount?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;

const DEFAULT_CITIES: CityEntry[] = [
  { city: 'Patiala', state: 'Punjab' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Gurgaon', state: 'Haryana' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Bangalore', state: 'Karnataka' },
];

const EVENT_TYPES = [
  'Grand Wedding',
  'Sangeet Party',
  'Evening Reception',
  'Birthday Party',
  'Engagement',
  'Cocktail Gala',
  'Anniversary',
  'Housewarming',
];

const STANDARD_CATEGORIES = [
  { key: 'VENUE', label: 'Venue Partner', icon: Building2 },
  { key: 'CATERING', label: 'Catering & Feast', icon: Utensils },
  { key: 'PHOTOGRAPHY', label: 'Photography & Cinema', icon: Camera },
  { key: 'DECOR', label: 'Decor & Styling', icon: Flower },
  { key: 'MAKEUP', label: 'Bridal & Groom Makeup', icon: Scissors },
  { key: 'ENTERTAINMENT', label: 'DJ & Sound Lighting', icon: Music },
  { key: 'PRIEST', label: 'Priest & Rituals', icon: HeartHandshake },
  { key: 'PLANNING', label: 'Planner & Coordinator', icon: Briefcase },
];

export default function CustomPackageScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [allPackages, setAllPackages] = useState<CustomPackage[]>(getAllCustomPackages());
  const [pkg, setPkg] = useState<CustomPackage>(
    (params.id ? getPackageById(params.id) : null) || getCustomPackage()
  );
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [editSpecsModalVisible, setEditSpecsModalVisible] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [vendorSelectModalCategory, setVendorSelectModalCategory] = useState<string | null>(null);
  const [categoryVendors, setCategoryVendors] = useState<VendorChoiceItem[]>([]);
  const [loadingCategoryVendors, setLoadingCategoryVendors] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [editingCategoryBudget, setEditingCategoryBudget] = useState(false);
  const [catBudgetInput, setCatBudgetInput] = useState('');

  // Reusable Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    icon?: 'trash' | 'alert' | 'logout' | 'help' | 'info' | 'sparkles';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Form State for Package Specs
  const [pkgName, setPkgName] = useState(pkg.name);
  const [pkgEventType, setPkgEventType] = useState(pkg.eventType);
  const [pkgCity, setPkgCity] = useState(pkg.city);
  const [pkgDate, setPkgDate] = useState(pkg.eventDate || '');
  const [pkgGuests, setPkgGuests] = useState(String(pkg.guestCount));
  const [pkgBudget, setPkgBudget] = useState(String(pkg.targetBudget));
  const [pkgDays, setPkgDays] = useState(String(pkg.eventDays || 1));

  useEffect(() => {
    const unsubscribe = subscribeAllCustomPackages((packages, activePkg) => {
      setAllPackages(packages);
      const current = (params.id ? packages.find((p) => p.id === params.id) : null) || activePkg;
      if (current) {
        setPkg(current);
        setPkgName(current.name);
        setPkgEventType(current.eventType);
        setPkgCity(current.city);
        setPkgDate(current.eventDate || '');
        setPkgGuests(String(current.guestCount));
        setPkgBudget(String(current.targetBudget));
        setPkgDays(String(current.eventDays || 1));
      }
    });
    return unsubscribe;
  }, [params.id]);

  const handleUpdateSpecs = () => {
    updateCustomPackageSettings({
      name: pkgName.trim() || 'My Bespoke Celebration Suite',
      eventType: pkgEventType,
      city: pkgCity.trim() || 'Patiala',
      eventDate: pkgDate.trim() || undefined,
      guestCount: parseInt(pkgGuests, 10) || 300,
      eventDays: parseInt(pkgDays, 10) || 1,
      targetBudget: parseInt(pkgBudget, 10) || 1500000,
    });
    setEditSpecsModalVisible(false);
  };

  const handleGuestStep = (delta: number) => {
    const next = Math.max(20, (pkg.guestCount || 300) + delta);
    updateCustomPackageSettings({ guestCount: next });
  };

  const handleRemoveVendor = (vendorId: string, name: string) => {
    if (!vendorId) return;
    setConfirmModal({
      visible: true,
      title: 'Remove Specialist',
      message: `Are you sure you want to remove "${name}" from your custom package? The total price and services will update immediately.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => {
        const updated = removeVendorFromCustomPackage(vendorId, pkg.id);
        setPkg(updated);
      },
    });
  };

  const handleDeletePackage = (packageId: string, name: string) => {
    if (!packageId) return;
    setConfirmModal({
      visible: true,
      title: 'Delete Celebration Suite',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => {
        const res = deleteCustomPackage(packageId);
        const all = getAllCustomPackages();
        setAllPackages(all);
        if (res && res.activePackage) {
          setPkg(res.activePackage);
        }
      },
    });
  };

  const handleReset = () => {
    setConfirmModal({
      visible: true,
      title: 'Reset Package',
      message: 'Are you sure you want to clear all specialists and start fresh with an empty custom suite?',
      confirmText: 'Reset All',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'alert',
      onConfirm: () => {
        clearCustomPackage();
      },
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: pkg.name,
        message: `Check out my custom ${pkg.eventType} package on Vellure: ${pkg.name} (${pkg.vendors.length} specialists, Total: ₹${pkg.totalPrice.toLocaleString('en-IN')})!`,
      });
    } catch (_) {}
  };

  const handleOpenVendorSelect = async (catKey: string) => {
    setVendorSelectModalCategory(catKey);
    setVendorSearchQuery('');
    setEditingCategoryBudget(false);
    const initialCatBudget = getCategoryBudget(pkg, catKey);
    setCatBudgetInput(String(initialCatBudget));
    setLoadingCategoryVendors(true);
    try {
      const grouped = await fetchVendorsData();
      const allVendors = Object.values(grouped).flat() as VendorChoiceItem[];
      const filtered = allVendors.filter(
        (v: VendorChoiceItem) =>
          v.category?.toUpperCase() === catKey.toUpperCase() ||
          v.category?.toLowerCase().includes(catKey.toLowerCase())
      );
      setCategoryVendors(filtered.length > 0 ? filtered : allVendors.slice(0, 4));
    } catch (_) {
      setCategoryVendors([]);
    } finally {
      setLoadingCategoryVendors(false);
    }
  };

  const handleAdjustCategoryBudget = (delta: number) => {
    if (!vendorSelectModalCategory) return;
    const current = getCategoryBudget(pkg, vendorSelectModalCategory);
    const next = Math.max(10000, current + delta);
    updateCategoryBudget(vendorSelectModalCategory, next, pkg.id);
    setCatBudgetInput(String(next));
  };

  const handleSaveCustomCategoryBudget = () => {
    if (!vendorSelectModalCategory) return;
    const parsed = parseInt(catBudgetInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateCategoryBudget(vendorSelectModalCategory, parsed, pkg.id);
    }
    setEditingCategoryBudget(false);
  };

  const processedCategoryVendors = useMemo(() => {
    const query = vendorSearchQuery.toLowerCase().trim();
    const matches = categoryVendors.filter((v) => {
      if (!query) return true;
      return (
        (v.businessName || '').toLowerCase().includes(query) ||
        (v.name || '').toLowerCase().includes(query) ||
        (v.city || '').toLowerCase().includes(query) ||
        (v.category || '').toLowerCase().includes(query)
      );
    });

    const categoryBudgetLimit = getCategoryBudget(pkg, vendorSelectModalCategory);

    return matches
      .map((v) => {
        const basePrice = v.basePrice || 50000;
        const priceType = v.priceType || 'STARTING_PRICE';
        let calculatedPrice = basePrice;
        let formulaLabel = 'Flat Package Rate';

        if (priceType === 'PER_PLATE' || priceType === 'PER_PERSON') {
          calculatedPrice = basePrice * (pkg.guestCount || 300);
          formulaLabel = `₹${basePrice.toLocaleString('en-IN')}/plate × ${pkg.guestCount} guests`;
        } else if (priceType === 'PER_DAY') {
          calculatedPrice = basePrice * (pkg.eventDays || 1);
          formulaLabel = `₹${basePrice.toLocaleString('en-IN')}/day × ${pkg.eventDays || 1} day(s)`;
        } else if (priceType === 'PER_EVENT' || priceType === 'FIXED_PACKAGE') {
          calculatedPrice = basePrice;
          formulaLabel = 'Fixed Event Benchmark';
        } else {
          calculatedPrice = basePrice;
          formulaLabel = 'Base Starting Fee';
        }

        const isCurrentInSlot = pkg.vendors.some((curr) => curr.vendorId === v.id);
        const isCityMatch = (v.city || '').toLowerCase() === (pkg.city || '').toLowerCase();
        const isExceedingBudget = categoryBudgetLimit > 0 && calculatedPrice > categoryBudgetLimit;
        const overBudgetDiff = isExceedingBudget ? calculatedPrice - categoryBudgetLimit : 0;
        const pctOfCatBudget =
          categoryBudgetLimit > 0 ? Math.round((calculatedPrice / categoryBudgetLimit) * 100) : 0;

        return {
          ...v,
          calculatedPrice,
          formulaLabel,
          isCurrentInSlot,
          isCityMatch,
          isExceedingBudget,
          overBudgetDiff,
          pctOfCatBudget,
        };
      })
      .sort((a, b) => {
        // Active (within category budget) options come FIRST, Exceeding Budget options come LAST
        if (a.isExceedingBudget !== b.isExceedingBudget) {
          return a.isExceedingBudget ? 1 : -1;
        }
        // Current selected vendor in slot comes first among active
        if (a.isCurrentInSlot !== b.isCurrentInSlot) {
          return a.isCurrentInSlot ? -1 : 1;
        }
        // City match priority
        if (a.isCityMatch !== b.isCityMatch) {
          return a.isCityMatch ? -1 : 1;
        }
        // Rating priority
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [
    categoryVendors,
    vendorSearchQuery,
    pkg.guestCount,
    pkg.eventDays,
    pkg.targetBudget,
    pkg.categoryBudgets,
    pkg.city,
    pkg.vendors,
    vendorSelectModalCategory,
  ]);

  const handleSaveAsDraft = () => {
    savePackageAsDraft(pkg.id);
    Alert.alert('Draft Saved', `"${pkg.name}" has been saved as a draft.`);
  };

  const handleDuplicate = () => {
    const cloned = duplicateCustomPackage(pkg.id);
    Alert.alert('Suite Duplicated', `Created a copy "${cloned.name}".`);
    router.setParams({ id: cloned.id });
  };

  const handleCreateNew = () => {
    const newPkg = createNewCustomPackage();
    setSwitchModalVisible(false);
    router.setParams({ id: newPkg.id });
  };

  const handleSwitchPackage = (targetId: string) => {
    setActivePackage(targetId);
    setSwitchModalVisible(false);
    router.setParams({ id: targetId });
  };

  // Budget calculations
  const budgetDiff = pkg.targetBudget - pkg.totalPrice;
  const isUnderBudget = budgetDiff >= 0;
  const savingsPct =
    pkg.targetBudget > 0 ? Math.round((Math.abs(budgetDiff) / pkg.targetBudget) * 100) : 0;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ⚡ 1-Click Package Availability Broadcast Modal */}
      <PackageAvailabilityBroadcastModal
        visible={broadcastModalVisible}
        packageItem={pkg}
        onClose={() => setBroadcastModalVisible(false)}
      />

      {/* Unified Multi-Vendor Inquiry Modal */}
      <EventInquiryModal
        visible={inquiryModalVisible}
        onClose={() => setInquiryModalVisible(false)}
        targetId={pkg.id || 'custom_pkg_booking'}
        targetName={pkg.name}
        targetCategory={pkg.eventType}
        isPackage={true}
        initialCity={pkg.city}
        initialBudget={pkg.totalPrice > 0 ? pkg.totalPrice : pkg.targetBudget}
        initialGuestCount={pkg.guestCount}
        initialEventType={pkg.eventType}
      />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <VellureButton
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#2A121E" />
        </VellureButton>

        <VellureButton
          onPress={() => setSwitchModalVisible(true)}
          style={styles.topBarCenter}
        >
          <View style={styles.topBarTitleRow}>
            <Text style={styles.topBarTitle} numberOfLines={1}>{pkg.name}</Text>
            <ChevronRight size={13} color="#8A7A70" />
          </View>
          <Text style={styles.topBarSubtitle}>
            {allPackages.length > 1 ? `${allPackages.length} Suites • Tap to switch` : 'Live Dynamic Suite'}
          </Text>
        </VellureButton>

        <View style={styles.topBarRight}>
          <VellureButton
            onPress={handleSaveAsDraft}
            style={styles.iconActionBtn}
            accessibilityLabel="Save as draft"
          >
            <Save size={15} color="#641E3D" />
          </VellureButton>
          <VellureButton
            onPress={handleDuplicate}
            style={styles.iconActionBtn}
            accessibilityLabel="Duplicate suite"
          >
            <Copy size={15} color="#641E3D" />
          </VellureButton>
          <VellureButton
            onPress={handleShare}
            style={styles.iconActionBtn}
            accessibilityLabel="Share package"
          >
            <Share2 size={15} color="#641E3D" />
          </VellureButton>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ──── 1. HERO PRICE & BUDGET TRACKER CARD ──── */}
        <View style={styles.heroPriceCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroTopRow}>
            <View style={styles.packagePill}>
              <Sparkles size={12} color="#F4D58D" />
              <Text style={styles.packagePillText}>{pkg.eventType}</Text>
            </View>
            <View
              style={[
                styles.pkgStatusBadge,
                pkg.status === 'INQUIRED'
                  ? styles.pkgStatusInquired
                  : pkg.status === 'READY'
                  ? styles.pkgStatusReady
                  : styles.pkgStatusDraft,
              ]}
            >
              <Text
                style={[
                  styles.pkgStatusBadgeText,
                  pkg.status === 'INQUIRED'
                    ? styles.pkgStatusTextInquired
                    : pkg.status === 'READY'
                    ? styles.pkgStatusTextReady
                    : styles.pkgStatusTextDraft,
                ]}
              >
                {pkg.status === 'INQUIRED'
                  ? 'Broadcasted ⚡'
                  : pkg.status === 'READY'
                  ? 'Ready ✨'
                  : 'Draft 📝'}
              </Text>
            </View>
          </View>

          <Text style={styles.packageHeading}>{pkg.name}</Text>

          {/* Big Live Price Display */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Estimated Package Total</Text>
            <View style={styles.priceRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <Text style={styles.priceAmount}>
                {pkg.totalPrice.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.priceSuffix}>all-inclusive</Text>
            </View>
          </View>

          {/* Subtotal & Tax Breakdown */}
          <View style={styles.taxBreakdownRow}>
            <Text style={styles.taxSubText}>
              Subtotal: ₹{pkg.subtotal.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.taxDot}>•</Text>
            <Text style={styles.taxSubText}>
              Est. GST (18%): ₹{pkg.estimatedTax.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Budget Comparison Benchmark */}
          <View style={styles.budgetBenchmarkBox}>
            <View style={styles.benchmarkHeader}>
              <Text style={styles.benchmarkLabel}>Target Budget: ₹{pkg.targetBudget.toLocaleString('en-IN')}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isUnderBudget ? styles.statusBadgeUnder : styles.statusBadgeOver,
                ]}
              >
                {isUnderBudget ? (
                  <ShieldCheck size={12} color="#287857" />
                ) : (
                  <ShieldAlert size={12} color="#B63A4A" />
                )}
                <Text
                  style={[
                    styles.statusBadgeText,
                    isUnderBudget ? styles.statusTextUnder : styles.statusTextOver,
                  ]}
                >
                  {isUnderBudget
                    ? `₹${budgetDiff.toLocaleString('en-IN')} Under Budget (${savingsPct}% Saved)`
                    : `₹${Math.abs(budgetDiff).toLocaleString('en-IN')} Over Budget`}
                </Text>
              </View>
            </View>

            {/* Visual Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.round((pkg.totalPrice / (pkg.targetBudget || 1)) * 100))}%`,
                    backgroundColor: isUnderBudget ? '#287857' : '#B63A4A',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ──── 2. CELEBRATION SPECS & GUEST COUNT ADJUSTER ──── */}
        <View style={styles.specsCard}>
          <View style={styles.specsCardHeader}>
            <View>
              <Text style={styles.specsCardTitle}>Celebration Specifications</Text>
              <Text style={styles.specsCardSubtitle}>Adjust scale to instantly recalculate catering & per-plate prices</Text>
            </View>
            <VellureButton
              style={styles.editSpecsBtn}
              onPress={() => setEditSpecsModalVisible(true)}
              accessibilityLabel="Edit package specifications"
            >
              <Text style={styles.editSpecsBtnText}>Edit Details</Text>
            </VellureButton>
          </View>

          <View style={styles.specsGrid}>
            {/* Guest Scale Stepper */}
            <View style={styles.guestScaleBox}>
              <View style={styles.guestScaleHeader}>
                <Users size={14} color="#641E3D" />
                <Text style={styles.guestScaleLabel}>Guest Scale</Text>
              </View>
              <View style={styles.stepperRow}>
                <VellureButton
                  style={styles.stepperBtn}
                  onPress={() => handleGuestStep(-50)}
                  accessibilityLabel="Decrease guests"
                >
                  <Text style={styles.stepperBtnText}>- 50</Text>
                </VellureButton>
                <View style={styles.guestCountDisplay}>
                  <Text style={styles.guestCountNum}>{pkg.guestCount}</Text>
                  <Text style={styles.guestCountUnit}>Guests</Text>
                </View>
                <VellureButton
                  style={styles.stepperBtn}
                  onPress={() => handleGuestStep(50)}
                  accessibilityLabel="Increase guests"
                >
                  <Text style={styles.stepperBtnText}>+ 50</Text>
                </VellureButton>
              </View>
              <Text style={styles.guestHelperText}>
                ⚡ Auto-scales food & beverage totals live
              </Text>
            </View>

            {/* City & Event Details */}
            <View style={styles.specMiniDetails}>
              <View style={styles.miniDetailItem}>
                <MapPin size={13} color="#D2AD6B" />
                <View>
                  <Text style={styles.miniDetailLabel}>Location</Text>
                  <Text style={styles.miniDetailValue}>{pkg.city}</Text>
                </View>
              </View>

              <View style={styles.miniDetailItem}>
                <Calendar size={13} color="#D2AD6B" />
                <View>
                  <Text style={styles.miniDetailLabel}>Celebration Date</Text>
                  <Text style={styles.miniDetailValue}>{pkg.eventDate || 'Nov 2025'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ──── 3. SELECTED SPECIALISTS & SERVICE SLOTS ──── */}
        <View style={styles.servicesSection}>
          <SectionHeader
            title="Package Specialists & Crew"
            subtitle="Select verified partners for each celebration service slot"
            badge="Live Dynamic Pricing"
            actionText="Explore All"
            onAction={() => router.push('/(tabs)/vendors')}
          />

          {/* Standard Service Categories */}
          {STANDARD_CATEGORIES.map((cat) => {
            const selectedVendor = pkg.vendors.find(
              (v) =>
                v.category?.toUpperCase() === cat.key.toUpperCase() ||
                v.category?.toLowerCase().includes(cat.key.toLowerCase())
            );
            const CatIcon = cat.icon;

            return (
              <View key={cat.key} style={styles.slotCard}>
                {selectedVendor ? (
                  // Filled Slot
                  <View style={styles.filledSlot}>
                    <View style={styles.filledSlotHeader}>
                      <View style={styles.filledCatBadge}>
                        <CatIcon size={12} color="#641E3D" />
                        <Text style={styles.filledCatText}>{cat.label}</Text>
                      </View>

                      <View style={styles.slotHeaderActions}>
                        <VellureButton
                          onPress={() => handleOpenVendorSelect(cat.key)}
                          style={styles.replaceVendorBtn}
                          accessibilityLabel={`Replace ${selectedVendor.businessName} with another ${cat.label}`}
                        >
                          <RefreshCw size={11} color="#641E3D" />
                          <Text style={styles.replaceVendorText}>Replace</Text>
                        </VellureButton>

                        <VellureButton
                          onPress={() =>
                            handleRemoveVendor(
                              selectedVendor.vendorId || (selectedVendor as any).id,
                              selectedVendor.businessName
                            )
                          }
                          style={styles.removeVendorBtn}
                          accessibilityLabel={`Remove ${selectedVendor.businessName}`}
                        >
                          <Trash2 size={11} color="#B63A4A" />
                          <Text style={styles.removeVendorText}>Remove</Text>
                        </VellureButton>
                      </View>
                    </View>

                    <View style={styles.vendorDetailRow}>
                      <Image
                        source={{
                          uri:
                            selectedVendor.image ||
                            'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                        }}
                        style={styles.vendorThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.vendorInfoCopy}>
                        <View style={styles.vendorNameRow}>
                          <Text style={styles.vendorName} numberOfLines={1}>
                            {selectedVendor.businessName}
                          </Text>
                          <VerifiedBadge isVerified={true} />
                        </View>
                        <Text style={styles.vendorCity}>
                          {selectedVendor.city} • ★ {selectedVendor.rating || 4.9} ({selectedVendor.reviewsCount || 24})
                        </Text>

                        {/* Live Price Formula */}
                        <View style={styles.formulaRow}>
                          {selectedVendor.priceType === 'PER_PLATE' ? (
                            <Text style={styles.formulaText}>
                              ₹{selectedVendor.basePrice.toLocaleString('en-IN')}/plate × {pkg.guestCount} guests
                            </Text>
                          ) : (
                            <Text style={styles.formulaText}>
                              Fixed Package Benchmark Rate
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Footer Calculated Amount */}
                    <View style={styles.slotFooterRow}>
                      <VellureButton
                        onPress={() => router.push(`/vendor/${selectedVendor.vendorId}`)}
                        style={styles.viewProfileBtn}
                      >
                        <Text style={styles.viewProfileText}>View Profile</Text>
                        <ExternalLink size={11} color="#641E3D" />
                      </VellureButton>

                      <View style={styles.calculatedPriceBox}>
                        <Text style={styles.calculatedPriceLabel}>Contributed Amount</Text>
                        <Text style={styles.calculatedPriceValue}>
                          ₹{selectedVendor.calculatedPrice.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  // Empty Slot
                  <VellureButton
                    onPress={() => handleOpenVendorSelect(cat.key)}
                    style={styles.emptySlotBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${cat.label}`}
                  >
                    <View style={styles.emptySlotIcon}>
                      <CatIcon size={20} color="#D2AD6B" />
                    </View>
                    <View style={styles.emptySlotCopy}>
                      <Text style={styles.emptySlotTitle}>+ Add {cat.label}</Text>
                      <Text style={styles.emptySlotSubtitle}>
                        Select specialist to automatically add to this package
                      </Text>
                    </View>
                    <Plus size={18} color="#641E3D" />
                  </VellureButton>
                )}
              </View>
            );
          })}
        </View>

        {/* ──── 4. ITEMIZED FINANCIAL SUMMARY TABLE ──── */}
        {pkg.vendors.length > 0 && (
          <View style={styles.summaryTableCard}>
            <Text style={styles.summaryTableTitle}>Itemized Price Summary</Text>
            <View style={styles.tableRows}>
              {pkg.vendors.map((v, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableColName}>
                    <Text style={styles.tableItemName}>{v.businessName}</Text>
                    <Text style={styles.tableItemCat}>{v.category}</Text>
                  </View>
                  <Text style={styles.tableItemPrice}>
                    ₹{v.calculatedPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}

              <View style={styles.tableDivider} />

              <View style={styles.tableRow}>
                <Text style={styles.tableSubLabel}>Subtotal</Text>
                <Text style={styles.tableSubValue}>
                  ₹{pkg.subtotal.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableSubLabel}>Goods & Services Tax (18%)</Text>
                <Text style={styles.tableSubValue}>
                  ₹{pkg.estimatedTax.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.tableRow, styles.tableTotalRow]}>
                <Text style={styles.tableTotalLabel}>Total Package Price</Text>
                <Text style={styles.tableTotalValue}>
                  ₹{pkg.totalPrice.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ──── 5. VELLURE PACKAGE ASSURANCE ──── */}
        <View style={styles.assuranceCard}>
          <View style={styles.assuranceItem}>
            <CheckCircle2 size={15} color="#287857" />
            <Text style={styles.assuranceText}>
              Single unified inquiry sent to all selected specialist teams simultaneously
            </Text>
          </View>
          <View style={styles.assuranceItem}>
            <CheckCircle2 size={15} color="#287857" />
            <Text style={styles.assuranceText}>
              Transparent pricing with no hidden agent markups or platform booking fees
            </Text>
          </View>
          <View style={styles.assuranceItem}>
            <CheckCircle2 size={15} color="#287857" />
            <Text style={styles.assuranceText}>
              Verified calendar sync with milestone-based payment milestones
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ──── 6. STICKY BOTTOM ACTIONS BAR ──── */}
      <View style={styles.stickyBottomBar}>
        <View style={styles.stickyPriceBox}>
          <Text style={styles.stickyTotalLabel}>Estimated Total</Text>
          <Text style={styles.stickyTotalAmount}>
            ₹{pkg.totalPrice.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* ⚡ 1-Click Availability Button */}
        <VellureButton
          style={styles.stickyBroadcastBtn}
          onPress={() => {
            if (pkg.vendors.length === 0) {
              Alert.alert('Select Specialists', 'Please add at least 1 specialist to your custom suite before checking availability.');
              return;
            }
            setBroadcastModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Zap size={14} color="#2A121E" fill="#2A121E" />
          <Text style={styles.stickyBroadcastText}>1-Click Check</Text>
        </VellureButton>

        {/* Full Quote Request Button */}
        <VellureButton
          style={styles.stickyInquireBtn}
          onPress={() => {
            if (pkg.vendors.length === 0) {
              Alert.alert('Select Specialists', 'Please add at least 1 specialist to your custom package before requesting quotes.');
              return;
            }
            setInquiryModalVisible(true);
          }}
          activeOpacity={0.88}
        >
          <Send size={13} color="#FFFFFF" />
          <Text style={styles.stickyInquireText}>
            Quotes ({pkg.vendors.length})
          </Text>
        </VellureButton>
      </View>

      {/* ──── MODAL: EDIT PACKAGE SPECS ──── */}
      <Modal visible={editSpecsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Package Details</Text>
                <Text style={styles.modalSubtitle}>
                  Update celebration specifications and recalculate budget live
                </Text>
              </View>
              <VellureButton onPress={() => setEditSpecsModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#641E3D" />
              </VellureButton>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <VellureInputField
                label="Package Name"
                value={pkgName}
                onChangeText={setPkgName}
                placeholder="e.g. Rohan & Priya's Grand Wedding"
                variant="filled"
              />

              <View style={{ marginBottom: 12 }}>
                <FormDropdown
                  label="Celebration Type"
                  value={pkgEventType}
                  options={EVENT_TYPES}
                  onChange={setPkgEventType}
                  placeholder="Select event type..."
                />
              </View>

              <View style={styles.formRow}>
                <VellureInputField
                  label="Host City"
                  icon={<MapPin size={13} color="#D2AD6B" />}
                  value={pkgCity}
                  isReadOnly
                  onPress={() => setShowCityPicker(true)}
                  placeholder="Select City"
                  variant="filled"
                  containerStyle={{ flex: 1 }}
                />

                <VellureInputField
                  label="Celebration Date"
                  icon={<Calendar size={13} color="#D2AD6B" />}
                  value={pkgDate || 'Select Date'}
                  isReadOnly
                  onPress={() => setShowDatePicker(true)}
                  placeholder="Select Date"
                  variant="filled"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <View style={styles.formRow}>
                <VellureInputField
                  label="Guest Scale"
                  value={pkgGuests}
                  onChangeText={setPkgGuests}
                  keyboardType="numeric"
                  placeholder="300"
                  variant="filled"
                  containerStyle={{ flex: 1 }}
                />

                <VellureInputField
                  label="Target Budget (₹)"
                  value={pkgBudget}
                  onChangeText={setPkgBudget}
                  keyboardType="numeric"
                  placeholder="1500000"
                  variant="filled"
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <VellureButton
                onPress={() => setEditSpecsModalVisible(false)}
                variant="ghost"
                style={{ flex: 1, height: 44, borderRadius: 12 }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </VellureButton>
              <VellureButton
                onPress={handleUpdateSpecs}
                variant="primary"
                style={{ flex: 1.6, height: 44, borderRadius: 12 }}
              >
                <Text style={styles.modalSaveText}>Save & Recalculate</Text>
              </VellureButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* ──── MODAL: SELECT CATEGORY VENDOR ──── */}
      <Modal visible={vendorSelectModalCategory !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select {vendorSelectModalCategory} Specialist
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose partner to credit into your custom package
                </Text>
              </View>
              <VellureButton
                onPress={() => {
                  setVendorSelectModalCategory(null);
                  setVendorSearchQuery('');
                }}
                style={styles.closeBtn}
              >
                <X size={18} color="#641E3D" />
              </VellureButton>
            </View>

            {/* 🔍 Search Input using Reusable VellureSearchInput */}
            <VellureSearchInput
              value={vendorSearchQuery}
              onChangeText={setVendorSearchQuery}
              onClear={() => setVendorSearchQuery('')}
              placeholder={`Search ${vendorSelectModalCategory || 'specialists'} by name, city or style...`}
              containerStyle={{ marginBottom: 12 }}
            />

            {/* 💡 Celebration Specs Context Banner */}
            <View style={styles.modalContextBanner}>
              <View style={styles.contextBannerItem}>
                <Users size={12} color="#641E3D" />
                <Text style={styles.contextBannerText}>{pkg.guestCount} Guests</Text>
              </View>
              <Text style={styles.contextDot}>•</Text>
              <View style={styles.contextBannerItem}>
                <MapPin size={12} color="#641E3D" />
                <Text style={styles.contextBannerText}>{pkg.city}</Text>
              </View>
              <Text style={styles.contextDot}>•</Text>
              <View style={styles.contextBannerItem}>
                <Calendar size={12} color="#641E3D" />
                <Text style={styles.contextBannerText}>{pkg.eventDays || 1} Day(s)</Text>
              </View>
            </View>

            {/* 💰 Category Budget Allocation Control */}
            <View style={styles.catBudgetBox}>
              <View style={styles.catBudgetTopRow}>
                <View style={styles.catBudgetTitleRow}>
                  <IndianRupee size={13} color="#641E3D" />
                  <Text style={styles.catBudgetLabel}>
                    {vendorSelectModalCategory} Budget:
                  </Text>
                  <Text style={styles.catBudgetValue}>
                    ₹{getCategoryBudget(pkg, vendorSelectModalCategory).toLocaleString('en-IN')}
                  </Text>
                </View>

                <VellureButton
                  style={styles.catBudgetEditBtn}
                  onPress={() => {
                    setCatBudgetInput(String(getCategoryBudget(pkg, vendorSelectModalCategory)));
                    setEditingCategoryBudget(!editingCategoryBudget);
                  }}
                  accessibilityLabel="Edit category budget"
                >
                  <Text style={styles.catBudgetEditText}>
                    {editingCategoryBudget ? 'Done' : 'Set Budget'}
                  </Text>
                </VellureButton>
              </View>

              {editingCategoryBudget ? (
                <View style={styles.catBudgetEditRow}>
                  <VellureInputField
                    label="Target Limit for this Category (₹)"
                    value={catBudgetInput}
                    onChangeText={setCatBudgetInput}
                    keyboardType="numeric"
                    placeholder="e.g. 350000"
                    variant="filled"
                    containerStyle={{ flex: 1 }}
                  />
                  <VellureButton
                    variant="primary"
                    onPress={handleSaveCustomCategoryBudget}
                    style={styles.catBudgetSaveBtn}
                  >
                    <Text style={styles.catBudgetSaveText}>Apply</Text>
                  </VellureButton>
                </View>
              ) : (
                <View style={styles.catBudgetSteppersRow}>
                  <VellureButton
                    style={styles.catBudgetPillBtn}
                    onPress={() => handleAdjustCategoryBudget(-25000)}
                    accessibilityLabel="Decrease category budget by 25,000"
                  >
                    <Text style={styles.catBudgetPillText}>- ₹25k</Text>
                  </VellureButton>
                  <VellureButton
                    style={styles.catBudgetPillBtn}
                    onPress={() => handleAdjustCategoryBudget(25000)}
                    accessibilityLabel="Increase category budget by 25,000"
                  >
                    <Text style={styles.catBudgetPillText}>+ ₹25k</Text>
                  </VellureButton>
                  <VellureButton
                    style={styles.catBudgetPillBtn}
                    onPress={() => handleAdjustCategoryBudget(100000)}
                    accessibilityLabel="Increase category budget by 100,000"
                  >
                    <Text style={styles.catBudgetPillText}>+ ₹1.0L</Text>
                  </VellureButton>
                  <View style={styles.catBudgetStats}>
                    <Text style={styles.catBudgetStatsText}>
                      {processedCategoryVendors.filter((x) => !x.isExceedingBudget).length} within budget
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {loadingCategoryVendors ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#641E3D" />
                <Text style={styles.loadingText}>Fetching available specialists…</Text>
              </View>
            ) : processedCategoryVendors.length > 0 ? (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {processedCategoryVendors.map((v, idx) => {
                  const prevItem = idx > 0 ? processedCategoryVendors[idx - 1] : null;
                  const isFirstOverBudget = v.isExceedingBudget && (!prevItem || !prevItem.isExceedingBudget);

                  return (
                    <React.Fragment key={v.id}>
                      {/* Divider when entering Over Budget list */}
                      {isFirstOverBudget && (
                        <View style={styles.overBudgetDividerRow}>
                          <ShieldAlert size={13} color="#B63A4A" />
                          <Text style={styles.overBudgetDividerTitle}>
                            Exceeds {vendorSelectModalCategory} Budget (Cannot be selected)
                          </Text>
                        </View>
                      )}

                      <VellureButton
                        disabled={v.isExceedingBudget}
                        onPress={() => {
                          if (v.isExceedingBudget) {
                            Alert.alert(
                              'Category Budget Exceeded',
                              `This specialist's cost (₹${v.calculatedPrice.toLocaleString('en-IN')}) exceeds your ${vendorSelectModalCategory} budget limit (₹${getCategoryBudget(pkg, vendorSelectModalCategory).toLocaleString('en-IN')}). Increase your category budget above or select an available partner.`
                            );
                            return;
                          }
                          const res = addVendorToCustomPackage(v, pkg.id);
                          if (res && res.package) {
                            setPkg(res.package);
                          }
                          setVendorSelectModalCategory(null);
                          setVendorSearchQuery('');
                        }}
                        style={[
                          styles.vendorChoiceCard,
                          v.isCurrentInSlot && styles.vendorChoiceCardSelected,
                          v.isExceedingBudget && styles.vendorChoiceCardDisabled,
                        ]}
                        activeOpacity={v.isExceedingBudget ? 1 : 0.88}
                        accessibilityLabel={`Select ${v.businessName || v.name} for ${vendorSelectModalCategory}`}
                      >
                        {/* Image Thumbnail */}
                        <View style={styles.choiceImageWrap}>
                          <Image
                            source={{
                              uri:
                                v.image ||
                                'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                            }}
                            style={[
                              styles.choiceThumb,
                              v.isExceedingBudget && styles.choiceThumbDisabled,
                            ]}
                          />
                          {v.isCityMatch && (
                            <View
                              style={[
                                styles.cityMatchTag,
                                v.isExceedingBudget && styles.cityMatchTagDisabled,
                              ]}
                            >
                              <Text style={styles.cityMatchTagText}>In {pkg.city}</Text>
                            </View>
                          )}
                        </View>

                        {/* Info & Formula Breakdown */}
                        <View style={styles.choiceCopy}>
                          <View style={styles.choiceTopRow}>
                            <Text
                              style={[
                                styles.choiceName,
                                v.isExceedingBudget && styles.choiceNameDisabled,
                              ]}
                              numberOfLines={1}
                            >
                              {v.businessName || v.name || 'Verified Partner'}
                            </Text>
                            <VerifiedBadge isVerified={true} size="small" />
                          </View>

                          <View style={styles.choiceMetaRow}>
                            <RatingDisplay
                              rating={v.rating || 4.8}
                              reviewsCount={v.reviewsCount || 24}
                              size="small"
                            />
                            <Text style={styles.choiceCity}>{v.city || 'Patiala'}</Text>
                          </View>

                          {/* Smart Price & Formula Breakdown */}
                          <View
                            style={[
                              styles.choiceCalcBox,
                              v.isExceedingBudget && styles.choiceCalcBoxDisabled,
                            ]}
                          >
                            <View style={styles.calcFormulaWrap}>
                              <Calculator
                                size={11}
                                color={v.isExceedingBudget ? '#8A7A70' : '#8A6A23'}
                              />
                              <Text
                                style={[
                                  styles.calcFormulaText,
                                  v.isExceedingBudget && styles.calcFormulaTextDisabled,
                                ]}
                              >
                                {v.formulaLabel}
                              </Text>
                            </View>
                            <View style={styles.calcTotalRow}>
                              <Text style={styles.calcTotalLabel}>Total for Event:</Text>
                              <Text
                                style={[
                                  styles.calcTotalAmount,
                                  v.isExceedingBudget && styles.calcTotalAmountDisabled,
                                ]}
                              >
                                ₹{v.calculatedPrice.toLocaleString('en-IN')}
                              </Text>
                            </View>
                          </View>

                          {/* Budget Status Badge */}
                          {v.isExceedingBudget ? (
                            <View style={styles.exceedsBadge}>
                              <ShieldAlert size={10} color="#B63A4A" />
                              <Text style={styles.exceedsBadgeText}>
                                Exceeds Category Budget (+₹{v.overBudgetDiff.toLocaleString('en-IN')})
                              </Text>
                            </View>
                          ) : v.pctOfCatBudget > 0 ? (
                            <Text style={styles.budgetImpactText}>
                              ≈ {v.pctOfCatBudget}% of {vendorSelectModalCategory} budget (₹{(getCategoryBudget(pkg, vendorSelectModalCategory) / 1000).toFixed(0)}k)
                            </Text>
                          ) : null}
                        </View>

                        {/* Action Plus/Check/Lock Button */}
                        <View
                          style={[
                            styles.choiceActionBtn,
                            v.isCurrentInSlot && styles.choiceActionBtnSelected,
                            v.isExceedingBudget && styles.choiceActionBtnDisabled,
                          ]}
                        >
                          {v.isExceedingBudget ? (
                            <Lock size={14} color="#8A7A70" strokeWidth={2} />
                          ) : v.isCurrentInSlot ? (
                            <Check size={16} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <Plus size={16} color="#641E3D" strokeWidth={2.5} />
                          )}
                        </View>
                      </VellureButton>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptySearchBox}>
                <Search size={24} color="#D2AD6B" />
                <Text style={styles.emptySearchTitle}>No matching partners found</Text>
                <Text style={styles.emptySearchSubtitle}>
                  Try a different search keyword or clear the filter
                </Text>
                {vendorSearchQuery.length > 0 && (
                  <VellureButton
                    onPress={() => setVendorSearchQuery('')}
                    style={styles.clearSearchBtn}
                  >
                    <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                  </VellureButton>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ──── MODAL: SWITCH / MANAGE CUSTOM PACKAGES ──── */}
      <Modal visible={switchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>My Celebration Suites</Text>
                <Text style={styles.modalSubtitle}>
                  Switch between active suites or start a new bespoke bundle
                </Text>
              </View>
              <VellureButton
                onPress={() => setSwitchModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={18} color="#641E3D" />
              </VellureButton>
            </View>

            <ScrollView style={{ maxHeight: 320, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              {allPackages.map((p) => {
                const isActive = p.id === pkg.id;
                return (
                  <View
                    key={p.id}
                    style={[styles.switchSuiteRow, isActive && styles.switchSuiteItemActive]}
                  >
                    <VellureButton
                      onPress={() => handleSwitchPackage(p.id)}
                      style={{ flex: 1 }}
                      accessibilityLabel={`Switch to ${p.name}`}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={[styles.switchSuiteName, isActive && styles.switchSuiteNameActive]}>
                          {p.name}
                        </Text>
                        <View style={[styles.statusBadgeSmall, p.status === 'INQUIRED' ? styles.pkgStatusInquired : p.status === 'READY' ? styles.pkgStatusReady : styles.pkgStatusDraft]}>
                          <Text style={[styles.statusBadgeSmallText, p.status === 'INQUIRED' ? styles.pkgStatusTextInquired : p.status === 'READY' ? styles.pkgStatusTextReady : styles.pkgStatusTextDraft]}>
                            {p.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.switchSuiteMeta, isActive && { color: '#E8D0D8' }]}>
                        {p.eventType} • {p.city} • {p.vendors.length} Specialists
                      </Text>
                    </VellureButton>

                    <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: 8 }}>
                      <Text style={[styles.switchSuitePrice, isActive && { color: '#F4D58D' }]}>
                        ₹{p.totalPrice.toLocaleString('en-IN')}
                      </Text>
                      {allPackages.length > 1 && (
                        <VellureButton
                          onPress={() => handleDeletePackage(p.id, p.name)}
                          style={styles.switchSuiteDeleteBtn}
                          accessibilityLabel={`Delete ${p.name}`}
                        >
                          <Trash2 size={12} color={isActive ? '#FFFFFF' : '#B63A4A'} />
                        </VellureButton>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <VellureButton
              style={styles.createSuiteModalBtn}
              onPress={handleCreateNew}
            >
              <Plus size={16} color="#2A121E" />
              <Text style={styles.createSuiteModalBtnText}>Create New Custom Suite</Text>
            </VellureButton>
          </View>
        </View>
      </Modal>

      {/* 🏙️ City Picker Modal */}
      <CityPickerModal
        visible={showCityPicker}
        cities={DEFAULT_CITIES}
        onClose={() => setShowCityPicker(false)}
        onSelect={(city) => {
          setPkgCity(city);
          setShowCityPicker(false);
        }}
      />

      {/* 📅 Date Picker Modal */}
      <CalendarModal
        visible={showDatePicker}
        currentDate={pkgDate}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(_rawDate, formattedDate) => {
          setPkgDate(formattedDate);
          setShowDatePicker(false);
        }}
      />

      {/* ⚠️ Reusable Confirmation Dialog */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Confirm'}
        cancelText={confirmModal.cancelText || 'Cancel'}
        isDestructive={confirmModal.isDestructive ?? true}
        icon={confirmModal.icon || 'trash'}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FDFBF7' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DB',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
  },
  topBarCenter: { alignItems: 'center' },
  topBarTitle: { color: '#2A121E', fontSize: 16, fontWeight: '900' },
  topBarSubtitle: { color: '#D2AD6B', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  topBarRight: { flexDirection: 'row', gap: 6 },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
  },
  scrollContent: { paddingBottom: 130 },
  heroPriceCard: {
    margin: PAGE_PADDING,
    backgroundColor: '#641E3D',
    borderRadius: 26,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(244, 213, 141, 0.15)',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  packagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  packagePillText: { color: '#F4D58D', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  vendorCountPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vendorCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  packageHeading: { color: '#FFFFFF', fontSize: 19, fontWeight: '900', marginBottom: 14 },
  priceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 213, 141, 0.2)',
  },
  priceLabel: { color: '#F4D58D', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  rupeeSymbol: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginRight: 2 },
  priceAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  priceSuffix: { color: '#F4D58D', fontSize: 11, fontWeight: '700', marginLeft: 8 },
  taxBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  taxSubText: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 10, fontWeight: '600' },
  taxDot: { color: '#F4D58D', fontSize: 10 },
  budgetBenchmarkBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  benchmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  benchmarkLabel: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 11, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeUnder: { backgroundColor: '#ECF8F1' },
  statusBadgeOver: { backgroundColor: '#FDE8EA' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusTextUnder: { color: '#287857' },
  statusTextOver: { color: '#B63A4A' },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  specsCard: {
    marginHorizontal: PAGE_PADDING,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1E8DB',
  },
  specsCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  specsCardTitle: { color: '#2A121E', fontSize: 14, fontWeight: '900' },
  specsCardSubtitle: { color: '#8A7A70', fontSize: 10, marginTop: 1 },
  editSpecsBtn: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  editSpecsBtnText: { color: '#641E3D', fontSize: 10, fontWeight: '800' },
  specsGrid: { gap: 10 },
  guestScaleBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  guestScaleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  guestScaleLabel: { color: '#641E3D', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperBtn: {
    backgroundColor: '#641E3D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stepperBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  guestCountDisplay: { alignItems: 'center' },
  guestCountNum: { color: '#2A121E', fontSize: 20, fontWeight: '900' },
  guestCountUnit: { color: '#8A7A70', fontSize: 10, fontWeight: '700' },
  guestHelperText: { color: '#8A6A23', fontSize: 9.5, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  specMiniDetails: { flexDirection: 'row', gap: 10 },
  miniDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDFBF7',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1E8DB',
  },
  miniDetailLabel: { color: '#8A7A70', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  miniDetailValue: { color: '#2A121E', fontSize: 12, fontWeight: '800' },
  servicesSection: { marginHorizontal: PAGE_PADDING, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionHeading: { color: '#2A121E', fontSize: 15, fontWeight: '900' },
  sectionSubheading: { color: '#8A7A70', fontSize: 10 },
  exploreMoreBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  exploreMoreText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
  slotCard: { marginBottom: 10 },
  filledSlot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  filledSlotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  filledCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  filledCatText: { color: '#641E3D', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  slotHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replaceVendorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  replaceVendorText: { color: '#641E3D', fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  removeVendorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  removeVendorText: { color: '#B63A4A', fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  vendorDetailRow: { flexDirection: 'row', gap: 12 },
  vendorThumb: { width: 62, height: 62, borderRadius: 12 },
  vendorInfoCopy: { flex: 1, justifyContent: 'center' },
  vendorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vendorName: { color: '#2A121E', fontSize: 14, fontWeight: '900', flexShrink: 1 },
  vendorCity: { color: '#786B70', fontSize: 10.5, fontWeight: '600', marginTop: 2 },
  formulaRow: { marginTop: 4 },
  formulaText: { color: '#8A6A23', fontSize: 10, fontWeight: '700' },
  slotFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE4',
  },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewProfileText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
  calculatedPriceBox: { alignItems: 'flex-end' },
  calculatedPriceLabel: { color: '#8A7A70', fontSize: 8.5, fontWeight: '800', textTransform: 'uppercase' },
  calculatedPriceValue: { color: '#641E3D', fontSize: 15, fontWeight: '900' },
  emptySlotBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE3CF',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptySlotIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotCopy: { flex: 1 },
  emptySlotTitle: { color: '#2A121E', fontSize: 13, fontWeight: '800' },
  emptySlotSubtitle: { color: '#8A7A70', fontSize: 10, marginTop: 1 },
  summaryTableCard: {
    marginHorizontal: PAGE_PADDING,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1E8DB',
  },
  summaryTableTitle: { color: '#2A121E', fontSize: 14, fontWeight: '900', marginBottom: 12 },
  tableRows: { gap: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tableColName: { flex: 1 },
  tableItemName: { color: '#2A121E', fontSize: 12, fontWeight: '800' },
  tableItemCat: { color: '#8A7A70', fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase' },
  tableItemPrice: { color: '#2A121E', fontSize: 12, fontWeight: '900' },
  tableDivider: { height: 1, backgroundColor: '#F1E8DB', marginVertical: 4 },
  tableSubLabel: { color: '#786B70', fontSize: 11, fontWeight: '600' },
  tableSubValue: { color: '#2A121E', fontSize: 11, fontWeight: '700' },
  tableTotalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8DCC8',
  },
  tableTotalLabel: { color: '#641E3D', fontSize: 13, fontWeight: '900' },
  tableTotalValue: { color: '#641E3D', fontSize: 16, fontWeight: '900' },
  assuranceCard: {
    marginHorizontal: PAGE_PADDING,
    backgroundColor: '#FAF5EC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 8,
  },
  assuranceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  assuranceText: { color: '#641E3D', fontSize: 10.5, lineHeight: 15, fontWeight: '600', flex: 1 },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    gap: 12,
  },
  stickyPriceBox: { flex: 1 },
  stickyTotalLabel: { color: '#8A7A70', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  stickyTotalAmount: { color: '#641E3D', fontSize: 18, fontWeight: '900' },
  stickyInquireBtn: {
    flex: 1.8,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#641E3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  stickyInquireText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: '#2A121E', fontSize: 17, fontWeight: '900' },
  modalSubtitle: { color: '#786B70', fontSize: 11, marginTop: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FAF5EC', alignItems: 'center', justifyContent: 'center' },
  modalBody: { marginBottom: 16 },
  formGroup: { marginBottom: 12 },
  formLabel: { color: '#8A7A70', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5 },
  formInput: {
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
  formRow: { flexDirection: 'row', gap: 10 },
  eventPillsScroll: { flexDirection: 'row', gap: 6 },
  modalEventPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    marginRight: 6,
  },
  modalEventPillActive: { backgroundColor: '#641E3D' },
  modalEventPillText: { color: '#786B70', fontSize: 11, fontWeight: '700' },
  modalEventPillTextActive: { color: '#FFFFFF', fontWeight: '900' },
  modalFooter: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E8DCC8', alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { color: '#786B70', fontSize: 12, fontWeight: '800' },
  modalSaveBtn: { flex: 1.5, height: 44, borderRadius: 12, backgroundColor: '#641E3D', alignItems: 'center', justifyContent: 'center' },
  modalSaveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  modalContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  contextBannerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contextBannerText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
  contextDot: { color: '#D2AD6B', fontSize: 12, fontWeight: '900' },
  catBudgetBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  catBudgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catBudgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  catBudgetLabel: {
    color: '#8A7A70',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  catBudgetValue: {
    color: '#641E3D',
    fontSize: 13.5,
    fontWeight: '900',
  },
  catBudgetEditBtn: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catBudgetEditText: {
    color: '#641E3D',
    fontSize: 10.5,
    fontWeight: '800',
  },
  catBudgetEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  catBudgetSaveBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 2,
  },
  catBudgetSaveText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  catBudgetSteppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  catBudgetPillBtn: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catBudgetPillText: {
    color: '#641E3D',
    fontSize: 10.5,
    fontWeight: '800',
  },
  catBudgetStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  catBudgetStatsText: {
    color: '#287857',
    fontSize: 10,
    fontWeight: '800',
  },
  loadingBox: { padding: 30, alignItems: 'center', gap: 8 },
  loadingText: { color: '#786B70', fontSize: 11 },
  overBudgetDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0E6D8',
  },
  overBudgetDividerTitle: {
    color: '#B63A4A',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vendorChoiceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FAF5EC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E6D8',
  },
  vendorChoiceCardSelected: {
    borderColor: '#641E3D',
    backgroundColor: '#FDFBF7',
  },
  vendorChoiceCardDisabled: {
    opacity: 0.58,
    backgroundColor: '#F6F2EB',
    borderColor: '#E8DED0',
  },
  choiceImageWrap: {
    position: 'relative',
  },
  choiceThumb: { width: 70, height: 70, borderRadius: 12 },
  choiceThumbDisabled: { opacity: 0.7 },
  cityMatchTag: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    backgroundColor: '#641E3D',
    paddingVertical: 1.5,
    borderRadius: 5,
    alignItems: 'center',
  },
  cityMatchTagDisabled: {
    backgroundColor: '#8A7A70',
  },
  cityMatchTagText: { color: '#FFFFFF', fontSize: 7.5, fontWeight: '900', textTransform: 'uppercase' },
  choiceCopy: { flex: 1 },
  choiceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  choiceName: { color: '#2A121E', fontSize: 13.5, fontWeight: '900', flexShrink: 1 },
  choiceNameDisabled: { color: '#6A5E63' },
  choiceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  choiceCity: { color: '#786B70', fontSize: 10.5, fontWeight: '600' },
  choiceCalcBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    padding: 7,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  choiceCalcBoxDisabled: {
    backgroundColor: '#EFEAE1',
    borderColor: '#E0D5C5',
  },
  calcFormulaWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  calcFormulaText: { color: '#8A6A23', fontSize: 9.5, fontWeight: '700' },
  calcFormulaTextDisabled: { color: '#8A7A70' },
  calcTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calcTotalLabel: { color: '#8A7A70', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  calcTotalAmount: { color: '#641E3D', fontSize: 13, fontWeight: '900' },
  calcTotalAmountDisabled: { color: '#B63A4A' },
  exceedsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDE8EA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  exceedsBadgeText: {
    color: '#B63A4A',
    fontSize: 9.5,
    fontWeight: '800',
  },
  budgetImpactText: { color: '#287857', fontSize: 9.5, fontWeight: '700', marginTop: 4 },
  choiceActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8DCC8',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  choiceActionBtnSelected: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  choiceActionBtnDisabled: {
    backgroundColor: '#EAE3D8',
    borderColor: '#D8CDC0',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    color: '#2A121E',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
  },
  modalSearchClearBtn: {
    padding: 4,
  },
  emptySearchBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 6,
  },
  emptySearchTitle: {
    color: '#2A121E',
    fontSize: 15,
    fontWeight: '900',
  },
  emptySearchSubtitle: {
    color: '#786B70',
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  clearSearchBtn: {
    backgroundColor: '#641E3D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  topBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pkgStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pkgStatusDraft: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  pkgStatusReady: { backgroundColor: '#ECF8F1' },
  pkgStatusInquired: { backgroundColor: '#F4D58D' },
  pkgStatusBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  pkgStatusTextDraft: { color: '#E0D4DC' },
  pkgStatusTextReady: { color: '#287857' },
  pkgStatusTextInquired: { color: '#2A121E' },
  statusBadgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeSmallText: { fontSize: 8.5, fontWeight: '900', textTransform: 'uppercase' },
  stickyBroadcastBtn: {
    flex: 1.1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F4D58D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  stickyBroadcastText: {
    color: '#2A121E',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  switchSuiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF5EC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  switchSuiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF5EC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  switchSuiteItemActive: {
    backgroundColor: '#641E3D',
    borderColor: '#D2AD6B',
  },
  switchSuiteDeleteBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  switchSuiteName: {
    color: '#2A121E',
    fontSize: 13,
    fontWeight: '800',
  },
  switchSuiteNameActive: {
    color: '#FFFFFF',
  },
  switchSuiteMeta: {
    color: '#786B70',
    fontSize: 10,
    marginTop: 2,
  },
  switchSuitePrice: {
    color: '#8A6A23',
    fontSize: 13,
    fontWeight: '900',
  },
  createSuiteModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F4D58D',
    paddingVertical: 12,
    borderRadius: 12,
  },
  createSuiteModalBtnText: {
    color: '#2A121E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  choicePrice: { color: '#8C6F3E', fontSize: 11, fontWeight: '900', marginTop: 2 },
});
