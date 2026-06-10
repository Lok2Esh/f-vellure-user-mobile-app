import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { theme } from '../../constants/theme';

export interface CityEntry {
  city: string;
  state: string;
}

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  cities: CityEntry[];
}

export function CityPickerModal({ visible, onClose, onSelect, cities }: CityPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group and filter cities
  const groupedCities = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    const filtered = term 
      ? cities.filter(c => c.city.toLowerCase().includes(term) || c.state.toLowerCase().includes(term))
      : cities;

    const grouped: Record<string, string[]> = {};
    for (const c of filtered) {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c.city);
    }
    
    // Sort states alphabetically
    return Object.keys(grouped).sort().map(state => ({
      state,
      cities: grouped[state].sort()
    }));
  }, [cities, searchQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
        style={{ backgroundColor: theme.colors.background.modalOverlay }}
      >
        <View className="h-[80%] rounded-t-[32px] overflow-hidden shadow-2xl elevation-xl" style={{ backgroundColor: theme.colors.background.primary }}>
          
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-5 border-b" style={{ borderColor: theme.colors.border.light }}>
            <View className="flex-row items-center">
              <MapPin size={20} color={theme.colors.brand.burgundyDark} strokeWidth={2} />
              <Text className="text-[18px] font-bold tracking-wide ml-2" style={{ color: theme.colors.brand.burgundyDark }}>
                Select City
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2 rounded-full" style={{ backgroundColor: theme.colors.background.iconContainer }}>
              <X size={18} color={theme.colors.brand.burgundyLight || theme.colors.brand.goldDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-5 py-4 border-b" style={{ borderColor: theme.colors.border.light, backgroundColor: '#FFFFFF' }}>
            <View className="flex-row items-center rounded-xl px-4 py-3 border" style={{ backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.medium }}>
              <Search size={18} color={theme.colors.text.tertiary} strokeWidth={2} />
              <TextInput
                className="flex-1 ml-3 text-[15px] p-0"
                style={{ color: theme.colors.text.primary, outline: 'none' } as any}
                placeholder="Search city or state..."
                placeholderTextColor={theme.colors.text.disabled}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
                selectionColor={theme.colors.brand.gold}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {groupedCities.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <Text style={{ color: theme.colors.text.tertiary }} className="text-[14px]">No cities found</Text>
              </View>
            ) : (
              groupedCities.map(group => (
                <View key={group.state} className="mb-2">
                  <View className="px-6 py-2 bg-[#F9F7F2]">
                    <Text className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: theme.colors.brand.goldDark }}>
                      {group.state}
                    </Text>
                  </View>
                  {group.cities.map(city => (
                    <TouchableOpacity 
                      key={city}
                      className="px-6 py-4 border-b ml-6"
                      style={{ borderColor: theme.colors.border.light }}
                      onPress={() => onSelect(city)}
                      activeOpacity={0.6}
                    >
                      <Text className="text-[15px] font-medium" style={{ color: theme.colors.text.secondary }}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
