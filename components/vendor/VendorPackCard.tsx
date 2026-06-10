import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react-native';

interface VendorPackCardProps {
  pack: {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    tag: string;
    categories: string[];
  };
  onPress: () => void;
}

export function VendorPackCard({ pack, onPress }: VendorPackCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-3xl p-5 mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      {/* Decorative Gradient Background Element */}
      <View 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-5"
        style={{ backgroundColor: '#D2AD6B' }}
      />

      <View className="flex-row justify-between items-start mb-3">
        <View className="bg-[#FEF5E8] px-3 py-1 rounded-full flex-row items-center border border-[#D2AD6B]/20">
          <Sparkles size={10} color="#D2AD6B" strokeWidth={3} />
          <Text className="text-[#9A8F65] text-[10px] font-bold uppercase tracking-wider ml-1">{pack.tag}</Text>
        </View>
        <Text className="text-[#641E3D] text-[18px] font-serif font-bold">{pack.priceLabel}</Text>
      </View>

      <Text className="text-[#1A1A1A] text-[20px] font-serif font-bold mb-1.5">{pack.name}</Text>
      <Text className="text-[#6A6A6A] text-[12px] leading-4.5 mb-4" numberOfLines={2}>
        {pack.description}
      </Text>

      <View className="flex-row flex-wrap mb-4">
        {pack.categories.slice(0, 4).map((cat, idx) => (
          <View key={idx} className="flex-row items-center mr-3 mb-2">
            <CheckCircle2 size={12} color="#D2AD6B" />
            <Text className="text-[#4A4A4A] text-[11px] font-medium ml-1.5">{cat}</Text>
          </View>
        ))}
        {pack.categories.length > 4 && (
          <Text className="text-[#9A8F65] text-[11px] font-bold italic">+{pack.categories.length - 4} more</Text>
        )}
      </View>

      <View className="flex-row items-center justify-between border-t border-[#F1E8DB] pt-4 mt-1">
        <Text className="text-[#D2AD6B] text-[12px] font-bold tracking-wide uppercase">Click to See All Vendors</Text>
        <View className="bg-[#FCF5E8] w-8 h-8 rounded-full items-center justify-center">
          <ChevronRight size={18} color="#D2AD6B" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
