import React, { useState, useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Scale,
  X,
  MapPin,
  Star,
  CheckCircle2,
  Trash2,
  Sparkles,
  IndianRupee,
  Users,
  ShieldCheck,
  Clock,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  HelpCircle,
  Zap,
  Info,
  CalendarClock,
  FileCheck2,
  Compass,
  AlertCircle,
  Package,
} from 'lucide-react-native';
import { VellureButton } from '../ui/VellureControls';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { RatingDisplay } from '../ui/RatingDisplay';
import { PriceDisplay } from '../ui/PriceDisplay';
import { EmptyStateCard } from '../ui/EmptyStateCard';
import { AddToPackageModal } from '../package/AddToPackageModal';

export type ComparableVendor = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state?: string;
  image?: string;
  basePrice?: number;
  priceType?: string;
  rating?: number;
  reviewsCount?: number;
  verified: boolean;
  experienceYears?: number | string;
  eventsCompleted?: number | string;
  teamSize?: string;
  overtimeFee?: string;
  travelFee?: string;
  taxesPolicy?: string;
  paymentSchedule?: string;
  setupTime?: string;
  backupPlan?: string;
  deliveryTimeline?: string;
  customizationFlexibility?: string;
  specialization?: string[];
  exclusions?: string[];
  verdictNote?: string;
  capacity?: string;
  amenities?: string[];
  features?: string[];
  highlights?: string[];
  cancellationPolicy?: string;
  advancePayment?: string;
  responseTime?: string;
  description?: string;
};

type CompareTab = 'ALL' | 'PRICING' | 'TRUST' | 'SPECS' | 'FEATURES' | 'VERDICT';

type Props = {
  visible: boolean;
  vendors: ComparableVendor[];
  onClose: () => void;
  onRemove: (vendorId: string) => void;
  onViewVendor: (vendorId: string) => void;
  onAddToPackage?: (vendor: ComparableVendor) => void;
};

export function VendorComparisonModal({
  visible,
  vendors,
  onClose,
  onRemove,
  onViewVendor,
  onAddToPackage,
}: Props) {
  const [activeTab, setActiveTab] = useState<CompareTab>('ALL');
  const [compareGuests, setCompareGuests] = useState<number>(300);
  const [addToPackageTarget, setAddToPackageTarget] = useState<ComparableVendor | null>(null);

  // Dynamic analysis & verdict calculations
  const vendorAnalytics = useMemo(() => {
    if (vendors.length === 0) return {};

    const validPrices = vendors.map((v) => v.basePrice || 0).filter((p) => p > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const maxRating = Math.max(...vendors.map((v) => v.rating || 0));

    return vendors.reduce((acc, v) => {
      const price = v.basePrice || 0;
      const type = (v.priceType || 'STARTING_PRICE').toUpperCase();
      let projectedTotal = price;
      let formulaNote = 'Flat package rate';

      if (type === 'PER_PLATE' || type === 'PER_PERSON' || type === 'PER_GUEST') {
        projectedTotal = price * compareGuests;
        formulaNote = `₹${price.toLocaleString('en-IN')}/plate × ${compareGuests} guests`;
      } else if (type === 'PER_DAY') {
        projectedTotal = price * 1;
        formulaNote = `₹${price.toLocaleString('en-IN')} / event day`;
      }

      const highlights: string[] = [];
      if (price > 0 && price === minPrice) highlights.push('Best Value');
      if (v.rating && v.rating === maxRating && v.rating >= 4.8) highlights.push('Highest Rated');
      if (v.verified) highlights.push('Verified Partner');
      if (Number(v.experienceYears || 0) >= 8) highlights.push('Senior Master');

      acc[v.id] = {
        projectedTotal,
        formulaNote,
        highlights,
        isLowestPrice: price > 0 && price === minPrice,
        isHighestRating: v.rating === maxRating,
      };
      return acc;
    }, {} as Record<string, { projectedTotal: number; formulaNote: string; highlights: string[]; isLowestPrice: boolean; isHighestRating: boolean }>);
  }, [vendors, compareGuests]);

  if (!visible) return null;

  const tabs: { key: CompareTab; label: string; icon: any }[] = [
    { key: 'ALL', label: 'Complete Comparison', icon: Layers },
    { key: 'PRICING', label: '💰 Pricing & Terms', icon: IndianRupee },
    { key: 'TRUST', label: '⭐ Trust & Crew', icon: Star },
    { key: 'SPECS', label: '📍 Specs & Range', icon: MapPin },
    { key: 'FEATURES', label: '✨ Inclusions & Timeline', icon: Sparkles },
    { key: 'VERDICT', label: '🏆 Recommendation', icon: Award },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ──── 1. MODAL HEADER ──── */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.titleIconBadge}>
                <Scale size={18} color="#641E3D" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Compare Specialists</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{vendors.length} Partners Side-by-Side</Text>
                  </View>
                </View>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Detailed analytical breakdown with distinct separation
                </Text>
              </View>
            </View>

            <VellureButton
              accessibilityRole="button"
              accessibilityLabel="Close comparison modal"
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={18} color="#2A121E" />
            </VellureButton>
          </View>

          {/* ──── 2. FILTER TABS & GUEST SELECTOR ──── */}
          <View style={styles.controlBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <VellureButton
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.tabPill, isActive && styles.tabPillActive]}
                  >
                    <TabIcon size={12} color={isActive ? '#FFFFFF' : '#786B70'} />
                    <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                      {tab.label}
                    </Text>
                  </VellureButton>
                );
              })}
            </ScrollView>

            {/* Guest Simulation Stepper */}
            {(activeTab === 'ALL' || activeTab === 'PRICING') && (
              <View style={styles.guestSimBar}>
                <View style={styles.guestSimLabelWrap}>
                  <Users size={12} color="#641E3D" />
                  <Text style={styles.guestSimLabel}>Guest Scale Projection:</Text>
                </View>
                <View style={styles.guestPillRow}>
                  {[150, 300, 500, 800].map((count) => (
                    <VellureButton
                      key={count}
                      style={[styles.guestPill, compareGuests === count && styles.guestPillActive]}
                      onPress={() => setCompareGuests(count)}
                    >
                      <Text style={[styles.guestPillText, compareGuests === count && styles.guestPillTextActive]}>
                        {count} Guests
                      </Text>
                    </VellureButton>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ──── 3. RESPONSIVE COMPARISON MATRIX WITH DISTINCT SEPARATION ──── */}
          {vendors.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyStateCard
                icon={<Scale size={32} color="#641E3D" />}
                title="No Specialists Selected"
                description="Tap 'Compare' on 2 or more partners in the marketplace to see their side-by-side breakdown here."
              />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* TOP VENDOR HERO CARDS - PROMINENT SEPARATION & DISTINCT FRAMES */}
              <View style={styles.heroRow}>
                {vendors.map((vendor, index) => {
                  const analytics = vendorAnalytics[vendor.id];
                  const imgUri =
                    vendor.image ||
                    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
                  const isPrimaryPartner = index === 0;

                  return (
                    <View
                      key={vendor.id}
                      style={[
                        styles.heroCard,
                        isPrimaryPartner ? styles.heroCardPartner1 : styles.heroCardPartner2,
                      ]}
                    >
                      {/* Top Distinct Header Badge */}
                      <View
                        style={[
                          styles.partnerNumberBadge,
                          isPrimaryPartner ? styles.partnerBadgeTheme1 : styles.partnerBadgeTheme2,
                        ]}
                      >
                        <Text
                          style={[
                            styles.partnerNumberBadgeText,
                            isPrimaryPartner ? styles.partnerBadgeText1 : styles.partnerBadgeText2,
                          ]}
                        >
                          PARTNER {index + 1}
                        </Text>
                      </View>

                      {/* Image & Remove */}
                      <View style={styles.imageWrap}>
                        <Image source={{ uri: imgUri }} style={styles.heroImage} />
                        <VellureButton
                          style={styles.removeIconBtn}
                          onPress={() => onRemove(vendor.id)}
                          accessibilityLabel={`Remove ${vendor.businessName} from comparison`}
                        >
                          <Trash2 size={12} color="#B63A4A" />
                        </VellureButton>
                        <View style={styles.catBadge}>
                          <Text style={styles.catBadgeText} numberOfLines={1}>
                            {vendor.category}
                          </Text>
                        </View>
                      </View>

                      {/* Info & Action */}
                      <View style={styles.heroCopy}>
                        <Text style={styles.vendorName} numberOfLines={2}>
                          {vendor.businessName}
                        </Text>

                        <View style={styles.ratingAndCityRow}>
                          <RatingDisplay
                            rating={vendor.rating || 4.8}
                            reviewsCount={vendor.reviewsCount || 24}
                            size="small"
                          />
                          <Text style={styles.vendorCityText} numberOfLines={1}>
                            • {vendor.city}
                          </Text>
                        </View>

                        {analytics?.highlights && analytics.highlights.length > 0 && (
                          <View style={styles.highlightsWrap}>
                            {analytics.highlights.slice(0, 2).map((hl, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.hlPill,
                                  hl === 'Best Value' ? styles.hlPillGreen : styles.hlPillGold,
                                ]}
                              >
                                <Sparkles size={8} color={hl === 'Best Value' ? '#287857' : '#8A6A23'} />
                                <Text
                                  style={[
                                    styles.hlPillText,
                                    hl === 'Best Value' ? styles.hlTextGreen : styles.hlTextGold,
                                  ]}
                                >
                                  {hl}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        <View style={styles.heroActionBtnsRow}>
                          <VellureButton
                            variant="primary"
                            onPress={() => onViewVendor(vendor.id)}
                            style={styles.viewProfileBtn}
                          >
                            <Text style={styles.viewProfileText}>Profile</Text>
                            <ChevronRight size={11} color="#FFFFFF" />
                          </VellureButton>

                          <VellureButton
                            onPress={() => setAddToPackageTarget(vendor)}
                            style={styles.addSuiteBtn}
                            accessibilityRole="button"
                            accessibilityLabel={`Add ${vendor.businessName} to celebration suite`}
                          >
                            <Package size={11} color="#641E3D" />
                            <Text style={styles.addSuiteText}>+ Suite</Text>
                          </VellureButton>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* ──── SECTION 1: 💰 PRICING, ESTIMATES & COMMERCIAL TERMS ──── */}
              {(activeTab === 'ALL' || activeTab === 'PRICING') && (
                <View style={styles.metricGroupCard}>
                  <View style={styles.sectionHeaderRow}>
                    <IndianRupee size={13} color="#641E3D" />
                    <Text style={styles.sectionHeaderTitle}>Pricing, Estimates & Payment Terms</Text>
                  </View>

                  {/* 1.1 Starting Rate */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Starting Base Rate</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <PriceDisplay
                            price={v.basePrice}
                            priceType={v.priceType}
                            size="small"
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 1.2 Projected Total for Guests */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>
                      Estimated Total ({compareGuests} Guests Scale)
                    </Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => {
                        const analytics = vendorAnalytics[v.id];
                        return (
                          <View
                            key={v.id}
                            style={[
                              styles.vendorValueCell,
                              styles.highlightCell,
                              i === 0 ? styles.highlightTheme1 : styles.highlightTheme2,
                            ]}
                          >
                            <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                            <Text style={styles.projectedValueText}>
                              ₹{analytics?.projectedTotal?.toLocaleString('en-IN') || 'Quote Req.'}
                            </Text>
                            <Text style={styles.projectedFormulaText} numberOfLines={2}>
                              ⚡ {analytics?.formulaNote}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* 1.3 Milestone Payment Schedule */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Payment Milestones</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.paymentSchedule || '25% Booking • 50% Pre-event • 25% Completion'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 1.4 Taxes Policy */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Taxes & GST Policy</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {v.taxesPolicy || '18% GST Applicable'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 1.5 Overtime Surcharge */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Overtime / Extra Hours</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.overtimeFee || '₹5,000 / additional hour'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 1.6 Travel & Outstation */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Travel & Outstation Coverage</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {v.travelFee || 'Complimentary within 35km radius'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 1.7 Cancellation Policy */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Cancellation & Rescheduling</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {v.cancellationPolicy || '100% Refund > 30 days before; Free date rescheduling'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* ──── SECTION 2: ⭐ TRACK RECORD, TRUST & TEAM SETUP ──── */}
              {(activeTab === 'ALL' || activeTab === 'TRUST') && (
                <View style={styles.metricGroupCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Award size={13} color="#641E3D" />
                    <Text style={styles.sectionHeaderTitle}>Track Record, Trust & Crew Setup</Text>
                  </View>

                  {/* 2.1 Verification */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Marketplace Trust Status</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <VerifiedBadge isVerified={v.verified} size="small" />
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 2.2 Experience & Events */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Experience & Track Record</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.experienceYears ? `${v.experienceYears}+ Years` : '7+ Years'}
                          </Text>
                          <Text style={styles.cellSmallText}>
                            {v.eventsCompleted ? `${v.eventsCompleted}+ Celebrations` : '320+ Events'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 2.3 Response Time */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Average Response Time</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <View style={styles.badgePillGreen}>
                            <Clock size={10} color="#287857" />
                            <Text style={styles.badgeTextGreen}>
                              {v.responseTime || '< 2 Hours'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 2.4 Dedicated Crew on Event Day */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Dedicated On-Site Staff</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.teamSize || 'Lead Specialist + 4 Crew'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 2.5 Contingency Backup */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Equipment & Backup Plan</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {v.backupPlan || '100% Redundant Gear & Standby Lead'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* ──── SECTION 3: 📍 LOCATION, SPECS & OPERATIONAL FIT ──── */}
              {(activeTab === 'ALL' || activeTab === 'SPECS') && (
                <View style={styles.metricGroupCard}>
                  <View style={styles.sectionHeaderRow}>
                    <MapPin size={13} color="#641E3D" />
                    <Text style={styles.sectionHeaderTitle}>Location, Range & Operational Fit</Text>
                  </View>

                  {/* 3.1 Primary City */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Primary City & Coverage</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.city}, {v.state || 'Punjab'}
                          </Text>
                          <Text style={styles.cellSmallText}>
                            Regional + Destination
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 3.2 Guest Capacity */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Guest Scale Suitability</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.capacity || '200 – 900 Guests'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 3.3 Setup Window */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Required Setup Window</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.setupTime || '3 Hours Prior to Event'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 3.4 Specializations */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Event Specializations</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {(v.specialization || ['Royal Weddings', 'Sangeet Nights', 'Cocktail Galas']).join(' • ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* ──── SECTION 4: ✨ INCLUSIONS, TIMELINE & EXCLUSIONS ──── */}
              {(activeTab === 'ALL' || activeTab === 'FEATURES') && (
                <View style={styles.metricGroupCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Sparkles size={13} color="#641E3D" />
                    <Text style={styles.sectionHeaderTitle}>Inclusions, Timeline & Exclusions</Text>
                  </View>

                  {/* 4.1 Inclusions List */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Core Inclusions Checklist</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <View style={styles.inclusionsList}>
                            {(v.amenities || v.features || [
                              'Dedicated Lead Specialist',
                              'Custom Theme Tailoring',
                              'On-Site Setup & Rehearsal',
                              'Backup Power & Support Lead',
                            ]).map((item, idx) => (
                              <View key={idx} style={styles.inclusionItem}>
                                <CheckCircle2 size={11} color="#287857" style={{ marginTop: 2 }} />
                                <Text style={styles.inclusionText}>{item}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 4.2 Delivery Timeline */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Delivery Timeline / Turnaround</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellBoldText}>
                            {v.deliveryTimeline || 'Highlights in 7 Days • Final in 25 Days'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 4.3 Customization Flexibility */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Customization Flexibility</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {v.customizationFlexibility || 'High (Custom themes & palettes)'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 4.4 Exclusions */}
                  <View style={styles.compareRowContainer}>
                    <Text style={styles.rowLabel}>Optional Add-ons / Exclusions</Text>
                    <View style={styles.sideBySideValuesRow}>
                      {vendors.map((v, i) => (
                        <View
                          key={v.id}
                          style={[
                            styles.vendorValueCell,
                            i === 0 ? styles.cellTheme1 : styles.cellTheme2,
                          ]}
                        >
                          <Text style={styles.cellPartnerTag}>Partner {i + 1}</Text>
                          <Text style={styles.cellSmallText}>
                            {(v.exclusions || ['Outstation Lodging', 'Speciality Pyrotechnics', 'Overnight Extra Hours']).join(', ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* ──── SECTION 5: 🏆 STRATEGIC VERDICT & RECOMMENDATION ──── */}
              {(activeTab === 'ALL' || activeTab === 'VERDICT') && (
                <View style={styles.metricGroupCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Award size={13} color="#641E3D" />
                    <Text style={styles.sectionHeaderTitle}>Strategic Comparison Verdict</Text>
                  </View>

                  <View style={styles.sideBySideValuesRow}>
                    {vendors.map((v, i) => (
                      <View
                        key={v.id}
                        style={[
                          styles.verdictCard,
                          i === 0 ? styles.verdictTheme1 : styles.verdictTheme2,
                        ]}
                      >
                        <View style={styles.verdictBadgeRow}>
                          <Sparkles size={11} color={i === 0 ? '#641E3D' : '#8A6A23'} />
                          <Text
                            style={[
                              styles.verdictBadgeText,
                              i === 0 ? styles.verdictText1 : styles.verdictText2,
                            ]}
                          >
                            WHY CHOOSE PARTNER {i + 1}
                          </Text>
                        </View>
                        <Text style={styles.verdictTitle}>{v.businessName}</Text>
                        <Text style={styles.verdictBody}>
                          {v.verdictNote || (i === 0
                            ? 'Best for grand celebrations requiring comprehensive crew and high-end specifications.'
                            : 'Best value option with high agility, rapid turnaround, and dedicated director.')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* ──── 4. FOOTER ──── */}
          <View style={styles.footer}>
            <VellureButton style={styles.footerDoneBtn} onPress={onClose}>
              <Text style={styles.footerDoneText}>Close Comparison</Text>
            </VellureButton>
          </View>
        </View>
      </View>

      {/* 📦 Select Celebration Suite / Package Modal */}
      {addToPackageTarget && (
        <AddToPackageModal
          visible={addToPackageTarget !== null}
          vendor={{
            id: addToPackageTarget.id,
            businessName: addToPackageTarget.businessName,
            category: addToPackageTarget.category,
            city: addToPackageTarget.city,
            basePrice: addToPackageTarget.basePrice,
            priceType: addToPackageTarget.priceType,
            rating: addToPackageTarget.rating,
            reviewsCount: addToPackageTarget.reviewsCount,
            image: addToPackageTarget.image,
          }}
          onClose={() => setAddToPackageTarget(null)}
        />
      )}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '94%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CF',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  titleIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#2A121E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  countBadgeText: {
    color: '#641E3D',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#786B70',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  controlBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3CF',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 9,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  tabPillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  tabPillText: {
    color: '#786B70',
    fontSize: 10.5,
    fontWeight: '700',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  guestSimBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  guestSimLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestSimLabel: {
    color: '#641E3D',
    fontSize: 10.5,
    fontWeight: '800',
  },
  guestPillRow: {
    flexDirection: 'row',
    gap: 5,
  },
  guestPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  guestPillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  guestPillText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '800',
  },
  guestPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  emptyWrap: {
    padding: 30,
    alignItems: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
  },
  heroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCardPartner1: {
    borderColor: '#E6D6C4',
  },
  heroCardPartner2: {
    borderColor: '#E2CEC2',
  },
  partnerNumberBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  partnerBadgeTheme1: {
    backgroundColor: '#FAF2E6',
    borderBottomColor: '#ECD8B5',
  },
  partnerBadgeTheme2: {
    backgroundColor: '#FAF0F4',
    borderBottomColor: '#F0D4E0',
  },
  partnerNumberBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  partnerBadgeText1: {
    color: '#8A6A23',
  },
  partnerBadgeText2: {
    color: '#641E3D',
  },
  imageWrap: {
    position: 'relative',
    height: 94,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  removeIconBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#641E3D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '85%',
  },
  catBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroCopy: {
    padding: 10,
  },
  vendorName: {
    color: '#2A121E',
    fontSize: 12.5,
    fontWeight: '900',
    lineHeight: 16,
    marginBottom: 3,
  },
  ratingAndCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  vendorCityText: {
    color: '#786B70',
    fontSize: 9.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  highlightsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  hlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  hlPillGreen: {
    backgroundColor: '#EBF8F2',
    borderColor: '#C3ECD8',
  },
  hlPillGold: {
    backgroundColor: '#FAF5EC',
    borderColor: '#EFE3CF',
  },
  hlPillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  hlTextGreen: {
    color: '#287857',
  },
  hlTextGold: {
    color: '#8A6A23',
  },
  heroActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewProfileBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  addSuiteBtn: {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  addSuiteText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '900',
  },
  metricGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 12,
    width: '100%',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  sectionHeaderTitle: {
    color: '#641E3D',
    fontSize: 11.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  compareRowContainer: {
    gap: 4,
  },
  rowLabel: {
    color: '#8A7A70',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  sideBySideValuesRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  vendorValueCell: {
    flex: 1,
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    justifyContent: 'center',
    gap: 2,
  },
  cellTheme1: {
    backgroundColor: '#FAF5EC',
    borderColor: '#EFE3CF',
  },
  cellTheme2: {
    backgroundColor: '#FAF2F5',
    borderColor: '#EED9E2',
  },
  cellPartnerTag: {
    fontSize: 7.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#A08E95',
    marginBottom: 1,
  },
  highlightCell: {
    borderWidth: 1.5,
  },
  highlightTheme1: {
    backgroundColor: '#FAF1E3',
    borderColor: '#DFCAA8',
  },
  highlightTheme2: {
    backgroundColor: '#F9ECF2',
    borderColor: '#E8C5D5',
  },
  cellBoldText: {
    color: '#2A121E',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  cellSmallText: {
    color: '#524348',
    fontSize: 9.5,
    lineHeight: 13.5,
    fontWeight: '600',
  },
  projectedValueText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '900',
  },
  projectedFormulaText: {
    color: '#8A6A23',
    fontSize: 8.5,
    fontWeight: '700',
    marginTop: 1,
  },
  badgePillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
  },
  badgeTextGreen: {
    color: '#287857',
    fontSize: 10.5,
    fontWeight: '800',
  },
  inclusionsList: {
    gap: 4,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  inclusionText: {
    color: '#2A121E',
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '600',
    flex: 1,
  },
  verdictCard: {
    flex: 1,
    borderRadius: 14,
    padding: 11,
    borderWidth: 1.5,
    gap: 4,
  },
  verdictTheme1: {
    backgroundColor: '#FAF1E3',
    borderColor: '#DFCAA8',
  },
  verdictTheme2: {
    backgroundColor: '#F9ECF2',
    borderColor: '#E8C5D5',
  },
  verdictBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verdictBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  verdictText1: {
    color: '#8A6A23',
  },
  verdictText2: {
    color: '#641E3D',
  },
  verdictTitle: {
    color: '#2A121E',
    fontSize: 12,
    fontWeight: '900',
  },
  verdictBody: {
    color: '#524348',
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    backgroundColor: '#FFFFFF',
  },
  footerDoneBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDoneText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
