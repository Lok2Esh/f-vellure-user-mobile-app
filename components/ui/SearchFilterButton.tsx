import { VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { Text, View, TouchableOpacityProps } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface SearchFilterButtonProps extends TouchableOpacityProps {
  title?: string;
}

export const SearchFilterButton = ({ title = "SEARCH & FILTER", style, ...props }: SearchFilterButtonProps) => {
  return (
    <VellureButton
      activeOpacity={0.8}
      className="w-full mb-2"
      style={[{
        shadowColor: '#A98236',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6
      }, style]}
      {...props}
    >
      <View style={{
        position: 'relative',
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#E8CA83'
      }}>
        {/* Background Gradient */}
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F6E7B9" stopOpacity="1" />
              <Stop offset="20%" stopColor="#D5AE59" stopOpacity="1" />
              <Stop offset="80%" stopColor="#C39D48" stopOpacity="1" />
              <Stop offset="100%" stopColor="#A27D2F" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#goldGrad)" />
        </Svg>

        {/* Inner Highlight for 3D bevel effect */}
        <View style={{
          position: 'absolute',
          top: 1, left: 1, right: 1, bottom: 1,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)'
        }} />

        {/* Content */}
        <View style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{
            color: '#2A141A',
            fontSize: 14,
            fontWeight: '800',
            letterSpacing: 0.5
          }}>
            {title}
          </Text>
        </View>
      </View>
    </VellureButton>
  );
};

