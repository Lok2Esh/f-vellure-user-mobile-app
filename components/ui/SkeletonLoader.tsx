import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 12,
  style,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function VendorCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={170} borderRadius={18} style={{ marginBottom: 12 }} />
      <View style={styles.contentSkeleton}>
        <Skeleton width="40%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={20} borderRadius={8} style={{ marginBottom: 10 }} />
        <Skeleton width="60%" height={14} borderRadius={6} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Skeleton width="45%" height={32} borderRadius={12} />
          <Skeleton width="45%" height={32} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#EBDDC9',
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D5',
    marginBottom: 16,
  },
  contentSkeleton: {
    paddingHorizontal: 4,
  },
});
