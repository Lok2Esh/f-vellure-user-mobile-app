import React from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  width?: string | number;
  onPress?: () => void;
  isReadOnly?: boolean;
}

export function FormInput({ label, icon, width = '100%', onPress, isReadOnly, ...props }: FormInputProps) {
  const innerContent = (
    <View>
      {/* Label & Icon */}
      <View className="flex-row items-center mb-1.5 ml-1">
        {icon}
        <Text className="text-[#9A8F65] text-[9px] font-bold tracking-[1.5px] uppercase ml-1.5">
          {label}
        </Text>
      </View>
      
      {/* Input Field */}
      <View className="bg-white border border-[#E8DCC8] rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] elevation-sm">
        {isReadOnly ? (
          <Text className={props.value ? "text-[#333333] text-[13px]" : "text-[#C4B99A] text-[13px]"}>
            {props.value || props.placeholder}
          </Text>
        ) : (
          <TextInput
            className="text-[#333333] text-[13px] p-0 m-0 w-full"
            style={{ outline: 'none' } as any}
            placeholderTextColor="#C4B99A"
            selectionColor="#D2AD6B"
            {...props}
          />
        )}
      </View>
    </View>
  );

  if (onPress || isReadOnly) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ width: width as any }}>
        {innerContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ width: width as any }}>
      {innerContent}
    </View>
  );
}
