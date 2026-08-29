import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState,
  useEffect,
  useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Sparkles,
  Sliders,
  Send,
  FolderKanban,
  Store,
  ChevronRight,
  BookmarkCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

// Services & Models
import {
  fetchBudgetDashboardData,
  generateBudgetMatch,
  fetchCitiesData,
  fetchUserPreferences,
  createNewPlan,
  EventPlan,
} from '../../services/api';
import {
  parseNaturalLanguagePrompt,
  ParsedEventPlan,
} from '../../services/aiParser';
import { colors } from '../../constants/theme';

// Reusable Components
import { ConversationalAiInput, AiSubmitPayload } from '../../components/ui/ConversationalAiInput';
import { AiInterpretationCard } from '../../components/budget/AiInterpretationCard';
import { BudgetAllocationMatrix, BudgetCategoryItem } from '../../components/budget/BudgetAllocationMatrix';
import { AiVendorRecommendations } from '../../components/budget/AiVendorRecommendations';
import { AiCuratedBundles } from '../../components/budget/AiCuratedBundles';
import { QuickValidationSheet, QuickValidationValues } from '../../components/budget/QuickValidationSheet';
import { CityPickerModal, CityEntry } from '../../components/ui/CityPickerModal';
import { CalendarModal } from '../../components/ui/CalendarModal';
import { EventInquiryModal } from '../../components/inquiry/EventInquiryModal';

const DEFAULT_PROMPT =
  'Outdoor engagement in Patiala for 150 guests with catering, decor, photography, and live music. Budget ₹4 lakh.';

export default function BudgetScreen() {
  const params = useLocalSearchParams<{
    prompt?: string;
    eventType?: string;
    city?: string;
    guestCount?: string;
    budget?: string;
    budgetMin?: string;
    budgetMax?: string;
    theme?: string;
    services?: string;
  }>();

  // Parsing & State
  const [currentPrompt, setCurrentPrompt] = useState(DEFAULT_PROMPT);
  const [parsedPlan, setParsedPlan] = useState<ParsedEventPlan>(() =>
    parseNaturalLanguagePrompt(DEFAULT_PROMPT, 'Patiala')
  );

  // Results State
  const [categories, setCategories] = useState<BudgetCategoryItem[]>([]);
  const [matchedVendors, setMatchedVendors] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiProvider, setAiProvider] = useState<'ollama' | 'local-planner'>('local-planner');
  const [aiModel, setAiModel] = useState('vellure-rules-v1');
  const [reasoning, setReasoning] = useState('');
  const [citiesData, setCitiesData] = useState<CityEntry[]>([]);

  // Modals state
  const [showValidationSheet, setShowValidationSheet] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<any>(null);
  const [savedPlanSuccess, setSavedPlanSuccess] = useState<EventPlan | null>(null);

  // Run AI Optimization
  const runAiOptimization = async (plan: ParsedEventPlan) => {
    setIsGenerating(true);
    try {
      const result = await generateBudgetMatch({
        totalBudget: plan.totalBudget,
        guestCount: plan.guestCount,
        city: plan.city,
        vibe: plan.theme,
        eventType: plan.eventType,
        description: plan.rawPrompt,
        date: plan.eventDate || '',
      });

      if (result.categories && result.categories.length > 0) {
        setCategories(result.categories);
        if (result.matchedVendors) setMatchedVendors(result.matchedVendors);
        if (result.aiGenerated !== undefined) setAiGenerated(result.aiGenerated);
        if (result.provider) setAiProvider(result.provider);
        if (result.model) setAiModel(result.model);
        if (result.reasoning) setReasoning(result.reasoning);
      } else {
        // Fallback calculation matching Indian market standards
        const b = plan.totalBudget;
        setCategories([
          { id: '1', name: 'Venue & Catering', amount: Math.round(b * 0.48), color: '#641E3D' },
          { id: '2', name: 'Decor & Lighting', amount: Math.round(b * 0.22), color: '#9E3A5A' },
          { id: '3', name: 'Photography', amount: Math.round(b * 0.15), color: '#D2AD6B' },
          { id: '4', name: 'Entertainment & Music', amount: Math.round(b * 0.10), color: '#E8DCC8' },
          { id: '5', name: 'Miscellaneous & Rituals', amount: Math.round(b * 0.05), color: '#A08F7E' },
        ]);
        setReasoning(`Optimized allocation matrix for ${plan.eventType} in ${plan.city}`);
        setAiGenerated(false);
        setAiProvider('local-planner');
        setAiModel('vellure-rules-v1');
      }
    } catch (err) {
      console.error('Budget generation error:', err);
      const b = plan.totalBudget;
      setCategories([
        { id: '1', name: 'Venue & Catering', amount: Math.round(b * 0.48), color: '#641E3D' },
        { id: '2', name: 'Decor & Lighting', amount: Math.round(b * 0.22), color: '#9E3A5A' },
        { id: '3', name: 'Photography', amount: Math.round(b * 0.15), color: '#D2AD6B' },
        { id: '4', name: 'Entertainment & Music', amount: Math.round(b * 0.10), color: '#E8DCC8' },
        { id: '5', name: 'Miscellaneous & Rituals', amount: Math.round(b * 0.05), color: '#A08F7E' },
      ]);
      setReasoning(`Benchmark distribution applied for ${plan.eventType}`);
      setAiGenerated(false);
      setAiProvider('local-planner');
      setAiModel('vellure-rules-v1');
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial Load & Route Param Parsing
  useEffect(() => {
    const loadInitial = () => {
      try {
        let promptToUse = DEFAULT_PROMPT;
        const defaultCity = params.city || 'Patiala';

        if (params.prompt) {
          promptToUse = params.prompt;
        } else if (params.eventType || params.city || params.budget) {
          const parts: string[] = [];
          if (params.eventType) parts.push(params.eventType);
          if (params.city) parts.push(`in ${params.city}`);
          if (params.guestCount) parts.push(`for ${params.guestCount} guests`);
          if (params.budget) parts.push(`budget ₹${params.budget}`);
          if (params.theme) parts.push(`theme ${params.theme}`);
          promptToUse = parts.join(' ');
        }

        setCurrentPrompt(promptToUse);
        const parsed = parseNaturalLanguagePrompt(promptToUse, defaultCity);

        // Explicit parameter overrides
        if (params.city) parsed.city = params.city;
        if (params.eventType) parsed.eventType = params.eventType;
        if (params.guestCount) parsed.guestCount = parseInt(params.guestCount, 10) || parsed.guestCount;
        if (params.budget) parsed.totalBudget = parseInt(params.budget.replace(/[^0-9]/g, ''), 10) || parsed.totalBudget;
        if (params.theme) parsed.theme = params.theme;

        setParsedPlan(parsed);
        setIsLoading(false);
        void runAiOptimization(parsed);

        // Optional backend data must never block the free local planner UI.
        void Promise.all([
          fetchCitiesData().catch(() => ({ cities: [] })),
          fetchUserPreferences().catch(() => null),
        ]).then(([citiesResp]) => {
          setCitiesData(citiesResp?.cities || []);
        });
      } catch (e) {
        console.error('Error loading AI planner:', e);
        setIsLoading(false);
      }
    };

    loadInitial();
  }, [params.prompt, params.eventType, params.budget, params.guestCount, params.city]);

  // Handle Conversational Submit
  const handlePromptSubmit = (payload: AiSubmitPayload) => {
    setCurrentPrompt(payload.prompt);
    const parsed = parseNaturalLanguagePrompt(payload.prompt, payload.city || parsedPlan.city);

    if (payload.eventType) parsed.eventType = payload.eventType;
    if (payload.city) parsed.city = payload.city;
    if (payload.guestCount) parsed.guestCount = payload.guestCount;
    if (payload.budget) parsed.totalBudget = payload.budget;
    if (payload.theme) parsed.theme = payload.theme;
    if (payload.services) parsed.requiredServices = payload.services;

    setParsedPlan(parsed);
    runAiOptimization(parsed);
  };

  // Handle Quick Validation Updates
  const handleApplyValidation = (updated: QuickValidationValues) => {
    const newPlan: ParsedEventPlan = {
      ...parsedPlan,
      eventType: updated.eventType,
      city: updated.city,
      guestCount: updated.guestCount,
      totalBudget: updated.totalBudget,
      theme: updated.theme,
      eventDate: updated.date,
      requiredServices: updated.requiredServices,
      confidence: 1.0,
      assumptions: [`Manually reviewed and validated by host for ${updated.city}`],
      missingInfo: [],
    };
    setParsedPlan(newPlan);
    runAiOptimization(newPlan);
  };

  // Save as Active Blueprint into My Plans
  const handleSaveAsBlueprint = async () => {
    try {
      const created = await createNewPlan({
        name: `${parsedPlan.theme} ${parsedPlan.eventType}`,
        eventType: parsedPlan.eventType,
        city: parsedPlan.city,
        date: parsedPlan.eventDate || '',
        guestCount: parsedPlan.guestCount,
        budgetMax: parsedPlan.totalBudget,
        theme: parsedPlan.theme,
        description: parsedPlan.rawPrompt,
        requiredServices: parsedPlan.requiredServices,
      });

      setSavedPlanSuccess(created);
      Alert.alert(
        'Blueprint Saved to My Plans',
        `"${created.name}" has been created as your active event blueprint. You can track services, shortlisted vendors, and quotations directly from your planning workspace.`,
        [
          {
            text: 'Keep Editing AI Budget',
            style: 'cancel',
          },
          {
            text: 'Go to My Plans',
            onPress: () => router.push('/(tabs)/plans'),
          },
        ]
      );
    } catch (e) {
      console.error('Failed to save plan:', e);
      Alert.alert('Error', 'Unable to save blueprint. Please try again.');
    }
  };

  const handleInquireVendor = (vendor: any) => {
    setInquiryTarget({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      isPackage: false,
    });
    setShowInquiryModal(true);
  };

  const handleInquireBundle = (bundle: any) => {
    setInquiryTarget({
      id: bundle.id,
      name: bundle.title,
      category: bundle.eventType,
      isPackage: true,
    });
    setShowInquiryModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Analyzing Natural Language Request & Local Rates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ──── 1. HEADER & PRODUCT HERO ──── */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Sparkles size={12} color="#D2AD6B" />
            <Text style={styles.headerBadgeText}>AI Indian Event Planner</Text>
          </View>
          <Text style={styles.headerTitle}>Plan with AI</Text>
          <Text style={styles.headerSubtitle}>
            Transform your vision into structured budgets, verified specialist allocations, and actionable celebration blueprints.
          </Text>
        </View>

        {/* ──── 2. CONVERSATIONAL AI PROMPT BOX ──── */}
        <View style={styles.promptWrap}>
          <ConversationalAiInput
            initialText={currentPrompt}
            currentCity={parsedPlan.city}
            onSubmit={handlePromptSubmit}
          />
        </View>

        {/* ──── 3. AI STRUCTURED INTERPRETATION CARD ──── */}
        <AiInterpretationCard
          plan={parsedPlan}
          onEditPress={() => setShowValidationSheet(true)}
          onServiceToggle={(srv) => {
            const updated = parsedPlan.requiredServices.includes(srv)
              ? parsedPlan.requiredServices.filter((s) => s !== srv)
              : [...parsedPlan.requiredServices, srv];
            setParsedPlan({ ...parsedPlan, requiredServices: updated });
          }}
        />

        {/* ──── 4. SMART BUDGET ALLOCATION MATRIX ──── */}
        <BudgetAllocationMatrix
          totalBudget={parsedPlan.totalBudget}
          guestCount={parsedPlan.guestCount}
          categories={categories}
          reasoning={reasoning}
          aiGenerated={aiGenerated}
          provider={aiProvider}
          model={aiModel}
        />

        {/* ──── 5. AI MATCHED LOCAL VENDORS ──── */}
        <AiVendorRecommendations
          matchedVendors={matchedVendors}
          hostCity={parsedPlan.city}
          onInquireVendor={handleInquireVendor}
        />

        {/* ──── 6. CURATED STARTER PACKAGES ──── */}
        <AiCuratedBundles
          eventType={parsedPlan.eventType}
          guestCount={parsedPlan.guestCount}
          city={parsedPlan.city}
          totalBudget={parsedPlan.totalBudget}
          onInquireBundle={handleInquireBundle}
        />

        {/* ──── 7. ACTION HUB: SAVE & EXPLORE ──── */}
        <View style={styles.actionHub}>
          <View style={styles.hubHeader}>
            <BookmarkCheck size={14} color="#641E3D" />
            <Text style={styles.hubTitle}>Save or Execute This Blueprint</Text>
          </View>

          <VellureButton
            style={styles.saveBlueprintBtn}
            onPress={handleSaveAsBlueprint}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Save as active celebration blueprint"
          >
            <FolderKanban size={16} color="#FFFFFF" />
            <Text style={styles.saveBlueprintBtnText}>Save as Active Event Blueprint</Text>
          </VellureButton>

          <View style={styles.secondaryActionsRow}>
            <VellureButton
              style={styles.secBtn}
              onPress={() => {
                setInquiryTarget({
                  id: 'ai_blueprint_all',
                  name: `${parsedPlan.theme} ${parsedPlan.eventType}`,
                  category: 'Curated Multi-Vendor Inquiry',
                  isPackage: true,
                });
                setShowInquiryModal(true);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Request consultations for this plan"
            >
              <Send size={13} color="#641E3D" />
              <Text style={styles.secBtnText}>Consult Specialist Team</Text>
            </VellureButton>

            <VellureButton
              style={styles.secBtn}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/vendors',
                  params: { city: parsedPlan.city },
                })
              }
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Explore all vendors in city"
            >
              <Store size={13} color="#641E3D" />
              <Text style={styles.secBtnText}>Explore Directory</Text>
            </VellureButton>
          </View>
        </View>
      </ScrollView>

      {/* Quick Validation / Parameter Fine-Tuning Sheet */}
      <QuickValidationSheet
        visible={showValidationSheet}
        initialValues={{
          eventType: parsedPlan.eventType,
          city: parsedPlan.city,
          guestCount: parsedPlan.guestCount,
          totalBudget: parsedPlan.totalBudget,
          theme: parsedPlan.theme,
          date: parsedPlan.eventDate || '',
          requiredServices: parsedPlan.requiredServices,
        }}
        cities={citiesData}
        onClose={() => setShowValidationSheet(false)}
        onApply={handleApplyValidation}
      />

      {/* Multi-Vendor / Single Vendor Consultation Modal */}
      {showInquiryModal && (
        <EventInquiryModal
          visible={showInquiryModal}
          onClose={() => setShowInquiryModal(false)}
          targetId={inquiryTarget?.id || 'ai_curated'}
          targetName={inquiryTarget?.name || `${parsedPlan.theme} ${parsedPlan.eventType}`}
          targetCategory={inquiryTarget?.category || parsedPlan.eventType}
          isPackage={inquiryTarget?.isPackage ?? true}
          initialCity={parsedPlan.city}
          initialBudget={parsedPlan.totalBudget}
          initialGuestCount={parsedPlan.guestCount}
          initialEventType={parsedPlan.eventType}
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
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 140, // Ensures all buttons are visible above floating tab bar
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    backgroundColor: '#FDFBF7',
    marginBottom: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerTitle: {
    color: '#641E3D',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#786B70',
    fontSize: 12,
    lineHeight: 18,
  },
  promptWrap: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  actionHub: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginHorizontal: 20,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  hubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hubTitle: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  saveBlueprintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 10,
  },
  saveBlueprintBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  secBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
});
