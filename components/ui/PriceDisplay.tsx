import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { IndianRupee } from 'lucide-react-native';
import { colors } from '../../constants/theme';

export type VendorPriceType =
  | 'PER_PLATE'
  | 'PER_PERSON'
  | 'PER_DAY'
  | 'PER_EVENT'
  | 'PER_HOUR'
  | 'PER_ROOM'
  | 'PER_ITEM'
  | 'FIXED_PACKAGE'
  | 'STARTING_PRICE'
  | 'QUOTE_REQUIRED';

export interface PriceDisplayProps {
  price?: number | string;
  priceType?: VendorPriceType | string;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  unitStyle?: StyleProp<TextStyle>;
  tone?: 'default' | 'inverse';
}

export function formatPriceUnit(priceType?: string): string {
  if (!priceType) return 'Starting price';
  switch (priceType.toUpperCase()) {
    case 'PER_PLATE':
      return 'per plate';
    case 'PER_PERSON':
      return 'per person';
    case 'PER_DAY':
      return 'per day';
    case 'PER_EVENT':
      return 'per event';
    case 'PER_HOUR':
      return 'per hour';
    case 'PER_ROOM':
      return 'per room / night';
    case 'PER_ITEM':
      return 'per item';
    case 'FIXED':
      return 'fixed price';
    case 'FIXED_PACKAGE':
      return 'fixed package';
    case 'STARTING_PRICE':
      return 'starting from';
    case 'QUOTE_REQUIRED':
      return 'custom quote';
    default:
      return priceType;
  }
}

export function PriceDisplay({
  price,
  priceType = 'STARTING_PRICE',
  size = 'medium',
  containerStyle,
  textStyle,
  unitStyle,
  tone = 'default',
}: PriceDisplayProps) {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  const isQuoteRequired = !numericPrice || isNaN(numericPrice) || numericPrice <= 0 || priceType === 'QUOTE_REQUIRED';
  const unitLabel = formatPriceUnit(priceType);

  if (isQuoteRequired) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text
          style={[
            styles.quoteRequiredText,
            size === 'large' && styles.quoteRequiredLarge,
            tone === 'inverse' && styles.quoteRequiredInverse,
            textStyle,
          ]}
        >
          Custom Quote on Request
        </Text>
      </View>
    );
  }

  const formattedAmount = `₹${numericPrice.toLocaleString('en-IN')}`;
  const isPrefix = priceType === 'STARTING_PRICE';

  return (
    <View style={[styles.container, containerStyle]}>
      {isPrefix ? (
        <Text
          style={[
            styles.prefixText,
            size === 'large' && styles.prefixLarge,
            tone === 'inverse' && styles.supportingTextInverse,
            unitStyle,
          ]}
        >
          Starting from{' '}
        </Text>
      ) : null}

      <Text
        style={[
          styles.amountText,
          size === 'small' && styles.amountSmall,
          size === 'large' && styles.amountLarge,
          tone === 'inverse' && styles.amountInverse,
          textStyle,
        ]}
      >
        {formattedAmount}
      </Text>

      {!isPrefix && unitLabel ? (
        <Text
          style={[
            styles.unitText,
            size === 'large' && styles.unitLarge,
            tone === 'inverse' && styles.supportingTextInverse,
            unitStyle,
          ]}
        >
          {' '}{unitLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  amountText: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '900',
  },
  amountSmall: {
    fontSize: 12,
  },
  amountLarge: {
    fontSize: 22,
    lineHeight: 27,
  },
  amountInverse: {
    color: '#F4D58D',
  },
  prefixText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  prefixLarge: {
    fontSize: 13,
  },
  unitText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  unitLarge: {
    fontSize: 12,
  },
  quoteRequiredText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  quoteRequiredLarge: {
    fontSize: 14,
  },
  supportingTextInverse: {
    color: '#F4E8D6',
  },
  quoteRequiredInverse: {
    color: '#F4D58D',
  },
});
