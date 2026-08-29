import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FolderKanban, Send, Heart, FileCheck, ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/theme';

interface ActivitySummaryGridProps {
  activePlansCount: number;
  enquiriesCount: number;
  savedVendorsCount: number;
  quotesReceivedCount: number;
  onPlansPress: () => void;
  onEnquiriesPress: () => void;
  onSavedVendorsPress: () => void;
  onQuotesPress: () => void;
}

export function ActivitySummaryGrid({
  activePlansCount,
  enquiriesCount,
  savedVendorsCount,
  quotesReceivedCount,
  onPlansPress,
  onEnquiriesPress,
  onSavedVendorsPress,
  onQuotesPress,
}: ActivitySummaryGridProps) {
  const items = [
    {
      id: 'plans',
      label: 'Active Plans',
      count: activePlansCount,
      icon: <FolderKanban size={17} color="#641E3D" />,
      onPress: onPlansPress,
      accessibilityLabel: `View ${activePlansCount} active event plans`,
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      count: enquiriesCount,
      icon: <Send size={17} color="#641E3D" />,
      onPress: onEnquiriesPress,
      accessibilityLabel: `View ${enquiriesCount} sent enquiries`,
    },
    {
      id: 'saved',
      label: 'Saved Vendors',
      count: savedVendorsCount,
      icon: <Heart size={17} color="#641E3D" />,
      onPress: onSavedVendorsPress,
      accessibilityLabel: `View ${savedVendorsCount} saved vendors`,
    },
    {
      id: 'quotes',
      label: 'Quotes Ready',
      count: quotesReceivedCount,
      icon: <FileCheck size={17} color="#2F7D62" />,
      onPress: onQuotesPress,
      accessibilityLabel: `View ${quotesReceivedCount} ready quotations`,
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={item.onPress}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={item.accessibilityLabel}
        >
          <View style={styles.topRow}>
            <View style={styles.iconWrap}>{item.icon}</View>
            <ChevronRight size={13} color="#A08F7E" />
          </View>
          <Text style={styles.countText}>{item.count}</Text>
          <Text style={styles.labelText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    minHeight: 96,
    justifyContent: 'space-between',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#2D2025',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  labelText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
});
