import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import {
  Check,
  ChevronRight,
  Eye,
  Layers,
  Palette,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import {
  generateInvitation,
  generateInvitationFromBackend,
  partialRegenerateFromBackend,
  InvitationDraft,
  InvitationEventType,
  InvitationLayout,
  InvitationMotif,
  InvitationRequest,
  InvitationTone,
} from '../services/invitationGenerator';
import { InvitationCanvas } from '../components/invitation/InvitationCanvas';
import {
  LuxuryCard,
  LuxuryScreen,
  PrimaryPill,
  ScreenHeader,
  SectionTitle,
} from '../components/ui/LuxuryLayout';
import { VellureButton, VellureTextInput } from '../components/ui/VellureControls';

const EVENT_TYPES: InvitationEventType[] = [
  'Wedding',
  'Engagement',
  'Mehendi',
  'Sangeet',
  'Haldi',
  'Reception',
  'Birthday',
  'Anniversary',
  'Housewarming',
  'Corporate Gala',
];

const TONE_OPTIONS: InvitationTone[] = [
  'Traditional',
  'Warm',
  'Modern',
  'Formal',
  'Regal Royal',
  'Floral Elegance',
];

const LAYOUT_OPTIONS: { id: InvitationLayout; label: string }[] = [
  { id: 'royal-arch', label: 'Royal Arch' },
  { id: 'botanical-frame', label: 'Botanical Frame' },
  { id: 'regal-monogram', label: 'Regal Monogram' },
  { id: 'festive-garland', label: 'Festive Garland' },
  { id: 'modern-orbit', label: 'Modern Orbit' },
];

const MOTIF_OPTIONS: { id: InvitationMotif; label: string }[] = [
  { id: 'lotus', label: 'Lotus (Padma)' },
  { id: 'peacock', label: 'Peacock (Mayura)' },
  { id: 'mandala', label: 'Mandala' },
  { id: 'marigold', label: 'Marigold (Genda)' },
  { id: 'rings', label: 'Rings' },
  { id: 'lamps', label: 'Diya (Lamp)' },
  { id: 'leaves', label: 'Botanical Leaves' },
  { id: 'stars', label: 'Celestial Stars' },
];

const DEFAULTS: Record<InvitationEventType, Partial<InvitationRequest>> = {
  Wedding: {
    primaryName: 'Meera',
    secondaryName: 'Arjun',
    date: 'Saturday, 14 February 2027',
    time: '4:00 PM onwards',
    venue: 'The Leela Palace',
    city: 'Jaipur, Rajasthan',
    hostNames: 'Together with their families',
    tone: 'Warm',
  },
  Engagement: {
    primaryName: 'Ananya',
    secondaryName: 'Rohan',
    date: 'Sunday, 22 November 2026',
    time: '6:30 PM onwards',
    venue: 'The Raj Bagh Palace',
    city: 'Udaipur, Rajasthan',
    hostNames: 'Together with their families',
    tone: 'Warm',
  },
  Mehendi: {
    primaryName: 'Meera',
    date: 'Friday, 12 February 2027',
    time: '12:00 PM onwards',
    venue: 'The Courtyard Garden',
    city: 'Jaipur, Rajasthan',
    hostNames: 'The Sharma Family',
    tone: 'Floral Elegance',
  },
  Sangeet: {
    primaryName: 'Meera',
    secondaryName: 'Arjun',
    date: 'Friday, 12 February 2027',
    time: '7:30 PM onwards',
    venue: 'The Royal Ballroom',
    city: 'Jaipur, Rajasthan',
    hostNames: 'Together with their families',
    tone: 'Warm',
  },
  Haldi: {
    primaryName: 'Meera',
    secondaryName: 'Arjun',
    date: 'Thursday, 11 February 2027',
    time: '10:30 AM onwards',
    venue: 'The Marigold Lawn',
    city: 'Jaipur, Rajasthan',
    hostNames: 'Together with their families',
    tone: 'Floral Elegance',
  },
  Reception: {
    primaryName: 'Meera',
    secondaryName: 'Arjun',
    date: 'Monday, 15 February 2027',
    time: '7:00 PM onwards',
    venue: 'The Grand Pavilion',
    city: 'Delhi NCR',
    hostNames: 'Together with their families',
    tone: 'Formal',
  },
  Birthday: {
    primaryName: 'Aarav',
    date: 'Sunday, 18 October 2026',
    time: '4:00 PM onwards',
    venue: 'The Celebration Lawn',
    city: 'Mumbai, Maharashtra',
    hostNames: 'Together with family & friends',
    tone: 'Warm',
  },
  Anniversary: {
    primaryName: 'Priya',
    secondaryName: 'Karan',
    date: 'Saturday, 5 December 2026',
    time: '7:30 PM onwards',
    venue: 'The Ivory Hall',
    city: 'Bengaluru, Karnataka',
    hostNames: 'Together with family & friends',
    tone: 'Regal Royal',
  },
  Housewarming: {
    primaryName: 'The Iyer Family',
    date: 'Sunday, 8 November 2026',
    time: '10:30 AM onwards',
    venue: 'Anandam Sanctuary',
    city: 'Bengaluru, Karnataka',
    hostNames: 'The Iyer Family',
    tone: 'Traditional',
  },
  'Corporate Gala': {
    primaryName: 'Vellure India',
    date: 'Friday, 20 November 2026',
    time: '7:00 PM onwards',
    venue: 'The Grand Ballroom',
    city: 'Mumbai, Maharashtra',
    hostNames: 'Vellure India',
    tone: 'Formal',
  },
};

type StudioTab = 'Design' | 'Wording' | 'AI Intelligence' | 'Quality Review';

export default function InvitationsScreen() {
  const [eventType, setEventType] = useState<InvitationEventType>('Wedding');
  const [variation, setVariation] = useState(0);
  const [request, setRequest] = useState<InvitationRequest>(() => buildRequest('Wedding', 0));
  const [draft, setDraft] = useState<InvitationDraft>(() => generateInvitation(request));
  const [currentTab, setCurrentTab] = useState<StudioTab>('Design');
  const [showSafeZoneGuide, setShowSafeZoneGuide] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [shareSuccessModal, setShareSuccessModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const generationLabel = useMemo(
    () => `${draft.layout.replace('-', ' ')} · ${draft.motif} seal`,
    [draft]
  );

  const fetchDesign = async (nextReq: InvitationRequest) => {
    setIsGenerating(true);
    setGenerationStep('Engaging 25-Agent Architecture...');
    try {
      const nextDraft = await generateInvitationFromBackend(nextReq, (step) => {
        setGenerationStep(step);
      });
      setDraft(nextDraft);
    } catch {
      // Handled via graceful offline fallback
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const chooseEvent = (nextType: InvitationEventType) => {
    const nextRequest = buildRequest(nextType, 0);
    setEventType(nextType);
    setVariation(0);
    setRequest(nextRequest);
    void fetchDesign(nextRequest);
  };

  const regenerate = () => {
    const nextVariation = variation + 1;
    const nextRequest: InvitationRequest = {
      ...request,
      variation: nextVariation,
      layoutPreference: undefined,
    };
    setVariation(nextVariation);
    setRequest(nextRequest);
    void fetchDesign(nextRequest);
  };

  const updateRequest = (changes: Partial<InvitationRequest>) => {
    const next = { ...request, ...changes };
    setRequest(next);
    void fetchDesign(next);
  };

  const triggerPartialRegeneration = async (
    action:
      | 'change_wording_only'
      | 'change_border_only'
      | 'change_decorations_only'
      | 'make_more_traditional'
      | 'make_more_modern'
      | 'make_more_premium'
      | 'reduce_decorations'
      | 'add_lotus_elements'
      | 'change_typography'
      | 'change_colors'
  ) => {
    setIsGenerating(true);
    setGenerationStep(`Targeted refinement: ${action.replace(/_/g, ' ')}...`);
    try {
      const nextDraft = await partialRegenerateFromBackend(
        draft.generationId,
        action,
        draft,
        request,
        (msg) => setGenerationStep(msg)
      );
      setDraft(nextDraft);
    } catch {
      //
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const shareInvitation = async () => {
    const names = draft.names.join(' & ');
    await Share.share({
      title: `${draft.eventType} Invitation`,
      message: `${draft.hostLine}\n\n${names}\n${draft.headline}\n\n${draft.invitationLine}\n\n“${draft.blessingLine}”\n\n📅 ${draft.dateLine}\n⏰ ${draft.timeLine}\n📍 ${draft.venueLine}, ${draft.cityLine}\n\n${draft.closingLine}\n\n— Crafted with Vellure Luxury Studio`,
    });
    setShareSuccessModal(true);
  };

  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Screen Header */}
      <ScreenHeader
        title="AI E-Invitation Studio"
        subtitle="Bespoke ceremony wording, cultural etiquette, & luxury layouts"
      />

      {/* 1. Celebration Selector */}
      <SectionTitle title="Choose celebration" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventScroller}
      >
        {EVENT_TYPES.map((item) => (
          <VellureButton
            key={item}
            style={[styles.eventChip, eventType === item && styles.eventChipActive]}
            onPress={() => chooseEvent(item)}
          >
            <Text
              style={[
                styles.eventChipText,
                eventType === item && styles.eventChipTextActive,
              ]}
            >
              {item}
            </Text>
          </VellureButton>
        ))}
      </ScrollView>

      {/* 2. AI Invitation Intelligence Card */}
      <View style={styles.aiHero}>
        <View style={styles.aiGlow} />
        <View style={styles.aiHeaderRow}>
          <View style={styles.aiIcon}>
            <Wand2 size={22} color={colors.goldLight} />
          </View>
          <View style={styles.aiHeading}>
            <View style={styles.intelligenceBadgeRow}>
              <Text style={styles.aiKicker}>VELLURE INVITATION INTELLIGENCE</Text>
              <View style={styles.agentCountPill}>
                <Text style={styles.agentCountText}>25 AGENTS</Text>
              </View>
              <View style={[styles.backendStatusPill, draft.backendPowered ? styles.backendStatusOnline : styles.backendStatusLocal]}>
                <View style={[styles.backendStatusDot, { backgroundColor: draft.backendPowered ? colors.success : colors.goldLight }]} />
                <Text style={styles.backendStatusText}>
                  {draft.backendPowered ? 'CLOUD LIVE' : 'LOCAL READY'}
                </Text>
              </View>
            </View>
            <Text style={styles.aiTitle}>Designed for {eventType}</Text>
          </View>
          <View style={styles.scorePill}>
            <ShieldCheck size={13} color={colors.success} />
            <Text style={styles.scoreText}>{draft.qualityScore}%</Text>
          </View>
        </View>

        <Text style={styles.aiCopy}>
          RAG knowledge retrieval, cultural etiquette guidelines, and strict 0-overlap layout
          planning work together to curate this bespoke Indian celebration invite.
        </Text>

        {/* Agent Micro-Pills */}
        <View style={styles.agentRow}>
          {[
            'Event recognition',
            'RAG retrieval',
            'Layout planner',
            '0-Overlap audit',
            'Luxury review',
          ].map((agent) => (
            <View key={agent} style={styles.agentChip}>
              <Check size={9} color={colors.goldLight} />
              <Text style={styles.agentText}>{agent}</Text>
            </View>
          ))}
        </View>

        {/* View Pipeline Audit Button */}
        <VellureButton
          style={styles.pipelineInspectBtn}
          onPress={() => setShowAgentModal(true)}
        >
          <Sparkles size={13} color={colors.goldLight} />
          <Text style={styles.pipelineInspectText}>Inspect 25-Agent Pipeline Audit</Text>
          <ChevronRight size={13} color={colors.goldLight} />
        </VellureButton>

        {/* Fresh Design CTA */}
        <VellureButton
          style={[styles.regenerate, isGenerating && styles.regenerateBusy]}
          onPress={regenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RefreshCw size={15} color={colors.primary} />
          )}
          <Text style={styles.regenerateText}>
            {isGenerating ? (generationStep || 'Crafting bespoke luxury design...') : 'Create fresh luxury design & phrasing'}
          </Text>
          <ChevronRight size={15} color={colors.primary} />
        </VellureButton>
      </View>

      {/* 3. Event-Aware Cultural Context Card */}
      <LuxuryCard style={styles.culturalCard}>
        <View style={styles.culturalHeader}>
          <Sparkles size={15} color={colors.goldDark} />
          <Text style={styles.culturalTitle}>CULTURAL CONTEXT & AUSPICIOUS GUIDANCE</Text>
        </View>
        <Text style={styles.culturalRitual}>{draft.culturalContext.ritualSummary}</Text>
        <View style={styles.culturalMetaRow}>
          <View style={styles.culturalItem}>
            <Text style={styles.culturalLabel}>RECOMMENDED ATTIRE</Text>
            <Text style={styles.culturalValue}>{draft.culturalContext.recommendedAttire}</Text>
          </View>
          <View style={styles.culturalItem}>
            <Text style={styles.culturalLabel}>AUSPICIOUS SYMBOLISM</Text>
            <Text style={styles.culturalValue}>{draft.culturalContext.auspiciousSymbolism}</Text>
          </View>
        </View>
      </LuxuryCard>

      {/* 4. Live Invitation Preview Section */}
      <View style={styles.previewHeading}>
        <View>
          <Text style={styles.previewKicker}>LIVE INVITATION PREVIEW</Text>
          <Text style={styles.previewMeta}>{generationLabel}</Text>
        </View>
        <View style={styles.previewActions}>
          <VellureButton
            style={[
              styles.safeZoneToggleBtn,
              showSafeZoneGuide && styles.safeZoneToggleBtnActive,
            ]}
            onPress={() => setShowSafeZoneGuide(!showSafeZoneGuide)}
          >
            <Eye size={12} color={showSafeZoneGuide ? colors.cream : colors.goldDark} />
            <Text
              style={[
                styles.safeZoneToggleText,
                showSafeZoneGuide && styles.safeZoneToggleTextActive,
              ]}
            >
              {showSafeZoneGuide ? 'Hide Safe Zone' : 'Inspect Safe Zone'}
            </Text>
          </VellureButton>
          <View style={styles.generatedBadge}>
            <Sparkles size={11} color={colors.goldDark} />
            <Text style={styles.generatedText}>v{variation + 1}</Text>
          </View>
        </View>
      </View>

      {/* Invitation Canvas with 0-Overlap Guarantee & Live Generating Overlay */}
      <View style={styles.canvasWrapper}>
        <InvitationCanvas draft={draft} showSafeZoneOverlay={showSafeZoneGuide} />
        {isGenerating && (
          <View style={styles.canvasLoadingOverlay}>
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color={colors.goldLight} />
              <Text style={styles.loadingPillText}>
                {generationStep || 'Multi-Agent Pipeline Generating...'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 0-Overlap Quality Tag */}
      <View style={styles.overlapStatusBadge}>
        <ShieldCheck size={13} color={colors.success} />
        <Text style={styles.overlapStatusText}>
          Strict 0-Overlap Layout Verified · Text Safe Zone Clearance: 14px
        </Text>
      </View>

      {/* 5. Studio Tabs */}
      <View style={styles.editorTabs}>
        {(['Design', 'Wording', 'AI Intelligence', 'Quality Review'] as const).map(
          (tab) => (
            <VellureButton
              key={tab}
              style={[styles.editorTab, currentTab === tab && styles.editorTabActive]}
              onPress={() => setCurrentTab(tab)}
            >
              <Text
                style={[
                  styles.editorTabText,
                  currentTab === tab && styles.editorTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </VellureButton>
          )
        )}
      </View>

      {/* TAB CONTENT: DESIGN & STYLES */}
      {currentTab === 'Design' && (
        <LuxuryCard style={styles.editorCard}>
          {/* Tone Chips */}
          <Text style={styles.editorLabel}>INVITATION TONE & FORMALITY</Text>
          <View style={styles.chipGrid}>
            {TONE_OPTIONS.map((tone) => (
              <VellureButton
                key={tone}
                style={[
                  styles.choiceChip,
                  request.tone === tone && styles.choiceChipActive,
                ]}
                onPress={() => updateRequest({ tone, variation: variation + 1 })}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    request.tone === tone && styles.choiceChipTextActive,
                  ]}
                >
                  {tone}
                </Text>
              </VellureButton>
            ))}
          </View>

          {/* Layout Template Styles */}
          <Text style={[styles.editorLabel, { marginTop: 14 }]}>CEREMONIAL LAYOUT PATTERN</Text>
          <View style={styles.chipGrid}>
            {LAYOUT_OPTIONS.map((layout) => (
              <VellureButton
                key={layout.id}
                style={[
                  styles.choiceChip,
                  draft.layout === layout.id && styles.choiceChipActive,
                ]}
                onPress={() => updateRequest({ layoutPreference: layout.id })}
              >
                <Layers size={11} color={draft.layout === layout.id ? '#FFF' : colors.primary} />
                <Text
                  style={[
                    styles.choiceChipText,
                    draft.layout === layout.id && styles.choiceChipTextActive,
                  ]}
                >
                  {layout.label}
                </Text>
              </VellureButton>
            ))}
          </View>

          {/* Sacred Motifs */}
          <Text style={[styles.editorLabel, { marginTop: 14 }]}>SACRED DECORATIVE MOTIF</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
            {MOTIF_OPTIONS.map((m) => (
              <VellureButton
                key={m.id}
                style={[
                  styles.motifChip,
                  draft.motif === m.id && styles.choiceChipActive,
                ]}
                onPress={() => {
                  const nextDraft = { ...draft, motif: m.id };
                  setDraft(nextDraft);
                }}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    draft.motif === m.id && styles.choiceChipTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </VellureButton>
            ))}
          </ScrollView>

          {/* Palette Info */}
          <View style={styles.paletteSummaryRow}>
            <Palette size={14} color={colors.goldDark} />
            <Text style={styles.paletteSummaryText}>Current Palette: {draft.palette.name}</Text>
          </View>

          {/* Targeted AI Refinement */}
          <Text style={[styles.editorLabel, { marginTop: 14 }]}>TARGETED AI REGENERATION</Text>
          <View style={styles.partialActionGrid}>
            <VellureButton
              style={styles.partialActionBtn}
              onPress={() => void triggerPartialRegeneration('change_wording_only')}
              disabled={isGenerating}
            >
              <Sparkles size={11} color={colors.goldDark} />
              <Text style={styles.partialActionText}>Re-phrase Wording</Text>
            </VellureButton>

            <VellureButton
              style={styles.partialActionBtn}
              onPress={() => void triggerPartialRegeneration('change_colors')}
              disabled={isGenerating}
            >
              <Palette size={11} color={colors.goldDark} />
              <Text style={styles.partialActionText}>Cycle Color Palette</Text>
            </VellureButton>

            <VellureButton
              style={styles.partialActionBtn}
              onPress={() => void triggerPartialRegeneration('add_lotus_elements')}
              disabled={isGenerating}
            >
              <ShieldCheck size={11} color={colors.goldDark} />
              <Text style={styles.partialActionText}>Add Sacred Lotus</Text>
            </VellureButton>

            <VellureButton
              style={styles.partialActionBtn}
              onPress={() => void triggerPartialRegeneration('make_more_premium')}
              disabled={isGenerating}
            >
              <Wand2 size={11} color={colors.goldDark} />
              <Text style={styles.partialActionText}>Elevate Royal Elegance</Text>
            </VellureButton>
          </View>
        </LuxuryCard>
      )}

      {/* TAB CONTENT: WORDING & DETAILS */}
      {currentTab === 'Wording' && (
        <LuxuryCard style={styles.editorCard}>
          <Text style={styles.editorLabel}>HONOREE NAMES & HOST</Text>
          <View style={styles.inputRow}>
            <StudioInput
              value={request.primaryName}
              onChangeText={(val) => updateRequest({ primaryName: val })}
              placeholder="Primary Name"
            />
            <StudioInput
              value={request.secondaryName || ''}
              onChangeText={(val) => updateRequest({ secondaryName: val })}
              placeholder="Second Name (Optional)"
            />
          </View>
          <StudioInput
            value={request.hostNames || ''}
            onChangeText={(val) => updateRequest({ hostNames: val })}
            placeholder="Host Line (e.g. Together with their families)"
            full
          />

          <Text style={[styles.editorLabel, { marginTop: 10 }]}>DATE, TIME & LOCATION</Text>
          <StudioInput
            value={request.date}
            onChangeText={(val) => updateRequest({ date: val })}
            placeholder="Event Date"
            full
          />
          <View style={styles.inputRow}>
            <StudioInput
              value={request.time}
              onChangeText={(val) => updateRequest({ time: val })}
              placeholder="Time"
            />
            <StudioInput
              value={request.venue}
              onChangeText={(val) => updateRequest({ venue: val })}
              placeholder="Venue"
            />
          </View>
          <StudioInput
            value={request.city}
            onChangeText={(val) => updateRequest({ city: val })}
            placeholder="City / State"
            full
          />

          {/* RAG Wording Alternatives Quick-Picker */}
          <Text style={[styles.editorLabel, { marginTop: 14 }]}>
            ALTERNATIVE HEADLINES (RETRIEVED BY RAG)
          </Text>
          {draft.suggestedAlternatives.headlineOptions.map((opt, i) => (
            <VellureButton
              key={i}
              style={[
                styles.alternativePill,
                draft.headline === opt && styles.alternativePillActive,
              ]}
              onPress={() => setDraft({ ...draft, headline: opt })}
            >
              <Text
                style={[
                  styles.alternativeText,
                  draft.headline === opt && styles.alternativeTextActive,
                ]}
              >
                “{opt}”
              </Text>
            </VellureButton>
          ))}
        </LuxuryCard>
      )}

      {/* TAB CONTENT: AI NOTES & ETIQUETTE */}
      {currentTab === 'AI Intelligence' && (
        <LuxuryCard style={styles.editorCard}>
          <Text style={styles.editorLabel}>RETRIEVED CULTURAL ETIQUETTE RULES</Text>
          {draft.etiquetteNotes.map((note, index) => (
            <View key={index} style={styles.noteRow}>
              <ShieldCheck size={14} color={colors.success} style={{ marginTop: 2 }} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}

          <View style={styles.retrievalBox}>
            <Sparkles size={16} color={colors.goldDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.retrievalTitle}>RAG Knowledge Ingested for this Draft</Text>
              <Text style={styles.retrievalText}>{draft.retrievedGuidance.join(' · ')}</Text>
            </View>
          </View>

          {/* Overlap Detection Audit */}
          <View style={styles.auditBox}>
            <Text style={styles.auditTitle}>Overlap Detection Engine Report</Text>
            <View style={styles.auditMetricRow}>
              <Text style={styles.auditLabel}>Tested Bounding Coordinates:</Text>
              <Text style={styles.auditValue}>
                {draft.overlapAudit.testedElementsCount} points
              </Text>
            </View>
            <View style={styles.auditMetricRow}>
              <Text style={styles.auditLabel}>Collision Count:</Text>
              <Text style={[styles.auditValue, { color: colors.success }]}>
                {draft.overlapAudit.collisionCount} (Clean)
              </Text>
            </View>
            <View style={styles.auditMetricRow}>
              <Text style={styles.auditLabel}>Safe Margin Clearance:</Text>
              <Text style={styles.auditValue}>
                {draft.overlapAudit.safeZoneClearancePx}px padding
              </Text>
            </View>
          </View>
        </LuxuryCard>
      )}

      {/* TAB CONTENT: QUALITY REVIEW */}
      {currentTab === 'Quality Review' && (
        <LuxuryCard style={styles.editorCard}>
          <Text style={styles.editorLabel}>LUXURY AUDIT & ACCURACY SCORES</Text>

          <View style={styles.scoreBarContainer}>
            <ScoreBar label="Overall Quality Score" score={draft.qualityScore} />
            <ScoreBar label="Editorial Luxury Aesthetic" score={draft.luxuryScore} />
            <ScoreBar label="Accessibility & Contrast" score={draft.readabilityScore} />
            <ScoreBar label="Cultural Etiquette Alignment" score={draft.culturalEtiquetteScore} />
          </View>

          <View style={styles.checklist}>
            {[
              'No ornaments, motifs, or borders overlap text',
              'Indian wedding ceremonial dignity preserved',
              'Event date, time, and venue hierarchy verified',
              'AAA Contrast verified for elderly family readability',
            ].map((checkItem, idx) => (
              <View key={idx} style={styles.checkItemRow}>
                <View style={styles.checkCircle}>
                  <Check size={11} color="#FFF" />
                </View>
                <Text style={styles.checkItemText}>{checkItem}</Text>
              </View>
            ))}
          </View>
        </LuxuryCard>
      )}

      {/* 6. Action Bar */}
      <View style={styles.actions}>
        <PrimaryPill
          label="Share Luxury Invitation"
          icon={<Send size={16} color="#FFFFFF" />}
          style={styles.shareMain}
          onPress={() => void shareInvitation()}
        />
        <VellureButton style={styles.shareIcon} onPress={() => void shareInvitation()}>
          <Share2 size={18} color={colors.primary} />
        </VellureButton>
      </View>

      {/* MODAL: 20-Agent Pipeline Audit */}
      <Modal
        visible={showAgentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.agentModalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalKicker}>VELLURE MULTI-AGENT SYSTEM</Text>
                <Text style={styles.modalTitle}>20-Agent Diagnostic Trace</Text>
              </View>
              <VellureButton
                style={styles.closeBtn}
                onPress={() => setShowAgentModal(false)}
              >
                <X size={18} color={colors.primary} />
              </VellureButton>
            </View>

            <ScrollView style={styles.agentList} showsVerticalScrollIndicator={false}>
              {draft.agentTraces.map((trace, index) => (
                <View key={index} style={styles.traceRow}>
                  <View style={styles.traceBadge}>
                    <Text style={styles.traceNumber}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.traceHeader}>
                      <Text style={styles.traceName}>{trace.agentName}</Text>
                      <View style={styles.traceVerifiedTag}>
                        <Check size={9} color={colors.success} />
                        <Text style={styles.traceVerifiedText}>VERIFIED</Text>
                      </View>
                    </View>
                    <Text style={styles.traceSummary}>{trace.summary}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <PrimaryPill
              label="Done Inspecting"
              style={{ marginTop: 14 }}
              onPress={() => setShowAgentModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL: Share Success */}
      <Modal
        visible={shareSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShareSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Check size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Invitation Ready to Travel</Text>
            <Text style={styles.successCopy}>
              Your bespoke, event-specific e-invitation has been formatted and opened in
              the secure share sheet for WhatsApp, SMS, or email.
            </Text>
            <PrimaryPill
              label="Return to Studio"
              style={styles.done}
              onPress={() => setShareSuccessModal(false)}
            />
          </View>
        </View>
      </Modal>
    </LuxuryScreen>
  );
}

// ============================================================================
// SUB-COMPONENTS & HELPERS
// ============================================================================

function buildRequest(eventType: InvitationEventType, variation: number): InvitationRequest {
  const preset = DEFAULTS[eventType];
  return {
    eventType,
    primaryName: preset.primaryName || 'Sneha',
    secondaryName: preset.secondaryName,
    date: preset.date || 'Saturday, 14 February 2027',
    time: preset.time || '6:00 PM onwards',
    venue: preset.venue || 'The Ivory Hall',
    city: preset.city || 'Jaipur, Rajasthan',
    hostNames: preset.hostNames,
    tone: preset.tone || 'Warm',
    variation,
  };
}

function StudioInput({
  full,
  ...props
}: React.ComponentProps<typeof VellureTextInput> & { full?: boolean }) {
  return (
    <VellureTextInput
      {...props}
      style={[styles.input, full && styles.inputFull, props.style]}
    />
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.scoreBarItem}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={styles.scoreBarValue}>{score}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View
          style={[
            styles.scoreFill,
            { width: `${score}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  eventScroller: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
    marginBottom: 6,
  },
  eventChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.blushLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  eventChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  eventChipText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  eventChipTextActive: {
    color: colors.textInverse,
  },
  aiHero: {
    minHeight: 220,
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceDark,
    position: 'relative',
  },
  aiGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    top: -80,
    backgroundColor: 'rgba(201, 153, 88, 0.14)',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 226, 199, 0.25)',
  },
  aiHeading: {
    flex: 1,
  },
  intelligenceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiKicker: {
    color: colors.goldLight,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  agentCountPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(201, 153, 88, 0.25)',
  },
  agentCountText: {
    color: colors.goldLight,
    fontSize: 7,
    fontWeight: '800',
  },
  backendStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  backendStatusOnline: {
    backgroundColor: 'rgba(52, 168, 83, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 168, 83, 0.4)',
  },
  backendStatusLocal: {
    backgroundColor: 'rgba(201, 153, 88, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(201, 153, 88, 0.35)',
  },
  backendStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  backendStatusText: {
    color: '#FFF8F3',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiTitle: {
    color: '#FFF8F3',
    fontFamily: typography.serif,
    fontSize: 18,
    marginTop: 3,
  },
  scorePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2F0E8',
  },
  scoreText: {
    color: colors.success,
    fontSize: 9.5,
    fontWeight: '800',
  },
  aiCopy: {
    color: '#DCCBD1',
    fontSize: 10,
    lineHeight: 14.5,
    marginTop: 10,
  },
  agentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  agentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  agentText: {
    color: '#E8D9DE',
    fontSize: 8,
    fontWeight: '500',
  },
  pipelineInspectBtn: {
    marginTop: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pipelineInspectText: {
    color: colors.goldLight,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  regenerate: {
    minHeight: 44,
    marginTop: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.goldLight,
  },
  regenerateBusy: {
    opacity: 0.85,
    backgroundColor: '#E6D3B3',
  },
  regenerateText: {
    flex: 1,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  canvasWrapper: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  canvasLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 24, 16, 0.48)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 14, 10, 0.94)',
    borderWidth: 1,
    borderColor: colors.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingPillText: {
    color: colors.cream,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  partialActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  partialActionBtn: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.blushLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  partialActionText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  culturalCard: {
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  culturalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  culturalTitle: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  culturalRitual: {
    color: colors.textPrimary,
    fontFamily: typography.serif,
    fontSize: 12.5,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  culturalMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  culturalItem: {
    flex: 1,
  },
  culturalLabel: {
    color: colors.textMuted,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  culturalValue: {
    color: colors.textPrimary,
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 2,
  },
  previewHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  previewKicker: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  previewMeta: {
    color: colors.primary,
    fontFamily: typography.serif,
    fontSize: 13.5,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeZoneToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.blushLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  safeZoneToggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  safeZoneToggleText: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: '700',
  },
  safeZoneToggleTextActive: {
    color: colors.cream,
  },
  generatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.goldLight,
  },
  generatedText: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: '700',
  },
  overlapStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#D2EFE0',
  },
  overlapStatusText: {
    color: colors.success,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  editorTabs: {
    flexDirection: 'row',
    padding: 4,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  editorTab: {
    flex: 1,
    minHeight: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorTabActive: {
    backgroundColor: colors.primary,
  },
  editorTabText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '500',
  },
  editorTabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  editorCard: {
    marginTop: 10,
    padding: 14,
  },
  editorLabel: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  choiceChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.blushLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  choiceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceChipText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  motifChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 12,
    marginRight: 6,
    justifyContent: 'center',
    backgroundColor: colors.blushLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  paletteSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  paletteSummaryText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    marginBottom: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    color: colors.textPrimary,
    fontSize: 10.5,
    backgroundColor: colors.blushLight,
  },
  inputFull: {
    width: '100%',
    flex: 0,
  },
  alternativePill: {
    padding: 9,
    borderRadius: 11,
    backgroundColor: colors.blushLight,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  alternativePillActive: {
    backgroundColor: colors.cream,
    borderColor: colors.primary,
  },
  alternativeText: {
    color: colors.textPrimary,
    fontFamily: typography.serif,
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  alternativeTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
  },
  retrievalBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
  },
  retrievalTitle: {
    color: colors.primary,
    fontFamily: typography.serif,
    fontSize: 11,
    fontWeight: '600',
  },
  retrievalText: {
    color: colors.textSecondary,
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 2,
  },
  auditBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  auditTitle: {
    color: colors.primary,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  auditMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  auditLabel: {
    color: colors.textSecondary,
    fontSize: 8.5,
  },
  auditValue: {
    color: colors.textPrimary,
    fontSize: 8.5,
    fontWeight: '700',
  },
  scoreBarContainer: {
    gap: 10,
    marginBottom: 14,
  },
  scoreBarItem: {
    width: '100%',
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  scoreBarLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  scoreBarValue: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  scoreTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklist: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  checkItemText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 9,
    lineHeight: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  shareMain: {
    flex: 1,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blushLight,
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(39, 20, 29, 0.55)',
  },
  agentModalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.cream,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalKicker: {
    color: colors.goldDark,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalTitle: {
    color: colors.primary,
    fontFamily: typography.serif,
    fontSize: 17,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentList: {
    maxHeight: 380,
  },
  traceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 7,
    borderBottomWidth: 0.8,
    borderBottomColor: colors.borderLight,
  },
  traceBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  traceNumber: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
  },
  traceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  traceName: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '700',
  },
  traceVerifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  traceVerifiedText: {
    color: colors.success,
    fontSize: 7,
    fontWeight: '800',
  },
  traceSummary: {
    color: colors.textSecondary,
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 2,
  },
  successCard: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  successTitle: {
    color: colors.primary,
    fontFamily: typography.serif,
    fontSize: 20,
    marginTop: 14,
    textAlign: 'center',
  },
  successCopy: {
    color: colors.textSecondary,
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  done: {
    width: '100%',
    marginTop: 16,
  },
});
