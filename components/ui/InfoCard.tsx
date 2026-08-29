import {
  VellureButton,
  VellureTextInput } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "number-pad" | "email-address" | "phone-pad";
  isIconLoading?: boolean;
  onIconPress?: () => void;
  onCardPress?: () => void;
  iconColor?: string;
  isReadOnly?: boolean;
}

export function InfoCard({
  icon: Icon,
  label,
  value,
  onChangeText,
  keyboardType = "default",
  isIconLoading = false,
  onIconPress,
  onCardPress,
  iconColor = theme.colors.brand.burgundyLight,
  isReadOnly = false
}: InfoCardProps) {
  const CardContent = (
    <>
      {onIconPress && !onCardPress ? (
        <VellureButton
          className="bg-[#FEF6EA] p-3 rounded-2xl mb-3"
          onPress={onIconPress}
          activeOpacity={0.7}
        >
          {isIconLoading ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Icon size={20} strokeWidth={1.5} color={iconColor} />
          )}
        </VellureButton>
      ) : (
        <View className="bg-[#FEF6EA] p-3 rounded-2xl mb-3">
          {isIconLoading ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Icon size={20} strokeWidth={1.5} color={iconColor} />
          )}
        </View>
      )}

      <Text className="text-[#6A6A6A] text-[9px] font-bold tracking-[1px] uppercase mb-1">
        {label}
      </Text>

      {isReadOnly || !onChangeText ? (
        <Text className="text-[#1A1A1A] text-[13px] font-semibold text-center tracking-wide w-full">
          {value}
        </Text>
      ) : (
        <VellureTextInput
          className="text-[#1A1A1A] text-[13px] font-semibold text-center tracking-wide w-full p-0 m-0"
          style={{ outline: 'none' } as any}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          selectionColor={iconColor}
        />
      )}
    </>
  );

  if (onCardPress) {
    return (
      <VellureButton
        activeOpacity={0.7}
        onPress={onCardPress}
        className="w-[48%] bg-white rounded-2xl py-5 px-3 mb-4 items-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] elevation-sm"
      >
        {CardContent}
      </VellureButton>
    );
  }

  return (
    <View className="w-[48%] bg-white rounded-2xl py-5 px-3 mb-4 items-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] elevation-sm">
      {CardContent}
    </View>
  );
}
