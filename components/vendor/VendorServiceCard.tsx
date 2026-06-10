import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BadgeCheck, MapPin } from 'lucide-react-native';
import { getServiceMetadata } from '../../constants/services';

interface VendorServiceCardProps {
  category: string;
  amount?: number;
  priceStr?: string; // e.g. "₹700/plate" or "₹45,000"
  vendorName: string | null;
  onActionPress?: () => void;
  variant?: 'grid' | 'list';
  guestCount?: number;
}

export function VendorServiceCard({ 
  category, 
  amount, 
  priceStr, 
  vendorName, 
  onActionPress, 
  variant = 'grid',
  guestCount = 1
}: VendorServiceCardProps) {
  
  const metadata = getServiceMetadata(category);
  const Icon = metadata.icon;

  // --- Logic for Full Price Calculation (if it's a per-plate price) ---
  const formatDisplayPrice = () => {
    if (amount !== undefined) {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    
    if (priceStr && priceStr.includes('/plate')) {
      const perPlate = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
      const total = perPlate * guestCount;
      return `₹${total.toLocaleString('en-IN')}`;
    }
    
    return priceStr || '₹0';
  };

  const getPriceSubtext = () => {
    if (priceStr && priceStr.includes('/plate')) {
      return `(${priceStr} for ${guestCount} guests)`;
    }
    return null;
  };

  const displayPrice = formatDisplayPrice();
  const subtext = getPriceSubtext();

  if (variant === 'list') {
    return (
      <View className="flex-row items-center border border-[#F1E8DB] bg-white rounded-2xl px-4 py-4 mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${metadata.color}10` }} // 10% opacity
        >
          <Icon size={20} color={metadata.color} />
        </View>
        <View className="flex-1">
          <Text className="text-[#9A8F65] text-[10px] font-bold uppercase tracking-widest">{category}</Text>
          <Text className="text-[#1A1A1A] text-[15px] font-bold mb-0.5">{vendorName || 'Not Selected'}</Text>
          <View className="flex-row items-center mt-0.5">
            <MapPin size={10} color="#888" />
            <Text className="text-[#888] text-[11px] ml-1">Patiala, Punjab</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[#641E3D] text-[13px] font-serif font-bold">{displayPrice}</Text>
          {subtext && (
            <Text className="text-[#9A8F65] text-[8px] font-bold mt-1 uppercase">{subtext}</Text>
          )}
        </View>
      </View>
    );
  }

  // --- Grid Variant (Default for Dashboard) ---
  return (
    <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] elevation-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View 
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${metadata.color}15` }}
        >
          <Icon size={22} color={metadata.color} strokeWidth={1.5} />
        </View>
        <View className="flex-row items-center bg-[#FDF9F0] rounded-full px-2 py-0.5 mt-0.5 shadow-sm shadow-[#D2AD6B]/10">
          <BadgeCheck size={9} strokeWidth={2.5} color="#9A8F65" />
          <Text className="text-[#9A8F65] text-[8px] ml-0.5 font-bold uppercase tracking-wide">Verify</Text>
        </View>
      </View>

      <Text className="text-[#4A4A4A] text-[10px] font-extrabold tracking-widest mb-1 uppercase">{category}</Text>
      <Text className="text-[#1A1A1A] text-[15px] font-serif mb-1.5" numberOfLines={1}>{displayPrice}</Text>

      {/* Selected vendor */}
      {vendorName ? (
        <View className="flex-row items-center bg-[#FDFAF3] rounded-lg px-2.5 py-1.5 mb-3">
          <View className="w-[6px] h-[6px] rounded-full mr-1.5" style={{ backgroundColor: metadata.color }} />
          <Text className="text-[#5A4A3A] text-[10px] font-semibold flex-1" numberOfLines={1}>{vendorName}</Text>
        </View>
      ) : (
        <View className="bg-[#FAF7F0] rounded-lg px-2.5 py-1.5 mb-3">
          <Text className="text-[#B8A88A] text-[9px] font-medium text-center italic">Assigning Vendor...</Text>
        </View>
      )}

      <TouchableOpacity 
        onPress={onActionPress}
        className="bg-[#78123C] py-2 rounded-lg items-center justify-center active:opacity-80"
      >
        <Text className="text-white text-[11px] font-bold tracking-wide">Change Vendor</Text>
      </TouchableOpacity>
    </View>
  );
}
