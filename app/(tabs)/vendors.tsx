import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Settings2, Search } from 'lucide-react-native';
import { fetchVendorsData } from '../../services/api';
import VendorCard from '../../components/vendor/VendorCard';

const PAGE_SIZE = 8;

function fakeText(context: string) {
  return `fake (${context})`;
}

export default function VendorsScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allData, setAllData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchVendorsData();
        setAllData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const displayedVendors = useMemo(() => {
    let list = selectedCategories.length
      ? selectedCategories.flatMap((category) => allData[category] || [])
      : Object.values(allData).flat();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v: any) =>
        (v.businessName || v.name || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q) ||
        (v.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allData, selectedCategories, searchQuery]);

  const visibleVendors = useMemo(
    () => displayedVendors.slice(0, visibleCount),
    [displayedVendors, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategories, searchQuery]);

  const handleFilter = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) return prev.filter((item) => item !== category);
      return [...prev, category];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((current) => {
      if (current >= displayedVendors.length) return current;
      return Math.min(current + PAGE_SIZE, displayedVendors.length);
    });
  }, [displayedVendors.length]);

  // ---- Category display name mapping ----
  const getCategoryDisplayName = (catKey: string): string => {
    const map: Record<string, string> = {
      photography: 'Photographers',
      venue: 'Venues',
      catering: 'Catering',
      decor: 'Decorators',
      makeup: 'Makeup Artists',
      entertainment: 'Entertainment',
      priest: 'Priests',
    };
    return map[catKey] || catKey.charAt(0).toUpperCase() + catKey.slice(1);
  };

  const header = useMemo(() => (
    <View className="px-5 pt-8">
      <Text className="text-[#641E3D] text-[24px] tracking-[1.5px] font-serif uppercase text-center mb-6">
        Find Your Vendors
      </Text>

      {/* Modern Search & Filter Bar */}
      <View className="flex-row items-center justify-between mb-6 space-x-3">
        <View className="flex-1 flex-row items-center bg-white rounded-2xl h-14 px-4 shadow-[0_2px_10px_rgba(100,30,61,0.05)] border border-[#F6EEDF] elevation-sm">
          <Search size={20} color="#D7B56D" />
          <TextInput
            placeholder="Search by name or city..."
            placeholderTextColor="#A1A1AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 h-full text-[#1A1A1A] text-[15px] font-medium"
          />
        </View>
        <TouchableOpacity className="bg-[#641E3D] w-14 h-14 rounded-2xl items-center justify-center shadow-[0_4px_12px_rgba(100,30,61,0.25)] elevation-md">
          <Settings2 size={24} color="#FDFBF7" />
        </TouchableOpacity>
      </View>

      {/* Refined Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row" contentContainerStyle={{ paddingRight: 20 }}>
        <TouchableOpacity
          onPress={handleSelectAll}
          className={`${selectedCategories.length === 0 ? 'bg-[#641E3D] shadow-[0_3px_8px_rgba(100,30,61,0.3)]' : 'bg-[#641E3D]/5 border border-[#641E3D]/10'} px-6 h-10 rounded-full justify-center mr-3`}
        >
          <Text className={`${selectedCategories.length === 0 ? 'text-white' : 'text-[#641E3D]'} text-[13px] font-bold tracking-wide`}>
            All
          </Text>
        </TouchableOpacity>
        {Object.keys(allData).map((catKey) => {
          const isActive = selectedCategories.includes(catKey);
          return (
            <TouchableOpacity 
              key={catKey}
              onPress={() => handleFilter(catKey)}
              className={`${isActive ? 'bg-[#641E3D] shadow-[0_3px_8px_rgba(100,30,61,0.3)]' : 'bg-[#641E3D]/5 border border-[#641E3D]/10'} px-6 h-10 rounded-full justify-center mr-3 transition-all`}
            >
              <Text className={`${isActive ? 'text-white' : 'text-[#641E3D]'} text-[13px] font-bold tracking-wide capitalize`}>
                {getCategoryDisplayName(catKey)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  ), [allData, handleFilter, handleSelectAll, searchQuery, selectedCategories]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FDFBF7]">
        <ActivityIndicator size="large" color="#641E3D" />
        <Text className="text-[#641E3D] font-serif mt-4 text-[16px]">Curating Partners...</Text>
      </View>
    );
  }

  const renderVendor = ({ item: vendor }: { item: any }) => (
    <VendorCard
      id={vendor.id}
      businessName={vendor.businessName || vendor.name || fakeText('Vendor Name')}
      category={vendor.category || fakeText('category')}
      city={vendor.city || fakeText('city')}
      cityTier={vendor.cityTier || 0}
      basePrice={vendor.basePrice || 0}
      priceType={vendor.priceType || fakeText('price type')}
      rating={vendor.rating || 0}
      reviewsCount={vendor.reviewsCount ?? vendor.reviews ?? 0}
      status={vendor.status || (vendor.verified ? 'VERIFIED' : fakeText('status'))}
      portfolio={vendor.portfolio || []}
      user={vendor.user}
    />
  );

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <View className="absolute inset-0 bg-gradient-to-b from-[#FFF2E3]/50 to-transparent" />
      {header}
      
      <FlatList
        data={visibleVendors}
        keyExtractor={(item: any, index: number) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderVendor}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20 px-10">
            <Text className="text-[#A1A1AA] text-center font-serif text-[18px]">No luxury vendors found.</Text>
            <Text className="text-[#A1A1AA]/60 text-center text-[12px] mt-2">Adjust your search or filter criteria.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          visibleCount < displayedVendors.length ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#641E3D" />
              <Text className="text-[#9A8F65] text-[10px] font-bold tracking-[1px] uppercase mt-2">
                Loading more vendors...
              </Text>
            </View>
          ) : null
        }
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </View>
  );
}
