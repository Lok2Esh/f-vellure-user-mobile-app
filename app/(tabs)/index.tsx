import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CakeSlice,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Flower2,
  Gift,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Search,
  Music,
  PartyPopper,
  Package,
  Plus,
  Sparkles,
  Settings,
  Utensils,
  Send,
  Users,
  Wand2,
  WalletCards,
} from 'lucide-react-native';
import { fetchActiveEventPlan, fetchCustomerProfile, ActiveEventPlan } from '../../services/api';
import { getSelectedLocation, subscribeSelectedLocation } from '../../services/locationStore';
import { colors, shadows, typography } from '../../constants/theme';
import { VellureButton } from '../../components/ui/VellureControls';
import { LuxuryScreen, ProgressBar, SectionTitle } from '../../components/ui/LuxuryLayout';

const categories = [
  { label: 'Weddings', detail: 'Ceremonies & receptions', icon: Heart },
  { label: 'Engagement', detail: 'Roka & ring ceremonies', icon: Sparkles },
  { label: 'Sangeet', detail: 'Music, dance & mehendi', icon: Music },
  { label: 'Birthdays', detail: 'Milestones & themes', icon: CakeSlice },
  { label: 'Corporate', detail: 'Galas, launches & summits', icon: BriefcaseBusiness },
  { label: 'Decor', detail: 'Styling & floral design', icon: Flower2 },
  { label: 'Catering', detail: 'Menus & hospitality', icon: Utensils },
  { label: 'Private Parties', detail: 'Intimate celebrations', icon: PartyPopper },
  { label: 'Housewarming', detail: 'Griha pravesh gatherings', icon: House },
  { label: 'Anniversary', detail: 'Beautiful milestones', icon: Gift },
  { label: 'Conferences', detail: 'Professional experiences', icon: Building2 },
  { label: 'Baby Shower', detail: 'Welcoming celebrations', icon: Heart },
  { label: 'Festival', detail: 'Festive family gatherings', icon: PartyPopper },
  { label: 'Puja & Path', detail: 'Traditional ceremonies', icon: Sparkles },
  { label: 'Ramayan Path', detail: 'Devotional gatherings', icon: Music },
  { label: 'Guru Granth Path', detail: 'Sacred family occasions', icon: Flower2 },
  { label: 'Nikah & Walima', detail: 'Ceremony & celebration', icon: Heart },
  { label: 'Church Ceremony', detail: 'Blessings & receptions', icon: Building2 },
];

const quickActions = [
  { label: 'Checklist', icon: CalendarCheck, route: '/checklist' as const },
  { label: 'Guests', icon: Users, route: '/guests' as const },
  { label: 'Budget', icon: WalletCards, route: '/(tabs)/budget' as const },
  { label: 'Bookings', icon: Sparkles, route: '/bookings' as const },
];

const planningStudio = [
  { label: 'Create New Event', detail: 'Start another celebration', icon: Plus, route: '/event-setup' as const },
  { label: 'Package Studio', detail: 'Build your partner suite', icon: Package, route: '/package-builder' as const },
  { label: 'Event Timeline', detail: 'Your celebration schedule', icon: CalendarCheck, route: '/timeline' as const },
  { label: 'E-Invitations', detail: 'Create and share beautifully', icon: Send, route: '/invitations' as const },
  { label: 'Vendor Messages', detail: 'Proposals and conversations', icon: MessageCircle, route: '/messages' as const },
  { label: 'Preferences', detail: 'Personalize your Vellure', icon: Settings, route: '/settings' as const },
];

export default function HomeScreen() {
  const [name, setName] = useState('Sneha');
  const [city, setCity] = useState(getSelectedLocation().city || 'Jaipur');
  const [plan, setPlan] = useState<ActiveEventPlan | null>(null);
  const [categoriesVisible, setCategoriesVisible] = useState(false);

  const load = useCallback(async () => {
    const [profile, activePlan] = await Promise.all([
      fetchCustomerProfile().catch(() => null),
      fetchActiveEventPlan().catch(() => null),
    ]);
    if (profile?.displayName || profile?.fullName) {
      setName(profile.displayName || profile.fullName.split(' ')[0]);
    }
    setPlan(activePlan);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => subscribeSelectedLocation((location) => setCity(location.city)), []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const eventTitle = plan?.title || 'Meera & Arjun’s Wedding';
  const eventDate = plan?.date ? new Date(plan.date) : new Date('2027-02-14');
  const daysToGo = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / 86400000));
  const progress = plan?.completionPercentage ?? 40;

  return (
    <LuxuryScreen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>Vellure</Text>
        <View style={styles.topActions}>
          <VellureButton style={styles.circleButton} accessibilityLabel="Notifications" onPress={() => router.push('/notifications')}>
            <Bell size={19} color={colors.primary} strokeWidth={1.7} />
            <View style={styles.dot} />
          </VellureButton>
          <VellureButton style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </VellureButton>
        </View>
      </View>

      <Text style={styles.eyebrow}>{greeting}, {name}</Text>
      <Text style={styles.heroTitle}>Make beautiful{`\n`}moments happen.</Text>

      <View style={styles.aiSection}>
        <View style={styles.aiSectionHeading}>
          <View>
            <Text style={styles.aiSectionEyebrow}>VELLURE SIGNATURE EXPERIENCE</Text>
            <Text style={styles.aiSectionTitle}>Your celebration starts here</Text>
          </View>
          <View style={styles.aiFeaturedBadge}>
            <Sparkles size={11} color={colors.goldDark} />
            <Text style={styles.aiFeaturedText}>Featured</Text>
          </View>
        </View>

        <VellureButton style={styles.aiPlannerCard} onPress={() => router.push('/(tabs)/budget')}>
          <View style={styles.aiGlowLarge} />
          <View style={styles.aiGlowSmall} />
          <View style={styles.aiTopRow}>
            <View style={styles.aiIconWrap}>
              <Wand2 size={25} color={colors.goldLight} strokeWidth={1.55} />
            </View>
            <View style={styles.aiBadge}>
              <Sparkles size={10} color={colors.goldLight} />
              <Text style={styles.aiBadgeText}>CONVERSATIONAL AI PLANNER</Text>
            </View>
          </View>

          <Text style={styles.aiTitle}>Start Planning Something Memorable</Text>
          <Text style={styles.aiDescription}>
            Use our conversational AI planner to estimate budget and discover verified local partners.
          </Text>

          <View style={styles.aiPromptBox}>
            <View style={styles.aiPromptCopy}>
              <Text style={styles.aiPromptLabel}>DESCRIBE YOUR EVENT</Text>
              <Text style={styles.aiPromptText} numberOfLines={1}>Wedding in Jaipur · 250 guests · ₹25L</Text>
            </View>
            <View style={styles.aiPromptButton}>
              <Wand2 size={17} color={colors.primary} />
              <Text style={styles.aiPromptButtonText}>Plan</Text>
              <ChevronRight size={15} color={colors.primary} />
            </View>
          </View>

          <View style={styles.aiBenefits}>
            <View style={styles.aiBenefitItem}>
              <CheckCircle2 size={13} color={colors.goldLight} />
              <Text style={styles.aiBenefitText}>Instant budget estimate</Text>
            </View>
            <View style={styles.aiBenefitDot} />
            <View style={styles.aiBenefitItem}>
              <CheckCircle2 size={13} color={colors.goldLight} />
              <Text style={styles.aiBenefitText}>Verified local partners</Text>
            </View>
          </View>
        </VellureButton>
      </View>

      <VellureButton style={styles.searchBar} onPress={() => router.push('/search')}>
        <Search size={18} color={colors.textSecondary} strokeWidth={1.8} />
        <Text style={styles.searchText}>Search venues, services, or ideas…</Text>
      </VellureButton>

      <View style={styles.categoryHeader}>
        <Text style={styles.categorySectionTitle}>Explore celebrations</Text>
        <VellureButton style={styles.showAllButton} onPress={() => setCategoriesVisible(true)}>
          <Text style={styles.showAllText}>Show all</Text>
          <ChevronRight size={14} color={colors.primary} />
        </VellureButton>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map(({ label, icon: Icon }) => (
          <VellureButton key={label} style={styles.categoryItem} onPress={() => router.push('/(tabs)/vendors')}>
            <View style={styles.categoryIcon}>
              <Icon size={23} color={colors.wine} strokeWidth={1.55} />
            </View>
            <Text style={styles.categoryLabel} numberOfLines={1}>{label}</Text>
          </VellureButton>
        ))}
      </ScrollView>

      <SectionTitle title="Your Event" action="View plan" onAction={() => router.push('/(tabs)/plans')} />
      <VellureButton style={styles.eventCard} onPress={() => router.push('/(tabs)/plans')}>
        <ImageBackground
          source={require('../../assets/images/celebrations/wedding.jpg')}
          style={styles.eventImage}
          imageStyle={styles.eventImageRadius}
        >
          <View style={styles.eventImageOverlay} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateMonth}>{eventDate.toLocaleString('en', { month: 'short' }).toUpperCase()}</Text>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
          </View>
        </ImageBackground>
        <View style={styles.eventBody}>
          <View style={styles.eventHeadingRow}>
            <View style={styles.eventTextWrap}>
              <Text style={styles.eventTitle} numberOfLines={1}>{eventTitle}</Text>
              <View style={styles.metaRow}>
                <MapPin size={12} color={colors.goldDark} />
                <Text style={styles.metaText}>{plan?.city || city || 'Jaipur'}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.primary} />
          </View>
          <View style={styles.progressCopyRow}>
            <Text style={styles.progressCopy}>{daysToGo || 125} days to go</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <ProgressBar value={progress} />
        </View>
      </VellureButton>

      <SectionTitle title="Plan Your Celebration" />
      <View style={styles.quickGrid}>
        {quickActions.map(({ label, icon: Icon, route }) => (
          <VellureButton key={label} style={styles.quickCard} onPress={() => router.push(route)}>
            <View style={styles.quickIcon}>
              <Icon size={20} color={colors.primary} strokeWidth={1.65} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
            <ChevronRight size={14} color={colors.textMuted} />
          </VellureButton>
        ))}
      </View>

      <SectionTitle title="Planning Studio" action="My event" onAction={() => router.push('/(tabs)/plans')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studioRow}>
        {planningStudio.map(({ label, detail, icon: Icon, route }) => (
          <VellureButton key={label} style={styles.studioCard} onPress={() => router.push(route)}>
            <View style={styles.studioIcon}><Icon size={21} color={colors.goldDark} strokeWidth={1.6} /></View>
            <Text style={styles.studioTitle}>{label}</Text>
            <Text style={styles.studioDetail}>{detail}</Text>
            <View style={styles.studioAction}><Text style={styles.studioActionText}>Open</Text><ChevronRight size={13} color={colors.primary} /></View>
          </VellureButton>
        ))}
      </ScrollView>

      <SectionTitle title="Curated For You" action="Explore" onAction={() => router.push('/(tabs)/vendors')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
        <FeaturedCard
          image={require('../../assets/images/celebrations/reception.jpg')}
          title="The Raj Bagh Palace"
          subtitle="Heritage venue · Jaipur"
          price="From ₹2,50,000"
        />
        <FeaturedCard
          image={require('../../assets/images/celebrations/sangeet-mehendi.jpg')}
          title="Royal Blush Decor"
          subtitle="Signature styling"
          price="From ₹1,75,000"
        />
      </ScrollView>

      <View style={styles.quoteCard}>
        <View>
          <Text style={styles.quoteTitle}>Extraordinary events.</Text>
          <Text style={styles.quoteTitle}>Rooted in your story.</Text>
        </View>
        <Flower2 size={43} color={colors.gold} strokeWidth={1} />
      </View>

      <Modal visible={categoriesVisible} transparent animationType="fade" onRequestClose={() => setCategoriesVisible(false)}>
        <View style={styles.popoverScreen}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCategoriesVisible(false)} />
          <View style={styles.categoryPopover}>
            <View style={styles.popoverHandle} />
            <View style={styles.popoverHeader}>
              <View>
                <Text style={styles.popoverEyebrow}>CELEBRATION DIRECTORY</Text>
                <Text style={styles.popoverTitle}>Explore all categories</Text>
              </View>
              <VellureButton style={styles.doneButton} onPress={() => setCategoriesVisible(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </VellureButton>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.popoverList}>
              {categories.map(({ label, detail, icon: Icon }, index) => (
                <VellureButton
                  key={label}
                  style={[styles.popoverItem, index === categories.length - 1 && styles.popoverItemLast]}
                  onPress={() => {
                    setCategoriesVisible(false);
                    router.push('/(tabs)/vendors');
                  }}
                >
                  <View style={styles.popoverIcon}>
                    <Icon size={20} color={colors.primary} strokeWidth={1.6} />
                  </View>
                  <View style={styles.popoverCopy}>
                    <Text style={styles.popoverItemTitle}>{label}</Text>
                    <Text style={styles.popoverItemDetail}>{detail}</Text>
                  </View>
                  <ChevronRight size={17} color={colors.textMuted} />
                </VellureButton>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LuxuryScreen>
  );
}

function FeaturedCard({ image, title, subtitle, price }: { image: any; title: string; subtitle: string; price: string }) {
  return (
    <VellureButton style={styles.featuredCard} onPress={() => router.push('/(tabs)/vendors')}>
      <Image source={image} style={styles.featuredImage} />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.featuredSubtitle}>{subtitle}</Text>
        <Text style={styles.featuredPrice}>{price}</Text>
      </View>
    </VellureButton>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  wordmark: { color: colors.primary, fontFamily: typography.serif, fontSize: 27, letterSpacing: -0.8 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  circleButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  dot: { position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.goldDark },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  avatarText: { color: colors.textInverse, fontFamily: typography.serif, fontSize: 15 },
  eyebrow: { color: colors.textSecondary, fontFamily: typography.serif, fontSize: 14, marginTop: 8 },
  heroTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 31, lineHeight: 35, letterSpacing: -0.8, marginTop: 2 },
  searchBar: { height: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, marginTop: 16, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight, ...shadows.subtle },
  searchText: { color: colors.textMuted, fontSize: 12.5 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17, marginBottom: 10 },
  categorySectionTitle: { color: colors.textPrimary, fontFamily: typography.serif, fontSize: 17 },
  showAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 5, paddingLeft: 10 },
  showAllText: { color: colors.primary, fontSize: 10.5, fontWeight: '700' },
  categoryRow: { gap: 9, paddingRight: 8, paddingBottom: 2 },
  categoryItem: { width: 78, alignItems: 'center', gap: 6 },
  categoryIcon: { width: 78, height: 59, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight, borderWidth: 1, borderColor: colors.borderLight },
  categoryLabel: { color: colors.textPrimary, fontSize: 10.5, fontWeight: '500' },
  aiSection: { marginTop: 22 },
  aiSectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  aiSectionEyebrow: { color: colors.goldDark, fontSize: 8.5, fontWeight: '800', letterSpacing: 1.05 },
  aiSectionTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 18, marginTop: 3 },
  aiFeaturedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.goldLight },
  aiFeaturedText: { color: colors.goldDark, fontSize: 9, fontWeight: '700' },
  aiPlannerCard: { minHeight: 262, padding: 19, borderRadius: 23, overflow: 'hidden', backgroundColor: colors.surfaceDark, borderWidth: 1, borderColor: '#6E4558', ...shadows.luxury },
  aiGlowLarge: { position: 'absolute', width: 230, height: 230, borderRadius: 115, right: -90, top: -115, backgroundColor: 'rgba(201,153,88,0.13)', borderWidth: 1, borderColor: 'rgba(244,226,199,0.10)' },
  aiGlowSmall: { position: 'absolute', width: 135, height: 135, borderRadius: 68, left: -70, bottom: -75, backgroundColor: 'rgba(233,214,210,0.08)', borderWidth: 1, borderColor: 'rgba(244,226,199,0.07)' },
  aiTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  aiIconWrap: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,252,0.10)', borderWidth: 1, borderColor: 'rgba(244,226,199,0.28)' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, backgroundColor: 'rgba(255,253,252,0.08)' },
  aiBadgeText: { color: colors.goldLight, fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  aiTitle: { maxWidth: '92%', color: '#FFF8F3', fontFamily: typography.serif, fontSize: 24, lineHeight: 29, letterSpacing: -0.45 },
  aiDescription: { maxWidth: '94%', color: '#E6D7DC', fontSize: 11.5, lineHeight: 17.5, marginTop: 7 },
  aiPromptBox: { minHeight: 57, marginTop: 16, paddingLeft: 13, paddingRight: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF9F5' },
  aiPromptCopy: { flex: 1, minWidth: 0 },
  aiPromptLabel: { color: colors.goldDark, fontSize: 7.5, fontWeight: '800', letterSpacing: 0.8 },
  aiPromptText: { color: colors.textPrimary, fontSize: 10.5, marginTop: 3 },
  aiPromptButton: { minWidth: 78, height: 45, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: colors.goldLight },
  aiPromptButtonText: { color: colors.primary, fontFamily: typography.serif, fontSize: 13 },
  aiBenefits: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 13 },
  aiBenefitItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBenefitText: { color: '#E6D7DC', fontSize: 8.5, fontWeight: '500' },
  aiBenefitDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.gold },
  eventCard: { flexDirection: 'row', overflow: 'hidden', minHeight: 132, borderRadius: 18, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight, ...shadows.card },
  eventImage: { width: 118, minHeight: 132, padding: 10 },
  eventImageRadius: { borderTopLeftRadius: 17, borderBottomLeftRadius: 17 },
  eventImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(58, 23, 39, 0.12)', borderTopLeftRadius: 17, borderBottomLeftRadius: 17 },
  dateBadge: { width: 43, borderRadius: 12, paddingVertical: 6, alignItems: 'center', backgroundColor: 'rgba(255,253,252,0.92)' },
  dateMonth: { color: colors.primary, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  dateDay: { color: colors.primary, fontFamily: typography.serif, fontSize: 20, lineHeight: 23 },
  eventBody: { flex: 1, padding: 14, justifyContent: 'center' },
  eventHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventTextWrap: { flex: 1, paddingRight: 4 },
  eventTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { color: colors.textSecondary, fontSize: 10.5 },
  progressCopyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17, marginBottom: 6 },
  progressCopy: { color: colors.textSecondary, fontSize: 10.5 },
  progressValue: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickCard: { width: '48.6%', minHeight: 66, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  quickIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight },
  quickLabel: { flex: 1, color: colors.textPrimary, fontFamily: typography.serif, fontSize: 13.5 },
  studioRow: { gap: 10, paddingRight: 8, paddingBottom: 2 },
  studioCard: { width: 166, minHeight: 142, padding: 14, borderRadius: 18, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  studioIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldLight },
  studioTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 15, marginTop: 12 },
  studioDetail: { color: colors.textSecondary, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  studioAction: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 'auto' },
  studioActionText: { color: colors.primary, fontSize: 9.5, fontWeight: '700' },
  featuredRow: { gap: 11, paddingRight: 10, paddingBottom: 3 },
  featuredCard: { width: 214, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  featuredImage: { width: '100%', height: 105 },
  featuredBody: { padding: 11 },
  featuredTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 15 },
  featuredSubtitle: { color: colors.textSecondary, fontSize: 10.5, marginTop: 2 },
  featuredPrice: { color: colors.goldDark, fontSize: 11, fontWeight: '700', marginTop: 7 },
  quoteCard: { minHeight: 90, borderRadius: 18, marginTop: 23, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceDark, overflow: 'hidden' },
  quoteTitle: { color: '#FAEDE8', fontFamily: typography.serif, fontSize: 16, lineHeight: 21 },
  popoverScreen: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(39,20,29,0.46)' },
  categoryPopover: { width: '100%', maxWidth: 620, maxHeight: '78%', alignSelf: 'center', paddingTop: 9, paddingHorizontal: 18, paddingBottom: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.cream, ...shadows.luxury },
  popoverHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: colors.borderMedium },
  popoverHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 17 },
  popoverEyebrow: { color: colors.goldDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  popoverTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 23, marginTop: 3 },
  doneButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.blushLight },
  doneButtonText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  popoverList: { borderRadius: 18, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  popoverItem: { minHeight: 68, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  popoverItemLast: { borderBottomWidth: 0 },
  popoverIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blushLight },
  popoverCopy: { flex: 1 },
  popoverItemTitle: { color: colors.primary, fontFamily: typography.serif, fontSize: 14.5 },
  popoverItemDetail: { color: colors.textSecondary, fontSize: 9.5, marginTop: 3 },
});
