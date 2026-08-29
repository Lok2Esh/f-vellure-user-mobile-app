import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Send,
  Sparkles,
  Users,
  Briefcase,
  Store,
} from 'lucide-react-native';
import { PriceDisplay } from '../../components/ui/PriceDisplay';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';
import { AddVendorToPlanModal } from '../../components/vendor/AddVendorToPlanModal';
import { colors } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;

export default function PackageDetailsScreen() {
  const { id, title, price, city, eventType, guestCount } = useLocalSearchParams<{
    id?: string;
    title?: string;
    price?: string;
    city?: string;
    eventType?: string;
    guestCount?: string;
  }>();

  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);

  const packTitle = title || 'Curated Celebration Starter Suite';
  const packCity = city || 'Patiala';
  const packEvent = eventType || 'Engagement';
  const packGuests = parseInt(guestCount || '150', 10);
  const packPrice = parseInt(price || '340000', 10);

  const inclusions = [
    'Complete venue setup & floral styling',
    'Dedicated on-site lead coordinator',
    'Sound, ambient lighting & wireless microphones',
    'Customized banquet / catering consultation',
    'Pre-event rehearsal & schedule management',
  ];

  const exclusions = [
    'Alcoholic beverages & excise permits',
    'Travel expenses beyond 50 km radius',
    'Overtime crew charges past midnight',
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <EventInquiryModal
        visible={inquiryModalVisible}
        onClose={() => setInquiryModalVisible(false)}
        targetId={id || 'pkg_detail'}
        targetName={packTitle}
        targetCategory={packEvent}
        isPackage={true}
        initialCity={packCity}
        initialBudget={packPrice}
        initialGuestCount={packGuests}
        initialEventType={packEvent}
      />

      <AddVendorToPlanModal
        visible={planModalVisible}
        onClose={() => setPlanModalVisible(false)}
        vendorId={id || 'pkg_detail'}
        vendorName={packTitle}
        category={packEvent}
        estimatedPrice={packPrice}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800' }}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <View style={styles.heroShade} />

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Package size={12} color="#D2AD6B" />
            <Text style={styles.heroBadgeText}>Curated Marketplace Bundle</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.categoryRow}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{packEvent}</Text>
            </View>
            <VerifiedBadge isVerified={true} />
          </View>

          <Text style={styles.title}>{packTitle}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={12} color="#8A7A70" />
              <Text style={styles.metaText}>{packCity}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={12} color="#8A7A70" />
              <Text style={styles.metaText}>Up to {packGuests} Guests</Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingBox}>
            <Text style={styles.pricingLabel}>Package Price</Text>
            <PriceDisplay price={packPrice} priceType="FIXED_PACKAGE" size="large" />
          </View>
        </View>

        {/* Inclusions */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Itemized Inclusions</Text>
          {inclusions.map((inc, i) => (
            <View key={i} style={styles.itemRow}>
              <CheckCircle2 size={13} color="#287857" />
              <Text style={styles.itemText}>{inc}</Text>
            </View>
          ))}
        </View>

        {/* Exclusions */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Exclusions & Conditions</Text>
          {exclusions.map((exc, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemTextMuted}>{exc}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            💡 Package availability and customization are subject to partner calendar confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.stickyBottomBar}>
        <TouchableOpacity
          style={styles.stickyPlanBtn}
          onPress={() => setPlanModalVisible(true)}
          activeOpacity={0.85}
        >
          <Briefcase size={15} color="#641E3D" />
          <Text style={styles.stickyPlanBtnText}>Add to Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stickyQuoteBtn}
          onPress={() => setInquiryModalVisible(true)}
          activeOpacity={0.88}
        >
          <Send size={15} color="#FFFFFF" />
          <Text style={styles.stickyQuoteBtnText}>Request Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  hero: {
    height: 240,
    width: '100%',
    backgroundColor: '#2A151D',
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 15, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  heroBadgeText: {
    color: '#D2AD6B',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: PAGE_PADDING,
    marginTop: -20,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typePill: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typePillText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#2D2025',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  pricingBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  pricingLabel: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: PAGE_PADDING,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  sectionTitle: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  itemText: {
    color: '#2D2025',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    flex: 1,
  },
  bullet: {
    color: '#8A7A70',
    fontSize: 14,
    lineHeight: 16,
  },
  itemTextMuted: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  disclaimerBox: {
    marginHorizontal: PAGE_PADDING,
    marginTop: 14,
    padding: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  disclaimerText: {
    color: '#786B70',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    gap: 8,
  },
  stickyPlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    height: 44,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  stickyPlanBtnText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  stickyQuoteBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    height: 44,
    borderRadius: 12,
    gap: 5,
  },
  stickyQuoteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
