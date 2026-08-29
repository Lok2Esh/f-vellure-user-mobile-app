import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  CheckCircle2,
  Sliders,
  Plus,
  ArrowRight,
  FolderKanban,
  FileText,
  Heart,
  Send,
  FileCheck,
  Clock,
  Settings,
  Trash2,
  Archive,
  Copy,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react-native';
import { router } from 'expo-router';

import {
  EventPlan,
  PlanService,
  VendorQuote,
  PlanningTask,
  formatPlanStatus,
  fetchPlanServices,
  fetchPlanQuotes,
  fetchPlanChecklist,
  addPlanService,
  removePlanService,
  selectPreferredQuote,
  saveEventPlan,
} from '../../services/api';
import { colors } from '../../constants/theme';
import { AddServiceSheet } from './AddServiceSheet';
import { QuoteComparisonModal } from './QuoteComparisonModal';
import { VellureInputField } from '../ui/VellureInputField';

interface PlanWorkspaceModalProps {
  visible: boolean;
  plan: EventPlan;
  onClose: () => void;
  onPlanUpdated: (updated: EventPlan) => void;
  onDuplicatePlan: (planId: string) => void;
  onArchivePlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}

type WorkspaceTab =
  | 'overview'
  | 'checklist'
  | 'services'
  | 'budget'
  | 'enquiries'
  | 'quotes'
  | 'timeline'
  | 'notes'
  | 'settings';

export function PlanWorkspaceModal({
  visible,
  plan,
  onClose,
  onPlanUpdated,
  onDuplicatePlan,
  onArchivePlan,
  onDeletePlan,
}: PlanWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [services, setServices] = useState<PlanService[]>([]);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [checklist, setChecklist] = useState<PlanningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-modal triggers
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [compareQuotesOpen, setCompareQuotesOpen] = useState(false);

  // Notes state
  const [generalNotes, setGeneralNotes] = useState(plan.notes || '');

  const loadWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [srvList, qList, chkList] = await Promise.all([
        fetchPlanServices(plan.id),
        fetchPlanQuotes(plan.id),
        fetchPlanChecklist(plan.id),
      ]);
      setServices(srvList);
      setQuotes(qList);
      setChecklist(chkList);
    } catch (e) {
      console.error('Error loading workspace:', e);
    } finally {
      setIsLoading(false);
    }
  }, [plan.id]);

  useEffect(() => {
    if (visible) {
      loadWorkspaceData();
    }
  }, [visible, loadWorkspaceData]);

  const handleAddService = async (newSrv: any) => {
    const updatedServices = await addPlanService(plan.id, newSrv);
    setServices(updatedServices);
    const updatedPlan: EventPlan = {
      ...plan,
      servicesCount: updatedServices.length,
    };
    onPlanUpdated(updatedPlan);
    await saveEventPlan(updatedPlan);
  };

  const handleRemoveService = async (srvId: string) => {
    const updatedServices = await removePlanService(plan.id, srvId);
    setServices(updatedServices);
    const updatedPlan: EventPlan = {
      ...plan,
      servicesCount: updatedServices.length,
    };
    onPlanUpdated(updatedPlan);
    await saveEventPlan(updatedPlan);
  };

  const handleSelectPreferredQuote = async (quote: VendorQuote) => {
    await selectPreferredQuote(plan.id, quote.id);
    loadWorkspaceData();
  };

  const handleSaveNotes = async () => {
    const updated: EventPlan = { ...plan, notes: generalNotes };
    await saveEventPlan(updated);
    onPlanUpdated(updated);
    Alert.alert('Notes Saved', 'Your internal celebration notes have been updated.');
  };

  const statusBadge = formatPlanStatus(plan.status);

  // Budget calculations
  const totalAllocated = services.reduce((sum, s) => sum + s.allocatedBudget, 0);
  const confirmedTotal = quotes
    .filter((q) => q.status === 'ACCEPTED_BY_CUSTOMER')
    .reduce((sum, q) => sum + q.totalAmount, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Workspace Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
                    {statusBadge.label}
                  </Text>
                </View>
                <Text style={styles.headerCity}>• {plan.city}</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {plan.name}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#2D2025" />
            </TouchableOpacity>
          </View>

          {/* Internal Workspace Tabs Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'checklist', label: `Checklist (${checklist.filter((t) => t.completed).length}/${checklist.length})` },
                { id: 'services', label: `Services (${services.length})` },
                { id: 'budget', label: 'Budget' },
                { id: 'enquiries', label: `Enquiries (${plan.enquiriesCount})` },
                { id: 'quotes', label: `Quotes (${quotes.length})` },
                { id: 'timeline', label: 'Timeline' },
                { id: 'notes', label: 'Notes' },
                { id: 'settings', label: 'Settings' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab.id as WorkspaceTab)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Main Workspace Body */}
          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#641E3D" />
              <Text style={styles.loadingText}>Loading Plan Workspace...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* ──── TAB 1: OVERVIEW ──── */}
              {activeTab === 'overview' && (
                <View style={styles.tabContent}>
                  {/* Next Step Box */}
                  <View style={styles.nextStepBanner}>
                    <View style={styles.nextStepHeader}>
                      <Sparkles size={12} color="#8A6A23" />
                      <Text style={styles.nextStepBadge}>Next Recommended Step</Text>
                    </View>
                    <Text style={styles.nextStepBody}>{plan.nextRecommendedStep}</Text>
                  </View>

                  {/* Metrics Grid */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Progress</Text>
                      <Text style={styles.metricValue}>{plan.progress}%</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Services</Text>
                      <Text style={styles.metricValue}>{services.length} Selected</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Quotes</Text>
                      <Text style={styles.metricValue}>{quotes.length} Received</Text>
                    </View>
                  </View>

                  {/* Summary Card */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.cardHeading}>Celebration Blueprint</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Event Type:</Text>
                      <Text style={styles.summaryVal}>{plan.eventType}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Target Date:</Text>
                      <Text style={styles.summaryVal}>{plan.eventDate || 'Flexible'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Host City:</Text>
                      <Text style={styles.summaryVal}>{plan.city}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Guest Scale:</Text>
                      <Text style={styles.summaryVal}>{plan.guestCount} Guests</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Target Budget:</Text>
                      <Text style={styles.summaryVal}>₹{plan.budgetMax.toLocaleString('en-IN')}</Text>
                    </View>
                    {plan.description ? (
                      <View style={styles.descBox}>
                        <Text style={styles.descText}>"{plan.description}"</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}

              {/* ──── TAB 2: CHECKLIST ──── */}
              {activeTab === 'checklist' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Planning Milestones Checklist</Text>
                  <Text style={styles.tabSub}>
                    Tasks complete automatically as you select services, shortlist partners, and review quotes.
                  </Text>

                  <View style={styles.checklistCard}>
                    {checklist.map((task) => (
                      <View key={task.id} style={styles.checkItem}>
                        {task.completed ? (
                          <CheckCircle2 size={18} color="#2F7D62" />
                        ) : (
                          <View style={styles.uncheckCircle} />
                        )}
                        <View style={styles.checkTextCol}>
                          <Text style={[styles.checkTitle, task.completed && styles.checkTitleDone]}>
                            {task.title}
                          </Text>
                          <Text style={styles.checkSub}>
                            {task.completed ? '✓ Completed' : 'Pending action'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* ──── TAB 3: SERVICES & VENDORS ──── */}
              {activeTab === 'services' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.tabHeading}>Selected Services</Text>
                    <TouchableOpacity
                      style={styles.addSrvTrigger}
                      onPress={() => setAddServiceOpen(true)}
                    >
                      <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.addSrvTriggerText}>Add Service</Text>
                    </TouchableOpacity>
                  </View>

                  {services.map((srv) => (
                    <View key={srv.id} style={styles.serviceCard}>
                      <View style={styles.serviceTop}>
                        <View style={styles.serviceTitleCol}>
                          <View style={styles.reqBadge}>
                            <Text style={styles.reqBadgeText}>{srv.requirement}</Text>
                          </View>
                          <Text style={styles.serviceName}>{srv.categoryName}</Text>
                        </View>
                        <Text style={styles.srvBudget}>
                          Allocated ₹{srv.allocatedBudget.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      {/* Shortlist status */}
                      <View style={styles.shortlistStatusBox}>
                        <Text style={styles.shortlistStatusText}>
                          {srv.shortlistedVendorIds.length > 0
                            ? `✓ ${srv.shortlistedVendorIds.length} Specialist(s) Shortlisted`
                            : 'No vendors shortlisted yet'}
                        </Text>
                      </View>

                      {/* Actions */}
                      <View style={styles.srvActionsRow}>
                        <TouchableOpacity
                          style={styles.findVendorsBtn}
                          onPress={() => {
                            onClose();
                            router.push({
                              pathname: '/(tabs)/vendors',
                              params: { category: srv.categoryKey, city: plan.city },
                            });
                          }}
                        >
                          <Text style={styles.findVendorsBtnText}>Discover Partners</Text>
                        </TouchableOpacity>

                        {quotes.filter((q) => q.serviceId === srv.id).length > 1 && (
                          <TouchableOpacity
                            style={styles.compareBtn}
                            onPress={() => setCompareQuotesOpen(true)}
                          >
                            <Text style={styles.compareBtnText}>Compare Quotes</Text>
                          </TouchableOpacity>
                        )}

                        {srv.requirement !== 'REQUIRED' && (
                          <TouchableOpacity
                            style={styles.removeSrvBtn}
                            onPress={() => handleRemoveService(srv.id)}
                          >
                            <Trash2 size={14} color="#B63A4A" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* ──── TAB 4: BUDGET ──── */}
              {activeTab === 'budget' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Budget Allocation Overview</Text>
                  <Text style={styles.tabSub}>
                    Comparing allocated benchmarks against actual received quotes.
                  </Text>

                  <View style={styles.budgetStatsRow}>
                    <View style={styles.budgetStatItem}>
                      <Text style={styles.bStatLabel}>Max Budget</Text>
                      <Text style={styles.bStatVal}>₹{plan.budgetMax.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.bStatDivider} />
                    <View style={styles.budgetStatItem}>
                      <Text style={styles.bStatLabel}>Allocated</Text>
                      <Text style={styles.bStatVal}>₹{totalAllocated.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.bStatDivider} />
                    <View style={styles.budgetStatItem}>
                      <Text style={styles.bStatLabel}>Confirmed</Text>
                      <Text style={[styles.bStatVal, { color: '#2F7D62' }]}>
                        ₹{confirmedTotal.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.budgetBreakdownCard}>
                    {services.map((s) => (
                      <View key={s.id} style={styles.budgetBreakdownRow}>
                        <Text style={styles.bRowName}>{s.categoryName}</Text>
                        <Text style={styles.bRowAmount}>
                          ₹{s.allocatedBudget.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* ──── TAB 5: ENQUIRIES ──── */}
              {activeTab === 'enquiries' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Sent Inquiries</Text>
                  <Text style={styles.tabSub}>
                    Requests dispatched to verified vendors for {plan.name}.
                  </Text>

                  <View style={styles.enqCard}>
                    <View style={styles.enqTop}>
                      <Text style={styles.enqName}>Fort Patiala (Venue & Banquet)</Text>
                      <View style={styles.enqStatusPill}>
                        <Text style={styles.enqStatusText}>Quote Ready</Text>
                      </View>
                    </View>
                    <Text style={styles.enqNotes}>
                      "Looking for royal heritage lawns and banquet hall for 300 guests on {plan.eventDate || 'Nov 2026'}."
                    </Text>
                  </View>
                </View>
              )}

              {/* ──── TAB 6: QUOTES ──── */}
              {activeTab === 'quotes' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.tabHeading}>Received Quotes</Text>
                    {quotes.length > 1 && (
                      <TouchableOpacity
                        style={styles.compareTrigger}
                        onPress={() => setCompareQuotesOpen(true)}
                      >
                        <Text style={styles.compareTriggerText}>Compare Side-by-Side</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {quotes.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <FileCheck size={28} color="#D2AD6B" />
                      <Text style={styles.emptyTitle}>No Quotes Received Yet</Text>
                      <Text style={styles.emptySub}>
                        Send consultation requests to shortlisted partners to receive custom proposals.
                      </Text>
                    </View>
                  ) : (
                    quotes.map((q) => (
                      <View key={q.id} style={styles.quoteCard}>
                        <View style={styles.quoteTop}>
                          <View>
                            <Text style={styles.quoteVendor}>{q.vendorName}</Text>
                            <Text style={styles.quoteCategory}>{q.vendorCategory}</Text>
                          </View>
                          <Text style={styles.quotePrice}>
                            ₹{q.totalAmount.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <Text style={styles.quoteInclusions}>
                          Includes: {q.includedItems.map((i) => i.title).join(', ')}
                        </Text>

                        <TouchableOpacity
                          style={styles.selectPreferredBtn}
                          onPress={() => handleSelectPreferredQuote(q)}
                        >
                          <Text style={styles.selectPreferredBtnText}>
                            {q.status === 'ACCEPTED_BY_CUSTOMER'
                              ? '✓ Selected as Preferred'
                              : 'Set as Preferred Choice'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* ──── TAB 7: TIMELINE ──── */}
              {activeTab === 'timeline' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Planning Timeline</Text>
                  <View style={styles.timelineCard}>
                    {[
                      { title: '1. Plan Initialized', date: '5 days ago', done: true },
                      { title: '2. Budget & Services Defined', date: '3 days ago', done: true },
                      { title: '3. Enquiries Dispatched', date: '2 days ago', done: true },
                      { title: '4. Quotations Received', date: 'Yesterday', done: true },
                      { title: '5. Lock Final Preferred Vendors', date: 'Pending', done: false },
                      { title: '6. Event Day Execution', date: plan.eventDate || 'Flexible', done: false },
                    ].map((step, idx) => (
                      <View key={idx} style={styles.timelineRow}>
                        <View
                          style={[
                            styles.timelineDot,
                            step.done && styles.timelineDotDone,
                          ]}
                        />
                        <View style={styles.timelineCopy}>
                          <Text style={[styles.timelineTitle, step.done && styles.timelineTitleDone]}>
                            {step.title}
                          </Text>
                          <Text style={styles.timelineDate}>{step.date}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* ──── TAB 8: NOTES ──── */}
              {activeTab === 'notes' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Internal Celebration Notes</Text>
                  <View style={styles.privateNotice}>
                    <Lock size={12} color="#8A6A23" />
                    <Text style={styles.privateNoticeText}>
                      Private to you. These notes are never shared with vendors automatically.
                    </Text>
                  </View>
                  <VellureInputField
                    value={generalNotes}
                    onChangeText={setGeneralNotes}
                    multiline
                    numberOfLines={5}
                    placeholder="Add special family requirements, dietary preferences, ceremony sequences..."
                    containerStyle={{ marginTop: 10 }}
                  />
                  <TouchableOpacity style={styles.saveNotesBtn} onPress={handleSaveNotes}>
                    <Text style={styles.saveNotesBtnText}>Save Private Notes</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ──── TAB 9: SETTINGS ──── */}
              {activeTab === 'settings' && (
                <View style={styles.tabContent}>
                  <Text style={styles.tabHeading}>Plan Settings & Management</Text>
                  <View style={styles.settingsMenu}>
                    <TouchableOpacity
                      style={styles.settingRow}
                      onPress={() => onDuplicatePlan(plan.id)}
                    >
                      <View style={styles.settingLeft}>
                        <Copy size={16} color="#641E3D" />
                        <Text style={styles.settingTitle}>Duplicate Plan Blueprint</Text>
                      </View>
                      <ChevronRight size={15} color="#A08F7E" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.settingRow}
                      onPress={() => onArchivePlan(plan.id)}
                    >
                      <View style={styles.settingLeft}>
                        <Archive size={16} color="#641E3D" />
                        <Text style={styles.settingTitle}>Archive Plan</Text>
                      </View>
                      <ChevronRight size={15} color="#A08F7E" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.settingRow, { borderBottomWidth: 0 }]}
                      onPress={() => onDeletePlan(plan.id)}
                    >
                      <View style={styles.settingLeft}>
                        <Trash2 size={16} color="#B63A4A" />
                        <Text style={[styles.settingTitle, { color: '#B63A4A' }]}>
                          Delete Plan Draft
                        </Text>
                      </View>
                      <ChevronRight size={15} color="#B63A4A" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Sub-Sheets */}
      <AddServiceSheet
        visible={addServiceOpen}
        onClose={() => setAddServiceOpen(false)}
        onAddService={handleAddService}
      />

      <QuoteComparisonModal
        visible={compareQuotesOpen}
        quotes={quotes}
        onClose={() => setCompareQuotesOpen(false)}
        onSelectPreferred={handleSelectPreferredQuote}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerCity: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#2D2025',
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
    marginBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  tabPillActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  tabPillText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  scroll: {
    paddingBottom: 28,
  },
  tabContent: {
    gap: 12,
  },
  tabHeading: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '900',
  },
  tabSub: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginTop: -8,
  },
  nextStepBanner: {
    backgroundColor: '#FAF1E3',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  nextStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  nextStepBadge: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  nextStepBody: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#8A7A70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#EFE3CF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  cardHeading: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EC',
  },
  summaryLabel: {
    color: '#786B70',
    fontSize: 12,
  },
  summaryVal: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  descBox: {
    marginTop: 10,
    backgroundColor: '#FAF5EC',
    padding: 10,
    borderRadius: 10,
  },
  descText: {
    color: '#4A3E44',
    fontSize: 11,
    fontStyle: 'italic',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  uncheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D4C6CE',
  },
  checkTextCol: {
    flex: 1,
  },
  checkTitle: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  checkTitleDone: {
    color: '#786B70',
    textDecorationLine: 'line-through',
  },
  checkSub: {
    color: '#8A7A70',
    fontSize: 10,
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addSrvTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  addSrvTriggerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceTitleCol: {
    flex: 1,
  },
  reqBadge: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  reqBadgeText: {
    color: '#8A6A23',
    fontSize: 8,
    fontWeight: '900',
  },
  serviceName: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
  },
  srvBudget: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  shortlistStatusBox: {
    backgroundColor: '#FAF5EC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  shortlistStatusText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '600',
  },
  srvActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  findVendorsBtn: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  findVendorsBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  compareBtn: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  compareBtnText: {
    color: '#8A6A23',
    fontSize: 11,
    fontWeight: '800',
  },
  removeSrvBtn: {
    padding: 8,
  },
  budgetStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  budgetStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  bStatLabel: {
    color: '#8A7A70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bStatVal: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  bStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#EFE3CF',
  },
  budgetBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  budgetBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EC',
  },
  bRowName: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '700',
  },
  bRowAmount: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  enqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  enqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enqName: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
  },
  enqStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  enqStatusText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  enqNotes: {
    color: '#786B70',
    fontSize: 11,
    fontStyle: 'italic',
  },
  compareTrigger: {
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compareTriggerText: {
    color: '#8A6A23',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  emptyTitle: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 2,
  },
  emptySub: {
    color: '#786B70',
    fontSize: 11,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  quoteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  quoteVendor: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
  },
  quoteCategory: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
  },
  quotePrice: {
    color: '#641E3D',
    fontSize: 15,
    fontWeight: '900',
  },
  quoteInclusions: {
    color: '#4A3E44',
    fontSize: 11,
    marginBottom: 10,
  },
  selectPreferredBtn: {
    backgroundColor: '#641E3D',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectPreferredBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EFE3CF',
  },
  timelineDotDone: {
    backgroundColor: '#2F7D62',
  },
  timelineCopy: {
    flex: 1,
  },
  timelineTitle: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineTitleDone: {
    color: '#2D2025',
    fontWeight: '800',
  },
  timelineDate: {
    color: '#8A7A70',
    fontSize: 10,
  },
  privateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    padding: 8,
    borderRadius: 10,
    gap: 5,
  },
  privateNoticeText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  notesEditor: {
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: '#2D2025',
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  saveNotesBtn: {
    backgroundColor: '#641E3D',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveNotesBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  settingsMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingTitle: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '700',
  },
});
