import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import {
  Star,
  BadgeCheck,
  MapPin,
  Heart,
  MessageSquare,
  BadgeIndianRupee,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { getServiceMetadata } from '../../constants/services';

// ============================================================
// VendorCard — Premium Hybrid Vendor Card
// Features: Portfolio slider, stats row, verified badge,
//           category-aware styling, Indian price formatting
// ============================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 20;
const CARD_INNER_PADDING = 0; // slider is edge-to-edge inside the card
const SLIDER_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;
const SLIDER_HEIGHT = 190;
const MAX_SLIDER_IMAGES = 5;

// ---- Types ----

interface PortfolioItem {
  imageUrl?: string;
  image?: string;
  title?: string;
}

export interface VendorCardProps {
  id: string;
  businessName: string;
  category: string;
  city: string;
  cityTier: number;
  basePrice: number;
  priceType: string;
  rating: number;
  reviewsCount: number;
  status: string;
  portfolio: PortfolioItem[];
  user?: { name: string };
}

// ---- Helpers ----

/**
 * Format price using Indian numbering system (lakhs, thousands)
 */
function fakeText(context: string): string {
  return `fake (${context})`;
}

function formatIndianPrice(price: number): string {
  if (price == null || isNaN(price) || price <= 0) return fakeText('₹20,00,000');
  return '₹' + price.toLocaleString('en-IN');
}

/**
 * Map API price type to human-readable label
 */
function formatPriceType(priceType: string): string {
  if (!priceType || priceType.startsWith('fake')) return fakeText('price type');
  const map: Record<string, string> = {
    PER_EVENT: 'Per Event',
    PER_DAY: 'Per Day',
    PER_HOUR: 'Per Hour',
    PER_PLATE: 'Per Plate',
    PER_PERSON: 'Per Person',
    FIXED: 'Fixed Price',
  };
  return map[priceType] || 'Per Event';
}

/**
 * Map city tier number to display label
 */
function formatCityTier(tier: number): string {
  if (tier === 1) return 'Metro';
  if (tier === 2) return 'Tier 2';
  if (tier === 3) return 'Tier 3';
  return '';
}

/**
 * Format large review counts (e.g., 1200 → 1.2k)
 */
function formatReviewCount(count: number): string {
  if (count == null || isNaN(count) || count <= 0) return fakeText('reviews');
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return count.toString();
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  venue: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549400265-57833cc6f5b9?q=90&w=1200&auto=format&fit=crop',
  ],
  catering: [
    'https://images.unsplash.com/photo-1555244162-803834f70033?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=90&w=1200&auto=format&fit=crop',
  ],
  decor: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=90&w=1200&auto=format&fit=crop',
  ],
  photography: [
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=90&w=1200&auto=format&fit=crop',
  ],
  makeup: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=90&w=1200&auto=format&fit=crop',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecbb4ec?q=90&w=1200&auto=format&fit=crop',
  ],
  priest: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=90&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=90&w=1200&auto=format&fit=crop',
  ],
};

// Category-specific gradient colors for empty portfolio fallback
const CATEGORY_GRADIENTS: Record<string, { bg: string; accent: string }> = {
  photography: { bg: '#F9E8F0', accent: '#BA0F6B' },
  venue: { bg: '#FBF0E4', accent: '#800020' },
  catering: { bg: '#FBF0E4', accent: '#800020' },
  decor: { bg: '#FFF8E7', accent: '#D4AF37' },
  makeup: { bg: '#FFF0F5', accent: '#F8C8DC' },
  entertainment: { bg: '#F0EDFF', accent: '#7B68EE' },
  priest: { bg: '#FFF8E7', accent: '#D2AD6B' },
};

// ============================================================
// Main Component
// ============================================================

export default function VendorCard(props: VendorCardProps) {
  const {
    id,
    businessName,
    category,
    city,
    cityTier,
    basePrice,
    priceType,
    rating,
    reviewsCount,
    status,
    portfolio,
  } = props;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sliderRef = useRef<ScrollView>(null);

  const isVerified = status === 'VERIFIED';
  const categoryKey = (category || '').toLowerCase();
  const serviceMeta = getServiceMetadata(category || 'Miscellaneous');
  const CategoryIcon = serviceMeta.icon;
  const categoryColor = serviceMeta.color;

  // Prepare slider images (cap at MAX_SLIDER_IMAGES)
  const sliderImages = useMemo(() => {
    const backendImages = (portfolio || [])
      .map((p) => p.imageUrl || p.image)
      .filter(Boolean) as string[];
    const categoryFallbacks = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.venue;
    const uniqueImages = Array.from(new Set([...backendImages, ...categoryFallbacks])).slice(0, MAX_SLIDER_IMAGES);

    while (uniqueImages.length < 3) {
      uniqueImages.push(categoryFallbacks[uniqueImages.length % categoryFallbacks.length]);
    }

    return uniqueImages.map((imageUrl) => ({ imageUrl }));
  }, [portfolio, categoryKey]);

  const hasImages = sliderImages.length > 0;

  useEffect(() => {
    if (sliderImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlideIndex((current) => {
        const next = (current + 1) % sliderImages.length;
        sliderRef.current?.scrollTo({ x: next * SLIDER_WIDTH, animated: true });
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Gradient fallback colors
  const gradientFallback = CATEGORY_GRADIENTS[categoryKey] || { bg: '#F5F0E8', accent: '#641E3D' };

  // ---- Scroll handler for dot indicator ----
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SLIDER_WIDTH);
      setActiveSlideIndex(index);
    },
    []
  );

  // ---- Press animation ----
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // ---- Navigate to vendor detail ----
  const navigateToDetail = () => {
    router.push(`/vendor/${id}` as any);
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <View style={styles.cardWrapper}>
      <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={navigateToDetail}
        >
          {/* ──── PORTFOLIO SLIDER / FALLBACK ──── */}
          <View style={styles.sliderContainer}>
            {hasImages ? (
              <ScrollView
                ref={sliderRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={SLIDER_WIDTH}
                snapToAlignment="start"
              >
                {sliderImages.map((item, index) => (
                  <View key={index} style={styles.slideItem}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.slideImage}
                      resizeMode="cover"
                    />
                    {/* Subtle dark overlay for text readability */}
                    <View style={styles.slideOverlay} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              /* Category-specific gradient fallback when no portfolio */
              <View style={[styles.fallbackContainer, { backgroundColor: gradientFallback.bg }]}>
                <View style={[styles.fallbackIconCircle, { backgroundColor: gradientFallback.accent + '15' }]}>
                  <CategoryIcon size={40} color={gradientFallback.accent} strokeWidth={1.5} />
                </View>
                <Text style={[styles.fallbackText, { color: gradientFallback.accent }]}>
                  Portfolio Coming Soon
                </Text>
              </View>
            )}

            {/* ──── CATEGORY PILL (Top Left) ──── */}
            <View style={[styles.categoryPill, { backgroundColor: categoryColor + 'E6' }]}>
              <CategoryIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.categoryPillText}>
                {(category || 'Vendor').charAt(0) + (category || 'Vendor').slice(1).toLowerCase()}
              </Text>
            </View>

            {/* ──── VERIFIED BADGE (Top Right) ──── */}
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={12} color="#641E3D" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}

            {/* ──── DOT INDICATOR ──── */}
            {hasImages && sliderImages.length > 1 && (
              <View style={styles.dotContainer}>
                {sliderImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeSlideIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ──── VENDOR INFO SECTION ──── */}
          <View style={styles.infoSection}>
            {/* Business Name */}
            <Text style={styles.businessName} numberOfLines={1}>
              {businessName || fakeText('Vendor Name')}
            </Text>

            {/* Location Row */}
            <View style={styles.locationRow}>
              <MapPin size={13} color="#D2AD6B" strokeWidth={2.5} />
              <Text style={styles.cityText}>{city || fakeText('city')}</Text>
              {cityTier > 0 && (
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>{formatCityTier(cityTier)}</Text>
                </View>
              )}
            </View>

            {/* ──── STATS ROW ──── */}
            <View style={styles.statsRow}>
              {/* Rating */}
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Star size={14} color="#D2AD6B" fill="#D2AD6B" />
                  <Text style={styles.statValue}>{rating ? rating.toFixed(1) : fakeText('4.5')}</Text>
                </View>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              {/* Divider */}
              <View style={styles.statDivider} />

              {/* Reviews */}
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <MessageSquare size={13} color="#641E3D" strokeWidth={2} />
                  <Text style={styles.statValue}>{formatReviewCount(reviewsCount || 0)}</Text>
                </View>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>

              {/* Divider */}
              <View style={styles.statDivider} />

              {/* Price */}
              <View style={[styles.statItem, { flex: 1.3 }]}>
                <View style={styles.statIconRow}>
                  <BadgeIndianRupee size={13} color="#641E3D" strokeWidth={2.5} />
                  <Text style={styles.statValuePrice} numberOfLines={1}>
                    {formatIndianPrice(basePrice).replace('₹', '')}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{formatPriceType(priceType)}</Text>
              </View>
            </View>

            {/* ──── ACTION BUTTONS ──── */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={navigateToDetail}
                activeOpacity={0.85}
              >
                <Text style={styles.viewDetailsBtnText}>View Details</Text>
                <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.shortlistBtn} activeOpacity={0.8}>
                <Heart size={18} color="#641E3D" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1E8DB',
    // Warm gold-tinted shadow
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  // ── Slider ──
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  slideItem: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  // ── Fallback ──
  fallbackContainer: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    opacity: 0.6,
  },

  // ── Category Pill ──
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Verified Badge ──
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Dot Indicator ──
  dotContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width: 18,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // ── Info Section ──
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 5,
  },
  cityText: {
    fontSize: 13,
    color: '#6A6A6A',
    fontWeight: '500',
  },
  tierBadge: {
    backgroundColor: '#FEF6EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1E8DB',
    marginLeft: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C9A84C',
    letterSpacing: 0.3,
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E8DB',
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statValuePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#641E3D',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A7A38B',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F1E8DB',
  },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewDetailsBtn: {
    flex: 1,
    backgroundColor: '#641E3D',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  shortlistBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DCC8',
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
