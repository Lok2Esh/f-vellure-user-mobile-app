import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { createNewCustomPackage } from '../../../services/customPackageStore';

export interface PackageServiceItem {
  id: string;
  vendorId?: string;
  category: string;
  serviceName: string;
  vendorName: string;
  vendorImage?: string;
  city?: string;
  estimatedCost: number;
  priceNote: string;
  deliverables: string[];
  rating?: number;
  reviewsCount?: number;
  verified?: boolean;
}

export interface PackageAddon {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  badge?: string;
}

export interface AiCuratedPackage {
  id: string;
  tier: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  badge: string;
  badgeColor?: string;
  totalPrice: number;
  perGuestPrice: number;
  savingsLabel?: string;
  eventType: string;
  city: string;
  guestCount: number;
  servicesIncluded: string[];
  serviceItems: PackageServiceItem[];
  addOns?: PackageAddon[];
  rationale: string;
  highlights: string[];
}

export interface UseAiPackageDetailsOptions {
  pack: AiCuratedPackage | null;
  onSaved?: () => void;
}

export function useAiPackageDetails({ pack, onSaved }: UseAiPackageDetailsOptions) {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedAddonIds([]);
    setIsSaved(false);
  }, [pack?.id]);

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const addOnsTotal = useMemo(() => {
    if (!pack?.addOns) return 0;
    return pack.addOns
      .filter((addon) => selectedAddonIds.includes(addon.id))
      .reduce((sum, addon) => sum + addon.cost, 0);
  }, [pack?.addOns, selectedAddonIds]);

  const dynamicTotal = (pack?.totalPrice ?? 0) + addOnsTotal;
  const dynamicPerGuest = Math.round(
    dynamicTotal / Math.max(1, pack?.guestCount ?? 1)
  );

  const formattedTotal = `₹${dynamicTotal.toLocaleString('en-IN')}`;
  const formattedPerGuest = `₹${dynamicPerGuest.toLocaleString('en-IN')}`;

  const handleSaveToPlans = useCallback(() => {
    if (!pack) return;
    try {
      const activeAddonItems = (pack.addOns || [])
        .filter((a) => selectedAddonIds.includes(a.id))
        .map((a, idx) => ({
          vendorId: `addon_${a.id}_${idx}`,
          businessName: a.name,
          category: a.category,
          city: pack.city,
          basePrice: a.cost,
          priceType: 'FIXED' as const,
          calculatedPrice: a.cost,
          rating: 4.9,
          reviewsCount: 18,
          addedAt: new Date().toISOString(),
        }));

      createNewCustomPackage({
        name: pack.title,
        eventType: pack.eventType,
        city: pack.city,
        guestCount: pack.guestCount,
        targetBudget: dynamicTotal,
        vendors: [
          ...pack.serviceItems.map((s, idx) => ({
            vendorId: s.vendorId || `vendor_${s.id}_${idx}`,
            businessName: s.vendorName,
            category: s.category,
            city: s.city || pack.city,
            image: s.vendorImage,
            basePrice: s.estimatedCost,
            priceType: 'FIXED' as const,
            calculatedPrice: s.estimatedCost,
            rating: s.rating,
            reviewsCount: s.reviewsCount,
            addedAt: new Date().toISOString(),
          })),
          ...activeAddonItems,
        ],
      });

      setIsSaved(true);
      if (onSaved) onSaved();

      Alert.alert(
        'Package Saved!',
        `"${pack.title}" has been saved with ${pack.serviceItems.length + activeAddonItems.length} services (Total: ${formattedTotal}).`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Failed to save package:', err);
    }
  }, [pack, selectedAddonIds, dynamicTotal, formattedTotal, onSaved]);

  return {
    showInquiryModal,
    setShowInquiryModal,
    isSaved,
    selectedAddonIds,
    toggleAddon,
    addOnsTotal,
    dynamicTotal,
    dynamicPerGuest,
    formattedTotal,
    formattedPerGuest,
    handleSaveToPlans,
  };
}
