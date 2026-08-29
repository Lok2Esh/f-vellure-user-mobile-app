import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Sparkles, Send, CheckCircle2, ChevronRight } from 'lucide-react-native';

export interface PackageCardProps {
  pack: {
    id: string;
    title?: string;
    name?: string;
    tagline?: string;
    description?: string;
    category?: string;
    eventType?: string;
    city?: string;
    guestCount?: number;
    estimatedPrice?: number;
    priceLabel?: string;
    includedServices?: string[];
    categories?: string[];
    image?: string;
    tag?: string;
  };
  onPress?: () => void;
  onInquire?: () => void;
  variant?: 'compact' | 'full';
  containerStyle?: StyleProp<ViewStyle>;
}

export function PackageCard({
  pack,
  onPress,
  onInquire,
  variant = 'full',
  containerStyle,
}: PackageCardProps) {
  const title = pack.title || pack.name || 'Curated Package';
  const tagline = pack.tagline || pack.description || '';
  const eventType = pack.eventType || pack.tag || 'Curated';
  const price = pack.estimatedPrice
    ? `₹${pack.estimatedPrice.toLocaleString('en-IN')}`
    : pack.priceLabel || '';
  const services = pack.includedServices || pack.categories || [];

  if (variant === 'compact') {
    return (
      <VellureButton
        activeOpacity={0.88}
        onPress={onPress || onInquire}
        style={[styles.compactCard, containerStyle]}
      >
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Sparkles size={10} color="#8A6A23" />
            <Text style={styles.badgeText}>{eventType}</Text>
          </View>
          <Text style={styles.priceText}>{price}</Text>
        </View>

        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.taglineText} numberOfLines={2}>
          {tagline}
        </Text>

        <View style={styles.servicesGrid}>
          {services.slice(0, 3).map((srv, idx) => (
            <View key={idx} style={styles.servicePill}>
              <Text style={styles.servicePillText}>✓ {srv}</Text>
            </View>
          ))}
          {services.length > 3 && (
            <Text style={styles.moreText}>+{services.length - 3} more</Text>
          )}
        </View>
      </VellureButton>
    );
  }

  return (
    <View style={[styles.card, containerStyle]}>
      {pack.image ? (
        <Image source={{ uri: pack.image }} style={styles.coverImage} resizeMode="cover" />
      ) : null}

      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Sparkles size={10} color="#8A6A23" />
            <Text style={styles.badgeText}>{eventType}</Text>
          </View>
          <Text style={styles.priceText}>Est. {price}</Text>
        </View>

        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.taglineText}>{tagline}</Text>

        <View style={styles.servicesGrid}>
          {services.map((srv, idx) => (
            <View key={idx} style={styles.servicePill}>
              <Text style={styles.servicePillText}>✓ {srv}</Text>
            </View>
          ))}
        </View>

        {onInquire ? (
          <VellureButton
            style={styles.inquireBtn}
            onPress={onInquire}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Request quotes for ${title}`}
          >
            <Send size={13} color="#FFFFFF" />
            <Text style={styles.inquireBtnText}>Request Quotes for this Bundle</Text>
          </VellureButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  badgeText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '900',
  },
  titleText: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  taglineText: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  servicePill: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  servicePillText: {
    color: '#4A3E44',
    fontSize: 10,
    fontWeight: '700',
  },
  moreText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
    alignSelf: 'center',
    marginLeft: 4,
  },
  inquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  inquireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
