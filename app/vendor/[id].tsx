import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useEffect,
  useState,
  useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
  Scale,
  HelpCircle,
  FileCheck,
  Sparkles,
  Send,
  Layers,
  CheckCircle2,
  X,
  Store,
  Briefcase,
  Share2,
  Package,
} from 'lucide-react-native';
import {
  fetchPublicVendorById,
  fetchSavedVendorIds,
  fetchComparedVendorIds,
  saveComparedVendorIds,
  toggleSaveVendorId,
  fetchCustomerPlans,
  EventPlan,
} from '../../services/api';
import {
  isVendorInCustomPackage,
  toggleVendorInCustomPackage,
  subscribeCustomPackage,
  getCustomPackage,
  CustomPackage,
} from '../../services/customPackageStore';
import { getServiceMetadata } from '../../constants/services';
import { PriceDisplay, VendorPriceType } from '../../components/ui/PriceDisplay';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { RatingDisplay } from '../../components/ui/RatingDisplay';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';
import { AddVendorToPlanModal } from '../../components/vendor/AddVendorToPlanModal';
import { AddToPackageModal } from '../../components/package/AddToPackageModal';
import { CalendarModal } from '../../components/ui/CalendarModal';
import { VendorWorkHistory, VendorWorkItem } from '../../components/vendor/VendorWorkHistory';
import { VendorServiceCatalog } from '../../components/vendor/VendorServiceCatalog';
import { colors } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;

type VendorServiceItem = {
  id?: string;
  name: string;
  price?: number;
  priceType?: string;
  description?: string;
};

type VendorPackageItem = {
  id?: string;
  name: string;
  price?: number;
  guestCount?: number;
  description?: string;
  inclusions?: string[];
  exclusions?: string[];
};

type NormalizedVendor = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  locality?: string;
  serviceRadiusKm?: number;
  cityTier?: number;
  basePrice?: number;
  priceType?: string;
  rating?: number;
  reviewsCount: number;
  status?: string;
  verified?: boolean;
  image?: string;
  portfolio: VendorWorkItem[];
  user?: { name?: string };
  createdAt?: string;
  yearsExperience?: number;
  description?: string;
  services: VendorServiceItem[];
  packages: VendorPackageItem[];
  amenities?: string[];
  capacityMin?: number;
  capacityMax?: number;
  policies?: {
    advance?: string;
    cancellation?: string;
    rescheduling?: string;
    travel?: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
};

function normalizeVendor(raw: any): NormalizedVendor {
  const portfolio: VendorWorkItem[] = Array.isArray(raw?.portfolio) ? raw.portfolio : [];
  const services: VendorServiceItem[] = Array.isArray(raw?.services) ? raw.services : [];
  const packages: VendorPackageItem[] = Array.isArray(raw?.packages) ? raw.packages : [];

  return {
    id: String(raw?.id || ''),
    businessName: raw?.businessName || raw?.name || '',
    category: raw?.category || '',
    city: raw?.city || raw?.location || '',
    locality: raw?.locality,
    serviceRadiusKm: raw?.serviceRadiusKm,
    cityTier: raw?.cityTier,
    basePrice: typeof raw?.basePrice === 'number' ? raw.basePrice : undefined,
    priceType: raw?.priceType,
    rating: typeof raw?.rating === 'number' ? raw.rating : undefined,
    reviewsCount: typeof raw?.reviewsCount === 'number' ? raw.reviewsCount : (typeof raw?.reviews === 'number' ? raw.reviews : 0),
    status: raw?.status,
    verified: raw?.verified ?? raw?.status === 'VERIFIED',
    image: raw?.image || (portfolio[0]?.imageUrl || portfolio[0]?.image),
    portfolio,
    user: raw?.user,
    createdAt: raw?.createdAt,
    yearsExperience: raw?.yearsExperience,
    description: raw?.description,
    services,
    packages,
    amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
    capacityMin: raw?.capacityMin,
    capacityMax: raw?.capacityMax,
    policies: raw?.policies,
    faqs: Array.isArray(raw?.faqs) ? raw.faqs : [],
  };
}

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const vendorId = Array.isArray(id) ? id[0] : id;

  const [vendor, setVendor] = useState<NormalizedVendor | null>(null);
  const [activePlan, setActivePlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Previous Works' | 'About' | 'Services' | 'Packages' | 'Reviews' | 'Policies'>('Previous Works');

  // Modals state
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedInquiryDate, setSelectedInquiryDate] = useState<string>('');
  const [showAddToPackageModal, setShowAddToPackageModal] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [customPackage, setCustomPackage] = useState<CustomPackage>(getCustomPackage());
  const [inCustomPackage, setInCustomPackage] = useState(
    vendorId ? isVendorInCustomPackage(String(vendorId)) : false
  );

  useEffect(() => {
    const unsubscribe = subscribeCustomPackage((pkg) => {
      setCustomPackage(pkg);
      if (vendorId) {
        setInCustomPackage(pkg.vendors.some((v) => String(v.vendorId) === String(vendorId)));
      }
    });
    return unsubscribe;
  }, [vendorId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [found, savedIds, comparedIds, plans] = await Promise.all([
        vendorId ? fetchPublicVendorById(String(vendorId)) : Promise.resolve(null),
        fetchSavedVendorIds().catch(() => [] as string[]),
        fetchComparedVendorIds().catch(() => [] as string[]),
        fetchCustomerPlans().catch(() => [] as EventPlan[]),
      ]);

      setVendor(found ? normalizeVendor(found) : null);
      const primary = plans.find((p) => p.isPrimary) || plans[0] || null;
      setActivePlan(primary);

      if (vendorId) {
        setIsSaved((savedIds as string[]).includes(String(vendorId)));
        setIsComparing((comparedIds as string[]).includes(String(vendorId)));
        setInCustomPackage(isVendorInCustomPackage(String(vendorId)));
      }
    } catch (e) {
      console.error('Error fetching vendor details:', e);
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab('Previous Works');
    loadData();
  }, [vendorId]);

  const handleToggleFavorite = async () => {
    if (!vendor) return;
    const nowSaved = await toggleSaveVendorId(vendor.id);
    setIsSaved(nowSaved);
  };

  const handleToggleCustomPackage = () => {
    if (!vendor) return;
    setShowAddToPackageModal(true);
  };

  const handleToggleCompare = async () => {
    if (!vendor) return;
    const current = await fetchComparedVendorIds();
    const next = current.includes(vendor.id)
      ? current.filter((item) => item !== vendor.id)
      : [...current, vendor.id].slice(0, 4);
    await saveComparedVendorIds(next);
    setIsComparing(next.includes(vendor.id));
  };

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Loading verified partner profile...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.centerScreen}>
        <Store size={44} color="#641E3D" />
        <Text style={styles.emptyTitle}>This vendor is no longer available</Text>
        <Text style={styles.emptyCopy}>
          The requested specialist listing may have been updated, relocated, or temporarily unlisted.
        </Text>
        <View style={styles.errorBtnRow}>
          <VellureButton onPress={() => router.back()} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Return to Explore</Text>
          </VellureButton>
          <VellureButton onPress={loadData} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </VellureButton>
        </View>
      </View>
    );
  }

  const serviceMeta = getServiceMetadata(vendor.category);
  const CategoryIcon = serviceMeta.icon;
  const portfolioImages = vendor.portfolio
    .flatMap((p) => {
      if (Array.isArray(p.images) && p.images.length > 0) {
        return p.images.map((img: any) => (typeof img === 'string' ? img : img?.uri || img?.imageUrl));
      }
      if (Array.isArray(p.photos) && p.photos.length > 0) {
        return p.photos.map((img: any) => (typeof img === 'string' ? img : img?.uri || img?.imageUrl));
      }
      return [p.imageUrl || p.image];
    })
    .filter(Boolean) as string[];

  const heroImages = portfolioImages.length > 0 ? portfolioImages : vendor.image ? [vendor.image] : [];

  // Active Plan Match Calculation
  const isCityMatch = Boolean(activePlan?.city && vendor.city && activePlan.city.toLowerCase() === vendor.city.toLowerCase());
  const isCapacityMatch = Boolean(activePlan?.guestCount && vendor.capacityMax && activePlan.guestCount <= vendor.capacityMax);
  const isBudgetMatch = Boolean(activePlan?.budgetMax && vendor.basePrice && vendor.basePrice <= activePlan.budgetMax);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ──── MODALS ──── */}
      <EventInquiryModal
        visible={inquiryModalVisible}
        onClose={() => setInquiryModalVisible(false)}
        targetId={vendor.id}
        targetName={vendor.businessName}
        targetCategory={serviceMeta.label}
        initialCity={vendor.city}
        initialBudget={vendor.basePrice}
      />

      <AddVendorToPlanModal
        visible={planModalVisible}
        onClose={() => setPlanModalVisible(false)}
        vendorId={vendor.id}
        vendorName={vendor.businessName}
        category={serviceMeta.label}
        estimatedPrice={vendor.basePrice}
      />

      <CalendarModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        onDateSelect={(dateString) => {
          setSelectedInquiryDate(dateString);
          setCalendarModalVisible(false);
          setInquiryModalVisible(true);
        }}
        currentDate={selectedInquiryDate}
      />

      {/* Fullscreen Image Preview */}
      {fullscreenImage && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setFullscreenImage(null)}>
          <View style={styles.fullscreenModal}>
            <VellureButton style={styles.closeFullscreenBtn} onPress={() => setFullscreenImage(null)}>
              <X size={24} color="#FFFFFF" />
            </VellureButton>
            <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImg} resizeMode="contain" />
          </View>
        </Modal>
      )}

      {/* ──── MAIN SCROLLABLE BODY ──── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ──── 1. HERO IMAGE GALLERY ──── */}
        <View style={styles.hero}>
          {heroImages.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.heroScroll}>
              {heroImages.map((uri, idx) => (
                <VellureButton key={idx} activeOpacity={0.95} onPress={() => setFullscreenImage(uri)}>
                  <Image source={{ uri }} style={styles.heroImage} resizeMode="cover" />
                </VellureButton>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroFallback, { backgroundColor: `${serviceMeta.color}20` }]}>
              <CategoryIcon size={54} color={serviceMeta.color} strokeWidth={1.4} />
              <Text style={[styles.heroFallbackText, { color: serviceMeta.color }]}>
                {serviceMeta.label} Portfolio
              </Text>
            </View>
          )}

          <View style={styles.heroShade} />

          {/* Navigation Bar Over Hero */}
          <VellureButton onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
          </VellureButton>

          <View style={styles.topRightActions}>
            <VellureButton
              style={[styles.actionRoundBtn, isComparing && styles.actionRoundBtnActive]}
              onPress={handleToggleCompare}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Compare partner"
            >
              <Scale size={16} color={isComparing ? '#641E3D' : '#FFFFFF'} strokeWidth={2.2} />
            </VellureButton>

            <VellureButton
              style={[styles.actionRoundBtn, isSaved && styles.actionRoundBtnSaved]}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Save to wishlist"
            >
              <Heart
                size={16}
                color={isSaved ? '#E11D48' : '#FFFFFF'}
                fill={isSaved ? '#E11D48' : 'transparent'}
                strokeWidth={2.2}
              />
            </VellureButton>
          </View>

          {heroImages.length > 1 && (
            <View style={styles.galleryCountBadge}>
              <Text style={styles.galleryCountText}>{heroImages.length} Photos</Text>
            </View>
          )}
        </View>

        {/* ──── 2. PROFILE SUMMARY CARD ──── */}
        <View style={styles.profileCard}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryChip}>
              <CategoryIcon size={12} color="#641E3D" />
              <Text style={styles.categoryChipText}>{serviceMeta.label}</Text>
            </View>
            <VerifiedBadge status={vendor.status} isVerified={vendor.verified} size="medium" />
          </View>

          <Text style={styles.vendorName}>{vendor.businessName}</Text>

          <View style={styles.locationLine}>
            <MapPin size={13} color="#8C6F3E" />
            <Text style={styles.locationText}>
              {[vendor.locality, vendor.city].filter(Boolean).join(', ') || 'Location not published'}
              {vendor.serviceRadiusKm ? ` (Serves within ${vendor.serviceRadiusKm} km)` : ''}
            </Text>
          </View>

          {/* Key Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <RatingDisplay rating={vendor.rating} reviewsCount={vendor.reviewsCount} size="medium" />
              <Text style={styles.metricSub}>Client Feedback</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{vendor.yearsExperience ? `${vendor.yearsExperience} Years` : 'Not shared'}</Text>
              <Text style={styles.metricSub}>Market Experience</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{vendor.capacityMax ? `Up to ${vendor.capacityMax}` : 'Not shared'}</Text>
              <Text style={styles.metricSub}>Guest Scale</Text>
            </View>
          </View>

          {/* Pricing Panel with Unambiguous PriceDisplay */}
          <View style={styles.pricingPanel}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingHeading}>Verified Pricing Benchmark</Text>
              <PriceDisplay
                price={vendor.basePrice}
                priceType={vendor.priceType as VendorPriceType}
                size="large"
                tone="inverse"
                containerStyle={styles.pricingValue}
              />
            </View>
            <Text style={styles.pricingDisclaimer}>
              * Listed rate is a starting benchmark. Final quotation and calendar availability require direct partner confirmation.
            </Text>
          </View>

          {/* Custom Package CTA Bar */}
          <View style={styles.packageCTAContainer}>
            <VellureButton
              style={[styles.customPackageHeroBtn, inCustomPackage && styles.customPackageHeroBtnActive]}
              onPress={handleToggleCustomPackage}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={inCustomPackage ? "In custom package" : "Add to custom package"}
            >
              {inCustomPackage ? (
                <CheckCircle2 size={16} color="#287857" strokeWidth={2.4} />
              ) : (
                <Package size={16} color="#641E3D" />
              )}
              <View style={styles.customPackageHeroCopy}>
                <Text style={[styles.customPackageHeroTitle, inCustomPackage && styles.customPackageHeroTitleActive]}>
                  {inCustomPackage ? 'In Your Custom Package ✓' : '+ Add to Custom Package Builder'}
                </Text>
                <Text style={styles.customPackageHeroSub}>
                  {inCustomPackage ? 'Dynamic rate credited • Tap to remove' : 'Calculates amount live in your bespoke celebration bundle'}
                </Text>
              </View>
              {inCustomPackage && (
                <VellureButton
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/custom-package');
                  }}
                  style={styles.customPackageViewBtn}
                >
                  <Text style={styles.customPackageViewText}>View →</Text>
                </VellureButton>
              )}
            </VellureButton>
          </View>
        </View>

        {/* ──── 3. EVENT PLAN COMPATIBILITY MATCH ──── */}
        {activePlan && (
          <View style={styles.planMatchCard}>
            <View style={styles.planMatchHeader}>
              <Sparkles size={14} color="#8A6A23" />
              <Text style={styles.planMatchTitle}>Match for your {activePlan.eventType} in {activePlan.city}</Text>
            </View>

            <View style={styles.matchChipsRow}>
              <View style={[styles.matchPill, isCityMatch && styles.matchPillActive]}>
                <CheckCircle2 size={11} color={isCityMatch ? '#287857' : '#8A7A70'} />
                <Text style={[styles.matchPillText, isCityMatch && styles.matchPillTextActive]}>
                  {isCityMatch ? `Operates in ${activePlan.city}` : `Located in ${vendor.city}`}
                </Text>
              </View>

              {activePlan.guestCount && vendor.capacityMax ? (
                <View style={[styles.matchPill, isCapacityMatch && styles.matchPillActive]}>
                  <CheckCircle2 size={11} color={isCapacityMatch ? '#287857' : '#8A7A70'} />
                  <Text style={[styles.matchPillText, isCapacityMatch && styles.matchPillTextActive]}>
                    Fits {activePlan.guestCount} guests
                  </Text>
                </View>
              ) : null}

              {activePlan.budgetMax && vendor.basePrice ? (
                <View style={[styles.matchPill, isBudgetMatch && styles.matchPillActive]}>
                  <CheckCircle2 size={11} color={isBudgetMatch ? '#287857' : '#8A7A70'} />
                  <Text style={[styles.matchPillText, isBudgetMatch && styles.matchPillTextActive]}>
                    Within budget allocation
                  </Text>
                </View>
              ) : null}
            </View>

            <VellureButton
              style={styles.addPlanQuickBtn}
              onPress={() => setPlanModalVisible(true)}
              activeOpacity={0.82}
            >
              <Briefcase size={13} color="#641E3D" />
              <Text style={styles.addPlanQuickText}>Add to "{activePlan.name}"</Text>
            </VellureButton>
          </View>
        )}

        {/* ──── 4. SECTION TABS ──── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsBar}>
          {(['Previous Works', 'About', 'Services', 'Packages', 'Reviews', 'Policies'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <VellureButton
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{tab}</Text>
              </VellureButton>
            );
          })}
        </ScrollView>

        {/* ──── 5. TAB CONTENTS ──── */}
        <View style={styles.tabContentArea}>
          {activeTab === 'Previous Works' && (
            <VendorWorkHistory
              items={vendor.portfolio}
              vendorName={vendor.businessName}
              vendorCategory={vendor.category}
              vendorCity={vendor.city}
            />
          )}

          {/* ABOUT TAB */}
          {activeTab === 'About' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>About the Specialist</Text>
              {vendor.description ? <Text style={styles.bodyParagraph}>{vendor.description}</Text> : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardTitle}>About details not published</Text>
                  <Text style={styles.emptyCardCopy}>This vendor has not added a business description to their backend profile.</Text>
                </View>
              )}

              {vendor.amenities && vendor.amenities.length > 0 ? (
                <>
                  <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Capabilities & Amenities</Text>
                  <View style={styles.amenitiesWrap}>
                    {vendor.amenities.map((amenity, i) => (
                      <View key={i} style={styles.amenityChip}>
                        <CheckCircle2 size={11} color="#287857" />
                        <Text style={styles.amenityChipText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              {vendor.user?.name ? (
                <>
                  <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Lead Coordinator</Text>
                  <View style={styles.coordinatorCard}>
                    <ShieldCheck size={20} color="#D2AD6B" />
                    <View>
                      <Text style={styles.coordinatorName}>{vendor.user.name}</Text>
                      <Text style={styles.coordinatorRole}>Vendor account contact</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'Services' && (
            <VendorServiceCatalog
              services={vendor.services}
              onEnquire={() => setInquiryModalVisible(true)}
            />
          )}

          {/* PACKAGES TAB */}
          {activeTab === 'Packages' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Curated Bundles ({vendor.packages.length})</Text>
              {vendor.packages.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardTitle}>No packages published</Text>
                  <Text style={styles.emptyCardCopy}>This vendor has not added packages to their backend profile.</Text>
                </View>
              ) : null}
              {vendor.packages.map((pkg, idx) => (
                <View key={idx} style={styles.packageCard}>
                  <View style={styles.packageHeader}>
                    <View style={styles.pkgTitleWrap}>
                      <Text style={styles.pkgTitle}>{pkg.name}</Text>
                      {pkg.guestCount ? <Text style={styles.pkgScale}>Configured for {pkg.guestCount} guests</Text> : null}
                    </View>
                    <PriceDisplay price={pkg.price} priceType="FIXED_PACKAGE" size="large" />
                  </View>

                  {pkg.description ? <Text style={styles.pkgDesc}>{pkg.description}</Text> : null}

                  {pkg.inclusions && pkg.inclusions.length > 0 && (
                    <View style={styles.inclusionsBox}>
                      <Text style={styles.inclusionsTitle}>Included In Package:</Text>
                      {pkg.inclusions.map((inc, i) => (
                        <Text key={i} style={styles.incItem}>• {inc}</Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.pkgActions}>
                    <VellureButton
                      style={styles.pkgAddBtn}
                      onPress={() => setPlanModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Briefcase size={12} color="#641E3D" />
                      <Text style={styles.pkgAddText}>Add Package to Plan</Text>
                    </VellureButton>

                    <VellureButton
                      style={styles.pkgQuoteBtn}
                      onPress={() => setInquiryModalVisible(true)}
                      activeOpacity={0.88}
                    >
                      <Send size={12} color="#FFFFFF" />
                      <Text style={styles.pkgQuoteText}>Request Quote</Text>
                    </VellureButton>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'Reviews' && (
            <View style={styles.sectionBlock}>
              <View style={styles.reviewsSummaryRow}>
                <View style={styles.reviewBigScore}>
                  <Star size={24} color="#D2AD6B" fill="#D2AD6B" />
                  <Text style={styles.reviewBigScoreText}>{vendor.rating ? vendor.rating.toFixed(1) : 'New'}</Text>
                </View>
                <View>
                  <Text style={styles.reviewHeading}>{vendor.reviewsCount} Verified Customer Reviews</Text>
                  <Text style={styles.reviewSub}>All reviews from verified marketplace consultations & bookings</Text>
                </View>
              </View>

              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>Individual reviews not available</Text>
                <Text style={styles.emptyCardCopy}>Only the backend rating summary is currently published for this vendor.</Text>
              </View>
            </View>
          )}

          {/* POLICIES & FAQS TAB */}
          {activeTab === 'Policies' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Marketplace Policies & Booking Terms</Text>

              {!vendor.policies?.advance && !vendor.policies?.cancellation && !vendor.policies?.rescheduling && !vendor.policies?.travel ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardTitle}>Policies not published</Text>
                  <Text style={styles.emptyCardCopy}>This vendor has not added booking policies to their backend profile.</Text>
                </View>
              ) : null}

              {vendor.policies?.advance ? (
                <View style={styles.policyRow}>
                  <FileCheck size={16} color="#641E3D" />
                  <View style={styles.policyCopy}>
                    <Text style={styles.policyTitle}>Advance Booking Policy</Text>
                    <Text style={styles.policyDesc}>{vendor.policies.advance}</Text>
                  </View>
                </View>
              ) : null}

              {vendor.policies?.cancellation || vendor.policies?.rescheduling ? (
                <View style={styles.policyRow}>
                  <FileCheck size={16} color="#641E3D" />
                  <View style={styles.policyCopy}>
                    <Text style={styles.policyTitle}>Cancellation & Rescheduling</Text>
                    {vendor.policies.cancellation ? <Text style={styles.policyDesc}>{vendor.policies.cancellation}</Text> : null}
                    {vendor.policies.rescheduling ? <Text style={styles.policyDesc}>{vendor.policies.rescheduling}</Text> : null}
                  </View>
                </View>
              ) : null}

              {vendor.policies?.travel ? (
                <View style={styles.policyRow}>
                  <FileCheck size={16} color="#641E3D" />
                  <View style={styles.policyCopy}>
                    <Text style={styles.policyTitle}>Travel & Outstation Coverage</Text>
                    <Text style={styles.policyDesc}>{vendor.policies.travel}</Text>
                  </View>
                </View>
              ) : null}

              {vendor.faqs && vendor.faqs.length > 0 ? (
                <>
                  <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Frequently Asked Questions</Text>
                  {vendor.faqs.map((faq, i) => (
                    <View key={i} style={styles.faqCard}>
                      <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          )}
        </View>

        {/* ──── 6. AVAILABILITY REQUEST WIDGET ──── */}
        <View style={styles.availabilityCard}>
          <View style={styles.availHeader}>
            <Calendar size={15} color="#641E3D" />
            <Text style={styles.availTitle}>Check Date Availability</Text>
          </View>
          <Text style={styles.availSubtitle}>
            Select your celebration date to verify partner calendar availability with no obligations.
          </Text>

          <VellureButton
            style={styles.availDateBtn}
            onPress={() => setCalendarModalVisible(true)}
            activeOpacity={0.85}
          >
            <Calendar size={13} color="#D2AD6B" />
            <Text style={styles.availDateBtnText}>
              {selectedInquiryDate ? `Date: ${selectedInquiryDate}` : 'Select Celebration Date'}
            </Text>
            <ChevronRight size={14} color="#641E3D" />
          </VellureButton>
        </View>
      </ScrollView>

      {/* ──── FLOATING CUSTOM PACKAGE BAR ──── */}
      {customPackage.vendors.length > 0 && (
        <VellureButton
          style={styles.floatingVendorPackageBar}
          onPress={() => router.push('/custom-package')}
          activeOpacity={0.92}
          accessibilityRole="button"
          accessibilityLabel={`View custom package with ${customPackage.vendors.length} vendors`}
        >
          <View style={styles.floatingVendorPackageIcon}>
            <Package size={15} color="#F4D58D" />
          </View>
          <View style={styles.floatingVendorPackageCopy}>
            <Text style={styles.floatingVendorPackageTitle}>Custom Package Active</Text>
            <Text style={styles.floatingVendorPackageSubtitle}>
              {customPackage.vendors.length} {customPackage.vendors.length === 1 ? 'Specialist' : 'Specialists'} • ₹{customPackage.totalPrice.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.floatingVendorPackageAction}>
            <Text style={styles.floatingVendorPackageActionText}>Builder →</Text>
          </View>
        </VellureButton>
      )}

      {/* ──── 7. STICKY MOBILE BOTTOM ACTION BAR ──── */}
      <View style={styles.stickyBottomBar}>
        <VellureButton
          style={[styles.stickyHeartBtn, isSaved && styles.stickyHeartBtnActive]}
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
        >
          <Heart size={18} color={isSaved ? '#E11D48' : '#641E3D'} fill={isSaved ? '#E11D48' : 'transparent'} />
        </VellureButton>

        <VellureButton
          style={[styles.stickyPackageBtn, inCustomPackage && styles.stickyPackageBtnActive]}
          onPress={handleToggleCustomPackage}
          activeOpacity={0.85}
        >
          {inCustomPackage ? <CheckCircle2 size={15} color="#287857" strokeWidth={2.4} /> : <Package size={15} color="#641E3D" />}
          <Text style={[styles.stickyPackageBtnText, inCustomPackage && styles.stickyPackageBtnTextActive]}>
            {inCustomPackage ? 'In Package' : '+ Package'}
          </Text>
        </VellureButton>

        <VellureButton
          style={styles.stickyPlanBtn}
          onPress={() => setPlanModalVisible(true)}
          activeOpacity={0.85}
        >
          <Briefcase size={14} color="#641E3D" />
          <Text style={styles.stickyPlanBtnText}>Plan</Text>
        </VellureButton>

        <VellureButton
          style={styles.stickyQuoteBtn}
          onPress={() => setInquiryModalVisible(true)}
          activeOpacity={0.88}
        >
          <Send size={14} color="#FFFFFF" />
          <Text style={styles.stickyQuoteBtnText}>Request Quote</Text>
        </VellureButton>
      </View>

      {/* 📦 Select Celebration Suite / Package Modal */}
      {vendor && (
        <AddToPackageModal
          visible={showAddToPackageModal}
          vendor={{
            id: vendor.id,
            businessName: vendor.businessName,
            category: vendor.category,
            city: vendor.city,
            locality: vendor.locality,
            basePrice: vendor.basePrice,
            priceType: vendor.priceType,
            rating: vendor.rating,
            reviewsCount: vendor.reviewsCount,
            image: vendor.image,
          }}
          onClose={() => setShowAddToPackageModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyTitle: {
    color: '#2D2025',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyCopy: {
    color: '#786B70',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  errorBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#641E3D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  secondaryBtnText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 110, // Sticky bottom bar clearance
  },
  hero: {
    height: 270,
    width: '100%',
    backgroundColor: '#2A151D',
    position: 'relative',
  },
  heroScroll: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 270,
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroFallbackText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 15, 0.35)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  topRightActions: {
    position: 'absolute',
    top: 48,
    right: 18,
    flexDirection: 'row',
    gap: 8,
  },
  actionRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  actionRoundBtnActive: {
    backgroundColor: '#FAF5EC',
    borderColor: '#D2AD6B',
  },
  actionRoundBtnSaved: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FECDD3',
  },
  galleryCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: PAGE_PADDING,
    marginTop: -20,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  categoryChipText: {
    color: '#641E3D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  vendorName: {
    color: '#2D2025',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  locationText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  metricSub: {
    color: '#8A7A70',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFE3CF',
  },
  pricingPanel: {
    backgroundColor: '#2A121E',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#5B3042',
  },
  pricingHeader: {
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 7,
  },
  pricingHeading: {
    color: '#F4E8D6',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  pricingValue: {
    width: '100%',
  },
  pricingDisclaimer: {
    color: '#CBBBC1',
    fontSize: 9.5,
    lineHeight: 14,
  },
  planMatchCard: {
    backgroundColor: '#FFFDF9',
    marginHorizontal: PAGE_PADDING,
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  planMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  planMatchTitle: {
    color: '#8A6A23',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  matchChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  matchPillActive: {
    backgroundColor: '#EAF7F0',
    borderColor: '#C2EAD4',
  },
  matchPillText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '700',
  },
  matchPillTextActive: {
    color: '#287857',
    fontWeight: '800',
  },
  addPlanQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  addPlanQuickText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  tabsBar: {
    flexDirection: 'row',
    paddingHorizontal: PAGE_PADDING,
    marginTop: 16,
    marginBottom: 12,
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  tabBtnActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  tabBtnText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabContentArea: {
    paddingHorizontal: PAGE_PADDING,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  bodyParagraph: {
    color: '#5A4D52',
    fontSize: 12,
    lineHeight: 18,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  amenityChipText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '700',
  },
  coordinatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  coordinatorName: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  coordinatorRole: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
    marginRight: 6,
  },
  itemDesc: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  itemEnquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  itemEnquireText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pkgTitleWrap: {
    flex: 1,
    marginRight: 8,
  },
  pkgTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
  },
  pkgScale: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  pkgDesc: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  inclusionsBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  inclusionsTitle: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  incItem: {
    color: '#4A3E44',
    fontSize: 11,
    lineHeight: 16,
  },
  pkgActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pkgAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  pkgAddText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  pkgQuoteBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  pkgQuoteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  portfolioImg: {
    width: '100%',
    height: 160,
    backgroundColor: '#FAF5EC',
  },
  portfolioBody: {
    padding: 12,
  },
  portfolioTitle: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  portfolioMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  portfolioMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  portfolioMetaText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
  },
  portfolioScope: {
    color: '#5A4D52',
    fontSize: 11,
    lineHeight: 15,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 6,
  },
  emptyCardTitle: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyCardCopy: {
    color: '#786B70',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  reviewsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  reviewBigScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewBigScoreText: {
    color: '#2D2025',
    fontSize: 22,
    fontWeight: '900',
  },
  reviewHeading: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  reviewSub: {
    color: '#786B70',
    fontSize: 10,
  },
  reviewCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 8,
  },
  reviewCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reviewerName: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewEventTag: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  reviewText: {
    color: '#4A3E44',
    fontSize: 11,
    lineHeight: 16,
  },
  policyRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 8,
  },
  policyCopy: {
    flex: 1,
  },
  policyTitle: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  policyDesc: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 15,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 8,
  },
  faqQuestion: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  faqAnswer: {
    color: '#5A4D52',
    fontSize: 11,
    lineHeight: 16,
  },
  availabilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: PAGE_PADDING,
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  availHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  availTitle: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  availSubtitle: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  availDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  availDateBtnText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
    marginLeft: 8,
  },
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
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  packageCTAContainer: {
    marginTop: 12,
  },
  customPackageHeroBtn: {
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#D2AD6B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customPackageHeroBtnActive: {
    backgroundColor: '#ECF8F1',
    borderColor: '#A5CDBE',
  },
  customPackageHeroCopy: { flex: 1 },
  customPackageHeroTitle: { color: '#641E3D', fontSize: 12.5, fontWeight: '900' },
  customPackageHeroTitleActive: { color: '#287857' },
  customPackageHeroSub: { color: '#786B70', fontSize: 9.5, marginTop: 2, fontWeight: '600' },
  customPackageViewBtn: {
    backgroundColor: '#287857',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  customPackageViewText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  floatingVendorPackageBar: {
    position: 'absolute',
    bottom: 80,
    left: 18,
    right: 18,
    backgroundColor: '#641E3D',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 213, 141, 0.3)',
    zIndex: 99,
  },
  floatingVendorPackageIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingVendorPackageCopy: { flex: 1 },
  floatingVendorPackageTitle: { color: '#F4D58D', fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  floatingVendorPackageSubtitle: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800', marginTop: 1 },
  floatingVendorPackageAction: {
    backgroundColor: '#F4D58D',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  floatingVendorPackageActionText: { color: '#2A121E', fontSize: 9.5, fontWeight: '900', textTransform: 'uppercase' },
  stickyHeartBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  stickyHeartBtnActive: {
    backgroundColor: '#FFF0F3',
    borderColor: '#FECDD3',
  },
  stickyPackageBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    height: 44,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D2AD6B',
  },
  stickyPackageBtnActive: {
    backgroundColor: '#ECF8F1',
    borderColor: '#BFE6CF',
  },
  stickyPackageBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
  },
  stickyPackageBtnTextActive: {
    color: '#287857',
  },
  stickyPlanBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    height: 44,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  stickyPlanBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  stickyQuoteBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    height: 44,
    borderRadius: 12,
    gap: 5,
  },
  stickyQuoteBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullscreenBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullscreenImg: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
});
