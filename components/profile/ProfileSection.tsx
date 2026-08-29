import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/theme';

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ProfileSection({ title, subtitle, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badgeValue?: string | number;
  badgeType?: 'default' | 'gold' | 'success';
  onPress: () => void;
  isLast?: boolean;
  destructive?: boolean;
  accessibilityLabel?: string;
}

export function ProfileMenuItem({
  icon,
  title,
  description,
  badgeValue,
  badgeType = 'default',
  onPress,
  isLast = false,
  destructive = false,
  accessibilityLabel,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
        {icon}
      </View>

      <View style={styles.copyCol}>
        <Text style={[styles.itemTitle, destructive && styles.itemTitleDestructive]}>
          {title}
        </Text>
        {description ? <Text style={styles.itemDescription}>{description}</Text> : null}
      </View>

      {badgeValue !== undefined && badgeValue !== null && (
        <View
          style={[
            styles.badgeWrap,
            badgeType === 'gold' && styles.badgeGold,
            badgeType === 'success' && styles.badgeSuccess,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              badgeType === 'gold' && styles.badgeTextGold,
              badgeType === 'success' && styles.badgeTextSuccess,
            ]}
          >
            {badgeValue}
          </Text>
        </View>
      )}

      <ChevronRight
        size={16}
        color={destructive ? '#B63A4A' : '#A08F7E'}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
    marginLeft: 4,
  },
  sectionSubtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapDestructive: {
    backgroundColor: '#FEE2E2',
  },
  copyCol: {
    flex: 1,
  },
  itemTitle: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '800',
  },
  itemTitleDestructive: {
    color: '#B63A4A',
  },
  itemDescription: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
    fontWeight: '500',
  },
  badgeWrap: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  badgeGold: {
    backgroundColor: '#FAF1E3',
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextGold: {
    color: '#8A6A23',
  },
  badgeTextSuccess: {
    color: '#15803D',
  },
});
