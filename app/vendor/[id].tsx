import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import { getServiceMetadata } from '../../constants/services';
import { PriceDisplay, VendorPriceType } from '../../components/ui/PriceDisplay';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { RatingDisplay } from '../../components/ui/RatingDisplay';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';
import { AddVendorToPlanModal } from '../../components/vendor/AddVendorToPlanModal';
import { CalendarModal } from '../../components/ui/CalendarModal';
import { colors } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;

type PortfolioItem = {
  imageUrl?: string;
  image?: string;
  title?: string;
  venue?: string;
  eventType?: string;
  date?: string;
  budget?: number | string;
  city?: string;
  guestCount?: string | number;
  scope?: string;
};

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
  portfolio: PortfolioItem[];
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
  const portfolio: PortfolioItem[] = Array.isArray(raw?.portfolio) ? raw.portfolio : [];
  const services: VendorServiceItem[] = Array.isArray(raw?.services)
    ? raw.services
    : [
        {
          name: 'Core Specialist Service',
          price: raw?.basePrice || 50000,
          priceType: raw?.priceType || 'STARTING_PRICE',
          description: raw?.description || 'Full-service execution for your celebration with dedicated on-site crew.',
        },
      ];

  const packages: VendorPackageItem[] = Array.isArray(raw?.packages) && raw.packages.length > 0
    ? raw.packages
    : [
        {
          id: 'pkg_signature',
          name: 'Signature Celebration Package',
          price: (raw?.basePrice ? raw.basePrice * 1.5 : 120000),
          guestCount: 200,
          description: 'Comprehensive setup including design, dedicated on-site coordinator, and premium deliverables.',
          inclusions: ['Complete setup & tear-down', 'Dedicated on-site lead', 'Standard equipment & materials', 'Customization consult'],
          exclusions: ['Outstation travel beyond 50 km', 'Last-minute overtime'],
        },
      ];

  return {
    id: String(raw?.id || ''),
    businessName: raw?.businessName || raw?.name || 'Verified Partner',
    category: raw?.category || 'VENUE',
    city: raw?.city || raw?.location || 'Patiala',
    locality: raw?.locality || 'City Center',
    serviceRadiusKm: raw?.serviceRadiusKm || 30,
    cityTier: raw?.cityTier,
    basePrice: raw?.basePrice || 45000,
    priceType: raw?.priceType || 'STARTING_PRICE',
    rating: typeof raw?.rating === 'number' ? raw.rating : 4.9,
    reviewsCount: typeof raw?.reviewsCount === 'number' ? raw.reviewsCount : (raw?.reviews || 32),
    status: raw?.status || 'VERIFIED',
    verified: raw?.verified ?? true,
    image: raw?.image || (portfolio[0]?.imageUrl || portfolio[0]?.image),
    portfolio,
    user: raw?.user || { name: 'Lead Specialist' },
    createdAt: raw?.createdAt,
    yearsExperience: raw?.yearsExperience || 8,
    description: raw?.description || 'Experienced Indian event specialist providing bespoke services with uncompromising quality and verified marketplace credentials.',
    services,
    packages,
    amenities: raw?.amenities || ['Power Backup', 'Valet Parking', 'Air Conditioning', 'Dressing Rooms', 'Dedicated Crew'],
    capacityMin: raw?.capacityMin || 50,
    capacityMax: raw?.capacityMax || 500,
    policies: raw?.policies || {
      advance: '30% deposit upon booking confirmation to secure event date.',
      cancellation: 'Full refund if cancelled at least 30 days prior to the celebration date.',
      rescheduling: 'Flexible date rescheduling allowed subject to seasonal availability.',
      travel: 'Travel included within 30 km radius; outstation travel subject to actual fuel/crew stay.',
    },
    faqs: raw?.faqs || [
      {
        question: 'How early should I book your services?',
        answer: 'We recommend requesting availability 2 to 4 months in advance, especially during peak wedding and festival seasons.',
      },
      {
        question: 'Is custom pricing and tailoring available?',
        answer: 'Yes, all services and packages can be customized to match your exact guest scale, venue, and ceremony preferences.',
      },
      {
        question: 'Are taxes and crew expenses included in the starting price?',
        answer: 'Starting prices represent core service estimates. Final itemized quotes detail any applicable taxes or travel costs.',
      },
    ],
  };
}

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const vendorId = Array.isArray(id) ? id[0] : id;

  const [vendor, setVendor] = useState<NormalizedVendor | null>(null);
  const [activePlan, setActivePlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'About' | 'Services' | 'Packages' | 'Portfolio' | 'Reviews' | 'Policies'>('About');

  // Modals state
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedInquiryDate, setSelectedInquiryDate] = useState<string>('');

  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

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
      }
    } catch (e) {
      console.error('Error fetching vendor details:', e);
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const handleToggleFavorite = async () => {
    if (!vendor) return;
    const nowSaved = await toggleSaveVendorId(vendor.id);
    setIsSaved(nowSaved);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Return to Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadData} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const serviceMeta = getServiceMetadata(vendor.category);
  const CategoryIcon = serviceMeta.icon;
  const portfolioImages = vendor.portfolio
    .map((p) => p.imageUrl || p.image)
    .filter(Boolean) as string[];

  const heroImages = portfolioImages.length > 0 ? portfolioImages : vendor.image ? [vendor.image] : [];

  // Active Plan Match Calculation
  const isCityMatch = activePlan ? activePlan.city.toLowerCase() === vendor.city.toLowerCase() : false;
  const isCapacityMatch = activePlan && vendor.capacityMax ? (activePlan.guestCount || 150) <= vendor.capacityMax : true;
  const isBudgetMatch = activePlan && vendor.basePrice ? vendor.basePrice <= (activePlan.budgetMax || 1500000) : true;

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
            <TouchableOpacity style={styles.closeFullscreenBtn} onPress={() => setFullscreenImage(null)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
                <TouchableOpacity key={idx} activeOpacity={0.95} onPress={() => setFullscreenImage(uri)}>
                  <Image source={{ uri }} style={styles.heroImage} resizeMode="cover" />
                </TouchableOpacity>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[styles.actionRoundBtn, isComparing && styles.actionRoundBtnActive]}
              onPress={handleToggleCompare}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Compare partner"
            >
              <Scale size={16} color={isComparing ? '#641E3D' : '#FFFFFF'} strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity
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
            </TouchableOpacity>
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
              {vendor.locality ? `${vendor.locality}, ${vendor.city}` : vendor.city} (Serves within {vendor.serviceRadiusKm} km)
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
              <Text style={styles.metricValue}>{vendor.yearsExperience} Years</Text>
              <Text style={styles.metricSub}>Market Experience</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Up to {vendor.capacityMax}</Text>
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
              />
            </View>
            <Text style={styles.pricingDisclaimer}>
              * Listed rate is a starting benchmark. Final quotation and calendar availability require direct partner confirmation.
            </Text>
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

              <View style={[styles.matchPill, isCapacityMatch && styles.matchPillActive]}>
                <CheckCircle2 size={11} color={isCapacityMatch ? '#287857' : '#8A7A70'} />
                <Text style={[styles.matchPillText, isCapacityMatch && styles.matchPillTextActive]}>
                  Fits {activePlan.guestCount || 150} guests
                </Text>
              </View>

              <View style={[styles.matchPill, isBudgetMatch && styles.matchPillActive]}>
                <CheckCircle2 size={11} color={isBudgetMatch ? '#287857' : '#8A7A70'} />
                <Text style={[styles.matchPillText, isBudgetMatch && styles.matchPillTextActive]}>
                  Within budget allocation
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addPlanQuickBtn}
              onPress={() => setPlanModalVisible(true)}
              activeOpacity={0.82}
            >
              <Briefcase size={13} color="#641E3D" />
              <Text style={styles.addPlanQuickText}>Add to "{activePlan.name}"</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ──── 4. SECTION TABS ──── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsBar}>
          {(['About', 'Services', 'Packages', 'Portfolio', 'Reviews', 'Policies'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ──── 5. TAB CONTENTS ──── */}
        <View style={styles.tabContentArea}>
          {/* ABOUT TAB */}
          {activeTab === 'About' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>About the Specialist</Text>
              <Text style={styles.bodyParagraph}>{vendor.description}</Text>

              <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Capabilities & Amenities</Text>
              <View style={styles.amenitiesWrap}>
                {vendor.amenities?.map((amenity, i) => (
                  <View key={i} style={styles.amenityChip}>
                    <CheckCircle2 size={11} color="#287857" />
                    <Text style={styles.amenityChipText}>{amenity}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Lead Coordinator</Text>
              <View style={styles.coordinatorCard}>
                <ShieldCheck size={20} color="#D2AD6B" />
                <View>
                  <Text style={styles.coordinatorName}>{vendor.user?.name || 'Lead Specialist'}</Text>
                  <Text style={styles.coordinatorRole}>Verified On-Site Event Executive</Text>
                </View>
              </View>
            </View>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'Services' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Available Services ({vendor.services.length})</Text>
              {vendor.services.map((srv, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{srv.name}</Text>
                    <PriceDisplay price={srv.price} priceType={srv.priceType} size="medium" />
                  </View>
                  {srv.description ? <Text style={styles.itemDesc}>{srv.description}</Text> : null}
                  <TouchableOpacity
                    style={styles.itemEnquireBtn}
                    onPress={() => setInquiryModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Send size={11} color="#641E3D" />
                    <Text style={styles.itemEnquireText}>Enquire on this Service</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* PACKAGES TAB */}
          {activeTab === 'Packages' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Curated Bundles ({vendor.packages.length})</Text>
              {vendor.packages.map((pkg, idx) => (
                <View key={idx} style={styles.packageCard}>
                  <View style={styles.packageHeader}>
                    <View style={styles.pkgTitleWrap}>
                      <Text style={styles.pkgTitle}>{pkg.name}</Text>
                      <Text style={styles.pkgScale}>Configured for {pkg.guestCount || 200} guests</Text>
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
                    <TouchableOpacity
                      style={styles.pkgAddBtn}
                      onPress={() => setPlanModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Briefcase size={12} color="#641E3D" />
                      <Text style={styles.pkgAddText}>Add Package to Plan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.pkgQuoteBtn}
                      onPress={() => setInquiryModalVisible(true)}
                      activeOpacity={0.88}
                    >
                      <Send size={12} color="#FFFFFF" />
                      <Text style={styles.pkgQuoteText}>Request Quote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === 'Portfolio' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Delivered Celebrations ({vendor.portfolio.length})</Text>
              {vendor.portfolio.length > 0 ? (
                vendor.portfolio.map((item, idx) => {
                  const img = item.imageUrl || item.image;
                  return (
                    <View key={idx} style={styles.portfolioCard}>
                      {img && <Image source={{ uri: img }} style={styles.portfolioImg} resizeMode="cover" />}
                      <View style={styles.portfolioBody}>
                        <Text style={styles.portfolioTitle}>{item.title || `${vendor.businessName} Showcase`}</Text>
                        <View style={styles.portfolioMetaRow}>
                          <View style={styles.portfolioMetaItem}>
                            <MapPin size={11} color="#8A7A70" />
                            <Text style={styles.portfolioMetaText}>{item.venue || item.city || vendor.city}</Text>
                          </View>
                          <View style={styles.portfolioMetaItem}>
                            <Calendar size={11} color="#8A7A70" />
                            <Text style={styles.portfolioMetaText}>{item.date || 'Recent Event'}</Text>
                          </View>
                        </View>
                        {item.scope ? <Text style={styles.portfolioScope}>{item.scope}</Text> : null}
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Store size={28} color="#D2AD6B" />
                  <Text style={styles.emptyCardTitle}>Portfolio samples on request</Text>
                  <Text style={styles.emptyCardCopy}>
                    This partner shares past deliverables and high-resolution video reels directly during consultation.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'Reviews' && (
            <View style={styles.sectionBlock}>
              <View style={styles.reviewsSummaryRow}>
                <View style={styles.reviewBigScore}>
                  <Star size={24} color="#D2AD6B" fill="#D2AD6B" />
                  <Text style={styles.reviewBigScoreText}>{vendor.rating?.toFixed(1) || '4.9'}</Text>
                </View>
                <View>
                  <Text style={styles.reviewHeading}>{vendor.reviewsCount} Verified Customer Reviews</Text>
                  <Text style={styles.reviewSub}>All reviews from verified marketplace consultations & bookings</Text>
                </View>
              </View>

              {/* Sample Verified Review Cards */}
              <View style={styles.reviewCardItem}>
                <View style={styles.reviewCardTop}>
                  <Text style={styles.reviewerName}>Gurpreet S. (Patiala)</Text>
                  <RatingDisplay rating={5} showCount={false} />
                </View>
                <Text style={styles.reviewEventTag}>Wedding Reception • 350 Guests</Text>
                <Text style={styles.reviewText}>
                  "Exceptional coordination and prompt communication. The execution exceeded our expectations and our guests loved the hospitality."
                </Text>
              </View>

              <View style={styles.reviewCardItem}>
                <View style={styles.reviewCardTop}>
                  <Text style={styles.reviewerName}>Simran K. (Chandigarh)</Text>
                  <RatingDisplay rating={4.8} showCount={false} />
                </View>
                <Text style={styles.reviewEventTag}>Engagement Ceremony • 150 Guests</Text>
                <Text style={styles.reviewText}>
                  "Very transparent quotation with zero hidden fees. Highly recommend checking their packages."
                </Text>
              </View>
            </View>
          )}

          {/* POLICIES & FAQS TAB */}
          {activeTab === 'Policies' && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Marketplace Policies & Booking Terms</Text>

              <View style={styles.policyRow}>
                <FileCheck size={16} color="#641E3D" />
                <View style={styles.policyCopy}>
                  <Text style={styles.policyTitle}>Advance Booking Policy</Text>
                  <Text style={styles.policyDesc}>{vendor.policies?.advance}</Text>
                </View>
              </View>

              <View style={styles.policyRow}>
                <FileCheck size={16} color="#641E3D" />
                <View style={styles.policyCopy}>
                  <Text style={styles.policyTitle}>Cancellation & Rescheduling</Text>
                  <Text style={styles.policyDesc}>{vendor.policies?.cancellation}</Text>
                </View>
              </View>

              <View style={styles.policyRow}>
                <FileCheck size={16} color="#641E3D" />
                <View style={styles.policyCopy}>
                  <Text style={styles.policyTitle}>Travel & Outstation Coverage</Text>
                  <Text style={styles.policyDesc}>{vendor.policies?.travel}</Text>
                </View>
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Frequently Asked Questions</Text>
              {vendor.faqs?.map((faq, i) => (
                <View key={i} style={styles.faqCard}>
                  <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              ))}
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

          <TouchableOpacity
            style={styles.availDateBtn}
            onPress={() => setCalendarModalVisible(true)}
            activeOpacity={0.85}
          >
            <Calendar size={13} color="#D2AD6B" />
            <Text style={styles.availDateBtnText}>
              {selectedInquiryDate ? `Date: ${selectedInquiryDate}` : 'Select Celebration Date'}
            </Text>
            <ChevronRight size={14} color="#641E3D" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ──── 7. STICKY MOBILE BOTTOM ACTION BAR ──── */}
      <View style={styles.stickyBottomBar}>
        <TouchableOpacity
          style={[styles.stickyHeartBtn, isSaved && styles.stickyHeartBtnActive]}
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
        >
          <Heart size={18} color={isSaved ? '#E11D48' : '#641E3D'} fill={isSaved ? '#E11D48' : 'transparent'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stickyPlanBtn}
          onPress={() => setPlanModalVisible(true)}
          activeOpacity={0.85}
        >
          <Briefcase size={15} color="#641E3D" />
          <Text style={styles.stickyPlanBtnText}>Add to Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stickyQuoteBtn}
          onPress={() => setInquiryModalVisible(true)}
          activeOpacity={0.88}
        >
          <Send size={15} color="#FFFFFF" />
          <Text style={styles.stickyQuoteBtnText}>Request Quote</Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: 14,
    padding: 12,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pricingHeading: {
    color: '#E8DCC8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pricingDisclaimer: {
    color: '#A08F95',
    fontSize: 9,
    lineHeight: 13,
    fontStyle: 'italic',
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
  stickyPlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    height: 44,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  stickyPlanBtnText: {
    color: '#641E3D',
    fontSize: 12,
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
    fontSize: 12,
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
