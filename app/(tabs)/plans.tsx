import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  FolderKanban,
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  Clock,
  Plus,
  ArrowRight,
  SlidersHorizontal,
  FileCheck,
  Send,
  HelpCircle,
  Archive,
  History,
  FileText,
  MapPin,
  ChevronRight,
  Store,
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';

// Services & Models
import {
  EventPlan,
  AttentionItem,
  EventInquiry,
  fetchCustomerPlans,
  fetchAttentionItems,
  fetchEventInquiries,
  duplicateEventPlan,
  archiveEventPlan,
  restoreEventPlan,
  deleteDraftPlan,
  saveEventPlan,
} from '../../services/api';
import { colors } from '../../constants/theme';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyStateCard } from '../../components/ui/EmptyStateCard';
import { InquiryCard } from '../../components/ui/InquiryCard';
import { ActivityItemRow } from '../../components/ui/ActivityItemRow';

// Subcomponents
import { PlansHeader } from '../../components/plans/PlansHeader';
import { AttentionCard } from '../../components/plans/AttentionCard';
import { ActivePlanHero } from '../../components/plans/ActivePlanHero';
import { PlanCard } from '../../components/plans/PlanCard';
import { NewPlanModal } from '../../components/plans/NewPlanModal';
import { PlanWorkspaceModal } from '../../components/plans/PlanWorkspaceModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'DRAFT'
  | 'WAITING_VENDORS'
  | 'QUOTES_READY'
  | 'READY_TO_BOOK'
  | 'COMPLETED'
  | 'ARCHIVED';

export default function MyPlansScreen() {
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [selectedPlanForWorkspace, setSelectedPlanForWorkspace] = useState<EventPlan | null>(null);

  const loadPlansData = useCallback(async () => {
    try {
      const [allPlans, attItems, inqList] = await Promise.all([
        fetchCustomerPlans(),
        fetchAttentionItems(),
        fetchEventInquiries().catch(() => []),
      ]);
      setPlans(allPlans);
      setAttentionItems(attItems);
      setInquiries(inqList);
    } catch (e) {
      console.error('Error loading plans:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlansData();
    }, [loadPlansData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlansData();
  };

  // Primary Plan
  const primaryPlan = useMemo(() => {
    return plans.find(
      (p) => p.isPrimary && p.status !== 'ARCHIVED' && p.status !== 'CANCELLED' && p.status !== 'COMPLETED'
    ) || plans.find(
      (p) => p.status !== 'ARCHIVED' && p.status !== 'CANCELLED' && p.status !== 'COMPLETED'
    ) || null;
  }, [plans]);

  // Filter & Search Pipeline
  const filteredPlans = useMemo(() => {
    let list = plans;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.eventType.toLowerCase().includes(q)
      );
    }

    // Status filter
    switch (selectedFilter) {
      case 'ACTIVE':
        return list.filter(
          (p) => p.status !== 'ARCHIVED' && p.status !== 'CANCELLED' && p.status !== 'COMPLETED'
        );
      case 'DRAFT':
        return list.filter((p) => p.status === 'DRAFT' || p.status === 'DETAILS_INCOMPLETE');
      case 'WAITING_VENDORS':
        return list.filter((p) => p.status === 'ENQUIRIES_SENT' || p.status === 'ENQUIRIES_PENDING');
      case 'QUOTES_READY':
        return list.filter((p) => p.status === 'QUOTES_RECEIVED' || p.status === 'REVIEWING_QUOTES');
      case 'READY_TO_BOOK':
        return list.filter((p) => p.status === 'READY_TO_BOOK' || p.status === 'BOOKING_REQUESTED');
      case 'COMPLETED':
        return list.filter((p) => p.status === 'COMPLETED');
      case 'ARCHIVED':
        return list.filter((p) => p.status === 'ARCHIVED');
      default:
        return list;
    }
  }, [plans, searchQuery, selectedFilter]);

  // Plan Actions
  const handleDuplicatePlan = async (planId: string) => {
    const duplicated = await duplicateEventPlan(planId);
    if (duplicated) {
      Alert.alert('Plan Duplicated', `"${duplicated.name}" has been created.`);
      loadPlansData();
    }
  };

  const handleArchivePlan = async (planId: string) => {
    Alert.alert(
      'Archive Plan',
      'This plan will be moved to your archived list. Inquiries and quote history will remain preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await archiveEventPlan(planId);
            loadPlansData();
            if (selectedPlanForWorkspace?.id === planId) {
              setSelectedPlanForWorkspace(null);
            }
          },
        },
      ]
    );
  };

  const handleDeletePlan = async (planId: string) => {
    await deleteDraftPlan(planId);
    loadPlansData();
    if (selectedPlanForWorkspace?.id === planId) {
      setSelectedPlanForWorkspace(null);
    }
  };

  const handleAttentionAction = (item: AttentionItem) => {
    const targetPlan = plans.find((p) => p.id === item.planId);
    if (targetPlan) {
      setSelectedPlanForWorkspace(targetPlan);
    }
  };

  const filterTabs = [
    { id: 'ACTIVE', label: `Active Plans (${plans.filter((p) => p.status !== 'ARCHIVED' && p.status !== 'CANCELLED').length})` },
    { id: 'DRAFT', label: `Drafts (${plans.filter((p) => p.status === 'DRAFT' || p.status === 'DETAILS_INCOMPLETE').length})` },
    { id: 'QUOTES_READY', label: `Quotes Ready (${plans.filter((p) => p.status === 'QUOTES_RECEIVED' || p.status === 'REVIEWING_QUOTES').length})` },
    { id: 'WAITING_VENDORS', label: `Waiting (${plans.filter((p) => p.status === 'ENQUIRIES_SENT' || p.status === 'ENQUIRIES_PENDING').length})` },
    { id: 'ARCHIVED', label: `Archived (${plans.filter((p) => p.status === 'ARCHIVED').length})` },
  ];

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case 'Quote Ready':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', label: 'Quote Ready' };
      case 'Under Review':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Under Review' };
      case 'Confirmed':
        return { bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE', label: 'Confirmed Plan' };
      default:
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Inquiry Sent' };
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Loading Planning Workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ──── 1. HEADER & SEARCH ──── */}
        <PlansHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewPlanPress={() => setNewPlanOpen(true)}
          onFilterPress={() => {
            const nextIdx = (filterTabs.findIndex((t) => t.id === selectedFilter) + 1) % filterTabs.length;
            setSelectedFilter(filterTabs[nextIdx].id as StatusFilter);
          }}
        />

        {/* ──── 2. ATTENTION REQUIRED ──── */}
        <AttentionCard items={attentionItems} onActionPress={handleAttentionAction} />

        {/* ──── 3. PRIMARY ACTIVE PLAN HERO ──── */}
        {primaryPlan && selectedFilter === 'ACTIVE' && !searchQuery && (
          <ActivePlanHero
            plan={primaryPlan}
            onResumePress={() => router.push('/(tabs)/budget')}
            onViewDetailsPress={() => setSelectedPlanForWorkspace(primaryPlan)}
          />
        )}

        {/* ──── 4. STATUS FILTER TABS ──── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab.id as StatusFilter)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${tab.label}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ──── 5. PLAN LIST / EMPTY STATES ──── */}
        <View style={styles.plansListSection}>
          {filteredPlans.length === 0 ? (
            <EmptyStateCard
              icon={<FolderKanban size={32} color="#D2AD6B" />}
              title={
                selectedFilter === 'ARCHIVED'
                  ? 'No Archived Plans'
                  : 'Your Next Celebration Starts Here'
              }
              description={
                selectedFilter === 'ARCHIVED'
                  ? 'Plans you archive will appear here for reference or restoration.'
                  : 'Describe your event and Vellure will help organize required services, budgets, and verified specialists.'
              }
              actionText="Create New Plan"
              onAction={() => setNewPlanOpen(true)}
            />
          ) : (
            filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpenPlan={() => setSelectedPlanForWorkspace(plan)}
                onDuplicatePlan={() => handleDuplicatePlan(plan.id)}
                onArchivePlan={() => handleArchivePlan(plan.id)}
                onDeletePlan={() => handleDeletePlan(plan.id)}
              />
            ))
          )}
        </View>

        {/* ──── 6. DIRECT SUBMITTED INQUIRIES & CONSULTATIONS ──── */}
        <View style={styles.inquiriesSection}>
          <SectionHeader
            title="Submitted Quotes & Consultations"
            subtitle="Track partner responses, availability checks, and quotations"
            badge="Partner Pipeline"
          />

          {inquiries.length === 0 ? (
            <View style={styles.emptyInquiryCard}>
              <FileText size={32} color="#D2AD6B" />
              <Text style={styles.emptyInquiryTitle}>No Inquiries in Progress</Text>
              <Text style={styles.emptyInquiryDesc}>
                When you consult with vendors or request curated packages, your tracking timeline will appear here.
              </Text>
              <TouchableOpacity
                style={styles.emptyInquiryBtn}
                onPress={() => router.push('/(tabs)/vendors')}
                activeOpacity={0.85}
              >
                <Store size={14} color="#FFFFFF" />
                <Text style={styles.emptyInquiryBtnText}>Explore Partner Directory</Text>
              </TouchableOpacity>
            </View>
          ) : (
            inquiries.map((inq) => (
              <InquiryCard
                key={inq.id}
                inquiry={inq}
                onPressTarget={(item) =>
                  router.push(item.isPackage ? '/(tabs)/budget' : `/vendor/${item.targetId}`)
                }
              />
            ))
          )}
        </View>

        {/* ──── 7. RECENT ACTIVITY ──── */}
        {plans.length > 0 && (
          <View style={styles.activitySection}>
            <View style={styles.activityHeaderRow}>
              <History size={14} color="#641E3D" />
              <Text style={styles.activityHeading}>Recent Planning Activity</Text>
            </View>

            <View style={styles.activityCard}>
              <ActivityItemRow
                title="Quote proposal received from Royal Kitchen"
                subtitle="Royal Wedding Celebration"
                timeAgo="2 days ago"
              />
              <ActivityItemRow
                title="Consultation enquiry sent to RR Studios"
                subtitle="Royal Wedding Celebration"
                timeAgo="3 days ago"
              />
              <ActivityItemRow
                title="Fort Patiala shortlisted for venue lawns"
                subtitle="Royal Wedding Celebration"
                timeAgo="5 days ago"
                showDivider={false}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* New Plan Choice Modal */}
      <NewPlanModal
        visible={newPlanOpen}
        onClose={() => setNewPlanOpen(false)}
        onPlanCreated={(newPlan) => {
          loadPlansData();
          setSelectedPlanForWorkspace(newPlan);
        }}
      />

      {/* Plan Workspace Deep Modal */}
      {selectedPlanForWorkspace && (
        <PlanWorkspaceModal
          visible={Boolean(selectedPlanForWorkspace)}
          plan={selectedPlanForWorkspace}
          onClose={() => setSelectedPlanForWorkspace(null)}
          onPlanUpdated={(updated) => {
            setSelectedPlanForWorkspace(updated);
            loadPlansData();
          }}
          onDuplicatePlan={handleDuplicatePlan}
          onArchivePlan={handleArchivePlan}
          onDeletePlan={handleDeletePlan}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  centerScreen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
  scrollContent: {
    paddingBottom: 140, // Ensures all buttons are visible above floating navigation
  },
  filterTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  filterChipActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  filterChipText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  plansListSection: {
    paddingTop: 4,
  },
  inquiriesSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  emptyInquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
  },
  emptyInquiryTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyInquiryDesc: {
    color: '#786B70',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  emptyInquiryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyInquiryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inquiryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inquiryLeft: {
    flex: 1,
    paddingRight: 10,
  },
  inquiryCatText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  inquiryTargetTitle: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
  },
  inquiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  inquiryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inquiryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  inquiryGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inquiryGridText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  notesText: {
    color: '#4A3E44',
    fontSize: 11,
    fontStyle: 'italic',
  },
  inquiryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FAF5EC',
  },
  refInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  refCode: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  refDate: {
    color: '#8A7A70',
    fontSize: 10,
  },
  inquiryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  inquiryCtaText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  activitySection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  activityHeading: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D2AD6B',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  activityMeta: {
    color: '#8A7A70',
    fontSize: 10,
    marginTop: 1,
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#FAF5EC',
    marginVertical: 10,
    marginLeft: 18,
  },
});
