import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { X, Sparkles, CheckCircle2, MapPin, Award } from 'lucide-react-native';
import { VendorServiceCard } from './VendorServiceCard';

interface VendorPackDetailModalProps {
  visible: boolean;
  onClose: () => void;
  pack: {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    tag: string;
    vendors: Array<{ category: string; name: string; price: string }>;
  } | null;
  guestCount: number;
}

export function VendorPackDetailModal({ visible, onClose, pack, guestCount }: VendorPackDetailModalProps) {
  if (!pack) return null;

  // Calculate actual total
  const calculatedTotal = pack.vendors.reduce((sum, vendor) => {
    const priceStr = vendor.price;
    if (priceStr.includes('/plate')) {
      const perPlate = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
      return sum + (perPlate * guestCount);
    }
    return sum + parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  }, 0);

  const formattedTotal = `₹${calculatedTotal.toLocaleString('en-IN')}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-[#FDFBF7] rounded-t-[40px] px-6 pt-8 pb-10" style={{ maxHeight: '85%' }}>
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <View className="bg-[#FEF5E8] px-3 py-1 rounded-full self-start flex-row items-center mb-2">
                <Sparkles size={10} color="#D2AD6B" strokeWidth={3} />
                <Text className="text-[#9A8F65] text-[10px] font-bold uppercase tracking-wider ml-1">{pack.tag}</Text>
              </View>
              <Text className="text-[#1A1A1A] text-[24px] font-serif font-bold">{pack.name}</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="bg-[#F1E8DB] w-10 h-10 rounded-full items-center justify-center"
            >
              <X size={20} color="#641E3D" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
            <Text className="text-[#6A6A6A] text-[14px] leading-5.5 mb-8">
              {pack.description}
            </Text>

            <View className="flex-row items-center mb-5">
              <Award size={18} color="#D2AD6B" strokeWidth={1.5} />
              <Text className="text-[#1A1A1A] text-[16px] font-serif font-bold ml-2">Included Vendors & Services</Text>
            </View>

            {pack.vendors.map((vendor, index) => (
              <VendorServiceCard
                key={index}
                category={vendor.category}
                priceStr={vendor.price}
                vendorName={vendor.name}
                variant="list"
                guestCount={guestCount}
              />
            ))}

            <View className="bg-[#78123C]/5 border border-[#78123C]/10 rounded-2xl p-5 mt-4 mb-8">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#641E3D] text-[15px] font-bold">Total Pack Estimate</Text>
                <Text className="text-[#641E3D] text-[22px] font-serif font-bold">{formattedTotal}</Text>
              </View>
              <Text className="text-[#9E5070] text-[11px] italic">Final price may vary based on specific customizations.</Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity 
            className="bg-[#78123C] w-full py-2 rounded-2xl items-center shadow-[0_12px_30px_rgba(120,18,60,0.25)] border-t border-white/10"
            onPress={onClose}
          >
            <Text className="text-white text-[16px] font-bold tracking-[0.8px] uppercase">Select This Bundle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
