import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  MapPin,
  Heart,
  Scale,
  ChevronRight,
  Send,
  Users,
  Eye,
  Store,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { getServiceMetadata } from '../../constants/services';
import { PriceDisplay, VendorPriceType } from '../ui/PriceDisplay';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { RatingDisplay } from '../ui/RatingDisplay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_MARGIN = 20;
const SLIDER_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2;
const SLIDER_HEIGHT = 180;
const MAX_SLIDER_IMAGES = 5;

export interface PortfolioItem {
  imageUrl?: string;
  image?: string;
  title?: string;
}

export interface VendorCardProps {
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
  reviewsCount?: number;
  status?: string;
  verified?: boolean;
  capacityMin?: number;
  capacityMax?: number;
  portfolio?: PortfolioItem[];
  user?: { name: string };
  isSaved?: boolean;
  isComparing?: boolean;
  variant?: 'standard' | 'compact' | 'horizontal' | 'compare' | 'saved';
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  onEnquire?: (id: string) => void;
}

export function VendorCard({
  id,
  businessName,
  category,
  city,
  locality,
  serviceRadiusKm,
  cityTier,
  basePrice,
  priceType = 'STARTING_PRICE',
  rating,
  reviewsCount,
  status = 'VERIFIED',
  verified = true,
  capacityMin,
  capacityMax,
  portfolio = [],
  user,
  isSaved = false,
  isComparing = false,
  variant = 'standard',
  onToggleSave,
  onToggleCompare,
  onEnquire,
}: VendorCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const images = (portfolio || [])
    .map((p) => p.imageUrl || p.image)
    .filter(Boolean) as string[];

  const displayImages = images.slice(0, MAX_SLIDER_IMAGES);
  const serviceMeta = getServiceMetadata(category);
  const CategoryIcon = serviceMeta.icon;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SLIDER_WIDTH);
      setActiveImageIndex(Math.max(0, Math.min(index, displayImages.length - 1)));
    },
    [displayImages.length]
  );

  const handleCardPress = () => {
    router.push(`/vendor/${id}`);
  };

  const isVenue = category?.toLowerCase().includes('venue');
  const capacityLabel =
    capacityMax != null && capacityMax > 0
      ? `Up to ${capacityMax} guests`
      : capacityMin != null && capacityMin > 0
      ? `From ${capacityMin} guests`
      : null;

  return (
    <View style={[styles.card, variant === 'compact' && styles.cardCompact]}>
      {/* ──── MEDIA HEADER ──── */}
      <View style={styles.mediaContainer}>
        {displayImages.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            style={styles.slider}
          >
            {displayImages.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.slideImage} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: `${serviceMeta.color}15` }]}>
            <CategoryIcon size={42} color={serviceMeta.color} strokeWidth={1.4} />
            <Text style={[styles.placeholderCategoryText, { color: serviceMeta.color }]}>
              {serviceMeta.label}
            </Text>
          </View>
        )}

        {/* Top Badges & Actions */}
        <View style={styles.mediaTopBar}>
          <View style={styles.categoryBadge}>
            <CategoryIcon size={11} color="#641E3D" />
            <Text style={styles.categoryBadgeText}>{serviceMeta.label}</Text>
          </View>

          <View style={styles.mediaActionIcons}>
            {onToggleCompare && (
              <TouchableOpacity
                style={[styles.iconButton, isComparing && styles.iconButtonActive]}
                onPress={() => onToggleCompare(id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Compare this vendor"
              >
                <Scale size={14} color={isComparing ? '#641E3D' : '#FFFFFF'} />
              </TouchableOpacity>
            )}

            {onToggleSave && (
              <TouchableOpacity
                style={[styles.iconButton, isSaved && styles.iconButtonSaved]}
                onPress={() => onToggleSave(id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Save vendor to favorites"
              >
                <Heart
                  size={14}
                  color={isSaved ? '#E11D48' : '#FFFFFF'}
                  fill={isSaved ? '#E11D48' : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pagination Dots */}
        {displayImages.length > 1 && (
          <View style={styles.dotsContainer}>
            {displayImages.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeImageIndex === i && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ──── CONTENT BODY ──── */}
      <TouchableOpacity
        style={styles.body}
        onPress={handleCardPress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${businessName}`}
      >
        <View style={styles.titleRow}>
          <Text style={styles.businessName} numberOfLines={1}>
            {businessName}
          </Text>
          <VerifiedBadge status={status} isVerified={verified} />
        </View>

        {/* Location & Rating Line */}
        <View style={styles.metaRow}>
          <View style={styles.locationWrap}>
            <MapPin size={11} color="#8A7A70" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locality ? `${locality}, ${city}` : city}
              {serviceRadiusKm ? ` • Serves ${serviceRadiusKm} km` : ''}
            </Text>
          </View>

          <RatingDisplay rating={rating} reviewsCount={reviewsCount} />
        </View>

        {/* Capability / Capacity */}
        {capacityLabel && (
          <View style={styles.capacityRow}>
            <Users size={11} color="#641E3D" />
            <Text style={styles.capacityText}>{capacityLabel}</Text>
          </View>
        )}

        {/* Price & Actions Row */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <PriceDisplay
              price={basePrice}
              priceType={priceType as VendorPriceType}
              size="medium"
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={handleCardPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${businessName}`}
            >
              <Text style={styles.detailsBtnText}>View Details</Text>
              <ChevronRight size={12} color="#641E3D" />
            </TouchableOpacity>

            {onEnquire && (
              <TouchableOpacity
                style={styles.enquireBtn}
                onPress={() => onEnquire(id)}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={`Request quote from ${businessName}`}
              >
                <Send size={11} color="#FFFFFF" />
                <Text style={styles.enquireBtnText}>Request Quote</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default VendorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    overflow: 'hidden',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardCompact: {
    marginHorizontal: 0,
    marginBottom: 12,
  },
  mediaContainer: {
    height: SLIDER_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: '#FAF5EC',
  },
  slider: {
    width: '100%',
    height: '100%',
  },
  slideImage: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: '#FAF5EC',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderCategoryText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mediaTopBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  categoryBadgeText: {
    color: '#641E3D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mediaActionIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 10, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  iconButtonActive: {
    backgroundColor: '#FAF1E3',
    borderColor: '#D2AD6B',
  },
  iconButtonSaved: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FECDD3',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  businessName: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 6,
  },
  locationText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  capacityText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FAF5EC',
    gap: 8,
  },
  priceContainer: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  detailsBtnText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  enquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  enquireBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
