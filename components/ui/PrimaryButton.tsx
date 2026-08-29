import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { Text,
} from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <VellureButton
      variant="primary"
      fullWidth
      activeOpacity={0.8}
      onPress={onPress}
      className="py-2 rounded-2xl shadow-[0_12px_30px_rgba(120,18,60,0.25)] border-t border-[#FFFFFF]/10"
    >
      <Text className="text-white text-[16px] font-bold tracking-[0.8px] uppercase">
        {title}
      </Text>
    </VellureButton>
  );
}
