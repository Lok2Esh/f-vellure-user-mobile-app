import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  SlidersHorizontal,
  X,
  Star,
  RotateCcw,
  MapPin,
  Heart,
  Scale,
  Sparkles,
  Search,
  ChevronDown,
  Store,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  fetchSavedVendorIds,
  fetchComparedVendorIds,
  fetchVendorsData,
  saveComparedVendorIds,
  toggleSaveVendorId,
  fetchCitiesData,
} from '../../services/api';
import VendorCard from '../../components/vendor/VendorCard';
import { VellureSearchInput } from '../../components/ui/VellureInputField';
import {
  ExploreFilterModal,
  ExploreFilters,
} from '../../components/vendor/ExploreFilterModal';
import {
  ComparableVendor,
  VendorComparisonModal,
} from '../../components/vendor/VendorComparisonModal';
import { VendorCompareTray } from '../../components/vendor/VendorCompareTray';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';
import { ExploreEmptyState } from '../../components/vendor/ExploreEmptyState';
import { CityPickerModal, CityEntry } from '../../components/ui/CityPickerModal';
import { colors } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_SIZE = 8;

const CATEGORY_MAP: Record<string, { label: string; key: string }> = {
  all: { label: 'All Services', key: 'all' },
  venue: { label: 'Grand Venues', key: 'venue' },
  catering: { label: 'Artisanal Catering', key: 'catering' },
  decor: { label: 'Decor & Lighting', key: 'decor' },
  photography: { label: 'Photography & Cinema', key: 'photography' },
  videography: { label: 'Videography', key: 'videography' },
  makeup: { label: 'Makeup & Styling', key: 'makeup' },
  mehendi: { label: 'Mehendi Artists', key: 'mehendi' },
  planning: { label: 'Event Planners', key: 'planning' },
  entertainment: { label: 'DJ & Live Music', key: 'entertainment' },
  music: { label: 'Live Bands', key: 'music' },
  invitations: { label: 'Invitations & Gifts', key: 'invitations' },
  accommodation: { label: 'Guest Accommodations', key: 'accommodation' },
  transport: { label: 'Luxury Transport', key: 'transport' },
  security: { label: 'Valet & Security', key: 'security' },
  priest: { label: 'Ceremony Priest', key: 'priest' },
  ceremony: { label: 'Rituals & Puja', key: 'ceremony' },
};

const POPULAR_SEARCH_SUGGESTIONS = [
  'Wedding venues in Patiala',
  'Caterers under ₹1,200 per plate',
  'Engagement photographer',
  'Outdoor floral decor',
  'Live acoustic music & DJ',
  'Pandit for ceremony',
  'Bridal makeup specialist',
];

type MarketplaceVendor = {
  id: string;
  businessName?: string;
  name?: string;
  category?: string;
  city?: string;
  locality?: string;
  serviceRadiusKm?: number;
  cityTier?: number;
  basePrice?: number;
  priceType?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: number;
  status?: string;
  verified?: boolean;
  description?: string;
  capacityMin?: number;
  capacityMax?: number;
  portfolio?: Array<{ imageUrl?: string; image?: string; title?: string }>;
  user?: { name: string };
};

const DEFAULT_FILTERS: ExploreFilters = {
  city: 'all',
  verifiedOnly: false,
  minimumRating: 0,
  sortBy: 'recommended',
};

export default function VendorsScreen() {
  const params = useLocalSearchParams<{ category?: string; eventType?: string; city?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [inquiryVendor, setInquiryVendor] = useState<MarketplaceVendor | null>(null);

  const [allData, setAllData] = useState<Record<string, MarketplaceVendor[]>>({});
  const [citiesData, setCitiesData] = useState<CityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [data, saved, compared, citiesResp] = await Promise.all([
        fetchVendorsData(),
        fetchSavedVendorIds(),
        fetchComparedVendorIds(),
        fetchCitiesData().catch(() => ({ cities: [] })),
      ]);
      setAllData(data as Record<string, MarketplaceVendor[]>);
      setSavedIds(saved);
      setCompareIds(compared);
      setCitiesData(citiesResp?.cities || []);
    } catch (error) {
      console.error('Error fetching marketplace vendors:', error);
      setLoadError('We could not load marketplace partners. Check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle incoming route params (e.g. from Home category or city click)
  useEffect(() => {
    if (params.category && (CATEGORY_MAP[params.category.toLowerCase()] || allData[params.category.toLowerCase()])) {
      setSelectedCategory(params.category.toLowerCase());
    }
    if (params.city) {
      setFilters((current) => ({ ...current, city: params.city || 'all' }));
    }
  }, [params.category, params.city, allData]);

  // Flatten and filter all vendors
  const filteredVendors = useMemo(() => {
    let list: MarketplaceVendor[] = [];

    if (selectedCategory === 'all') {
      list = Object.values(allData).flat();
    } else {
      list = allData[selectedCategory] || [];
    }

    // Deduplicate by ID
    const seen = new Set<string>();
    list = list.filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // 1. Search filter
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          (v.businessName || v.name || '').toLowerCase().includes(q) ||
          (v.category || '').toLowerCase().includes(q) ||
          (v.city || '').toLowerCase().includes(q) ||
          (v.locality || '').toLowerCase().includes(q) ||
          (v.description || '').toLowerCase().includes(q)
      );
    }

    // 2. City filter
    if (filters.city && filters.city !== 'all') {
      list = list.filter(
        (v) => (v.city || '').toLowerCase() === filters.city.toLowerCase()
      );
    }

    // 3. Verified only filter
    if (filters.verifiedOnly) {
      list = list.filter((v) => v.status === 'VERIFIED' || v.verified);
    }

    // 4. Minimum rating filter
    if (filters.minimumRating > 0) {
      list = list.filter((v) => (v.rating || 0) >= filters.minimumRating);
    }

    // 5. Price & Rating sorting
    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (filters.sortBy === 'price_desc') {
      list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (filters.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [allData, selectedCategory, debouncedQuery, filters]);

  const displayedVendors = useMemo(() => {
    return filteredVendors.slice(0, visibleCount);
  }, [filteredVendors, visibleCount]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city && filters.city !== 'all') count++;
    if (filters.verifiedOnly) count++;
    if (filters.minimumRating > 0) count++;
    if (filters.sortBy && filters.sortBy !== 'recommended') count++;
    return count;
  }, [filters]);

  const handleToggleSave = async (vendorId: string) => {
    const isNowSaved = await toggleSaveVendorId(vendorId);
    setSavedIds((current) =>
      isNowSaved ? [...current, vendorId] : current.filter((id) => id !== vendorId)
    );
  };

  const handleToggleCompare = async (vendorId: string) => {
    const next = compareIds.includes(vendorId)
      ? compareIds.filter((id) => id !== vendorId)
      : [...compareIds, vendorId].slice(0, 4);

    await saveComparedVendorIds(next);
    setCompareIds(next);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const comparableVendorsList: ComparableVendor[] = useMemo(() => {
    const all = Object.values(allData).flat();
    return compareIds
      .map((id) => all.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => ({
        id: v!.id,
        businessName: v!.businessName || v!.name || 'Vendor',
        category: v!.category || 'Vendor',
        city: v!.city || 'Patiala',
        basePrice: v!.basePrice,
        priceType: v!.priceType,
        rating: v!.rating,
        reviewsCount: v!.reviewsCount || v!.reviews,
        verified: Boolean(v!.status === 'VERIFIED' || v!.verified),
      }));
  }, [compareIds, allData]);

  const currentCityLabel = filters.city !== 'all' ? filters.city : 'Patiala, Punjab';

  return (
    <View style={styles.screen}>
      {/* ──── HEADER ──── */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.headerTitle}>Explore Marketplace</Text>
            <Text style={styles.headerSubtitle}>
              Discover verified services for every celebration.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.locationPill}
            onPress={() => setShowCityPicker(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change location city"
          >
            <MapPin size={12} color="#D2AD6B" />
            <Text style={styles.locationPillText} numberOfLines={1}>
              {currentCityLabel}
            </Text>
            <ChevronDown size={12} color="#641E3D" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputContainer}>
            <VellureSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search venues, caterers, decorators, photographers…"
            />
          </View>

          <TouchableOpacity
            style={[styles.filterIconButton, activeFilterCount > 0 && styles.filterIconButtonActive]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open filters modal"
          >
            <SlidersHorizontal size={16} color={activeFilterCount > 0 ? '#FFFFFF' : '#641E3D'} />
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Search Suggestions when Search is Active */}
        {!searchQuery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionChips}
          >
            {POPULAR_SEARCH_SUGGESTIONS.map((sug, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => setSearchQuery(sug)}
                activeOpacity={0.75}
              >
                <Search size={10} color="#8A7A70" />
                <Text style={styles.suggestionChipText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ──── EXPANDED CATEGORY BAR ──── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBar}
        >
          {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
            const isSelected = selectedCategory === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCategory(key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ──── ACTIVE FILTER CHIPS ──── */}
        {activeFilterCount > 0 && (
          <View style={styles.activeFiltersRow}>
            {filters.city !== 'all' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{filters.city}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, city: 'all' })}>
                  <X size={12} color="#641E3D" />
                </TouchableOpacity>
              </View>
            )}

            {filters.verifiedOnly && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>Verified Only</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, verifiedOnly: false })}>
                  <X size={12} color="#641E3D" />
                </TouchableOpacity>
              </View>
            )}

            {filters.minimumRating > 0 && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{filters.minimumRating}+ Stars</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, minimumRating: 0 })}>
                  <X size={12} color="#641E3D" />
                </TouchableOpacity>
              </View>
            )}

            {filters.sortBy !== 'recommended' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>Sort: {filters.sortBy.replace('_', ' ')}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, sortBy: 'recommended' })}>
                  <X size={12} color="#641E3D" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={handleResetFilters} style={styles.resetAllBtn}>
              <Text style={styles.resetAllText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result Count Line */}
        <View style={styles.resultCountBar}>
          <Text style={styles.resultCountText}>
            {filteredVendors.length} verified partner{filteredVendors.length === 1 ? '' : 's'} found
          </Text>
        </View>
      </View>

      {/* ──── MAIN RESULTS LIST ──── */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#641E3D" />
          <Text style={styles.loadingCopy}>Searching marketplace directory...</Text>
        </View>
      ) : filteredVendors.length === 0 ? (
        <ExploreEmptyState
          query={debouncedQuery}
          categoryLabel={CATEGORY_MAP[selectedCategory]?.label}
          city={filters.city}
          filterCount={activeFilterCount}
          suggestions={[
            { key: 'venue', label: 'Grand Venues' },
            { key: 'catering', label: 'Artisanal Catering' },
            { key: 'decor', label: 'Decor & Lighting' },
          ]}
          onClear={handleResetFilters}
          onChangeLocation={() => setShowCityPicker(true)}
          onChooseCategory={(k) => setSelectedCategory(k)}
          onCustomRequest={() => router.push('/(tabs)/budget')}
        />
      ) : (
        <FlatList
          data={displayedVendors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VendorCard
              id={item.id}
              businessName={item.businessName || item.name || 'Verified Partner'}
              category={item.category || 'Vendor'}
              city={item.city || 'Patiala'}
              locality={item.locality}
              serviceRadiusKm={item.serviceRadiusKm}
              cityTier={item.cityTier}
              basePrice={item.basePrice}
              priceType={item.priceType}
              rating={item.rating}
              reviewsCount={item.reviewsCount || item.reviews}
              status={item.status}
              verified={item.verified}
              capacityMin={item.capacityMin}
              capacityMax={item.capacityMax}
              portfolio={item.portfolio}
              user={item.user}
              isSaved={savedIds.includes(item.id)}
              isComparing={compareIds.includes(item.id)}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              onEnquire={(vId) => {
                setInquiryVendor(item);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (visibleCount < filteredVendors.length) {
              setVisibleCount((c) => c + PAGE_SIZE);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            visibleCount < filteredVendors.length ? (
              <ActivityIndicator size="small" color="#641E3D" style={{ marginVertical: 16 }} />
            ) : filteredVendors.length > 0 ? (
              <View style={styles.endListBadge}>
                <Text style={styles.endListText}>All matching partners shown</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* ──── COMPARE TRAY & MODALS ──── */}
      <VendorCompareTray
        count={compareIds.length}
        onCompare={() => setShowComparison(true)}
        onClear={() => {
          setCompareIds([]);
          saveComparedVendorIds([]);
        }}
      />

      <VendorComparisonModal
        visible={showComparison}
        onClose={() => setShowComparison(false)}
        vendors={comparableVendorsList}
        onRemove={(id) => handleToggleCompare(id)}
        onViewVendor={(id) => {
          setShowComparison(false);
          router.push(`/vendor/${id}`);
        }}
      />

      <ExploreFilterModal
        visible={showFilterModal}
        filters={filters}
        cities={citiesData.map((c) => c.city)}
        onChange={(f) => setFilters(f)}
        onApply={() => setShowFilterModal(false)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onClose={() => setShowFilterModal(false)}
      />

      <CityPickerModal
        visible={showCityPicker}
        cities={citiesData}
        onClose={() => setShowCityPicker(false)}
        onSelect={(city) => {
          setFilters({ ...filters, city });
          setShowCityPicker(false);
        }}
      />

      {inquiryVendor && (
        <EventInquiryModal
          visible={!!inquiryVendor}
          onClose={() => setInquiryVendor(null)}
          targetId={inquiryVendor.id}
          targetName={inquiryVendor.businessName || inquiryVendor.name || 'Partner'}
          targetCategory={CATEGORY_MAP[selectedCategory]?.label || 'Partner'}
          initialCity={inquiryVendor.city}
          initialBudget={inquiryVendor.basePrice}
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
  header: {
    paddingTop: 52,
    backgroundColor: '#FDFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EC',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  headerTitle: {
    color: '#641E3D',
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#786B70',
    fontSize: 11,
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    maxWidth: 140,
  },
  locationPillText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    flexShrink: 1,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconButtonActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  filterCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D2AD6B',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    color: '#2D2025',
    fontSize: 9,
    fontWeight: '900',
  },
  suggestionChips: {
    paddingHorizontal: 20,
    gap: 6,
    paddingBottom: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  suggestionChipText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryBar: {
    paddingHorizontal: 20,
    gap: 6,
    paddingBottom: 10,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  catChipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  catChipText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 6,
    paddingBottom: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  activeFilterChipText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  resetAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3.5,
  },
  resetAllText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  resultCountBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultCountText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 140, // Floating navigation bar clearance
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingCopy: {
    marginTop: 12,
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '700',
  },
  endListBadge: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  endListText: {
    color: '#8A7A70',
    fontSize: 11,
    fontWeight: '600',
  },
});
