import React from 'react';
import { Image, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { Camera, Images } from 'lucide-react-native';
import { VellureButton } from './VellureControls';

export type CollageImage = {
  uri: string;
  accessibilityLabel?: string;
};

export type ImageCollageProps = {
  images: CollageImage[];
  onOpen: (index: number) => void;
  height?: number;
  roundedTopOnly?: boolean;
  style?: StyleProp<ViewStyle>;
  featuredBadgeText?: string;
  hideEmptyState?: boolean;
};

export function ImageCollage({
  images,
  onOpen,
  height = 210,
  roundedTopOnly = false,
  style,
  featuredBadgeText = 'Featured work',
  hideEmptyState = false,
}: ImageCollageProps) {
  if (!images || images.length === 0) {
    if (hideEmptyState) return null;
    return (
      <View style={[styles.empty, { height }, style]}>
        <Camera size={26} color="#D2AD6B" />
        <Text style={styles.emptyTitle}>Photos coming soon</Text>
        <Text style={styles.emptyCopy}>This celebration does not have shared photos yet.</Text>
      </View>
    );
  }

  const containerRadiusStyle = roundedTopOnly
    ? styles.roundedTopOnly
    : styles.roundedAll;

  // 1 Photo: Full-width Card Hero
  if (images.length === 1) {
    return (
      <View style={[styles.collage, { height }, containerRadiusStyle, style]}>
        <VellureButton
          style={styles.fullButton}
          onPress={() => onOpen(0)}
          activeOpacity={0.92}
          accessibilityLabel={images[0].accessibilityLabel || 'Open featured celebration photo'}
        >
          <Image source={{ uri: images[0].uri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.featureBadge}>
            <Camera size={10} color="#FFFFFF" />
            <Text style={styles.featureBadgeText}>{featuredBadgeText}</Text>
          </View>
        </VellureButton>
      </View>
    );
  }

  // 2 Photos: Side-by-side 50/50 Split
  if (images.length === 2) {
    return (
      <View style={[styles.collage, { height }, containerRadiusStyle, style]}>
        <VellureButton
          style={styles.halfButton}
          onPress={() => onOpen(0)}
          activeOpacity={0.9}
          accessibilityLabel={images[0].accessibilityLabel || 'Open celebration photo 1'}
        >
          <Image source={{ uri: images[0].uri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.featureBadge}>
            <Camera size={10} color="#FFFFFF" />
            <Text style={styles.featureBadgeText}>{featuredBadgeText}</Text>
          </View>
        </VellureButton>

        <VellureButton
          style={styles.halfButton}
          onPress={() => onOpen(1)}
          activeOpacity={0.9}
          accessibilityLabel={images[1].accessibilityLabel || 'Open celebration photo 2'}
        >
          <Image source={{ uri: images[1].uri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.countBadge}>
            <Images size={10} color="#FFFFFF" />
            <Text style={styles.countBadgeText}>2 Photos</Text>
          </View>
        </VellureButton>
      </View>
    );
  }

  // 3 Photos: 1 Hero Left + 2 Stacked Right
  if (images.length === 3) {
    return (
      <View style={[styles.collage, { height }, containerRadiusStyle, style]}>
        <VellureButton
          style={styles.featureButton3}
          onPress={() => onOpen(0)}
          activeOpacity={0.9}
          accessibilityLabel={images[0].accessibilityLabel || 'Open celebration photo 1'}
        >
          <Image source={{ uri: images[0].uri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.featureBadge}>
            <Camera size={10} color="#FFFFFF" />
            <Text style={styles.featureBadgeText}>{featuredBadgeText}</Text>
          </View>
        </VellureButton>

        <View style={styles.sideColumn}>
          {[1, 2].map((imageIndex) => {
            const image = images[imageIndex];
            return (
              <VellureButton
                key={imageIndex}
                style={styles.smallButton}
                onPress={() => onOpen(imageIndex)}
                activeOpacity={0.88}
                accessibilityLabel={image.accessibilityLabel || `Open celebration photo ${imageIndex + 1}`}
              >
                <Image source={{ uri: image.uri }} style={styles.photo} resizeMode="cover" />
                {imageIndex === 2 ? (
                  <View style={styles.countBadgeSmall}>
                    <Text style={styles.countBadgeText}>3 Photos</Text>
                  </View>
                ) : null}
              </VellureButton>
            );
          })}
        </View>
      </View>
    );
  }

  // 4+ Photos: 1 Hero Left + 3 Stacked Right with +N overlay
  const visible = images.slice(0, 4);
  const moreCount = Math.max(0, images.length - 4);

  return (
    <View style={[styles.collage, { height }, containerRadiusStyle, style]}>
      <VellureButton
        style={styles.featureButton4}
        onPress={() => onOpen(0)}
        activeOpacity={0.9}
        accessibilityLabel={images[0].accessibilityLabel || 'Open celebration photo 1'}
      >
        <Image source={{ uri: images[0].uri }} style={styles.photo} resizeMode="cover" />
        <View style={styles.featureBadge}>
          <Camera size={10} color="#FFFFFF" />
          <Text style={styles.featureBadgeText}>{featuredBadgeText}</Text>
        </View>
      </VellureButton>

      <View style={styles.sideColumn}>
        {[1, 2, 3].map((imageIndex) => {
          const image = visible[imageIndex];
          const isLast = imageIndex === 3;

          return (
            <VellureButton
              key={imageIndex}
              style={styles.smallButton}
              onPress={() => onOpen(imageIndex)}
              activeOpacity={0.88}
              accessibilityLabel={
                isLast && moreCount > 0
                  ? `View all ${images.length} celebration photos`
                  : image?.accessibilityLabel || `Open celebration photo ${imageIndex + 1}`
              }
            >
              <Image source={{ uri: image.uri }} style={styles.photo} resizeMode="cover" />
              {isLast && moreCount > 0 ? (
                <View style={styles.moreOverlay}>
                  <Images size={14} color="#FFFFFF" />
                  <Text style={styles.moreValue}>+{moreCount}</Text>
                  <Text style={styles.moreLabel}>photos</Text>
                </View>
              ) : null}
            </VellureButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collage: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
    overflow: 'hidden',
    backgroundColor: '#EDE4D7',
  },
  roundedAll: {
    borderRadius: 18,
  },
  roundedTopOnly: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  fullButton: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#D9C9B6',
  },
  halfButton: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#D9C9B6',
  },
  featureButton3: {
    flex: 1.45,
    overflow: 'hidden',
    backgroundColor: '#D9C9B6',
  },
  featureButton4: {
    flex: 1.6,
    overflow: 'hidden',
    backgroundColor: '#D9C9B6',
  },
  sideColumn: {
    flex: 1,
    gap: 4,
  },
  smallButton: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#D9C9B6',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  featureBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42,18,30,0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42,18,30,0.82)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  countBadgeSmall: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(42,18,30,0.82)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  countBadgeText: {
    color: '#F4D58D',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(35,13,24,0.78)',
  },
  moreValue: {
    marginTop: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  moreLabel: {
    color: '#F4D58D',
    fontSize: 7.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    padding: 16,
  },
  emptyTitle: {
    marginTop: 6,
    color: '#3A202B',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 2,
    color: '#786B70',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
