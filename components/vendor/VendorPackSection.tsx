import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState,
  useEffect } from 'react';
import { View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, ChevronRight, LayoutList } from 'lucide-react-native';
import { fetchVendorPacks } from '../../services/api';
import { VendorPackCard } from './VendorPackCard';
import { VendorPackDetailModal } from './VendorPackDetailModal';

interface VendorPackSectionProps {
  budget: number;
  guestCount: number;
}

export function VendorPackSection({ budget, guestCount }: VendorPackSectionProps) {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPacks = async () => {
      setLoading(true);
      try {
        const data = await fetchVendorPacks(budget);
        if (isMounted) setPacks(data);
      } catch (error) {
        console.error('Failed to load vendor packs:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPacks();
    return () => { isMounted = false; };
  }, [budget]);

  const handlePackPress = (pack: any) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="small" color="#641E3D" />
        <Text className="text-[#9A8F65] text-[10px] font-bold tracking-[1px] uppercase mt-2.5">
          Curating ideal packs...
        </Text>
      </View>
    );
  }

  if (packs.length === 0) {
    return null;
  }

  return (
    <View className="mt-8 mb-10">
      <View className="flex-row items-center justify-between mb-4 px-1">
        <View className="flex-row items-center">
          <View className="bg-[#FEF5E8] w-8 h-8 rounded-full items-center justify-center mr-2.5">
            <LayoutList size={14} color="#D2AD6B" strokeWidth={2.5} />
          </View>
          <Text className="text-[#641E3D] text-[14px] font-bold tracking-[1.5px] uppercase">
            Curated Vendor Packs
          </Text>
        </View>
        <VellureButton className="flex-row items-center">
          <Text className="text-[#9A8F65] text-[10px] font-bold uppercase mr-1">View All</Text>
          <ChevronRight size={10} color="#9A8F65" strokeWidth={3} />
        </VellureButton>
      </View>

      <View className="px-1">
        {packs.map((pack) => (
          <VendorPackCard
            key={pack.id}
            pack={pack}
            onPress={() => handlePackPress(pack)}
          />
        ))}
      </View>

      <VendorPackDetailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pack={selectedPack}
        guestCount={guestCount}
      />
    </View>
  );
}
