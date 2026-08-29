import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HeartHandshake,
  IndianRupee,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
  Building2,
  Utensils,
  Flower,
  Music,
  Scissors,
} from 'lucide-react-native';
import { VellureButton } from '../ui/VellureControls';
import { PriceDisplay } from '../ui/PriceDisplay';
import { ImageGalleryViewer } from '../ui/ImageGalleryViewer';
import { EventInquiryModal } from '../inquiry/EventInquiryModal';
import { getServiceMetadata } from '../../constants/services';
import type { VendorWorkItem, CollaboratingVendor } from './VendorWorkHistory';
import { getItemImages, cleanWorkTitle } from './VendorWorkHistory';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WorkHistoryDetailModalProps = {
  visible: boolean;
  item: VendorWorkItem | null;
  vendorName: string;
  vendorCategory?: string;
  vendorCity: string;
  onClose: () => void;
};

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

export function WorkHistoryDetailModal({
  visible,
  item,
  vendorName,
  vendorCategory,
  vendorCity,
  onClose,
}: WorkHistoryDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);

  if (!item) return null;

  const images = getItemImages(item);
  const budget = numericBudget(item.budget);
  const location = [item.venue, item.city].filter(Boolean).join(', ') || vendorCity;
  const collaborators: CollaboratingVendor[] = item.collaborators || [];
  const eventTitle = cleanWorkTitle(item.title, item.eventType, vendorName);

  const handleShare = async () => {
    try {
      await Share.share({
        title: eventTitle,
        message: `Check out this celebration by ${vendorName}: ${eventTitle} (${location}) on Vellure!`,
      });
    } catch (_) {}
  };

  const handleOpenVendorProfile = (vendorId?: string) => {
    if (!vendorId) return;
    onClose();
    router.push(`/vendor/${vendorId}`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <VellureButton
            style={styles.navButton}
            onPress={onClose}
            accessibilityLabel="Close case study details"
          >
            <ArrowLeft size={20} color="#2A121E" />
          </VellureButton>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarEyebrow}>Verified Case Study</Text>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {eventTitle}
            </Text>
          </View>

          <VellureButton
            style={styles.navButton}
            onPress={handleShare}
            accessibilityLabel="Share celebration details"
          >
            <Share2 size={18} color="#2A121E" />
          </VellureButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Media Section */}
          {images.length > 0 ? (
            <View style={styles.mediaContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImageIndex(idx);
                }}
              >
                {images.map((img, idx) => (
                  <VellureButton
                    key={idx}
                    activeOpacity={0.92}
                    style={styles.slideButton}
                    onPress={() => setGalleryOpen(true)}
                  >
                    <Image source={{ uri: img.uri }} style={styles.heroImage} resizeMode="cover" />
                  </VellureButton>
                ))}
              </ScrollView>

              <View style={styles.photoCountBadge}>
                <Camera size={11} color="#FFFFFF" />
                <Text style={styles.photoCountText}>
                  {activeImageIndex + 1} / {images.length} Photos (Tap to Zoom)
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyHero}>
              <Camera size={34} color="#D2AD6B" />
              <Text style={styles.emptyHeroText}>Photos coming soon for this celebration</Text>
            </View>
          )}

          {/* Event Header Info */}
          <View style={styles.contentWrap}>
            <View style={styles.badgeRow}>
              <View style={styles.eventTypeBadge}>
                <Sparkles size={11} color="#8C6F3E" />
                <Text style={styles.eventTypeText}>{item.eventType || 'Grand Celebration'}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={11} color="#287857" />
                <Text style={styles.verifiedBadgeText}>Verified Vellure Execution</Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>{eventTitle}</Text>
            <Text style={styles.leadVendorSubtitle}>
              Executed by <Text style={styles.leadVendorHighlight}>{vendorName}</Text>
            </Text>

            {/* 4 Metric Benchmarks Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <MapPin size={16} color="#641E3D" />
                </View>
                <Text style={styles.metricLabel}>Venue & City</Text>
                <Text style={styles.metricValue} numberOfLines={2}>
                  {location}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <CalendarDays size={16} color="#641E3D" />
                </View>
                <Text style={styles.metricLabel}>Celebration Date</Text>
                <Text style={styles.metricValue}>{displayDate(item)}</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Users size={16} color="#641E3D" />
                </View>
                <Text style={styles.metricLabel}>Guest Scale</Text>
                <Text style={styles.metricValue}>
                  {item.guestCount ? `${item.guestCount} guests` : 'Not specified'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <IndianRupee size={16} color="#641E3D" />
                </View>
                <Text style={styles.metricLabel}>Shared Budget</Text>
                {budget ? (
                  <PriceDisplay price={budget} priceType="FIXED_PACKAGE" size="small" />
                ) : (
                  <Text style={styles.metricValue}>Available on request</Text>
                )}
              </View>
            </View>

            {/* Scope of Work & Deliverables Narrative */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionCardTitle}>Scope & Deliverables</Text>
              </View>
              <Text style={styles.narrativeText}>
                {item.scope ||
                  'The specialist managed complete planning, on-site setup, luxury detailing, and coordinated execution for this celebration.'}
              </Text>
              {item.story ? (
                <Text style={[styles.narrativeText, { marginTop: 10 }]}>{item.story}</Text>
              ) : null}
            </View>

            {/* Collaborating Vendors Section */}
            <View style={styles.sectionCard}>
              <View style={styles.collabHeaderRow}>
                <View style={styles.collabTitleWrap}>
                  <HeartHandshake size={18} color="#641E3D" />
                  <Text style={styles.sectionCardTitle}>Event Collaborators & Crew</Text>
                </View>
                <View style={styles.collabCountPill}>
                  <Text style={styles.collabCountText}>
                    {collaborators.length} {collaborators.length === 1 ? 'Specialist' : 'Specialists'}
                  </Text>
                </View>
              </View>
              <Text style={styles.collabIntroCopy}>
                Specialist teams who collaborated to make this celebration seamless.
              </Text>

              {collaborators.length > 0 ? (
                <View style={styles.collabsList}>
                  {collaborators.map((collab, cIdx) => {
                    const meta = getServiceMetadata(collab.category || 'misc');
                    const CatIcon = meta.icon || Building2;
                    const isRegistered = Boolean(collab.vendorId || collab.isRegistered);

                    return (
                      <View key={cIdx} style={styles.collabCard}>
                        <View style={styles.collabLeft}>
                          <View
                            style={[
                              styles.collabIconBox,
                              { backgroundColor: `${meta.color || '#641E3D'}18` },
                            ]}
                          >
                            <CatIcon size={18} color={meta.color || '#641E3D'} />
                          </View>
                          <View style={styles.collabInfo}>
                            <View style={styles.collabTitleLine}>
                              <Text style={styles.collabName}>{collab.name}</Text>
                              {isRegistered ? (
                                <View style={styles.registeredPill}>
                                  <Sparkles size={9} color="#287857" />
                                  <Text style={styles.registeredPillText}>On Vellure</Text>
                                </View>
                              ) : (
                                <View style={styles.externalPill}>
                                  <Text style={styles.externalPillText}>External Partner</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.collabRole}>
                              {collab.role || meta.label || 'Event Specialist'}
                              {collab.city ? ` • ${collab.city}` : ''}
                            </Text>
                          </View>
                        </View>

                        {isRegistered && collab.vendorId ? (
                          <VellureButton
                            style={styles.viewProfileBtn}
                            onPress={() => handleOpenVendorProfile(collab.vendorId)}
                            activeOpacity={0.82}
                          >
                            <Text style={styles.viewProfileText}>View Profile</Text>
                            <ChevronRight size={13} color="#641E3D" />
                          </VellureButton>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyCollabBox}>
                  <Users size={20} color="#D2AD6B" />
                  <Text style={styles.emptyCollabText}>
                    Single specialist execution or collaborators not listed.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Consultation Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomCopy}>
            <Text style={styles.bottomEyebrow}>Inspired by this setup?</Text>
            <Text style={styles.bottomTitle}>Request similar quote & date</Text>
          </View>
          <VellureButton
            style={styles.inquireBtn}
            onPress={() => setInquiryModalVisible(true)}
            activeOpacity={0.88}
          >
            <Sparkles size={14} color="#FFFFFF" />
            <Text style={styles.inquireBtnText}>Inquire for Event</Text>
          </VellureButton>
        </View>

        {/* Fullscreen Gallery */}
        <ImageGalleryViewer
          images={images}
          visible={galleryOpen}
          initialIndex={activeImageIndex}
          title={eventTitle}
          onClose={() => setGalleryOpen(false)}
        />

        {/* Inquiry Modal */}
        <EventInquiryModal
          visible={inquiryModalVisible}
          onClose={() => setInquiryModalVisible(false)}
          targetId={item.id || 'vendor_work_case_study'}
          targetName={vendorName}
          targetCategory={vendorCategory || 'Event Specialist'}
          initialCity={vendorCity}
          initialBudget={budget}
          initialEventType={item.eventType || 'Wedding'}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#EDE4D7',
    backgroundColor: '#FFFFFF',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EFE6',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  topBarEyebrow: {
    color: '#8C6F3E',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  topBarTitle: {
    color: '#2A121E',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: '#0B0709',
  },
  slideButton: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  photoCountBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(42, 18, 30, 0.85)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  emptyHero: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    gap: 8,
  },
  emptyHeroText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '700',
  },
  contentWrap: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF2E6',
    borderWidth: 1,
    borderColor: '#E6D4B8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventTypeText: {
    color: '#8C6F3E',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECF8F1',
    borderWidth: 1,
    borderColor: '#BFE6CF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedBadgeText: {
    color: '#287857',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mainTitle: {
    color: '#2A121E',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  leadVendorSubtitle: {
    color: '#786B70',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  leadVendorHighlight: {
    color: '#641E3D',
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 36 - 10) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EDE4D7',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF2E6',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#8A7A70',
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    color: '#2A121E',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE4D7',
    marginBottom: 16,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#641E3D',
  },
  sectionCardTitle: {
    color: '#2A121E',
    fontSize: 14,
    fontWeight: '900',
  },
  narrativeText: {
    color: '#4F4247',
    fontSize: 12,
    lineHeight: 18,
  },
  collabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  collabTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  collabCountPill: {
    backgroundColor: '#FAF2E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E6D4B8',
  },
  collabCountText: {
    color: '#8C6F3E',
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  collabIntroCopy: {
    color: '#8A7A70',
    fontSize: 11,
    marginBottom: 14,
  },
  collabsList: {
    gap: 10,
  },
  collabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDFBF7',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#EDE4D7',
    gap: 8,
  },
  collabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  collabIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collabInfo: {
    flex: 1,
    minWidth: 0,
  },
  collabTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  collabName: {
    color: '#2A121E',
    fontSize: 12.5,
    fontWeight: '900',
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECF8F1',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  registeredPillText: {
    color: '#287857',
    fontSize: 7.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  externalPill: {
    backgroundColor: '#F0EAE1',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  externalPillText: {
    color: '#786B70',
    fontSize: 7.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  collabRole: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FAF2E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E6D4B8',
  },
  viewProfileText: {
    color: '#641E3D',
    fontSize: 9.5,
    fontWeight: '900',
  },
  emptyCollabBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    gap: 6,
  },
  emptyCollabText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#EDE4D7',
    shadowColor: '#2A121E',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomCopy: {
    flex: 1,
    marginRight: 12,
  },
  bottomEyebrow: {
    color: '#8A7A70',
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bottomTitle: {
    color: '#2A121E',
    fontSize: 12.5,
    fontWeight: '900',
    marginTop: 1,
  },
  inquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#641E3D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  inquireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
