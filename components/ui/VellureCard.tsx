import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { colors } from '../../constants/theme';
import { VellureButton } from './VellureControls';

export type VellureCardVariant = 'elevated' | 'outlined' | 'champagne' | 'tinted' | 'flat';
export type VellureCardPadding = 'none' | 'small' | 'medium' | 'large';

export interface VellureCardProps {
  variant?: VellureCardVariant;
  padding?: VellureCardPadding;
  onPress?: () => void;
  activeOpacity?: number;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}

export function VellureCard({
  variant = 'elevated',
  padding = 'medium',
  onPress,
  activeOpacity = 0.85,
  accessibilityRole,
  accessibilityLabel,
  style,
  children,
  testID,
}: VellureCardProps) {
  const cardStyle = [
    styles.base,
    variantStyles[variant],
    paddingStyles[padding],
    style,
  ];

  if (onPress) {
    return (
      <VellureButton
        onPress={onPress}
        activeOpacity={activeOpacity}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        style={cardStyle}
        testID={testID}
      >
        {children}
      </VellureButton>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  elevated: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#2D2025',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 16px rgba(45, 32, 37, 0.06)',
      } as any,
    }),
  },
  outlined: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  champagne: {
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  tinted: {
    backgroundColor: '#FCF8F2',
    borderWidth: 1,
    borderColor: 'rgba(210, 173, 107, 0.3)',
  },
  flat: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 0,
  },
});

const paddingStyles = StyleSheet.create({
  none: {
    padding: 0,
  },
  small: {
    padding: 10,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 20,
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
