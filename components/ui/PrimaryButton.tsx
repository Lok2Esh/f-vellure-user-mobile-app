import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-[#78123C] w-full py-2 rounded-2xl items-center shadow-[0_12px_30px_rgba(120,18,60,0.25)] border-t border-[#FFFFFF]/10"
    >
      <Text className="text-white text-[16px] font-bold tracking-[0.8px] uppercase">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
