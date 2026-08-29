import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  X,
  Heart,
  Search,
  Star,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { toggleSaveVendorId } from '../../services/api';
import { colors } from '../../constants/theme';
import { EmptyStateCard } from '../ui/EmptyStateCard';
import { VellureSearchInput } from '../ui/VellureInputField';

interface SavedVendorsModalProps {
  visible: boolean;
  savedVendors: any[];
  onClose: () => void;
  onVendorRemoved: (vendorId: string) => void;
}

export function SavedVendorsModal({
  visible,
  savedVendors,
  onClose,
  onVendorRemoved,
}: SavedVendorsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(savedVendors.map((v) => v.category || 'Vendor')))];

  const filtered = savedVendors.filter((v) => {
    const matchesCat = selectedCategory === 'All' || (v.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const name = (v.businessName || v.name || '').toLowerCase();
    const city = (v.city || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || name.includes(q) || city.includes(q);
    return matchesCat && matchesSearch;
  });

  const handleRemove = async (vendorId: string, vendorName: string) => {
    await toggleSaveVendorId(vendorId);
    onVendorRemoved(vendorId);
  };

  const handleOpenVendor = (vendorId: string) => {
    onClose();
    router.push(`/vendor/${vendorId}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Saved Vendors Wishlist</Text>
              <Text style={styles.subtitle}>{savedVendors.length} Shortlisted Partners</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          {/* Search bar */}
          <VellureSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search saved partners or cities..."
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Categories */}
          {categories.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {categories.map((c) => (
                <VellureButton
                  key={c}
                  style={[styles.catChip, selectedCategory === c && styles.catChipActive]}
                  onPress={() => setSelectedCategory(c)}
                >
                  <Text style={[styles.catChipText, selectedCategory === c && styles.catChipTextActive]}>
                    {c}
                  </Text>
                </VellureButton>
              ))}
            </ScrollView>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {filtered.length === 0 ? (
              <EmptyStateCard
                icon={<Heart size={32} color="#D2AD6B" />}
                title="No Saved Partners Found"
                description={
                  savedVendors.length === 0
                    ? 'Shortlist verified venues, caterers, and decorators from the marketplace for fast comparison.'
                    : 'No saved vendors match your search filters.'
                }
                actionText="Explore Marketplace"
                onAction={() => {
                  onClose();
                  router.push('/(tabs)/vendors');
                }}
              />
            ) : (
              filtered.map((vendor) => {
                const imgUri =
                  vendor.image ||
                  (Array.isArray(vendor.portfolio) && vendor.portfolio[0]?.imageUrl) ||
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
                return (
                  <View key={vendor.id} style={styles.card}>
                    <VellureButton
                      style={styles.cardLeft}
                      onPress={() => handleOpenVendor(vendor.id)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: imgUri }} style={styles.thumb} />
                      <View style={styles.info}>
                        <Text style={styles.catText}>{vendor.category || 'Vendor'}</Text>
                        <Text style={styles.nameText} numberOfLines={1}>
                          {vendor.businessName || vendor.name}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Star size={11} color="#D4AF37" fill="#D4AF37" />
                          <Text style={styles.ratingText}>
                            {vendor.rating ? vendor.rating.toFixed(1) : '4.8'}
                          </Text>
                          <Text style={styles.cityText}>• {vendor.city || 'India'}</Text>
                        </View>
                        <Text style={styles.priceText}>
                          {vendor.basePrice
                            ? `Starting at ₹${vendor.basePrice.toLocaleString('en-IN')}`
                            : 'Quote on Request'}
                        </Text>
                      </View>
                    </VellureButton>

                    <VellureButton
                      style={styles.trashBtn}
                      onPress={() => handleRemove(vendor.id, vendor.businessName || vendor.name)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Remove from wishlist"
                    >
                      <Trash2 size={16} color="#B63A4A" />
                    </VellureButton>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#641E3D',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '600',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  catScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  scroll: {
    paddingBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#2A121E',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  catText: {
    color: '#8A7A70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  nameText: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  ratingText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '800',
  },
  cityText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
  },
  priceText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
