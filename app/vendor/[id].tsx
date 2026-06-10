import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  Clock3,
  Heart,
  IndianRupee,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react-native';
import { fetchVendorsData } from '../../services/api';
import { getServiceMetadata } from '../../constants/services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;
const HISTORY_IMAGE_WIDTH = SCREEN_WIDTH - PAGE_PADDING * 2;

type PortfolioItem = {
  imageUrl?: string;
  image?: string;
  title?: string;
  venue?: string;
  eventType?: string;
  date?: string;
  budget?: number | string;
  city?: string;
};

type NormalizedVendor = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  cityTier?: number;
  basePrice?: number;
  price?: string;
  priceType?: string;
  rating: number;
  reviewsCount: number;
  status?: string;
  verified?: boolean;
  image?: string;
  portfolio: PortfolioItem[];
  user?: { name?: string };
  createdAt?: string;
  yearsExperience?: number;
  description?: string;
};

type WorkHistoryItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  budget: string;
  eventType: string;
  guestCount: string;
  scope: string;
  images: string[];
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=900',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=900',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900',
];

function normalizeVendor(raw: any): NormalizedVendor {
  return {
    id: String(raw?.id || ''),
    businessName: raw?.businessName || raw?.name || 'Premium Vendor',
    category: raw?.category || 'Vendor',
    city: raw?.city || raw?.location || 'Location on request',
    cityTier: raw?.cityTier,
    basePrice: raw?.basePrice,
    price: raw?.price,
    priceType: raw?.priceType,
    rating: Number(raw?.rating || 0),
    reviewsCount: Number(raw?.reviewsCount ?? raw?.reviews ?? 0),
    status: raw?.status,
    verified: raw?.verified,
    image: raw?.image || raw?.profileImage,
    portfolio: Array.isArray(raw?.portfolio) ? raw.portfolio : [],
    user: raw?.user,
    createdAt: raw?.createdAt,
    yearsExperience: raw?.yearsExperience || raw?.experienceYears,
    description: raw?.description,
  };
}

function formatCategory(category: string): string {
  if (!category) return 'Vendor';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

function formatPrice(vendor: NormalizedVendor): string {
  if (vendor.price) return vendor.price;
  if (!vendor.basePrice) return 'Custom quote';

  const suffixMap: Record<string, string> = {
    PER_EVENT: 'event',
    PER_DAY: 'day',
    PER_HOUR: 'hour',
    PER_PLATE: 'plate',
    PER_PERSON: 'person',
    FIXED: 'package',
  };
  const suffix = suffixMap[vendor.priceType || ''] || 'event';
  return `INR ${vendor.basePrice.toLocaleString('en-IN')}/${suffix}`;
}

function getYearsActive(vendor: NormalizedVendor): string {
  if (vendor.yearsExperience) return `${vendor.yearsExperience}+ yrs`;
  if (vendor.createdAt) {
    const createdYear = new Date(vendor.createdAt).getFullYear();
    if (!Number.isNaN(createdYear)) {
      const years = Math.max(1, new Date().getFullYear() - createdYear);
      return `${years}+ yrs`;
    }
  }
  const seed = vendor.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `${(seed % 7) + 4}+ yrs`;
}

function getPortfolioImages(vendor: NormalizedVendor): string[] {
  const portfolioImages = vendor.portfolio
    .map((item) => item.imageUrl || item.image)
    .filter(Boolean) as string[];

  if (portfolioImages.length > 0) return portfolioImages;
  if (vendor.image) return [vendor.image, ...FALLBACK_IMAGES.slice(0, 3)];
  return FALLBACK_IMAGES;
}

function buildWorkHistory(vendor: NormalizedVendor): WorkHistoryItem[] {
  const images = getPortfolioImages(vendor);
  const category = formatCategory(vendor.category);
  const city = vendor.city || 'India';
  const price = formatPrice(vendor);

  const firstTitle = vendor.portfolio[0]?.title || `Signature ${category} Celebration`;
  const secondTitle = vendor.portfolio[1]?.title || `Private ${city} Wedding`;

  return [
    {
      id: `${vendor.id}-w1`,
      title: firstTitle,
      date: vendor.portfolio[0]?.date || 'Dec 2025',
      venue: vendor.portfolio[0]?.venue || `${city} Palace Grounds`,
      city,
      budget: vendor.portfolio[0]?.budget ? String(vendor.portfolio[0].budget) : price,
      eventType: vendor.portfolio[0]?.eventType || 'Wedding',
      guestCount: '280 guests',
      scope: `${category} planning, on-site coordination, premium setup and final delivery.`,
      images: [images[0], images[1] || images[0], images[2] || images[0]].filter(Boolean),
    },
    {
      id: `${vendor.id}-w2`,
      title: secondTitle,
      date: vendor.portfolio[1]?.date || 'Oct 2025',
      venue: vendor.portfolio[1]?.venue || `Boutique venue, ${city}`,
      city: vendor.portfolio[1]?.city || city,
      budget: vendor.portfolio[1]?.budget ? String(vendor.portfolio[1].budget) : price,
      eventType: vendor.portfolio[1]?.eventType || 'Engagement',
      guestCount: '120 guests',
      scope: `Curated ${category.toLowerCase()} service with a compact premium team.`,
      images: [images[2] || images[0], images[3] || images[1] || images[0], images[4] || images[0]].filter(Boolean),
    },
  ];
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statPill}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function HistoryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.historyMetric}>
      <View style={styles.historyMetricIcon}>{icon}</View>
      <View style={styles.historyMetricCopy}>
        <Text style={styles.historyMetricLabel}>{label}</Text>
        <Text style={styles.historyMetricValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function WorkHistoryCard({ item }: { item: WorkHistoryItem }) {
  const [activeImage, setActiveImage] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / HISTORY_IMAGE_WIDTH);
    setActiveImage(index);
  };

  return (
    <View style={styles.historyCard}>
      <View style={styles.historySliderWrap}>
        <ScrollView
          style={styles.historySlider}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={HISTORY_IMAGE_WIDTH}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {item.images.map((image, index) => (
            <Image
              key={`${item.id}-${index}`}
              source={{ uri: image }}
              style={styles.historyImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.historyImageOverlay} />
        <View style={styles.historyBadge}>
          <Sparkles size={13} color="#FFFFFF" />
          <Text style={styles.historyBadgeText}>{item.eventType}</Text>
        </View>
        {item.images.length > 1 && (
          <View style={styles.historyDots}>
            {item.images.map((_, index) => (
              <View
                key={index}
                style={[styles.historyDot, activeImage === index && styles.historyDotActive]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.historyContent}>
        <View style={styles.historyTitleRow}>
          <View style={styles.historyTitleCopy}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <Text style={styles.historyVenue}>{item.venue}</Text>
          </View>
          <View style={styles.historyDateBadge}>
            <Calendar size={14} color="#641E3D" />
            <Text style={styles.historyDateText}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.historyMetaGrid}>
          <HistoryMetric icon={<MapPin size={15} color="#D2AD6B" />} label="Venue" value={item.city} />
          <HistoryMetric icon={<IndianRupee size={15} color="#D2AD6B" />} label="Budget" value={item.budget} />
          <HistoryMetric icon={<Users size={15} color="#D2AD6B" />} label="Scale" value={item.guestCount} />
          <HistoryMetric icon={<BriefcaseBusiness size={15} color="#D2AD6B" />} label="Type" value={item.eventType} />
        </View>

        <View style={styles.scopeBox}>
          <Text style={styles.scopeLabel}>Work delivered</Text>
          <Text style={styles.scopeText}>{item.scope}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const vendorId = Array.isArray(id) ? id[0] : id;
  const [vendor, setVendor] = useState<NormalizedVendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Work History' | 'Reviews'>('Work History');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchVendorsData();
        const allVendors = Object.values(data).flat() as any[];
        const found = allVendors.find((item) => String(item?.id) === String(vendorId));
        setVendor(found ? normalizeVendor(found) : null);
      } catch (e) {
        console.error(e);
        setVendor(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [vendorId]);

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Loading vendor details...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyTitle}>Vendor not found</Text>
        <Text style={styles.emptyCopy}>This partner may no longer be available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const serviceMeta = getServiceMetadata(vendor.category);
  const CategoryIcon = serviceMeta.icon;
  const coverImages = getPortfolioImages(vendor);
  const workHistory = buildWorkHistory(vendor);
  const isVerified = vendor.status === 'VERIFIED' || vendor.verified;
  const ownerName = vendor.user?.name || 'Lead specialist';
  const categoryLabel = formatCategory(vendor.category);
  const priceLabel = formatPrice(vendor);
  const ratingLabel = vendor.rating ? vendor.rating.toFixed(1) : 'New';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <Image source={{ uri: coverImages[0] }} style={styles.heroImage} />
          <View style={styles.heroShade} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={21} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartButton}>
            <Heart size={20} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: vendor.image || coverImages[0] }} style={styles.avatar} />
          </View>

          <View style={styles.categoryChip}>
            <CategoryIcon size={14} color={serviceMeta.color} />
            <Text style={[styles.categoryChipText, { color: serviceMeta.color }]}>
              {categoryLabel}
            </Text>
          </View>

          <Text style={styles.vendorName}>{vendor.businessName}</Text>
          <View style={styles.locationLine}>
            <MapPin size={14} color="#8C6F3E" />
            <Text style={styles.locationText}>{vendor.city}</Text>
            {isVerified && (
              <View style={styles.verifiedInline}>
                <BadgeCheck size={13} color="#287857" />
                <Text style={styles.verifiedInlineText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            <StatPill
              icon={<Star size={16} color="#D2AD6B" fill="#D2AD6B" />}
              label="Rating"
              value={ratingLabel}
            />
            <StatPill
              icon={<MessageCircle size={16} color="#641E3D" />}
              label="Reviews"
              value={`${vendor.reviewsCount}`}
            />
            <StatPill
              icon={<Clock3 size={16} color="#641E3D" />}
              label="Active"
              value={getYearsActive(vendor)}
            />
          </View>

          <View style={styles.infoPanel}>
            <DetailRow
              icon={<IndianRupee size={16} color="#D2AD6B" />}
              label="Starting price"
              value={priceLabel}
            />
            <DetailRow
              icon={<Award size={16} color="#D2AD6B" />}
              label="Managed by"
              value={ownerName}
            />
            <DetailRow
              icon={<ShieldCheck size={16} color="#D2AD6B" />}
              label="Service promise"
              value={isVerified ? 'Verified partner with reviewed delivery' : 'Profile under review'}
            />
          </View>

          <TouchableOpacity style={styles.bookButton} activeOpacity={0.88}>
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Text style={styles.bookButtonPrice}>{priceLabel}</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {(['Work History', 'Reviews'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.contentSection}>
          {activeTab === 'Work History' ? (
            workHistory.map((item) => <WorkHistoryCard key={item.id} item={item} />)
          ) : (
            <View style={styles.reviewCard}>
              <View style={styles.reviewScore}>
                <Star size={34} color="#D2AD6B" fill="#D2AD6B" />
                <Text style={styles.reviewScoreText}>{ratingLabel}</Text>
              </View>
              <Text style={styles.reviewTitle}>{vendor.reviewsCount} client reviews</Text>
              <Text style={styles.reviewCopy}>
                Clients rate this partner for timely delivery, polished coordination, and
                premium event execution.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FBF7EF',
  },
  scrollContent: {
    paddingBottom: 38,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7EF',
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    color: '#641E3D',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTitle: {
    color: '#2A151D',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyCopy: {
    color: '#7C6D63',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: '#641E3D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  hero: {
    height: 268,
    width: '100%',
    backgroundColor: '#2A151D',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 12, 14, 0.42)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heartButton: {
    position: 'absolute',
    top: 48,
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  profileCard: {
    marginHorizontal: PAGE_PADDING,
    marginTop: -52,
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
  avatarWrap: {
    position: 'absolute',
    top: -45,
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 26,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBDCC2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#E8E6E0',
  },
  categoryChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  vendorName: {
    color: '#241018',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  locationText: {
    color: '#705F53',
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EAF7F0',
  },
  verifiedInlineText: {
    color: '#287857',
    fontSize: 10,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
  },
  statValue: {
    color: '#241018',
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: '#9A8A7A',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  infoPanel: {
    borderRadius: 20,
    backgroundColor: '#2A151D',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(210, 173, 107, 0.14)',
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: '#AA9B8F',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bookButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#641E3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 7,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  bookButtonPrice: {
    color: '#EEDBB5',
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: PAGE_PADDING,
    marginTop: 22,
    padding: 5,
    borderRadius: 18,
    backgroundColor: '#EFE7DA',
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tabText: {
    color: '#8F8177',
    fontSize: 13,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#641E3D',
  },
  contentSection: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 18,
  },
  historyCard: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 18,
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  historySliderWrap: {
    width: '100%',
    height: 214,
    overflow: 'hidden',
    backgroundColor: '#E8E1D4',
  },
  historySlider: {
    width: HISTORY_IMAGE_WIDTH,
  },
  historyImage: {
    width: HISTORY_IMAGE_WIDTH,
    height: 214,
  },
  historyImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  historyBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(100, 30, 61, 0.9)',
  },
  historyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  historyDots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.56)',
  },
  historyDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  historyContent: {
    padding: 14,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  historyTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    color: '#241018',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginBottom: 4,
  },
  historyVenue: {
    color: '#74685C',
    fontSize: 12,
    fontWeight: '700',
  },
  historyDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  historyDateText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
  },
  historyMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#2A151D',
    marginBottom: 12,
  },
  historyMetric: {
    width: '48%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239, 227, 207, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  historyMetricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(210, 173, 107, 0.14)',
    marginRight: 9,
  },
  historyMetricCopy: {
    flex: 1,
    minWidth: 0,
  },
  historyMetricLabel: {
    color: '#BDAF9F',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  historyMetricValue: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  scopeBox: {
    borderRadius: 16,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    padding: 13,
  },
  scopeLabel: {
    color: '#9A8A7A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 5,
  },
  scopeText: {
    color: '#352027',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  reviewCard: {
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    padding: 24,
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  reviewScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reviewScoreText: {
    color: '#241018',
    fontSize: 34,
    fontWeight: '900',
  },
  reviewTitle: {
    color: '#641E3D',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  reviewCopy: {
    color: '#74685C',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
});
