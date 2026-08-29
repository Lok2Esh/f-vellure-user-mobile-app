import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BadgeCheck, ShieldAlert, ShieldCheck } from 'lucide-react-native';

export type VerificationStatus = 'VERIFIED' | 'UNDER_REVIEW' | 'PENDING' | 'SUSPENDED';

export interface VerifiedBadgeProps {
  status?: VerificationStatus | string;
  isVerified?: boolean;
  showExplanationOnPress?: boolean;
  size?: 'small' | 'medium';
}

export function VerifiedBadge({
  status,
  isVerified,
  showExplanationOnPress = true,
  size = 'small',
}: VerifiedBadgeProps) {
  const verified = isVerified ?? (status === 'VERIFIED');

  const handlePress = () => {
    if (!showExplanationOnPress) return;
    if (verified) {
      Alert.alert(
        'Verified Vellure Partner',
        'Vellure has reviewed this vendor’s submitted business credentials, experience records, and portfolio samples. Availability and final pricing require direct partner confirmation.'
      );
    } else {
      Alert.alert(
        'Verification In Progress',
        'This partner has submitted their portfolio and is currently undergoing Vellure marketplace background verification.'
      );
    }
  };

  if (verified) {
    return (
      <TouchableOpacity
        style={[styles.badgeVerified, size === 'medium' && styles.badgeMedium]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Verified partner badge"
      >
        <BadgeCheck size={size === 'medium' ? 13 : 11} color="#287857" />
        <Text style={[styles.textVerified, size === 'medium' && styles.textMedium]}>
          Verified Partner
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.badgeReview, size === 'medium' && styles.badgeMedium]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Under review badge"
    >
      <ShieldAlert size={size === 'medium' ? 13 : 11} color="#B7791F" />
      <Text style={[styles.textReview, size === 'medium' && styles.textMedium]}>
        Under Review
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: '#C2EAD4',
  },
  textVerified: {
    color: '#287857',
    fontSize: 9,
    fontWeight: '800',
  },
  badgeReview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9EE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  textReview: {
    color: '#B7791F',
    fontSize: 9,
    fontWeight: '800',
  },
  badgeMedium: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  textMedium: {
    fontSize: 10,
  },
});
