import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface MetricStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  variant?: 'dark' | 'light' | 'card' | 'gold';
  containerStyle?: StyleProp<ViewStyle>;
}

export function MetricStatCard({
  label,
  value,
  icon,
  subtext,
  variant = 'card',
  containerStyle,
}: MetricStatCardProps) {
  const isDark = variant === 'dark';
  const isGold = variant === 'gold';
  const isLight = variant === 'light';

  return (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        isGold && styles.containerGold,
        isLight && styles.containerLight,
        containerStyle,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text
        style={[
          styles.valueText,
          isDark && styles.valueTextDark,
          isGold && styles.valueTextGold,
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.labelText,
          isDark && styles.labelTextDark,
          isGold && styles.labelTextGold,
        ]}
      >
        {label}
      </Text>
      {subtext ? (
        <Text
          style={[
            styles.subtext,
            isDark && styles.subtextDark,
            isGold && styles.subtextGold,
          ]}
        >
          {subtext}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'transparent',
  },
  containerGold: {
    backgroundColor: 'rgba(210, 173, 107, 0.12)',
    borderColor: 'rgba(210, 173, 107, 0.3)',
    shadowColor: 'transparent',
  },
  containerLight: {
    backgroundColor: '#FAF5EC',
    borderColor: '#EFE3CF',
    shadowColor: 'transparent',
  },
  iconWrap: {
    marginBottom: 4,
  },
  valueText: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
  },
  valueTextDark: {
    color: '#FFFFFF',
  },
  valueTextGold: {
    color: '#D2AD6B',
  },
  labelText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  labelTextDark: {
    color: '#D4C6CE',
  },
  labelTextGold: {
    color: '#8A6A23',
  },
  subtext: {
    color: '#786B70',
    fontSize: 9,
    marginTop: 2,
  },
  subtextDark: {
    color: '#A08F7E',
  },
  subtextGold: {
    color: '#9A8F65',
  },
});
