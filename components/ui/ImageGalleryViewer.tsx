import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { VellureButton } from './VellureControls';
import type { CollageImage } from './ImageCollage';

const VIEWPORT_WIDTH = Dimensions.get('window').width;

type ImageGalleryViewerProps = {
  images: CollageImage[];
  visible: boolean;
  initialIndex?: number;
  title?: string;
  onClose: () => void;
};

export function ImageGalleryViewer({ images, visible, initialIndex = 0, title, onClose }: ImageGalleryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) return;
    const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
    setActiveIndex(safeIndex);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ x: safeIndex * VIEWPORT_WIDTH, animated: false }));
  }, [images.length, initialIndex, visible]);

  const showImage = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), images.length - 1);
    setActiveIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * VIEWPORT_WIDTH, animated: true });
  };

  if (!images.length) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.topBar}>
          <View style={styles.topBarCopy}>
            <Text style={styles.eyebrow} numberOfLines={1}>{title || 'Previous Works Gallery'}</Text>
            <Text style={styles.counter}>{activeIndex + 1} of {images.length}</Text>
          </View>
          <VellureButton style={styles.closeButton} onPress={onClose} accessibilityLabel="Close image gallery">
            <X size={22} color="#FFFFFF" />
          </VellureButton>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: initialIndex * VIEWPORT_WIDTH, y: 0 }}
          onMomentumScrollEnd={(event) => {
            setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / VIEWPORT_WIDTH));
          }}
          style={styles.slider}
        >
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.slide}>
              <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        {activeIndex > 0 ? (
          <VellureButton style={[styles.arrowButton, styles.previousButton]} onPress={() => showImage(activeIndex - 1)} accessibilityLabel="Previous gallery photo">
            <ChevronLeft size={26} color="#FFFFFF" />
          </VellureButton>
        ) : null}
        {activeIndex < images.length - 1 ? (
          <VellureButton style={[styles.arrowButton, styles.nextButton]} onPress={() => showImage(activeIndex + 1)} accessibilityLabel="Next gallery photo">
            <ChevronRight size={26} color="#FFFFFF" />
          </VellureButton>
        ) : null}

        <View style={styles.dots}>
          {images.map((_, index) => (
            <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0B0709', justifyContent: 'center' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, paddingHorizontal: 18, paddingBottom: 12,
    backgroundColor: 'rgba(11,7,9,0.85)',
  },
  topBarCopy: { flex: 1, marginRight: 12 },
  eyebrow: { color: '#D2AD6B', fontSize: 11, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  counter: { marginTop: 2, color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  closeButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  slider: { flex: 1 },
  slide: { width: VIEWPORT_WIDTH, height: '100%', alignItems: 'center', justifyContent: 'center' },
  image: { width: VIEWPORT_WIDTH, height: '100%' },
  arrowButton: {
    position: 'absolute', top: '48%', width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(100,30,61,0.9)', borderWidth: 1, borderColor: 'rgba(244,213,141,0.5)',
  },
  previousButton: { left: 12 },
  nextButton: { right: 12 },
  dots: { position: 'absolute', bottom: 34, left: 20, right: 20, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 18, backgroundColor: '#D2AD6B' },
});
