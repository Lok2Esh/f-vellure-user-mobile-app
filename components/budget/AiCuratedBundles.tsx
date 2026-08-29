import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package, Sparkles } from 'lucide-react-native';
import { PackageCard } from '../ui/PackageCard';

export interface AiCuratedBundlesProps {
  eventType: string;
  guestCount: number;
  city: string;
  totalBudget: number;
  onInquireBundle: (bundle: any) => void;
}

export function AiCuratedBundles({
  eventType,
  guestCount,
  city,
  totalBudget,
  onInquireBundle,
}: AiCuratedBundlesProps) {
  // Curated starter bundles dynamically calibrated to the user's celebration parameters
  const isEngagement = eventType === 'Engagement';
  const isWedding = eventType === 'Wedding';

  const bundles = isEngagement
    ? [
        {
          id: 'bundle_eng_intimate',
          title: 'Royal Lawn & Floral Engagement Bundle',
          tagline: `Outdoor lawn + Floral ring stage + Live acoustic setup in ${city}`,
          eventType: 'Engagement',
          city: city,
          guestCount: guestCount || 150,
          estimatedPrice: Math.round(totalBudget * 0.85) || 340000,
          includedServices: ['Outdoor Lawn Venue', 'Pastel Floral Mandap', '2 Cinematic Photographers', 'Live Acoustic Trio'],
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        },
      ]
    : [
        {
          id: 'bundle_wed_royal',
          title: 'Heritage Palace & Feast Grand Suite',
          tagline: `Royal Venue + Gourmet Punjabi Feast for ${guestCount || 250} guests in ${city}`,
          eventType: 'Wedding',
          city: city,
          guestCount: guestCount || 250,
          estimatedPrice: Math.round(totalBudget * 0.9) || 1350000,
          includedServices: ['Royal Banquet Hall', '3-Course Gourmet Feast', 'Bespoke Floral Arch', 'LED Stage & Sound'],
          image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
        },
      ];

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Package size={12} color="#641E3D" />
        <Text style={styles.badgeText}>Curated Multi-Vendor Packages</Text>
      </View>
      <Text style={styles.heading}>Recommended Starter Celebration Bundles</Text>
      <Text style={styles.subText}>
        Pre-configured packages combining venue, decor, and audio-visuals for seamless execution.
      </Text>

      {bundles.map((b) => (
        <PackageCard
          key={b.id}
          pack={b}
          onInquire={() => onInquireBundle(b)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    color: '#641E3D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heading: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  subText: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
});
