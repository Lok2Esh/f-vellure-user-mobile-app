import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

export interface RatingDisplayProps {
  rating?: number;
  reviewsCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export function RatingDisplay({
  rating,
  reviewsCount,
  size = 'small',
  showCount = true,
}: RatingDisplayProps) {
  const isNew = rating == null || isNaN(rating) || rating <= 0;
  const starSize = size === 'large' ? 16 : size === 'medium' ? 13 : 11;

  if (isNew) {
    return (
      <View style={styles.container}>
        <View style={styles.newBadge}>
          <Text style={[styles.newText, size === 'large' && styles.newTextLarge]}>
            New on Vellure
          </Text>
        </View>
      </View>
    );
  }

  const formattedRating = rating.toFixed(1);
  const countLabel = reviewsCount != null && reviewsCount > 0 ? `(${reviewsCount})` : '';

  return (
    <View style={styles.container}>
      <Star size={starSize} color="#D2AD6B" fill="#D2AD6B" />
      <Text style={[styles.ratingText, size === 'large' && styles.ratingLarge]}>
        {formattedRating}
      </Text>
      {showCount && countLabel ? (
        <Text style={[styles.countText, size === 'large' && styles.countLarge]}>
          {countLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingLarge: {
    fontSize: 14,
  },
  countText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  countLarge: {
    fontSize: 12,
  },
  newBadge: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  newText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '800',
  },
  newTextLarge: {
    fontSize: 11,
  },
});
