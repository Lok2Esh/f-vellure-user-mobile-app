import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useEffect,
  useState,
  useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Sparkles,
  MapPin,
  Heart,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Users,
  Award,
  Clock,
  ArrowRight,
  BadgeCheck,
  Star,
  Hotel,
  Gift,
  Crown,
  Music,
  Flower2,
  CalendarDays,
  Headphones,
  CheckCircle2,
  Package,
} from 'lucide-react-native';
import { router } from 'expo-router';
import {
  fetchUserPreferences,
  fetchVendorPacks,
  fetchVendorsData,
  fetchSavedVendorIds,
} from '../../services/api';
import {
  getSelectedLocation,
  setSelectedLocation,
  subscribeSelectedLocation,
  isVendorInCity,
  POPULAR_CITIES,
} from '../../services/locationStore';
import { colors } from '../../constants/theme';
import { ConversationalAiInput, AiSubmitPayload } from '../../components/ui/ConversationalAiInput';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { VendorPackDetailModal } from '../../components/vendor/VendorPackDetailModal';
import { CityPickerModal, CityEntry } from '../../components/ui/CityPickerModal';
import { fetchCitiesData, fetchPublicCategories } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 18 Comprehensive Event Categories for India
const EVENT_CATEGORIES = [
  {
    id: 'wedding',
    name: 'Wedding',
    tagline: 'Royal & Heritage Ceremonies',
    icon: Heart,
    color: '#641E3D',
    image: require('../../assets/images/celebrations/wedding.jpg'),
  },
  {
    id: 'engagement',
    name: 'Engagement',
    tagline: 'Ring Ceremonies & Roka',
    icon: Crown,
    color: '#8A5A27',
    image: require('../../assets/images/celebrations/engagement.jpg'),
  },
  {
    id: 'reception',
    name: 'Reception',
    tagline: 'Grand Galas & Banquets',
    icon: Flower2,
    color: '#A05A2C',
    image: require('../../assets/images/celebrations/reception.jpg'),
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Mehendi',
    tagline: 'Music, Dance & Henna Nights',
    icon: Music,
    color: '#9A3F32',
    image: require('../../assets/images/celebrations/sangeet-mehendi.jpg'),
  },
  {
    id: 'birthday',
    name: 'Birthday',
    tagline: 'Themed Celebrations & Milestones',
    icon: Gift,
    color: '#7B4D83',
    image: require('../../assets/images/celebrations/birthday.jpg'),
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    tagline: 'Golden, Silver & Milestone Soirées',
    icon: Sparkles,
    color: '#6F3D82',
    image: require('../../assets/images/celebrations/anniversary.jpg'),
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    tagline: 'Godh Bharai & Welcoming Blessings',
    icon: Heart,
    color: '#476A91',
    image: require('../../assets/images/celebrations/baby-shower.jpg'),
  },
  {
    id: 'housewarming',
    name: 'Housewarming',
    tagline: 'Griha Pravesh & Blessings',
    icon: Hotel,
    color: '#7E5C3A',
    image: require('../../assets/images/celebrations/housewarming.jpg'),
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    tagline: 'Summits, Galas & Dinners',
    icon: Hotel,
    color: '#365C78',
    image: require('../../assets/images/celebrations/corporate-event.jpg'),
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    tagline: 'Media, Sound & Experiential Staging',
    icon: Sparkles,
    color: '#2A5C8A',
    image: require('../../assets/images/celebrations/product-launch.jpg'),
  },
  {
    id: 'conference',
    name: 'Conference',
    tagline: 'Keynotes & Exhibition Halls',
    icon: CalendarDays,
    color: '#2E6F5A',
    image: require('../../assets/images/celebrations/conference.jpg'),
  },
  {
    id: 'private-party',
    name: 'Private Party',
    tagline: 'Intimate Dinners & Cocktails',
    icon: Music,
    color: '#8A2D58',
    image: require('../../assets/images/celebrations/private-party.jpg'),
  },
  {
    id: 'festival',
    name: 'Festival Celebration',
    tagline: 'Diwali, Holi, Eid, Christmas & Baisakhi',
    icon: Gift,
    color: '#B45B27',
    image: require('../../assets/images/celebrations/festival-celebration.jpg'),
  },
  {
    id: 'puja-path',
    name: 'Puja & Path',
    tagline: 'Traditional Vedic Rituals & Havans',
    icon: Sparkles,
    color: '#7A5B20',
    image: require('../../assets/images/celebrations/puja-path.jpg'),
  },
  {
    id: 'ramayan-path',
    name: 'Ramayan Path & Kirtan',
    tagline: 'Akhand Path & Devotional Sangeet',
    icon: Sparkles,
    color: '#9C6228',
    image: require('../../assets/images/celebrations/ramayan-path-kirtan.jpg'),
  },
  {
    id: 'guru-granth-path',
    name: 'Guru Granth Sahib Path',
    tagline: 'Akhand Path & Kirtan Darbar',
    icon: Crown,
    color: '#266352',
    image: require('../../assets/images/celebrations/guru-granth-sahib-path.jpg'),
  },
  {
    id: 'nikah',
    name: 'Nikah & Walima',
    tagline: 'Islamic Ceremonies & Feast',
    icon: Heart,
    color: '#2F6D62',
    image: require('../../assets/images/celebrations/nikah-walima.jpg'),
  },
  {
    id: 'church-ceremony',
    name: 'Church Ceremony',
    tagline: 'Christian Weddings & Blessings',
    icon: CalendarDays,
    color: '#476A91',
    image: require('../../assets/images/celebrations/church-ceremony.jpg'),
  },
];

const PARTNER_OFFERS = [
  {
    id: 'off-1',
    title: 'Heritage Palace Welcome Perk',
    subtitle: 'Complimentary Royal Dhol & Welcome Mocktail Bar for bookings confirmed this month',
    tag: 'Verified Exclusive',
    validity: 'Valid across Patiala & Punjab Heritage Venues',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  },
  {
    id: 'off-2',
    title: 'Cinematic Drone & Reel Upgrade',
    subtitle: 'Free 4K drone highlights & 2 Instagram teaser reels with 2-day photography bundles',
    tag: 'Trending Bundle',
    validity: 'Valid on wedding & reception bookings',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
  },
  {
    id: 'off-3',
    title: 'Couture Decor Lighting Upgrade',
    subtitle: '10% complimentary mood & fairy lighting value upgrade on weeknight celebrations',
    tag: 'Special Partner Rate',
    validity: 'Valid on full stage + entrance decor',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState('Host');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [packModalVisible, setPackModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic Data
  const [userBudget, setUserBudget] = useState(2500000);
  const [guestCount, setGuestCount] = useState(300);
  const [userEventType, setUserEventType] = useState('Wedding');
  const [vendorPacks, setVendorPacks] = useState<any[]>([]);
  const [verifiedVendors, setVerifiedVendors] = useState<any[]>([]);
  const [eventCategories, setEventCategories] = useState<any[]>(EVENT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const [currentCity, setCurrentCity] = useState<string>(getSelectedLocation().city);
  const [currentState, setCurrentState] = useState<string>(getSelectedLocation().state || 'Punjab');

  const loadHomeData = async (targetCity?: string) => {
    const activeCity = targetCity || getSelectedLocation().city || currentCity;
    try {
      // 1. Fetch preferences
      try {
        const pref = await fetchUserPreferences();
        if (pref) {
          if (pref.totalBudget) setUserBudget(pref.totalBudget);
          if (pref.guestCount) setGuestCount(pref.guestCount);
          if (pref.eventType) setUserEventType(pref.eventType);
          if (pref.user?.name) setUserName(pref.user.name);
        }
      } catch (_) {}

      // 2. Fetch curated vendor packs
      try {
        const packs = await fetchVendorPacks(userBudget);
        if (Array.isArray(packs) && packs.length > 0) {
          setVendorPacks(packs);
        }
      } catch (_) {}

      // 3. Fetch top verified vendors specifically for this city
      try {
        const vendorData = await fetchVendorsData(activeCity);
        const all = Object.values(vendorData).flat() as any[];
        const cityMatches = all.filter((v) => isVendorInCity(v, activeCity));
        setVerifiedVendors(cityMatches.length > 0 ? cityMatches.slice(0, 10) : all.slice(0, 10));
      } catch (_) {}

      // 4. Saved items count
      try {
        const savedIds = await fetchSavedVendorIds();
        setSavedCount(savedIds.length);
      } catch (_) {}

      // 5. Dynamic Active Celebration Categories from Backend
      try {
        const dynamicCats = await fetchPublicCategories('EVENT');
        if (Array.isArray(dynamicCats) && dynamicCats.length > 0) {
          const mapped = dynamicCats.map((dc) => {
            const normKey = dc.key.toLowerCase().replace(/_/g, '-');
            const matched = EVENT_CATEGORIES.find(
              (ec) =>
                ec.id.toLowerCase() === normKey ||
                ec.id.toLowerCase() === dc.key.toLowerCase() ||
                ec.name.toLowerCase() === dc.name.toLowerCase()
            );
            return {
              id: dc.key,
              name: dc.name,
              tagline: dc.tagline || (matched ? matched.tagline : 'Celebration Specialists'),
              icon: matched ? matched.icon : Heart,
              color: dc.color || (matched ? matched.color : '#641E3D'),
              image: matched
                ? matched.image
                : dc.image && dc.image.startsWith('http')
                ? { uri: dc.image }
                : require('../../assets/images/celebrations/wedding.jpg'),
              isActive: dc.isActive,
            };
          });
          setEventCategories(mapped);
        }
      } catch (_) {}
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeSelectedLocation((loc) => {
      setCurrentCity(loc.city);
      setCurrentState(loc.state || 'Punjab');
      loadHomeData(loc.city);
    });
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHomeData(currentCity);
  };

  const [citiesList, setCitiesList] = useState<CityEntry[]>(POPULAR_CITIES);

  const handleCitySelect = (selectedCityName: string) => {
    const matched = POPULAR_CITIES.find((c) => c.city.toLowerCase() === selectedCityName.toLowerCase());
    setSelectedLocation(selectedCityName, matched?.state);
    setCityPickerVisible(false);
  };

  const handleAiPromptSubmit = (payload: AiSubmitPayload) => {
    router.push({
      pathname: '/(tabs)/budget',
      params: {
        prompt: payload.prompt,
        eventType: payload.eventType || userEventType,
        city: payload.city || currentCity,
        guestCount: String(payload.guestCount || guestCount),
        budget: String(payload.budget || userBudget),
        budgetMin: payload.budgetMin ? String(payload.budgetMin) : undefined,
        budgetMax: payload.budgetMax ? String(payload.budgetMax) : undefined,
        theme: payload.theme || 'Grand & Royal',
        services: payload.services ? payload.services.join(',') : undefined,
      },
    });
  };

  const handleCategoryPress = (category: typeof EVENT_CATEGORIES[0]) => {
    router.push({
      pathname: '/(tabs)/vendors',
      params: { eventType: category.name },
    });
  };

  const handlePackPress = (pack: any) => {
    const formattedPack = {
      id: pack.id,
      name: pack.name,
      description: pack.description || 'Complete curated multi-vendor package for your celebration.',
      priceLabel: `₹${Number(pack.totalPrice || userBudget * 0.85).toLocaleString('en-IN')}`,
      tag: pack.badge || pack.tag || 'Curated Package',
      vendors: [
        { category: 'Venue', name: 'Fort Patiala', price: '₹1,000/plate' },
        { category: 'Catering', name: 'The Royal Kitchen', price: '₹1,500/plate' },
        { category: 'Photography', name: 'RR Studios', price: '₹70,000/day' },
        { category: 'Decor', name: 'Shaandaar Events', price: '₹5,00,000' },
      ],
    };
    setSelectedPack(formattedPack);
    setPackModalVisible(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* ──── 1. TOP HEADER & LOCATION BAR ──── */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{greeting}, {userName || 'Host'}</Text>
            <VellureButton
              style={styles.locationPill}
              onPress={() => setCityPickerVisible(true)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Select city, currently ${currentCity}`}
            >
              <MapPin size={13} color={colors.gold} strokeWidth={2.5} />
              <Text style={styles.locationCity}>{currentCity}</Text>
              <ChevronRight size={12} color="#786B70" />
            </VellureButton>
          </View>

          <View style={styles.headerRight}>
            <VellureButton
              style={styles.headerIconBtn}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="View saved wishlist"
            >
              <Heart size={18} color={colors.primary} />
              {savedCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{savedCount}</Text>
                </View>
              )}
            </VellureButton>

            <VellureButton
              style={styles.headerIconBtn}
              onPress={() => Alert.alert('Notifications', 'No new alerts. Your vendor quotes will appear here.')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={colors.primary} />
            </VellureButton>
          </View>
        </View>

        {/* ──── 2. CONVERSATIONAL AI PLANNING ENTRY ──── */}
        <ConversationalAiInput currentCity={currentCity} onSubmit={handleAiPromptSubmit} />

        {/* ──── 3. CONTINUE PLANNING ACTIVE WORKSPACE ──── */}
        <View style={styles.continueCard}>
          <View style={styles.continueTop}>
            <View style={styles.continueIconWrap}>
              <Sparkles size={18} color="#D2AD6B" />
            </View>
            <View style={styles.continueHeaderCopy}>
              <View style={styles.continueBadge}>
                <Text style={styles.continueBadgeText}>In Progress</Text>
              </View>
              <Text style={styles.continueTitle}>{userEventType} in {currentCity}</Text>
            </View>
            <Text style={styles.continuePercent}>60% Ready</Text>
          </View>

          <Text style={styles.continueSubtitle}>
            Budget: ₹{userBudget.toLocaleString('en-IN')} • {guestCount} Guests
          </Text>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>

          <View style={styles.continueFooter}>
            <View style={styles.nextActionItem}>
              <CheckCircle2 size={13} color="#2F7D62" />
              <Text style={styles.nextActionText}>Next: Review Photography & Makeup artists</Text>
            </View>
            <VellureButton
              style={styles.continueActionBtn}
              onPress={() => router.push('/(tabs)/budget')}
              activeOpacity={0.85}
            >
              <Text style={styles.continueActionBtnText}>Resume Plan</Text>
              <ArrowRight size={13} color="#FFFFFF" />
            </VellureButton>
          </View>
        </View>

        {/* ──── 4. EVENT CATEGORIES (DYNAMIC ACTIVE FROM BACKEND) ──── */}
        <SectionHeader
          title="Plan by Celebration"
          subtitle="Explore curated vendors tailored to Indian & universal ceremonies"
          badge={`${eventCategories.length} Ceremonies`}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {eventCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <VellureButton
                key={cat.id}
                style={styles.catCard}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.82}
              >
                <Image source={cat.image} style={styles.catImage} />
                <View style={styles.catOverlay} />
                <View style={[styles.catIconWrap, { backgroundColor: cat.color }]}>
                  <IconComponent size={14} color="#FFFFFF" />
                </View>
                <View style={styles.catBottom}>
                  <Text style={styles.catName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.catTagline} numberOfLines={1}>
                    {cat.tagline}
                  </Text>
                </View>
              </VellureButton>
            );
          })}
        </ScrollView>

        {/* ──── 5. RECOMMENDED CURATED PACKAGES ──── */}
        <SectionHeader
          title="Curated Event Bundles"
          subtitle={`Pre-negotiated multi-vendor packages for ${currentCity}`}
          badge="Zero Advance"
          actionText="View All"
          onAction={() => router.push('/(tabs)/budget')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packsRow}
        >
          {/* 🌟 Custom Package Builder Highlight Card */}
          <VellureButton
            style={styles.customPackBuilderCard}
            onPress={() => router.push('/custom-package')}
            activeOpacity={0.88}
          >
            <View style={styles.customPackHeader}>
              <View style={styles.customPackBadge}>
                <Sparkles size={11} color="#F4D58D" />
                <Text style={styles.customPackBadgeText}>Bespoke Suite</Text>
              </View>
              <Package size={22} color="#F4D58D" />
            </View>
            <Text style={styles.customPackTitle}>Build Your Custom Package</Text>
            <Text style={styles.customPackDesc}>
              Handpick your venue, catering, photographer, and decor. Live price reflects instantly with selections!
            </Text>
            <View style={styles.customPackFooter}>
              <View style={styles.customPackFeaturePills}>
                <Text style={styles.customPackFeature}>★ Live Rates</Text>
                <Text style={styles.customPackFeature}>★ 1-Click Quote</Text>
              </View>
              <View style={styles.customPackCta}>
                <Text style={styles.customPackCtaText}>Start Building →</Text>
              </View>
            </View>
          </VellureButton>

          {(vendorPacks.length > 0
            ? vendorPacks
            : [
                {
                  id: 'pack_essential',
                  name: 'Essential Elegance Package',
                  description: 'Core celebration coverage with premium venue, catering, and decor.',
                  totalPrice: userBudget * 0.8,
                  rating: 4.8,
                  vendorsCount: 4,
                  tag: 'Most Popular',
                  image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                  categories: ['Venue', 'Catering', 'Photography', 'Decor'],
                },
                {
                  id: 'pack_premium',
                  name: 'Premium Boutique Package',
                  description: 'Top-rated specialists with candid cinematography and designer florals.',
                  totalPrice: userBudget * 0.95,
                  rating: 4.9,
                  vendorsCount: 6,
                  tag: 'Curated Choice',
                  image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
                  categories: ['Venue', 'Catering', 'Photography', 'Decor', 'Makeup', 'DJ'],
                },
                {
                  id: 'pack_luxury',
                  name: 'Grand Royal Palace Package',
                  description: 'End-to-end luxury with palace setting, live band, and drone film.',
                  totalPrice: userBudget * 1.25,
                  rating: 5.0,
                  vendorsCount: 8,
                  tag: 'Luxury Tier',
                  image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
                  categories: ['Venue', 'Catering', 'Photography', 'Decor', 'Makeup', 'Live Band', 'Invitations'],
                },
              ]
          ).map((pack) => (
            <VellureButton
              key={pack.id}
              style={styles.packCard}
              onPress={() => handlePackPress(pack)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: pack.image }} style={styles.packImage} />
              <View style={styles.packTag}>
                <Sparkles size={10} color="#D2AD6B" />
                <Text style={styles.packTagText}>{pack.tag || 'Curated'}</Text>
              </View>

              <View style={styles.packBody}>
                <Text style={styles.packName} numberOfLines={1}>{pack.name}</Text>
                <Text style={styles.packDesc} numberOfLines={2}>{pack.description}</Text>

                <View style={styles.packServicesRow}>
                  {pack.categories?.slice(0, 4).map((c: string, idx: number) => (
                    <View key={idx} style={styles.packServicePill}>
                      <Text style={styles.packServiceText}>{c}</Text>
                    </View>
                  ))}
                  {pack.categories && pack.categories.length > 4 && (
                    <View style={styles.packServicePillMore}>
                      <Text style={styles.packServiceTextMore}>+{pack.categories.length - 4}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.packFooter}>
                  <View>
                    <Text style={styles.packPriceLabel}>Estimated Bundle</Text>
                    <Text style={styles.packPrice}>
                      ₹{Number(pack.totalPrice || userBudget).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.packCtaBtn}>
                    <Text style={styles.packCtaBtnText}>View Bundle</Text>
                    <ChevronRight size={14} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </VellureButton>
          ))}
        </ScrollView>

        {/* ──── 6. VERIFIED VENDORS NEAR YOU ──── */}
        <SectionHeader
          title={`Verified Partners in ${currentCity}`}
          subtitle="Direct consultation with background-checked local partners"
          badge="Verified Only"
          actionText="Explore All"
          onAction={() => router.push('/(tabs)/vendors')}
        />

        {verifiedVendors.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingBoxText}>Connecting with local verified partners...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vendorsRow}
          >
            {verifiedVendors.map((vendor) => {
              const img =
                vendor.image ||
                (Array.isArray(vendor.portfolio) && vendor.portfolio[0]?.imageUrl) ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
              const rating = vendor.rating ? vendor.rating.toFixed(1) : '4.8';
              const priceLabel = vendor.basePrice
                ? vendor.priceType === 'PER_PLATE'
                  ? `₹${vendor.basePrice.toLocaleString('en-IN')}/plate`
                  : `From ₹${vendor.basePrice.toLocaleString('en-IN')}`
                : 'Custom Quote';

              return (
                <VellureButton
                  key={vendor.id}
                  style={styles.vendorCard}
                  onPress={() => router.push(`/vendor/${vendor.id}`)}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: img }} style={styles.vendorImage} />
                  <View style={styles.vendorRatingBadge}>
                    <Star size={11} color="#D2AD6B" fill="#D2AD6B" />
                    <Text style={styles.vendorRatingText}>{rating}</Text>
                  </View>

                  <View style={styles.vendorBody}>
                    <View style={styles.vendorCatRow}>
                      <Text style={styles.vendorCatText}>{vendor.category || 'Vendor'}</Text>
                      <View style={styles.verifiedTag}>
                        <BadgeCheck size={11} color="#2F7D62" />
                        <Text style={styles.verifiedTagText}>Verified</Text>
                      </View>
                    </View>

                    <Text style={styles.vendorName} numberOfLines={1}>
                      {vendor.businessName || vendor.name}
                    </Text>
                    <Text style={styles.vendorCity}>{vendor.city || currentCity}</Text>

                    <View style={styles.vendorFooter}>
                      <Text style={styles.vendorPrice}>{priceLabel}</Text>
                      <View style={styles.vendorViewBtn}>
                        <Text style={styles.vendorViewBtnText}>Consult</Text>
                      </View>
                    </View>
                  </View>
                </VellureButton>
              );
            })}
          </ScrollView>
        )}

        {/* ──── 7. CURATED PARTNER OFFERS & SEASONAL PERKS ──── */}
        <SectionHeader
          title="Exclusive Partner Benefits"
          subtitle="Pre-negotiated booking perks from verified local partners"
          badge="Verified Perks"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersRow}
        >
          {PARTNER_OFFERS.map((off) => (
            <View key={off.id} style={styles.offerCard}>
              <Image source={{ uri: off.image }} style={styles.offerImage} />
              <View style={styles.offerOverlay} />
              <View style={styles.offerBadge}>
                <Sparkles size={10} color="#641E3D" />
                <Text style={styles.offerBadgeText}>{off.tag}</Text>
              </View>

              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{off.title}</Text>
                <Text style={styles.offerSubtitle} numberOfLines={2}>
                  {off.subtitle}
                </Text>
                <View style={styles.offerFooter}>
                  <Text style={styles.offerValidity}>{off.validity}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ──── 8. VELLURE TRUST & QUALITY ASSURANCE ──── */}
        <View style={styles.trustCard}>
          <Text style={styles.trustHeadline}>The Vellure Service Guarantee</Text>
          <Text style={styles.trustSubheadline}>
            Planning an Indian celebration requires trust, precision, and verified accountability.
          </Text>

          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <ShieldCheck size={20} color="#641E3D" />
              </View>
              <Text style={styles.trustItemTitle}>100% Verified Partners</Text>
              <Text style={styles.trustItemDesc}>Physical checks and verified past celebration portfolios.</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Award size={20} color="#641E3D" />
              </View>
              <Text style={styles.trustItemTitle}>Transparent Pricing</Text>
              <Text style={styles.trustItemDesc}>Direct vendor quotes with zero hidden markups or advance fees.</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Headphones size={20} color="#641E3D" />
              </View>
              <Text style={styles.trustItemTitle}>Dedicated Concierge</Text>
              <Text style={styles.trustItemDesc}>Senior advisors to assist with multi-day dates and negotiations.</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconWrap}>
                <Clock size={20} color="#641E3D" />
              </View>
              <Text style={styles.trustItemTitle}>24-Hour Response</Text>
              <Text style={styles.trustItemDesc}>Official quote turnaround guaranteed within one business day.</Text>
            </View>
          </View>
        </View>

        {/* Bottom Platform Branding */}
        <View style={styles.brandFooter}>
          <Text style={styles.brandFooterLogo}>VELLURE</Text>
          <Text style={styles.brandFooterSub}>
            AI-Powered Local Event Planning & Marketplace for India
          </Text>
        </View>
      </ScrollView>

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelect={handleCitySelect}
        cities={citiesList}
      />

      {/* Vendor Pack Modal */}
      <VendorPackDetailModal
        visible={packModalVisible}
        onClose={() => setPackModalVisible(false)}
        pack={selectedPack}
        guestCount={guestCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scrollContent: {
    paddingTop: 52,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 5,
  },
  locationCity: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#641E3D',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 26,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  continueIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF1E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  continueHeaderCopy: {
    flex: 1,
  },
  continueBadge: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  continueBadgeText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  continueTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
  },
  continuePercent: {
    color: '#2F7D62',
    fontSize: 12,
    fontWeight: '900',
  },
  continueSubtitle: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3EDE2',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#641E3D',
    borderRadius: 3,
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
  },
  nextActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  nextActionText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '700',
  },
  continueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  continueActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 22,
  },
  catCard: {
    width: 140,
    height: 175,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A121E',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  catOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 12, 18, 0.48)',
  },
  catIconWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  catBottom: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  catName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  catTagline: {
    color: '#E0D4DC',
    fontSize: 10,
    fontWeight: '600',
  },
  packsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 24,
  },
  customPackBuilderCard: {
    width: 290,
    backgroundColor: '#641E3D',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D2AD6B',
    justifyContent: 'space-between',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  customPackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customPackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  customPackBadgeText: {
    color: '#F4D58D',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  customPackTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  customPackDesc: {
    color: '#E0D4DC',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  customPackFooter: {
    gap: 10,
  },
  customPackFeaturePills: {
    flexDirection: 'row',
    gap: 8,
  },
  customPackFeature: {
    color: '#F4D58D',
    fontSize: 10,
    fontWeight: '700',
  },
  customPackCta: {
    backgroundColor: '#F4D58D',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPackCtaText: {
    color: '#2A121E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  packCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  packImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#2A121E',
  },
  packTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 12, 18, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(210, 173, 107, 0.4)',
  },
  packTagText: {
    color: '#F4D374',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  packBody: {
    padding: 14,
  },
  packName: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 3,
  },
  packDesc: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  packServicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 12,
  },
  packServicePill: {
    backgroundColor: '#FAF2E4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  packServicePillMore: {
    backgroundColor: '#F3EDE2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  packServiceText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '700',
  },
  packServiceTextMore: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '800',
  },
  packFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
  },
  packPriceLabel: {
    color: '#9A8E94',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  packPrice: {
    color: '#641E3D',
    fontSize: 16,
    fontWeight: '900',
  },
  packCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 3,
  },
  packCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  vendorsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 24,
  },
  vendorCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  vendorImage: {
    width: '100%',
    height: 115,
    backgroundColor: '#2A121E',
  },
  vendorRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorRatingText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '900',
  },
  vendorBody: {
    padding: 12,
  },
  vendorCatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorCatText: {
    color: '#9A8E94',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedTagText: {
    color: '#2F7D62',
    fontSize: 9,
    fontWeight: '800',
  },
  vendorName: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  vendorCity: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  vendorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
  },
  vendorPrice: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
  },
  vendorViewBtn: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vendorViewBtnText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 20,
  },
  loadingBoxText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  offersRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 26,
  },
  offerCard: {
    width: 270,
    height: 175,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#2A121E',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    padding: 14,
    justifyContent: 'space-between',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 12, 18, 0.65)',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  offerBadgeText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  offerContent: {
    zIndex: 2,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 3,
  },
  offerSubtitle: {
    color: '#F4ECEF',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  offerFooter: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  offerValidity: {
    color: '#D2AD6B',
    fontSize: 10,
    fontWeight: '700',
  },
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 24,
  },
  trustHeadline: {
    color: '#2D2025',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  trustSubheadline: {
    color: '#786B70',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trustItem: {
    width: '47%',
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 12,
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trustItemTitle: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  trustItemDesc: {
    color: '#786B70',
    fontSize: 10,
    lineHeight: 14,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  brandFooterLogo: {
    color: '#641E3D',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
  },
  brandFooterSub: {
    color: '#9A8E94',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
