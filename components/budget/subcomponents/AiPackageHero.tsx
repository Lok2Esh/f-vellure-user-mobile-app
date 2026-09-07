import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { X, Sparkles, MapPin } from 'lucide-react-native';
import { VellureButton } from '../../ui/VellureControls';
import { VellureBadge } from '../../ui/VellureBadge';
import { VellureText } from '../../ui/VellureText';

export interface AiPackageHeroProps {
  title: string;
  tagline: string;
  image: string;
  badge: string;
  badgeColor?: string;
  city: string;
  onClose: () => void;
}

export function AiPackageHero({
  title,
  tagline,
  image,
  badge,
  badgeColor = '#D2AD6B',
  city,
  onClose,
}: AiPackageHeroProps) {
  return (
    <View style={styles.heroWrap}>
      <Image source={{ uri: image }} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroGradient} />

      <VellureButton
        onPress={onClose}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Close package details"
      >
        <X size={18} color="#FFFFFF" />
      </VellureButton>

      <View style={styles.heroBadgeRow}>
        <VellureBadge
          label={badge.toUpperCase()}
          tone="custom"
          customBgColor={badgeColor}
          customTextColor="#FFFFFF"
          size="small"
          icon={<Sparkles size={11} color="#FFFFFF" strokeWidth={2.5} />}
        />
        <VellureBadge
          label={city}
          tone="glass"
          size="small"
          icon={<MapPin size={11} color="#FFFFFF" />}
        />
      </View>

      <View style={styles.heroTitleWrap}>
        <VellureText variant="h2" color="inverse" weight="heavy" numberOfLines={2}>
          {title}
        </VellureText>
        <VellureText variant="bodySmall" color="secondary" style={styles.heroTagline} numberOfLines={2}>
          {tagline}
        </VellureText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    height: 200,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 10, 18, 0.65)',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitleWrap: {
    marginTop: 6,
  },
  heroTagline: {
    color: '#EFE3CF',
    marginTop: 2,
  },
});
