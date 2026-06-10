import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { ChevronDown } from 'lucide-react-native';

interface FormDropdownProps {
  label: string;
  icon?: React.ReactNode;
  width?: string | number;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FormDropdown({ label, icon, width = '100%', value, options, onChange, placeholder = 'Select...' }: FormDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  const handleSelect = (opt: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange(opt);
    setOpen(false);
  };

  return (
    <View style={{ width: width as any, zIndex: open ? 50 : 1 }}>
      {/* Label & Icon */}
      <View className="flex-row items-center mb-1.5 ml-1">
        {icon}
        <Text className="text-[#9A8F65] text-[9px] font-bold tracking-[1.5px] uppercase ml-1.5">
          {label}
        </Text>
      </View>
      
      {/* Dropdown Field */}
      <TouchableOpacity 
        className="flex-row items-center justify-between bg-white border border-[#E8DCC8] rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] elevation-sm"
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text className={value ? "text-[#333333] text-[13px]" : "text-[#C4B99A] text-[13px]"}>
          {value || placeholder}
        </Text>
        <ChevronDown size={14} color="#9A8F65" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Options List popover */}
      {open && (
        <View className="absolute top-[65px] left-0 right-0 bg-white border border-[#E8DCC8] rounded-xl overflow-hidden shadow-lg elevation-xl z-50">
          {options.map((opt, idx) => (
            <TouchableOpacity 
              key={opt}
              className={`px-4 py-3 ${idx !== options.length - 1 ? 'border-b border-[#F5F0E6]' : ''}`}
              onPress={() => handleSelect(opt)}
            >
              <Text className={`text-[13px] ${value === opt ? 'text-[#641E3D] font-bold tracking-wide' : 'text-[#555]'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
