import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../constants/theme';

export type VellureTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'price';

export type VellureTextColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'brand'
  | 'gold'
  | 'success'
  | 'error';

export interface VellureTextProps extends RNTextProps {
  variant?: VellureTextVariant;
  color?: VellureTextColor;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'heavy';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function VellureText({
  variant = 'body',
  color = 'default',
  weight,
  align,
  style,
  children,
  ...rest
}: VellureTextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});

const colorStyles = StyleSheet.create({
  default: {
    color: colors.textPrimary,
  },
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textSecondary,
  },
  muted: {
    color: colors.textMuted,
  },
  inverse: {
    color: colors.textInverse,
  },
  brand: {
    color: colors.primary,
  },
  gold: {
    color: colors.goldDark,
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.error,
  },
});

const weightStyles = StyleSheet.create({
  normal: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  heavy: { fontWeight: '800' },
});
