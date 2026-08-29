import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  Package,
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  Plus,
  ArrowRight,
  Send,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  Utensils,
  Camera,
  Flower,
  Scissors,
  Music,
  HeartHandshake,
  Briefcase,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Save,
  Zap,
  FileEdit,
  FolderHeart,
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';

// Services & Models
import {
  EventInquiry,
  fetchEventInquiries,
  fetchVendorPacks,
} from '../../services/api';
import {
  CustomPackage,
  getAllCustomPackages,
  getCustomPackage,
  subscribeAllCustomPackages,
  setActivePackage,
  createNewCustomPackage,
  duplicateCustomPackage,
  savePackageAsDraft,
  deleteCustomPackage,
} from '../../services/customPackageStore';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { VellureButton } from '../../components/ui/VellureControls';
import { EmptyStateCard } from '../../components/ui/EmptyStateCard';
import { PriceDisplay } from '../../components/ui/PriceDisplay';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { InquiryCard } from '../../components/ui/InquiryCard';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';
import { PackageAvailabilityBroadcastModal } from '../../components/inquiry/PackageAvailabilityBroadcastModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;

type FilterTab = 'ALL' | 'ACTIVE' | 'DRAFTS' | 'CURATED' | 'INQUIRIES';

export default function MyPackagesScreen() {
  const [allPackages, setAllPackages] = useState<CustomPackage[]>(getAllCustomPackages());
  const [activePackage, setActivePkg] = useState<CustomPackage>(getCustomPackage());
  const [curatedPacks, setCuratedPacks] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Modals state
  const [inquiryModalTarget, setInquiryModalTarget] = useState<CustomPackage | null>(null);
  const [broadcastModalTarget, setBroadcastModalTarget] = useState<CustomPackage | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [packs, inqs] = await Promise.all([
        fetchVendorPacks(activePackage.targetBudget || 1500000).catch(() => []),
        fetchEventInquiries().catch(() => []),
      ]);
      setCuratedPacks(packs);
      setInquiries(inqs);
    } catch (_) {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activePackage.targetBudget]);

  useEffect(() => {
    const unsubscribe = subscribeAllCustomPackages((packages, active) => {
      setAllPackages(packages);
      setActivePkg(active);
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateNewPackage = () => {
    const newPkg = createNewCustomPackage();
    router.push({ pathname: '/custom-package', params: { id: newPkg.id } });
  };

  const handleDuplicate = (packageId: string) => {
    const cloned = duplicateCustomPackage(packageId);
    Alert.alert('Suite Duplicated', `Created a copy "${cloned.name}".`);
  };

  const handleSaveAsDraft = (packageId: string) => {
    savePackageAsDraft(packageId);
    Alert.alert('Saved to Drafts', 'This package has been marked as a draft.');
  };

  const handleDelete = (packageId: string, name: string) => {
    if (!packageId) return;
    setConfirmModal({
      visible: true,
      title: 'Delete Celebration Suite',
      message: `Are you sure you want to permanently delete "${name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => {
        const res = deleteCustomPackage(packageId);
        setAllPackages(getAllCustomPackages());
        if (res && res.activePackage) {
          setActivePkg(res.activePackage);
        }
      },
    });
  };

  // Filter packages based on activeTab
  const drafts = allPackages.filter((p) => p.status === 'DRAFT');
  const activeSuites = allPackages.filter((p) => p.status === 'READY' || p.status === 'INQUIRED');

  const displayedPackages =
    activeTab === 'DRAFTS'
      ? drafts
      : activeTab === 'ACTIVE'
      ? activeSuites
      : activeTab === 'ALL'
      ? allPackages
      : [];

  return (
    <View style={styles.screen}>
      {/* ⚡ 1-Click Availability Broadcast Modal */}
      <PackageAvailabilityBroadcastModal
        visible={broadcastModalTarget !== null}
        packageItem={broadcastModalTarget}
        onClose={() => setBroadcastModalTarget(null)}
      />

      {/* Full Multi-Vendor Quote Inquiry Modal */}
      {inquiryModalTarget && (
        <EventInquiryModal
          visible={inquiryModalTarget !== null}
          onClose={() => setInquiryModalTarget(null)}
          targetId={inquiryModalTarget.id}
          targetName={inquiryModalTarget.name}
          targetCategory={inquiryModalTarget.eventType}
          isPackage={true}
          initialCity={inquiryModalTarget.city}
          initialBudget={
            inquiryModalTarget.totalPrice > 0
              ? inquiryModalTarget.totalPrice
              : inquiryModalTarget.targetBudget
          }
          initialGuestCount={inquiryModalTarget.guestCount}
          initialEventType={inquiryModalTarget.eventType}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>Celebration Suites</Text>
          <Text style={styles.headerTitle}>My Packages</Text>
          <Text style={styles.headerSubtitle}>
            Manage multiple bespoke custom suites, drafts, and 1-click availability checks
          </Text>
        </View>
        <VellureButton
          style={styles.newPackageBtn}
          onPress={handleCreateNewPackage}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Create new custom package"
        >
          <Plus size={14} color="#2A121E" />
          <Text style={styles.newPackageBtnText}>New Suite</Text>
        </VellureButton>
      </View>

      {/* Filter Tabs Bar */}
      <View style={styles.filterTabsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {[
            { key: 'ALL', label: `All Suites (${allPackages.length})` },
            { key: 'ACTIVE', label: `Active (${activeSuites.length})` },
            { key: 'DRAFTS', label: `Drafts (${drafts.length})` },
            { key: 'CURATED', label: 'Curated Bundles' },
            { key: 'INQUIRIES', label: `Inquiries (${inquiries.length})` },
          ].map((tab) => (
            <VellureButton
              key={tab.key}
              onPress={() => setActiveTab(tab.key as FilterTab)}
              style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeTab === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </VellureButton>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#641E3D"
          />
        }
      >
        {/* ──── 1. CUSTOM PACKAGES ROSTER ──── */}
        {(activeTab === 'ALL' || activeTab === 'ACTIVE' || activeTab === 'DRAFTS') && (
          <View style={styles.customSection}>
            <View style={styles.customSectionHeader}>
              <View style={styles.customSectionTitleWrap}>
                <Sparkles size={14} color="#D2AD6B" />
                <Text style={styles.customSectionHeading}>
                  {activeTab === 'DRAFTS'
                    ? 'Draft Celebration Suites'
                    : activeTab === 'ACTIVE'
                    ? 'Active Celebration Suites'
                    : 'Your Custom Celebration Suites'}
                </Text>
              </View>
              <VellureButton
                onPress={handleCreateNewPackage}
                style={styles.openBuilderBtn}
              >
                <Plus size={12} color="#641E3D" />
                <Text style={styles.openBuilderText}>Create Suite</Text>
              </VellureButton>
            </View>

            {displayedPackages.length > 0 ? (
              displayedPackages.map((pkg) => {
                const budgetDiff = pkg.targetBudget - pkg.totalPrice;
                const isUnderBudget = budgetDiff >= 0;

                return (
                  <View key={pkg.id} style={styles.customSuiteCard}>
                    {/* Card Top Header */}
                    <View style={styles.customCardTop}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <View style={styles.customTypePill}>
                            <Text style={styles.customTypePillText}>{pkg.eventType}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              pkg.status === 'INQUIRED'
                                ? styles.statusPillInquired
                                : pkg.status === 'READY'
                                ? styles.statusPillReady
                                : styles.statusPillDraft,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                pkg.status === 'INQUIRED'
                                  ? styles.statusTextInquired
                                  : pkg.status === 'READY'
                                  ? styles.statusTextReady
                                  : styles.statusTextDraft,
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
                        <Text style={styles.customSuiteName}>{pkg.name}</Text>
                      </View>

                      {/* Card Action Icons */}
                      <View style={styles.cardHeaderActions}>
                        <VellureButton
                          onPress={() => handleDuplicate(pkg.id)}
                          style={styles.cardIconBtn}
                          accessibilityLabel="Duplicate package"
                        >
                          <Copy size={13} color="#D2AD6B" />
                        </VellureButton>
                        <VellureButton
                          onPress={() => handleDelete(pkg.id, pkg.name)}
                          style={styles.cardIconBtn}
                          accessibilityLabel="Delete package"
                        >
                          <Trash2 size={13} color="#FECDD3" />
                        </VellureButton>
                      </View>
                    </View>

                    {/* Metrics Row */}
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <MapPin size={11} color="#D2AD6B" />
                        <Text style={styles.metricText}>{pkg.city}</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Users size={11} color="#D2AD6B" />
                        <Text style={styles.metricText}>{pkg.guestCount} Guests</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Calendar size={11} color="#D2AD6B" />
                        <Text style={styles.metricText}>{pkg.eventDate || 'Tentative 2025'}</Text>
                      </View>
                    </View>

                    {/* Live Calculated Price Box */}
                    <View style={styles.customPriceBox}>
                      <View>
                        <Text style={styles.customPriceLabel}>Live Calculated Amount</Text>
                        <Text style={styles.customPriceValue}>
                          ₹{pkg.totalPrice.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.budgetStatusPill,
                          isUnderBudget ? styles.budgetStatusUnder : styles.budgetStatusOver,
                        ]}
                      >
                        <Text
                          style={[
                            styles.budgetStatusText,
                            isUnderBudget ? styles.budgetTextUnder : styles.budgetTextOver,
                          ]}
                        >
                          {isUnderBudget
                            ? `₹${budgetDiff.toLocaleString('en-IN')} Under Budget`
                            : `₹${Math.abs(budgetDiff).toLocaleString('en-IN')} Over Budget`}
                        </Text>
                      </View>
                    </View>

                    {/* Specialists Chips */}
                    {pkg.vendors.length > 0 ? (
                      <View style={styles.specialistsWrap}>
                        <Text style={styles.specialistsLabel}>
                          Included Specialists ({pkg.vendors.length})
                        </Text>
                        <View style={styles.specialistsChips}>
                          {pkg.vendors.map((v, i) => (
                            <View key={i} style={styles.specialistChip}>
                              <CheckCircle2 size={11} color="#287857" />
                              <Text style={styles.specialistChipName} numberOfLines={1}>
                                {v.businessName}
                              </Text>
                              <Text style={styles.specialistChipPrice}>
                                ₹{v.calculatedPrice.toLocaleString('en-IN')}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.emptyVendorsNotice}>
                        <Text style={styles.emptyVendorsText}>
                          No specialists added yet. Configure in builder to handpick partners!
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons Row */}
                    <View style={styles.customCardActions}>
                      {/* ⚡ 1-Click Availability Check Button */}
                      <VellureButton
                        style={styles.broadcastActionBtn}
                        onPress={() => {
                          if (pkg.vendors.length === 0) {
                            Alert.alert('Add Specialists', 'Please add at least 1 specialist before checking availability.');
                            return;
                          }
                          setBroadcastModalTarget(pkg);
                        }}
                        activeOpacity={0.85}
                      >
                        <Zap size={13} color="#2A121E" fill="#2A121E" />
                        <Text style={styles.broadcastActionText}>1-Click Date Check</Text>
                      </VellureButton>

                      {/* Configure in Builder Button */}
                      <VellureButton
                        style={styles.customEditBtn}
                        onPress={() => {
                          setActivePackage(pkg.id);
                          router.push({ pathname: '/custom-package', params: { id: pkg.id } });
                        }}
                      >
                        <FileEdit size={13} color="#FFFFFF" />
                        <Text style={styles.customEditBtnText}>Configure</Text>
                      </VellureButton>

                      {/* Quotes Button */}
                      <VellureButton
                        style={styles.customInquireBtn}
                        onPress={() => {
                          if (pkg.vendors.length === 0) {
                            Alert.alert('Add Specialists', 'Please add at least 1 specialist before requesting quotes.');
                            return;
                          }
                          setInquiryModalTarget(pkg);
                        }}
                      >
                        <Send size={12} color="#FFFFFF" />
                        <Text style={styles.customInquireBtnText}>Quotes</Text>
                      </VellureButton>
                    </View>
                  </View>
                );
              })
            ) : (
              // Empty State using Reusable EmptyStateCard
              <EmptyStateCard
                icon={<Package size={28} color="#641E3D" />}
                title="No Suites in this Filter"
                description="Create your custom celebration package with real-time price calculation and 1-click availability checks!"
                actionText="Create New Custom Suite"
                onAction={handleCreateNewPackage}
              />
            )}
          </View>
        )}

        {/* ──── 2. CURATED MARKETPLACE BUNDLES ──── */}
        {(activeTab === 'ALL' || activeTab === 'CURATED') && (
          <View style={styles.curatedSection}>
            <SectionHeader
              title="Curated Marketplace Starter Bundles"
              subtitle="Pre-negotiated packages with verified partners"
              badge="Guaranteed Rates"
              actionText="Explore All"
              onAction={() => router.push('/(tabs)/vendors')}
            />

            {(curatedPacks.length > 0
              ? curatedPacks
              : [
                  {
                    id: 'pack_essential',
                    name: 'Essential Elegance Suite',
                    description: 'Core celebration coverage with premium venue, catering, and floral styling.',
                    totalPrice: 850000,
                    city: 'Patiala',
                    guestCount: 250,
                    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                    categories: ['Venue', 'Catering', 'Photography', 'Decor'],
                  },
                  {
                    id: 'pack_premium',
                    name: 'Signature Royal Palace Suite',
                    description: 'Heritage palace setting, candid cinematography, and live band orchestra.',
                    totalPrice: 1650000,
                    city: 'Patiala',
                    guestCount: 450,
                    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
                    categories: ['Palace Venue', 'Royal Catering', 'Cinema Lead', 'Mandap Decor', 'Bridal Makeup', 'DJ'],
                  },
                ]
            ).map((pack) => (
              <VellureButton
                key={pack.id}
                style={styles.bundleCard}
                onPress={() =>
                  router.push({
                    pathname: '/package/[id]',
                    params: {
                      id: pack.id,
                      title: pack.name,
                      price: String(pack.totalPrice),
                      city: pack.city || 'Patiala',
                      guestCount: String(pack.guestCount || 300),
                    },
                  })
                }
              >
                <Image source={{ uri: pack.image }} style={styles.bundleImage} />
                <View style={styles.bundleBody}>
                  <View style={styles.bundleTopRow}>
                    <Text style={styles.bundleTitle} numberOfLines={1}>
                      {pack.name}
                    </Text>
                    {/* Reusable VerifiedBadge */}
                    <VerifiedBadge isVerified={true} />
                  </View>

                  <Text style={styles.bundleDesc} numberOfLines={2}>
                    {pack.description}
                  </Text>

                  <View style={styles.bundleCategoriesRow}>
                    {pack.categories?.map((cat: string, i: number) => (
                      <View key={i} style={styles.bundleCatPill}>
                        <Text style={styles.bundleCatText}>{cat}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.bundleFooter}>
                    <View>
                      <Text style={styles.bundlePriceLabel}>Package Benchmark</Text>
                      {/* Reusable PriceDisplay */}
                      <PriceDisplay price={pack.totalPrice} priceType="FIXED_PACKAGE" size="medium" />
                    </View>
                    <View style={styles.bundleCta}>
                      <Text style={styles.bundleCtaText}>View Details</Text>
                      <ChevronRight size={13} color="#641E3D" />
                    </View>
                  </View>
                </View>
              </VellureButton>
            ))}
          </View>
        )}

        {/* ──── 3. PACKAGE INQUIRIES & QUOTATIONS ──── */}
        {(activeTab === 'ALL' || activeTab === 'INQUIRIES') && (
          <View style={styles.inquiriesSection}>
            <SectionHeader
              title="Quotation Inquiries & Availability Broadcasts"
              subtitle="Track responses sent to vendor specialist teams"
            />

            {inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <InquiryCard
                  key={inq.id}
                  inquiry={inq}
                />
              ))
            ) : (
              // Empty State using Reusable EmptyStateCard
              <EmptyStateCard
                icon={<Send size={28} color="#641E3D" />}
                title="No Inquiries Sent Yet"
                description="When you send 1-click availability checks or quote requests for your packages, their responses will appear here."
              />
            )}
          </View>
        )}
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DB',
  },
  headerTitleWrap: { flex: 1, marginRight: 10 },
  headerEyebrow: {
    color: '#8A6A23',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: { color: '#2A121E', fontSize: 22, fontWeight: '900', marginTop: 1 },
  headerSubtitle: { color: '#786B70', fontSize: 11, marginTop: 2, lineHeight: 15 },
  newPackageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4D58D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  newPackageBtnText: { color: '#2A121E', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  filterTabsBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DB',
  },
  filterTabsScroll: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
  },
  filterTabActive: { backgroundColor: '#641E3D' },
  filterTabText: { color: '#786B70', fontSize: 11, fontWeight: '700' },
  filterTabTextActive: { color: '#FFFFFF', fontWeight: '900' },
  scrollContent: { paddingBottom: 120 },
  customSection: {
    marginHorizontal: PAGE_PADDING,
    marginTop: 16,
    marginBottom: 8,
  },
  customSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customSectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customSectionHeading: { color: '#2A121E', fontSize: 15, fontWeight: '900' },
  openBuilderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  openBuilderText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
  customSuiteCard: {
    backgroundColor: '#641E3D',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D2AD6B',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
  },
  customCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customTypePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  customTypePillText: { color: '#F4D58D', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusPillDraft: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  statusPillReady: { backgroundColor: '#ECF8F1' },
  statusPillInquired: { backgroundColor: '#F4D58D' },
  statusPillText: { fontSize: 8.5, fontWeight: '900', textTransform: 'uppercase' },
  statusTextDraft: { color: '#E0D4DC' },
  statusTextReady: { color: '#287857' },
  statusTextInquired: { color: '#2A121E' },
  customSuiteName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginTop: 2 },
  cardHeaderActions: { flexDirection: 'row', gap: 5 },
  cardIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricText: { color: '#E0D4DC', fontSize: 10.5, fontWeight: '600' },
  customPriceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 11,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(244, 213, 141, 0.2)',
  },
  customPriceLabel: { color: '#F4D58D', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  customPriceValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 1 },
  budgetStatusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  budgetStatusUnder: { backgroundColor: '#ECF8F1' },
  budgetStatusOver: { backgroundColor: '#FDE8EA' },
  budgetStatusText: { fontSize: 9, fontWeight: '800' },
  budgetTextUnder: { color: '#287857' },
  budgetTextOver: { color: '#B63A4A' },
  specialistsWrap: { marginTop: 12 },
  specialistsLabel: {
    color: '#F4D58D',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  specialistsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  specialistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  specialistChipName: { color: '#2A121E', fontSize: 10.5, fontWeight: '700', maxWidth: 120 },
  specialistChipPrice: { color: '#8A6A23', fontSize: 9.5, fontWeight: '800' },
  emptyVendorsNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  emptyVendorsText: { color: '#E0D4DC', fontSize: 10.5, textAlign: 'center', fontStyle: 'italic' },
  customCardActions: { flexDirection: 'row', gap: 6, marginTop: 14 },
  broadcastActionBtn: {
    flex: 1.2,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F4D58D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  broadcastActionText: { color: '#2A121E', fontSize: 10.5, fontWeight: '900', textTransform: 'uppercase' },
  customEditBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  customEditBtnText: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' },
  customInquireBtn: {
    flex: 0.9,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  customInquireBtnText: { color: '#641E3D', fontSize: 10.5, fontWeight: '900' },
  emptyCustomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EFE3CF',
    borderStyle: 'dashed',
  },
  emptyCustomIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyCustomTitle: { color: '#2A121E', fontSize: 16, fontWeight: '900' },
  emptyCustomDesc: {
    color: '#786B70',
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  startCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#641E3D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startCustomBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  curatedSection: { marginHorizontal: PAGE_PADDING, marginTop: 14 },
  bundleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
  },
  bundleImage: { width: '100%', height: 130, backgroundColor: '#2A121E' },
  bundleBody: { padding: 14 },
  bundleTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  bundleTitle: { color: '#2A121E', fontSize: 15, fontWeight: '900', flex: 1 },
  bundleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECF8F1',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bundleBadgeText: { color: '#287857', fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  bundleDesc: { color: '#786B70', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  bundleCategoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  bundleCatPill: { backgroundColor: '#FAF5EC', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  bundleCatText: { color: '#641E3D', fontSize: 9.5, fontWeight: '700' },
  bundleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FAF5EC',
  },
  bundlePriceLabel: { color: '#8A7A70', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  bundlePrice: { color: '#641E3D', fontSize: 16, fontWeight: '900' },
  bundleCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  bundleCtaText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
  inquiriesSection: { marginHorizontal: PAGE_PADDING, marginTop: 14 },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 10,
  },
  inquiryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  inquiryStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inquiryStatusText: { color: '#641E3D', fontSize: 9.5, fontWeight: '900', textTransform: 'uppercase' },
  inquiryDate: { color: '#8A7A70', fontSize: 10, fontWeight: '600' },
  inquiryTargetName: { color: '#2A121E', fontSize: 14, fontWeight: '900' },
  inquiryCategory: { color: '#786B70', fontSize: 11, marginTop: 2 },
  inquiryBudgetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  inquiryBudgetLabel: { color: '#8A7A70', fontSize: 10, fontWeight: '600' },
  inquiryBudgetValue: { color: '#641E3D', fontSize: 12, fontWeight: '800' },
  emptyInquiriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 6,
  },
  emptyInquiriesTitle: { color: '#2A121E', fontSize: 14, fontWeight: '900' },
  emptyInquiriesSubtitle: { color: '#786B70', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
