import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BadgePercent,
  CalendarDays,
  ChevronRight,
  Crown,
  Flower2,
  Gift,
  Heart,
  Hotel,
  LocateFixed,
  MapPin,
  Music,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react-native';
import { fetchUserPreferences, fetchHomeData } from '../../services/api';
import * as Icons from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - PAGE_PADDING * 2;
const PACKAGE_WIDTH = SCREEN_WIDTH - PAGE_PADDING * 2;
const COLLAGE_GAP = 4;
const COLLAGE_HEIGHT = 198;
const COLLAGE_INNER_WIDTH = PACKAGE_WIDTH - 8;
const COLLAGE_MAIN_WIDTH = Math.round(COLLAGE_INNER_WIDTH * 0.62);
const COLLAGE_SIDE_WIDTH = COLLAGE_INNER_WIDTH - COLLAGE_MAIN_WIDTH - COLLAGE_GAP;
const NIL = 'Not available';
const INR_SYMBOL = '\u20B9';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=90&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=90&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=90&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=90&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555244162-803834f70033?q=90&w=1200&auto=format&fit=crop',
];

function randomFallbackImage(seed = 0): string {
  const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[(randomIndex + seed) % FALLBACK_IMAGES.length];
}

const DEFAULT_CATEGORY_COLORS = [
  '#7E244A', '#8A5A27', '#A05A2C', '#7B4D83', 
  '#6F3D82', '#365C78', '#9A3F32', '#7E5C3A'
];

function getIconComponent(iconName: string | null) {
  if (!iconName) return Icons.CalendarDays;
  const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  return (Icons as any)[formattedName] || Icons.CalendarDays;
}

function mapCategories(backendCategories: any[]): EventCategory[] {
  if (!backendCategories || backendCategories.length === 0) return [];
  return backendCategories.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    count: `${cat.vendorCount} options`,
    icon: getIconComponent(cat.icon),
    color: DEFAULT_CATEGORY_COLORS[idx % DEFAULT_CATEGORY_COLORS.length],
    image: cat.imageUrl,
  }));
}

function mapOffers(backendOffers: any[]): OfferBanner[] {
  if (!backendOffers || backendOffers.length === 0) return [];
  return backendOffers.map(offer => ({
    id: offer.id,
    title: offer.title,
    subtitle: offer.subtitle,
    tag: offer.badge || 'PROMO',
    image: offer.imageUrl,
  }));
}

function formatInrPrice(value: number): string {
  if (!value) return `${INR_SYMBOL}0`;
  return `${INR_SYMBOL}${value.toLocaleString('en-IN')}`;
}

function mapPackages(backendPackages: any[]): CreatedPackage[] {
  if (!backendPackages || backendPackages.length === 0) return [];
  return backendPackages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.description || '',
    price: formatInrPrice(pkg.basePrice),
    duration: pkg.duration || '1 day',
    guests: pkg.guestRange || 'Varies',
    rating: String(pkg.rating || 4.5),
    badge: pkg.badge || 'POPULAR',
    services: pkg.services || [],
    images: pkg.images || [],
  }));
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight size={14} color="#8A6B3B" strokeWidth={2.6} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function DynamicImage({
  uri,
  imageStyle,
  fallbackStyle,
}: {
  uri: string | null;
  imageStyle: any;
  fallbackStyle: any;
}) {
  if (!uri) {
    return (
      <View style={[imageStyle, fallbackStyle]}>
        <Text style={styles.nilImageText}>{NIL}</Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={imageStyle} resizeMode="cover" />;
}

function PackageCollage({ images }: { images: string[] }) {
  const visibleImages = images.slice(0, 4);

  return (
    <View style={styles.packageCollage}>
      <Image source={{ uri: visibleImages[0] || randomFallbackImage(0) }} style={styles.collageMain} resizeMode="cover" />
      <View style={styles.collageSide}>
        <Image source={{ uri: visibleImages[1] || randomFallbackImage(1) }} style={styles.collageTop} resizeMode="cover" />
        <View style={styles.collageBottomRow}>
          <Image source={{ uri: visibleImages[2] || randomFallbackImage(2) }} style={styles.collageBottomImage} resizeMode="cover" />
          <Image source={{ uri: visibleImages[3] || randomFallbackImage(3) }} style={styles.collageBottomImage} resizeMode="cover" />
        </View>
      </View>
      {images.length > 4 && (
        <View style={styles.moreImagesBadge}>
          <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
        </View>
      )}
    </View>
  );
}

function CategoryCard({ item }: { item: EventCategory }) {
  const Icon = item.icon;
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.categoryCard}>
      <DynamicImage uri={item.image} imageStyle={styles.categoryImage} fallbackStyle={styles.nilDarkImage} />
      <View style={[styles.categoryTint, { backgroundColor: item.color }]} />
      <View style={styles.categoryIconWrap}>
        <Icon size={18} color="#FFFFFF" strokeWidth={2.3} />
      </View>
      <View style={styles.categoryCopy}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count === NIL ? NIL : `${item.count} options`}</Text>
      </View>
    </TouchableOpacity>
  );
}

function DiscountBanner({ item }: { item: OfferBanner }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.bannerCard}>
      <DynamicImage uri={item.image} imageStyle={styles.bannerImage} fallbackStyle={styles.nilDarkImage} />
      <View style={styles.bannerShade} />
      <View style={styles.bannerContent}>
        <View style={styles.bannerTag}>
          <BadgePercent size={13} color="#641E3D" />
          <Text style={styles.bannerTagText}>{item.tag}</Text>
        </View>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PackageCard({ item }: { item: CreatedPackage }) {
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.packageCard}>
      <View>
        <PackageCollage images={item.images} />
        <View style={styles.packageBadge}>
          <Crown size={13} color="#FFFFFF" />
          <Text style={styles.packageBadgeText}>{item.badge}</Text>
        </View>
      </View>

      <View style={styles.packageBody}>
        <View style={styles.packageTitleRow}>
          <View style={styles.packageTitleCopy}>
            <Text style={styles.packageName}>{item.name}</Text>
            <Text style={styles.packageTagline}>{item.tagline}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Star size={13} color="#D2AD6B" fill="#D2AD6B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.packageMetaRow}>
          <View style={styles.packageMetaItem}>
            <CalendarDays size={14} color="#7E244A" />
            <Text style={styles.packageMetaText}>{item.duration}</Text>
          </View>
          <View style={styles.packageMetaItem}>
            <Users size={14} color="#7E244A" />
            <Text style={styles.packageMetaText}>{item.guests}</Text>
          </View>
        </View>

        <View style={styles.servicesWrap}>
          {item.services.map((service) => (
            <View key={service} style={styles.serviceChip}>
              <ShieldCheck size={12} color="#8A6B3B" />
              <Text style={styles.serviceChipText}>{service}</Text>
            </View>
          ))}
        </View>

        <View style={styles.packageFooter}>
          <View>
            <Text style={styles.priceLabel}>Package from</Text>
            <Text style={styles.packagePrice}>{item.price}</Text>
          </View>
          <View style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore</Text>
            <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [city, setCity] = useState(NIL);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [packages, setPackages] = useState<CreatedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [preferences, homeData] = await Promise.all([
          fetchUserPreferences().catch(() => null),
          fetchHomeData().catch(() => ({ categories: [], offers: [], packages: [] }))
        ]);

        if (preferences?.city) setCity(preferences.city);

        setCategories(mapCategories(homeData.categories));
        setBanners(mapOffers(homeData.offers));
        setPackages(mapPackages(homeData.packages));
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const filteredPackages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return packages;

    return packages.filter((item) => (
      item.name.toLowerCase().includes(query) ||
      item.tagline.toLowerCase().includes(query) ||
      item.services.some((service) => service.toLowerCase().includes(query))
    ));
  }, [packages, searchQuery]);

  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (place) {
        const cityName = place.city || place.subregion || place.district || 'Selected city';
        const stateName = place.region || '';
        setCity(stateName ? `${cityName}, ${stateName}` : cityName);
      }
    } catch (error) {
      console.warn('Error fetching location:', error);
      Alert.alert('Location Unavailable', "We couldn't fetch your current location right now.");
    } finally {
      setIsLocating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Preparing your event home...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.title}>Plan something unforgettable</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.giftButton}>
              <Gift size={22} color="#641E3D" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={fetchLocation} style={styles.locationButton}>
            <View style={styles.locationIcon}>
              {isLocating ? (
                <ActivityIndicator size="small" color="#D2AD6B" />
              ) : (
                <MapPin size={17} color="#D2AD6B" strokeWidth={2.4} />
              )}
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationLabel}>Selected location</Text>
              <Text style={styles.locationValue} numberOfLines={1}>{city}</Text>
            </View>
            <LocateFixed size={17} color="#8A6B3B" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Search size={20} color="#9C8D7B" strokeWidth={2.3} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search venues, decor, photographers..."
              placeholderTextColor="#9C8D7B"
              style={styles.searchInput}
              selectionColor="#D2AD6B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Event Categories" action="View all" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {categories.map((item) => (
              <CategoryCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Offers For You" action="See deals" />
          <ScrollView
            horizontal
            pagingEnabled
            snapToInterval={BANNER_WIDTH + 14}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannerList}
          >
            {banners.map((item) => (
              <DiscountBanner key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Created Packages" action="Compare" />
          <View style={styles.packageIntro}>
            <Sparkles size={16} color="#D2AD6B" />
            <Text style={styles.packageIntroText}>
              Ready-made plans with services, price, guest scale, and visual previews.
            </Text>
          </View>

          {filteredPackages.map((item) => (
            <PackageCard key={item.id} item={item} />
          ))}
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
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7EF',
  },
  loadingText: {
    marginTop: 12,
    color: '#641E3D',
    fontSize: 15,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 18,
    backgroundColor: '#FBF2E6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: 14,
  },
  greeting: {
    color: '#8A6B3B',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  title: {
    color: '#241018',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  giftButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  locationButton: {
    minHeight: 64,
    borderRadius: 22,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A151D',
    marginRight: 11,
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationLabel: {
    color: '#9C8D7B',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  locationValue: {
    color: '#241018',
    fontSize: 15,
    fontWeight: '900',
  },
  searchBox: {
    height: 58,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#241018',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    paddingTop: 22,
  },
  sectionHeader: {
    paddingHorizontal: PAGE_PADDING,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#641E3D',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    color: '#8A6B3B',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  horizontalList: {
    paddingLeft: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    gap: 12,
  },
  categoryCard: {
    width: 136,
    height: 158,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2A151D',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  nilDarkImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A151D',
  },
  nilLightImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE3CF',
  },
  nilImageText: {
    color: '#D2AD6B',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.56,
  },
  categoryIconWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  categoryCopy: {
    position: 'absolute',
    left: 13,
    right: 13,
    bottom: 13,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 3,
  },
  categoryCount: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '800',
  },
  bannerList: {
    paddingLeft: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    gap: 14,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 168,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#2A151D',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 14, 0.48)',
  },
  bannerContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FBF2E6',
    marginBottom: 10,
  },
  bannerTagText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  packageIntro: {
    marginHorizontal: PAGE_PADDING,
    marginBottom: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  packageIntroText: {
    flex: 1,
    color: '#6F6257',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  packageCard: {
    width: PACKAGE_WIDTH,
    alignSelf: 'center',
    marginBottom: 18,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#6C461A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 7,
  },
  packageCollage: {
    height: COLLAGE_HEIGHT,
    flexDirection: 'row',
    gap: COLLAGE_GAP,
    padding: 4,
    backgroundColor: '#F3E9DB',
  },
  collageMain: {
    width: COLLAGE_MAIN_WIDTH,
    height: COLLAGE_HEIGHT - 8,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 10,
  },
  collageSide: {
    width: COLLAGE_SIDE_WIDTH,
    height: COLLAGE_HEIGHT - 8,
    gap: COLLAGE_GAP,
  },
  collageTop: {
    width: '100%',
    height: 104,
    borderTopRightRadius: 20,
  },
  collageBottomRow: {
    flexDirection: 'row',
    gap: COLLAGE_GAP,
    flex: 1,
  },
  collageBottomImage: {
    flex: 1,
    height: '100%',
    borderBottomRightRadius: 20,
  },
  moreImagesBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    minWidth: 42,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36, 16, 24, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  moreImagesText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  packageBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(100, 30, 61, 0.92)',
  },
  packageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packageBody: {
    padding: 16,
  },
  packageTitleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  packageTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  packageName: {
    color: '#241018',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    marginBottom: 4,
  },
  packageTagline: {
    color: '#706257',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  ratingText: {
    color: '#241018',
    fontSize: 12,
    fontWeight: '900',
  },
  packageMetaRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 13,
  },
  packageMetaItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#FBF7EF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 7,
  },
  packageMetaText: {
    color: '#3A252D',
    fontSize: 11,
    fontWeight: '900',
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FEF8EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  serviceChipText: {
    color: '#4E4037',
    fontSize: 11,
    fontWeight: '800',
  },
  packageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    gap: 12,
  },
  priceLabel: {
    color: '#9C8D7B',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  packagePrice: {
    color: '#641E3D',
    fontSize: 19,
    fontWeight: '900',
  },
  exploreButton: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#641E3D',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
