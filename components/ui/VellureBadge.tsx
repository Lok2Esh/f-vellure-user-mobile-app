import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/theme';
import { VellureButton } from './VellureControls';
import { VellureText } from './VellureText';

export type VellureBadgeTone =
  | 'primary'
  | 'gold'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'glass'
  | 'custom';

export type VellureBadgeSize = 'small' | 'medium' | 'large';

export interface VellureBadgeProps {
  label: string;
  tone?: VellureBadgeTone;
  size?: VellureBadgeSize;
  icon?: React.ReactNode;
  customBgColor?: string;
  customTextColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function VellureBadge({
  label,
  tone = 'primary',
  size = 'small',
  icon,
  customBgColor,
  customTextColor,
  onPress,
  style,
  textStyle,
}: VellureBadgeProps) {
  const content = (
    <>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <VellureText
        variant={size === 'large' ? 'bodySmall' : 'caption'}
        weight="bold"
        style={[
          styles.text,
          sizeStyles[size].text,
          toneTextStyles[tone],
          customTextColor ? { color: customTextColor } : null,
          textStyle,
        ]}
      >
        {label}
      </VellureText>
    </>
  );

  const containerStyle = [
    styles.base,
    sizeStyles[size].container,
    toneBgStyles[tone],
    customBgColor ? { backgroundColor: customBgColor } : null,
    style,
  ];

  if (onPress) {
    return (
      <VellureButton
        onPress={onPress}
        style={containerStyle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </VellureButton>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  iconWrap: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.2,
  },
});

const sizeStyles = {
  small: StyleSheet.create({
    container: {
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    text: {
      fontSize: 10,
      lineHeight: 13,
    },
  }),
  medium: StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    text: {
      fontSize: 11,
      lineHeight: 15,
    },
  }),
  large: StyleSheet.create({
    container: {
      paddingHorizontal: 13,
      paddingVertical: 6,
    },
    text: {
      fontSize: 12,
      lineHeight: 16,
    },
  }),
};

const toneBgStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  gold: {
    backgroundColor: colors.gold,
  },
  success: {
    backgroundColor: '#E7F7EF',
    borderWidth: 1,
    borderColor: '#C3EBD5',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  error: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  neutral: {
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  glass: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  custom: {},
});

const toneTextStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
  },
  gold: {
    color: '#FFFFFF',
  },
  success: {
    color: '#166534',
  },
  warning: {
    color: '#92400E',
  },
  error: {
    color: '#991B1B',
  },
  neutral: {
    color: colors.textPrimary,
  },
  glass: {
    color: '#FFFFFF',
  },
  custom: {},
});
