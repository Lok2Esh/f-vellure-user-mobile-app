import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface ActivityItemRowProps {
  title: string;
  subtitle: string;
  timeAgo?: string;
  dotColor?: string;
  showDivider?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function ActivityItemRow({
  title,
  subtitle,
  timeAgo,
  dotColor = '#D2AD6B',
  showDivider = true,
  containerStyle,
}: ActivityItemRowProps) {
  return (
    <View style={containerStyle}>
      <View style={styles.itemRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.copyWrap}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.metaText}>
            {subtitle} {timeAgo ? `• ${timeAgo}` : ''}
          </Text>
        </View>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  copyWrap: {
    flex: 1,
  },
  titleText: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  metaText: {
    color: '#8A7A70',
    fontSize: 10,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#FAF5EC',
    marginVertical: 10,
    marginLeft: 18,
  },
});
