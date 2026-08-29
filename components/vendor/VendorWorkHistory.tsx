import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  CalendarDays,
  Camera,
  IndianRupee,
  MapPin,
  Sparkles,
  Users,
  Images,
  HeartHandshake,
  ArrowRight,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react-native';
import { PriceDisplay } from '../ui/PriceDisplay';
import { ImageCollage, CollageImage } from '../ui/ImageCollage';
import { ImageGalleryViewer } from '../ui/ImageGalleryViewer';
import { VellureButton } from '../ui/VellureControls';
import { WorkHistoryDetailModal } from './WorkHistoryDetailModal';
import { getServiceMetadata } from '../../constants/services';

export type CollaboratingVendor = {
  vendorId?: string;
  name: string;
  category?: string;
  role?: string;
  imageUrl?: string;
  rating?: number;
  city?: string;
  isRegistered?: boolean;
};

export type VendorWorkItem = {
  id?: string;
  imageUrl?: string;
  image?: string;
  images?: Array<string | { uri: string; accessibilityLabel?: string }>;
  photos?: Array<string | { uri: string; accessibilityLabel?: string }>;
  title?: string;
  venue?: string;
  eventType?: string;
  eventDate?: string | Date;
  date?: string;
  budget?: number | string;
  city?: string;
  guestCount?: string | number;
  scope?: string;
  story?: string;
  collaborators?: CollaboratingVendor[];
  collabs?: CollaboratingVendor[] | string[];
};

type VendorWorkHistoryProps = {
  items: VendorWorkItem[];
  vendorName: string;
  vendorCategory?: string;
  vendorCity: string;
  allowAdd?: boolean;
};

export function getItemImages(item: VendorWorkItem): CollageImage[] {
  const rawList: any[] = [];
  if (Array.isArray(item.images) && item.images.length > 0) {
    rawList.push(...item.images);
  } else if (Array.isArray(item.photos) && item.photos.length > 0) {
    rawList.push(...item.photos);
  }

  if (item.imageUrl) {
    rawList.push(item.imageUrl);
  }
  if (item.image && item.image !== item.imageUrl) {
    rawList.push(item.image);
  }

  const seen = new Set<string>();
  const result: CollageImage[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const entry = rawList[i];
    const uri = typeof entry === 'string' ? entry : entry?.uri || entry?.imageUrl || entry?.url;
    if (uri && typeof uri === 'string' && !seen.has(uri)) {
      seen.add(uri);
      result.push({
        uri,
        accessibilityLabel:
          typeof entry === 'object' && entry?.accessibilityLabel
            ? entry.accessibilityLabel
            : `${item.title || 'Work'} photo ${result.length + 1}`,
      });
    }
  }

  return result;
}

export function getNormalizedCollaborators(item: VendorWorkItem): CollaboratingVendor[] {
  if (Array.isArray(item.collaborators) && item.collaborators.length > 0) {
    return item.collaborators;
  }
  if (Array.isArray(item.collabs) && item.collabs.length > 0) {
    return item.collabs.map((c) => {
      if (typeof c === 'string') {
        return { name: c, isRegistered: false };
      }
      return c;
    });
  }
  return [];
}

export function cleanWorkTitle(title?: string, eventType?: string, vendorName?: string): string {
  if (!title) {
    if (eventType) return `${eventType} Celebration`;
    return 'Grand Wedding Celebration';
  }

  let cleaned = title.trim();

  // If title contains "showcase" or generic "specialist"
  if (cleaned.toLowerCase().includes('showcase')) {
    if (eventType) {
      return `${eventType} Celebration`;
    }
    cleaned = cleaned.replace(/showcase/gi, '').trim();
    if (vendorName) {
      const vNameRegex = new RegExp(vendorName, 'gi');
      cleaned = cleaned.replace(vNameRegex, '').trim();
    }
    cleaned = cleaned.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '').trim();
    return cleaned.length > 2
      ? `${cleaned} Celebration`
      : eventType
      ? `${eventType} Celebration`
      : 'Grand Royal Wedding';
  }

  // If title is literally `${vendorName} Celebration`
  if (vendorName && cleaned.toLowerCase() === `${vendorName.toLowerCase()} celebration`) {
    if (eventType) return `${eventType} Celebration`;
    return 'Grand Royal Wedding';
  }

  return cleaned;
}

function displayDate(item: VendorWorkItem) {
  const value = item.date || item.eventDate;
  if (!value) return 'Date not shared';
  if (value === 'Recent Event') return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function numericBudget(value?: number | string) {
  if (typeof value === 'number') return value;
  if (!value) return undefined;
  const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function VendorWorkHistory({
  items,
  vendorName,
  vendorCategory,
  vendorCity,
}: VendorWorkHistoryProps) {
  const [galleryState, setGalleryState] = useState<{
    images: CollageImage[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  const [selectedDetailItem, setSelectedDetailItem] = useState<VendorWorkItem | null>(null);

  return (
    <View style={styles.section}>
      {/* Intro Header Banner */}
      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <Sparkles size={16} color="#F4D58D" />
        </View>
        <View style={styles.introCopy}>
          <Text style={styles.eyebrow}>Verified Work History</Text>
          <Text style={styles.heading}>Previous celebrations by {vendorName}</Text>
          <Text style={styles.subheading}>
            Delivered setups, guest scale, collaborator teams, and benchmark budgets.
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countValue}>{items.length}</Text>
          <Text style={styles.countLabel}>Works</Text>
        </View>
      </View>

      {/* Gallery Modal */}
      <ImageGalleryViewer
        images={galleryState?.images || []}
        visible={galleryState !== null}
        initialIndex={galleryState?.initialIndex || 0}
        title={galleryState?.title}
        onClose={() => setGalleryState(null)}
      />

      {/* Case Study Full Details Modal */}
      <WorkHistoryDetailModal
        visible={selectedDetailItem !== null}
        item={selectedDetailItem}
        vendorName={vendorName}
        vendorCategory={vendorCategory}
        vendorCity={vendorCity}
        onClose={() => setSelectedDetailItem(null)}
      />

      {/* Cards List */}
      {items.length > 0 ? (
        items.map((item, index) => {
          const cardImages = getItemImages(item);
          const collaborators = getNormalizedCollaborators(item);
          const budget = numericBudget(item.budget);
          const location = [item.venue, item.city].filter(Boolean).join(', ') || vendorCity;
          const itemTitle = cleanWorkTitle(item.title, item.eventType, vendorName);

          return (
            <View key={item.id || `${itemTitle}-${index}`} style={styles.workCard}>
              {/* Card Top: Image Collage */}
              {cardImages.length > 0 ? (
                <ImageCollage
                  images={cardImages}
                  height={205}
                  roundedTopOnly
                  onOpen={(imageIdx) =>
                    setGalleryState({
                      images: cardImages,
                      initialIndex: imageIdx,
                      title: itemTitle,
                    })
                  }
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={26} color="#D2AD6B" />
                  <Text style={styles.placeholderText}>Photos coming soon</Text>
                </View>
              )}

              {/* Card Body */}
              <View style={styles.body}>
                {/* Title & Verified Tag */}
                <View style={styles.titleRow}>
                  <View style={styles.titleCopy}>
                    <Text style={styles.eventType}>{item.eventType || 'Completed Event'}</Text>
                    <Text style={styles.title}>{itemTitle}</Text>
                  </View>
                  <View style={styles.verifiedPill}>
                    <Sparkles size={10} color="#287857" />
                    <Text style={styles.verifiedText}>Portfolio</Text>
                  </View>
                </View>

                {/* 4 Details Cells */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailCell}>
                    <MapPin size={13} color="#8C6F3E" />
                    <View style={styles.detailCopy}>
                      <Text style={styles.detailLabel}>Venue & City</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>
                        {location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailCell}>
                    <CalendarDays size={13} color="#8C6F3E" />
                    <View style={styles.detailCopy}>
                      <Text style={styles.detailLabel}>Event Date</Text>
                      <Text style={styles.detailValue}>{displayDate(item)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailCell}>
                    <Users size={13} color="#8C6F3E" />
                    <View style={styles.detailCopy}>
                      <Text style={styles.detailLabel}>Guest Scale</Text>
                      <Text style={styles.detailValue}>
                        {item.guestCount ? `${item.guestCount} guests` : 'Not shared'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailCell}>
                    <IndianRupee size={13} color="#8C6F3E" />
                    <View style={styles.detailCopy}>
                      <Text style={styles.detailLabel}>Event Budget</Text>
                      {budget ? (
                        <PriceDisplay price={budget} priceType="FIXED_PACKAGE" size="small" />
                      ) : (
                        <Text style={styles.detailValue}>Not shared</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Vendor Collaborations Trimmed Preview */}
                {collaborators.length > 0 ? (
                  <View style={styles.collabSection}>
                    <View style={styles.collabHeader}>
                      <HeartHandshake size={12} color="#641E3D" />
                      <Text style={styles.collabSectionTitle}>Event Collabs & Crew</Text>
                      <View style={styles.collabCountBadge}>
                        <Text style={styles.collabCountBadgeText}>
                          {collaborators.length} {collaborators.length === 1 ? 'Partner' : 'Partners'}
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.collabScroll}
                    >
                      {collaborators.map((c, cIdx) => {
                        const isReg = Boolean(c.vendorId || c.isRegistered);
                        const meta = getServiceMetadata(c.category || 'misc');
                        const IconComponent = meta.icon || Building2;

                        return (
                          <VellureButton
                            key={cIdx}
                            style={[styles.collabChip, isReg && styles.collabChipReg]}
                            onPress={() => {
                              if (c.vendorId) {
                                router.push(`/vendor/${c.vendorId}`);
                              } else {
                                setSelectedDetailItem(item);
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <IconComponent size={11} color={meta.color || '#641E3D'} />
                            <Text style={styles.collabChipName} numberOfLines={1}>
                              {c.name}
                            </Text>
                            {isReg ? (
                              <View style={styles.chipVellureDot}>
                                <Sparkles size={8} color="#287857" />
                              </View>
                            ) : null}
                          </VellureButton>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {/* Trimmed Scope & Story */}
                <View style={styles.scopeBox}>
                  <View style={styles.scopeHeaderRow}>
                    <Text style={styles.scopeLabel}>Scope of Work & Deliverables</Text>
                  </View>
                  <Text style={styles.scopeText} numberOfLines={2}>
                    {item.scope ||
                      'Detailed execution deliverables and custom setup specs are documented for this celebration.'}
                  </Text>
                </View>

                {/* Action Row: View Full Details / Photos */}
                <View style={styles.cardActionsRow}>
                  {cardImages.length > 1 ? (
                    <VellureButton
                      style={styles.galleryQuickBtn}
                      onPress={() =>
                        setGalleryState({
                          images: cardImages,
                          initialIndex: 0,
                          title: itemTitle,
                        })
                      }
                      activeOpacity={0.84}
                    >
                      <Images size={12} color="#641E3D" />
                      <Text style={styles.galleryQuickText}>{cardImages.length} Photos</Text>
                    </VellureButton>
                  ) : null}

                  <VellureButton
                    style={styles.viewFullDetailsBtn}
                    onPress={() => setSelectedDetailItem(item)}
                    activeOpacity={0.84}
                  >
                    <Text style={styles.viewFullDetailsText}>Full Case Study</Text>
                    <ArrowRight size={12} color="#FFFFFF" />
                  </VellureButton>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Camera size={30} color="#D2AD6B" />
          <Text style={styles.emptyTitle}>Previous works coming soon</Text>
          <Text style={styles.emptyCopy}>
            This vendor has not published an event case study yet. Request photos and references during
            consultation.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#2A121E',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#5B3042',
  },
  introIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A2333',
  },
  introCopy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: '#F4D58D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heading: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginTop: 2 },
  subheading: { color: '#CBBBC1', fontSize: 10, lineHeight: 14, marginTop: 3 },
  countPill: {
    minWidth: 42,
    alignItems: 'center',
    backgroundColor: '#F4D58D',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  countValue: { color: '#2A121E', fontSize: 14, fontWeight: '900' },
  countLabel: { color: '#641E3D', fontSize: 6.5, fontWeight: '900', textTransform: 'uppercase' },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF5EC',
  },
  placeholderText: { color: '#786B70', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 11,
  },
  titleCopy: { flex: 1, minWidth: 0 },
  eventType: {
    color: '#8C6F3E',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { color: '#2D2025', fontSize: 15, fontWeight: '900', marginTop: 2 },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: '#ECF8F1',
    borderWidth: 1,
    borderColor: '#BFE6CF',
  },
  verifiedText: { color: '#287857', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    backgroundColor: '#FFFDF9',
  },
  detailCell: {
    width: '50%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#EFE3CF',
  },
  detailCopy: { flex: 1, minWidth: 0 },
  detailLabel: {
    color: '#8A7A70',
    fontSize: 7.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  detailValue: {
    color: '#2D2025',
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 13,
    marginTop: 2,
  },
  collabSection: {
    marginTop: 10,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  collabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
  },
  collabSectionTitle: {
    color: '#641E3D',
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  collabCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#F0E3CE',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  collabCountBadgeText: {
    color: '#641E3D',
    fontSize: 7.5,
    fontWeight: '800',
  },
  collabScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  collabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E6D4B8',
  },
  collabChipReg: {
    borderColor: '#BFE6CF',
    backgroundColor: '#F7FCF9',
  },
  collabChipName: {
    color: '#2A121E',
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 130,
  },
  chipVellureDot: {
    marginLeft: 1,
  },
  scopeBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  scopeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  scopeLabel: {
    color: '#641E3D',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  scopeText: {
    color: '#5A4D52',
    fontSize: 10.5,
    lineHeight: 15,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 11,
  },
  galleryQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF2E6',
    borderWidth: 1,
    borderColor: '#E6D4B8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  galleryQuickText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  viewFullDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#641E3D',
    borderRadius: 10,
    paddingVertical: 8,
  },
  viewFullDetailsText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 6,
  },
  emptyTitle: { color: '#2D2025', fontSize: 14, fontWeight: '900' },
  emptyCopy: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
