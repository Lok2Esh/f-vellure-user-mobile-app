import Constants from 'expo-constants';
import { createLocalBudgetPlan, BudgetPlannerInput } from './localBudgetPlanner';

// ============================================================
// API Service — Strict Database & Plans Workspace Store Mode
// ============================================================

const debuggerHost = Constants.expoConfig?.hostUri;
const host = debuggerHost?.split(':').shift() || 'localhost';

const BASE_URL = `http://${host}:3000/api`;
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// Types: Customer Profile & Preferences
// ============================================================

export type CustomerProfile = {
  id: string;
  fullName: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  primaryCity: string;
  state?: string;
  preferredLanguage?: string;
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp';
  isAuthenticated: boolean;
};

export type CustomerPreferences = {
  eventTypes: string[];
  cities: string[];
  guestRange?: { minimum: number; maximum: number };
  budgetRange?: { minimum: number; maximum: number };
  serviceCategories: string[];
  dietaryPreferences: string[];
  ceremonyPreferences: string[];
  venueStyle?: string;
  recommendationEnabled: boolean;
};

export type NotificationPreferences = {
  vendorResponses: boolean;
  quoteUpdates: boolean;
  eventReminders: boolean;
  planningRecommendations: boolean;
  partnerOffers: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushEnabled: boolean;
};

export type SavedLocationItem = {
  id: string;
  name: string;
  city: string;
  state: string;
  tag?: 'Primary' | 'Venue' | 'Family';
};

// ============================================================
// Types: Event Plans Lifecycle & Workspace
// ============================================================

export type EventPlanStatus =
  | 'DRAFT'
  | 'DETAILS_INCOMPLETE'
  | 'PLANNING'
  | 'VENDORS_SHORTLISTED'
  | 'ENQUIRIES_PENDING'
  | 'ENQUIRIES_SENT'
  | 'QUOTES_RECEIVED'
  | 'REVIEWING_QUOTES'
  | 'READY_TO_BOOK'
  | 'BOOKING_REQUESTED'
  | 'CONFIRMED_WITHOUT_PAYMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export const formatPlanStatus = (status: EventPlanStatus): { label: string; bg: string; text: string; border: string } => {
  switch (status) {
    case 'DRAFT':
      return { label: 'Draft', bg: '#FAF5EC', text: '#8A7A70', border: '#EFE3CF' };
    case 'DETAILS_INCOMPLETE':
      return { label: 'Complete Details', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    case 'PLANNING':
      return { label: 'Planning in Progress', bg: '#FAF1E3', text: '#8A6A23', border: '#ECD8B5' };
    case 'VENDORS_SHORTLISTED':
      return { label: 'Vendors Shortlisted', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
    case 'ENQUIRIES_PENDING':
      return { label: 'Enquiries Pending', bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE' };
    case 'ENQUIRIES_SENT':
      return { label: 'Waiting for Vendors', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'QUOTES_RECEIVED':
      return { label: 'Quotes Ready', bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    case 'REVIEWING_QUOTES':
      return { label: 'Reviewing Quotes', bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
    case 'READY_TO_BOOK':
      return { label: 'Ready to Book', bg: '#FAF1E3', text: '#8A6A23', border: '#D2AD6B' };
    case 'BOOKING_REQUESTED':
      return { label: 'Booking Requested', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    case 'CONFIRMED_WITHOUT_PAYMENT':
      return { label: 'Vendor Confirmed', bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    case 'COMPLETED':
      return { label: 'Completed', bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
    case 'CANCELLED':
      return { label: 'Cancelled', bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
    case 'ARCHIVED':
      return { label: 'Archived', bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    default:
      return { label: 'In Progress', bg: '#FAF5EC', text: '#8A7A70', border: '#EFE3CF' };
  }
};

export type EventPlan = {
  id: string;
  userId: string;
  name: string;
  eventType: string;
  ceremonyType?: string;
  status: EventPlanStatus;
  city: string;
  venueArea?: string;
  eventDate?: string;
  flexibleDate: boolean;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  theme?: string;
  description?: string;
  progress: number;
  isPrimary: boolean;
  servicesCount: number;
  enquiriesCount: number;
  quotesCount: number;
  nextRecommendedStep: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanServiceRequirement = 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';
export type PlanServiceStatus =
  | 'SUGGESTED'
  | 'REQUIRED'
  | 'VENDOR_NEEDED'
  | 'VENDOR_SHORTLISTED'
  | 'ENQUIRY_SENT'
  | 'QUOTE_RECEIVED'
  | 'VENDOR_SELECTED';

export type PlanService = {
  id: string;
  planId: string;
  categoryKey: string;
  categoryName: string;
  requirement: PlanServiceRequirement;
  status: PlanServiceStatus;
  allocatedBudget: number;
  estimatedPrice?: number;
  shortlistedVendorIds: string[];
  preferredVendorId?: string;
  preferredQuoteId?: string;
  notes?: string;
};

export type QuoteStatus =
  | 'RECEIVED'
  | 'VIEWED'
  | 'CLARIFICATION_REQUIRED'
  | 'REVISED'
  | 'ACCEPTED_BY_CUSTOMER'
  | 'DECLINED_BY_CUSTOMER'
  | 'EXPIRED';

export type QuoteLineItem = {
  id: string;
  title: string;
  description?: string;
  quantity?: number;
  rate?: number;
  amount: number;
};

export type VendorQuote = {
  id: string;
  planId: string;
  serviceId: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  vendorCity: string;
  vendorRating: number;
  vendorVerified: boolean;
  status: QuoteStatus;
  currency: 'INR';
  totalAmount: number;
  priceUnit?: string;
  validUntil: string;
  includedItems: QuoteLineItem[];
  excludedItems: string[];
  cancellationPolicy: string;
  partnerOffer?: string;
  responseTime?: string;
  vendorNotes?: string;
  createdAt: string;
};

export type AttentionItem = {
  id: string;
  planId: string;
  planName: string;
  priority: 'Information' | 'Action Required' | 'Time Sensitive';
  title: string;
  issue: string;
  deadline?: string;
  actionText: string;
  actionType: 'review_quotes' | 'shortlist_vendor' | 'set_date' | 'view_plan';
};

export type PlanningTask = {
  id: string;
  section: 'details' | 'budget' | 'services' | 'vendors' | 'enquiries' | 'quotes' | 'confirmation';
  title: string;
  completed: boolean;
  isDataDriven: boolean;
  blockedReason?: string;
};

export interface EventInquiry {
  id: string;
  targetId: string;
  targetName: string;
  targetCategory: string;
  isPackage?: boolean;
  eventType: string;
  eventDate: string;
  guestCount: number;
  city: string;
  estimatedBudget: number;
  specialNotes?: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  status: 'Inquiry Sent' | 'Under Review' | 'Quote Ready' | 'Confirmed';
  createdAt: string;
  quoteAmount?: number;
}

export type ActiveEventPlan = {
  id: string;
  title: string;
  eventType: string;
  city: string;
  date?: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  vibe: string;
  requiredServices: string[];
  shortlistedVendorsCount: number;
  enquiriesSentCount: number;
  completionPercentage: number;
  nextRecommendedStep: string;
};

// ============================================================
// Storage Keys & Caches
// ============================================================

const PLANS_STORAGE_KEY = 'vellure_event_plans_store';
const SERVICES_STORAGE_KEY = 'vellure_plan_services_store';
const QUOTES_STORAGE_KEY = 'vellure_vendor_quotes_store';
const INQUIRIES_STORAGE_KEY = 'vellure_event_inquiries';
const SAVED_VENDORS_STORAGE_KEY = 'vellure_saved_vendors';
const SAVED_PACKAGES_STORAGE_KEY = 'vellure_saved_packages';
const COMPARED_VENDORS_STORAGE_KEY = 'vellure_compared_vendors';
const PROFILE_STORAGE_KEY = 'vellure_customer_profile';
const NOTIFICATIONS_STORAGE_KEY = 'vellure_notification_preferences';
const LOCATIONS_STORAGE_KEY = 'vellure_saved_locations';

let plansCache: EventPlan[] = [
  {
    id: 'plan_wedding_patiala',
    userId: 'user_1',
    name: 'Royal Wedding Celebration',
    eventType: 'Wedding',
    ceremonyType: 'Anand Karaj & Reception',
    status: 'QUOTES_RECEIVED',
    city: 'Patiala',
    venueArea: 'Urban Estate / Heritage Belt',
    eventDate: '2026-11-12',
    flexibleDate: false,
    guestCount: 300,
    budgetMin: 2000000,
    budgetMax: 2500000,
    theme: 'Grand & Royal',
    description: 'Heritage palace wedding with traditional Anand Karaj, gourmet feasting, and candid cinematography.',
    progress: 65,
    isPrimary: true,
    servicesCount: 5,
    enquiriesCount: 2,
    quotesCount: 1,
    nextRecommendedStep: 'Review received quotes for Royal Feasting & Photography',
    notes: 'Bride side arrival at 10 AM. Royal entrance with dhol and mood lighting required.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let servicesCache: Record<string, PlanService[]> = {
  plan_wedding_patiala: [
    {
      id: 'srv_1',
      planId: 'plan_wedding_patiala',
      categoryKey: 'venue',
      categoryName: 'Grand Palace Venue',
      requirement: 'REQUIRED',
      status: 'VENDOR_SELECTED',
      allocatedBudget: 1000000,
      estimatedPrice: 950000,
      shortlistedVendorIds: ['0b7c232f-0f45-4966-b7b2-6db3633d926d'],
      preferredVendorId: '0b7c232f-0f45-4966-b7b2-6db3633d926d',
      notes: 'Fort Patiala shortlisted for lawns & heritage banquet hall.',
    },
    {
      id: 'srv_2',
      planId: 'plan_wedding_patiala',
      categoryKey: 'catering',
      categoryName: 'Royal Artisanal Catering',
      requirement: 'REQUIRED',
      status: 'QUOTE_RECEIVED',
      allocatedBudget: 600000,
      estimatedPrice: 580000,
      shortlistedVendorIds: ['cat_royal_kitchen'],
      notes: '3-course feast for 300 guests with live chaat and tandoor counters.',
    },
    {
      id: 'srv_3',
      planId: 'plan_wedding_patiala',
      categoryKey: 'photography',
      categoryName: 'Cinematic Photography & Film',
      requirement: 'REQUIRED',
      status: 'VENDOR_SHORTLISTED',
      allocatedBudget: 350000,
      estimatedPrice: 320000,
      shortlistedVendorIds: ['51c9bde8-d49c-43c1-8891-b8610c31d97e'],
      notes: 'RR Studios candid photography and drone cinema.',
    },
    {
      id: 'srv_4',
      planId: 'plan_wedding_patiala',
      categoryKey: 'decor',
      categoryName: 'Bespoke Decor & Lighting',
      requirement: 'REQUIRED',
      status: 'VENDOR_SHORTLISTED',
      allocatedBudget: 400000,
      estimatedPrice: 380000,
      shortlistedVendorIds: ['47118ca0-17af-47c3-bb33-8c4624c0435b'],
      notes: 'Shaandaar Events floral mandap and mood lighting entrance.',
    },
    {
      id: 'srv_5',
      planId: 'plan_wedding_patiala',
      categoryKey: 'makeup',
      categoryName: 'Bridal Couture Makeup',
      requirement: 'RECOMMENDED',
      status: 'VENDOR_NEEDED',
      allocatedBudget: 150000,
      estimatedPrice: 120000,
      shortlistedVendorIds: [],
    },
  ],
};

let quotesCache: Record<string, VendorQuote[]> = {
  plan_wedding_patiala: [
    {
      id: 'quote_101',
      planId: 'plan_wedding_patiala',
      serviceId: 'srv_2',
      vendorId: 'cat_royal_kitchen',
      vendorName: 'Royal Kitchen Caterers',
      vendorCategory: 'Catering',
      vendorCity: 'Patiala',
      vendorRating: 4.9,
      vendorVerified: true,
      status: 'RECEIVED',
      currency: 'INR',
      totalAmount: 570000,
      priceUnit: '₹1,900 / Plate (300 Guests)',
      validUntil: '2026-09-30',
      includedItems: [
        { id: 'item_1', title: '6 Welcome Drinks & Mocktails', amount: 30000 },
        { id: 'item_2', title: '8 Live Starters (Veg & Non-Veg Tandoor)', amount: 120000 },
        { id: 'item_3', title: 'Main Feast Buffet (16 Items + Breads)', amount: 320000 },
        { id: 'item_4', title: '4 Royal Desserts + Kulfi Counter', amount: 60000 },
        { id: 'item_5', title: 'Service Uniform Staff & Cutlery', amount: 40000 },
      ],
      excludedItems: ['Imported Mineral Water Bottles', 'Specialist Ice Sculptures'],
      cancellationPolicy: '100% refundable up to 30 days prior to celebration.',
      partnerOffer: 'Complimentary Live Coffee & Paan Counter',
      responseTime: 'Under 6 hours',
      vendorNotes: 'Rates confirmed for 300 guests. Complimentary chef food tasting session included upon selection.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

let profileCache: CustomerProfile = {
  id: 'guest_user',
  fullName: 'Event Host',
  displayName: 'Host',
  avatarUrl: '',
  email: 'host@vellure.in',
  emailVerified: true,
  phone: '+91 98765 43210',
  phoneVerified: true,
  primaryCity: 'Patiala',
  state: 'Punjab',
  preferredLanguage: 'English / Punjabi',
  preferredContactMethod: 'phone',
  isAuthenticated: true,
};

let notificationPrefsCache: NotificationPreferences = {
  vendorResponses: true,
  quoteUpdates: true,
  eventReminders: true,
  planningRecommendations: true,
  partnerOffers: false,
  emailMarketing: false,
  smsMarketing: true,
  pushEnabled: true,
};

let savedLocationsCache: SavedLocationItem[] = [
  { id: 'loc-1', name: 'Primary Residence', city: 'Patiala', state: 'Punjab', tag: 'Primary' },
  { id: 'loc-2', name: 'Family Home', city: 'Chandigarh', state: 'Punjab', tag: 'Family' },
];

let inquiriesCache: EventInquiry[] = [
  {
    id: 'VEL-INQ-101',
    targetId: '0b7c232f-0f45-4966-b7b2-6db3633d926d',
    targetName: 'Fort Patiala',
    targetCategory: 'Grand Palace Venue',
    eventType: 'Wedding',
    eventDate: '2026-11-12',
    guestCount: 300,
    city: 'Patiala',
    estimatedBudget: 1000000,
    specialNotes: 'Looking for royal heritage lawns and banquet hall.',
    userName: 'Event Host',
    userPhone: '+91 98765 43210',
    userEmail: 'host@vellure.in',
    status: 'Quote Ready',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    quoteAmount: 950000,
  },
  {
    id: 'VEL-INQ-102',
    targetId: '51c9bde8-d49c-43c1-8891-b8610c31d97e',
    targetName: 'RR Studios',
    targetCategory: 'Cinematic Photography & Film',
    eventType: 'Wedding',
    eventDate: '2026-11-12',
    guestCount: 300,
    city: 'Patiala',
    estimatedBudget: 350000,
    specialNotes: 'Looking for 3-day coverage including pre-wedding teaser.',
    userName: 'Event Host',
    userPhone: '+91 98765 43210',
    userEmail: 'host@vellure.in',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let savedVendorIdsCache: string[] = [
  '0b7c232f-0f45-4966-b7b2-6db3633d926d',
  '51c9bde8-d49c-43c1-8891-b8610c31d97e',
  '47118ca0-17af-47c3-bb33-8c4624c0435b',
];

let savedPackageIdsCache: string[] = ['pack_essential', 'pack_premium'];
let comparedVendorIdsCache: string[] = [];

// ============================================================
// Plan Calculation Engine
// ============================================================

export const calculatePlanMetrics = (plan: EventPlan, services: PlanService[], quotes: VendorQuote[]): {
  progress: number;
  status: EventPlanStatus;
  nextStep: string;
} => {
  let score = 0;

  // 1. Event Details (20%)
  const hasDetails = Boolean(plan.name && plan.eventType && plan.city);
  const hasDate = Boolean(plan.eventDate);
  if (hasDetails) score += 10;
  if (hasDate) score += 10;

  // 2. Budget Details (15%)
  if (plan.budgetMax > 0) score += 15;

  // 3. Required Services Selected (15%)
  const required = services.filter((s) => s.requirement === 'REQUIRED');
  if (required.length > 0) score += 15;

  // 4. Vendors Shortlisted (20%)
  const shortlisted = services.filter((s) => s.shortlistedVendorIds.length > 0);
  if (shortlisted.length > 0) score += 10;
  if (shortlisted.length >= required.length && required.length > 0) score += 10;

  // 5. Enquiries Sent (10%)
  if (plan.enquiriesCount > 0) score += 10;

  // 6. Quotes Reviewed (10%)
  if (quotes.length > 0) score += 10;

  // 7. Preferred Vendors Selected (10%)
  const preferred = services.filter((s) => Boolean(s.preferredVendorId));
  if (preferred.length > 0) score += 10;

  // Determine status
  let calculatedStatus: EventPlanStatus = 'PLANNING';
  if (!hasDetails || !hasDate) calculatedStatus = 'DETAILS_INCOMPLETE';
  else if (quotes.length > 0) calculatedStatus = 'QUOTES_RECEIVED';
  else if (plan.enquiriesCount > 0) calculatedStatus = 'ENQUIRIES_SENT';
  else if (shortlisted.length > 0) calculatedStatus = 'VENDORS_SHORTLISTED';
  else if (preferred.length >= required.length && required.length > 0) calculatedStatus = 'READY_TO_BOOK';

  // Determine next step
  let nextStep = 'Select your required celebration services';
  if (!hasDate) nextStep = 'Set your target celebration date';
  else if (quotes.length > 0) nextStep = `Review ${quotes.length} received quotation proposals`;
  else if (shortlisted.length < required.length) nextStep = 'Shortlist verified specialists for required services';
  else if (plan.enquiriesCount === 0) nextStep = 'Send consultation enquiries to shortlisted partners';

  return {
    progress: Math.min(100, Math.max(10, score)),
    status: calculatedStatus,
    nextStep,
  };
};

// ============================================================
// Plans CRUD Services
// ============================================================

export const fetchCustomerPlans = async (): Promise<EventPlan[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(PLANS_STORAGE_KEY);
      if (stored) plansCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...plansCache];
};

export const fetchPlanById = async (planId: string): Promise<EventPlan | null> => {
  const all = await fetchCustomerPlans();
  return all.find((p) => p.id === planId) || null;
};

export const saveEventPlan = async (plan: EventPlan): Promise<EventPlan> => {
  const existingIdx = plansCache.findIndex((p) => p.id === plan.id);
  if (existingIdx >= 0) {
    plansCache[existingIdx] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    plansCache = [plan, ...plansCache];
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
    }
  } catch (_) {}

  return plan;
};

export const createNewPlan = async (params: {
  name: string;
  eventType: string;
  city: string;
  date?: string;
  guestCount?: number;
  budgetMax?: number;
  theme?: string;
  description?: string;
  requiredServices?: string[];
}): Promise<EventPlan> => {
  const newId = `plan_${Date.now()}`;
  const budgetMax = params.budgetMax || 1500000;
  const budgetMin = Math.round(budgetMax * 0.8);
  const guestCount = params.guestCount || 200;

  const defaultServices: PlanService[] = (params.requiredServices || [
    'Grand Venue',
    'Artisanal Catering',
    'Bespoke Decor',
    'Photography & Cinema',
  ]).map((srvName, idx) => ({
    id: `srv_${Date.now()}_${idx}`,
    planId: newId,
    categoryKey: srvName.toLowerCase().replace(/\s+/g, '_'),
    categoryName: srvName,
    requirement: 'REQUIRED',
    status: 'VENDOR_NEEDED',
    allocatedBudget: Math.round(budgetMax / 4),
    shortlistedVendorIds: [],
  }));

  servicesCache[newId] = defaultServices;
  quotesCache[newId] = [];

  const newPlan: EventPlan = {
    id: newId,
    userId: 'user_1',
    name: params.name || `${params.eventType} in ${params.city}`,
    eventType: params.eventType || 'Wedding',
    status: 'PLANNING',
    city: params.city || 'Patiala',
    eventDate: params.date,
    flexibleDate: !params.date,
    guestCount,
    budgetMin,
    budgetMax,
    theme: params.theme || 'Grand & Royal',
    description: params.description || '',
    progress: 35,
    isPrimary: plansCache.length === 0,
    servicesCount: defaultServices.length,
    enquiriesCount: 0,
    quotesCount: 0,
    nextRecommendedStep: 'Shortlist verified specialists from local marketplace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { progress, nextStep } = calculatePlanMetrics(newPlan, defaultServices, []);
  newPlan.progress = progress;
  newPlan.nextRecommendedStep = nextStep;

  plansCache = [newPlan, ...plansCache];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}

  return newPlan;
};

export const duplicateEventPlan = async (planId: string): Promise<EventPlan | null> => {
  const original = await fetchPlanById(planId);
  if (!original) return null;

  const newId = `plan_${Date.now()}`;
  const duplicated: EventPlan = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    status: 'DRAFT',
    progress: 30,
    isPrimary: false,
    enquiriesCount: 0,
    quotesCount: 0,
    nextRecommendedStep: 'Review celebration services and shortlist vendors',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const originalServices = servicesCache[planId] || [];
  servicesCache[newId] = originalServices.map((s, idx) => ({
    ...s,
    id: `srv_${Date.now()}_${idx}`,
    planId: newId,
    status: 'VENDOR_NEEDED',
    shortlistedVendorIds: [],
    preferredVendorId: undefined,
    preferredQuoteId: undefined,
  }));

  quotesCache[newId] = [];
  plansCache = [duplicated, ...plansCache];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}

  return duplicated;
};

export const archiveEventPlan = async (planId: string): Promise<boolean> => {
  const idx = plansCache.findIndex((p) => p.id === planId);
  if (idx >= 0) {
    plansCache[idx].status = 'ARCHIVED';
    plansCache[idx].isPrimary = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
      }
    } catch (_) {}
    return true;
  }
  return false;
};

export const restoreEventPlan = async (planId: string): Promise<boolean> => {
  const idx = plansCache.findIndex((p) => p.id === planId);
  if (idx >= 0) {
    plansCache[idx].status = 'PLANNING';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
      }
    } catch (_) {}
    return true;
  }
  return false;
};

export const cancelEventPlan = async (planId: string): Promise<boolean> => {
  const idx = plansCache.findIndex((p) => p.id === planId);
  if (idx >= 0) {
    plansCache[idx].status = 'CANCELLED';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
      }
    } catch (_) {}
    return true;
  }
  return false;
};

export const deleteDraftPlan = async (planId: string): Promise<boolean> => {
  plansCache = plansCache.filter((p) => p.id !== planId);
  delete servicesCache[planId];
  delete quotesCache[planId];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plansCache));
    }
  } catch (_) {}
  return true;
};

// ============================================================
// Services & Shortlist Operations
// ============================================================

export const fetchPlanServices = async (planId: string): Promise<PlanService[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(SERVICES_STORAGE_KEY);
      if (stored) servicesCache = JSON.parse(stored);
    }
  } catch (_) {}
  return servicesCache[planId] || [];
};

export const addPlanService = async (
  planId: string,
  service: Omit<PlanService, 'id' | 'planId' | 'shortlistedVendorIds' | 'status'>
): Promise<PlanService[]> => {
  const newService: PlanService = {
    ...service,
    id: `srv_${Date.now()}`,
    planId,
    status: 'VENDOR_NEEDED',
    shortlistedVendorIds: [],
  };

  const list = servicesCache[planId] || [];
  servicesCache[planId] = [...list, newService];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}

  return servicesCache[planId];
};

export const removePlanService = async (planId: string, serviceId: string): Promise<PlanService[]> => {
  const list = servicesCache[planId] || [];
  servicesCache[planId] = list.filter((s) => s.id !== serviceId);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}
  return servicesCache[planId];
};

export const shortlistVendorForService = async (
  planId: string,
  serviceId: string,
  vendorId: string
): Promise<PlanService[]> => {
  const list = servicesCache[planId] || [];
  const idx = list.findIndex((s) => s.id === serviceId);
  if (idx >= 0) {
    const srv = list[idx];
    if (!srv.shortlistedVendorIds.includes(vendorId)) {
      srv.shortlistedVendorIds = [...srv.shortlistedVendorIds, vendorId];
      srv.status = 'VENDOR_SHORTLISTED';
    }
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}
  return servicesCache[planId] || [];
};

export const setPreferredVendor = async (
  planId: string,
  serviceId: string,
  vendorId: string
): Promise<PlanService[]> => {
  const list = servicesCache[planId] || [];
  const idx = list.findIndex((s) => s.id === serviceId);
  if (idx >= 0) {
    list[idx].preferredVendorId = vendorId;
    list[idx].status = 'VENDOR_SELECTED';
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
    }
  } catch (_) {}
  return servicesCache[planId] || [];
};

// ============================================================
// Quotes & Comparisons
// ============================================================

export const fetchPlanQuotes = async (planId: string): Promise<VendorQuote[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(QUOTES_STORAGE_KEY);
      if (stored) quotesCache = JSON.parse(stored);
    }
  } catch (_) {}
  return quotesCache[planId] || [];
};

export const selectPreferredQuote = async (planId: string, quoteId: string): Promise<boolean> => {
  const list = quotesCache[planId] || [];
  const qIdx = list.findIndex((q) => q.id === quoteId);
  if (qIdx >= 0) {
    list[qIdx].status = 'ACCEPTED_BY_CUSTOMER';

    // Update the corresponding service
    const serviceId = list[qIdx].serviceId;
    const srvList = servicesCache[planId] || [];
    const sIdx = srvList.findIndex((s) => s.id === serviceId);
    if (sIdx >= 0) {
      srvList[sIdx].preferredVendorId = list[qIdx].vendorId;
      srvList[sIdx].preferredQuoteId = quoteId;
      srvList[sIdx].status = 'VENDOR_SELECTED';
      srvList[sIdx].estimatedPrice = list[qIdx].totalAmount;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotesCache));
        window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesCache));
      }
    } catch (_) {}
    return true;
  }
  return false;
};

// ============================================================
// Attention Required & Checklist Generator
// ============================================================

export const fetchAttentionItems = async (): Promise<AttentionItem[]> => {
  const plans = await fetchCustomerPlans();
  const activePlans = plans.filter((p) => p.status !== 'ARCHIVED' && p.status !== 'CANCELLED' && p.status !== 'COMPLETED');
  const items: AttentionItem[] = [];

  for (const plan of activePlans) {
    const quotes = await fetchPlanQuotes(plan.id);
    const unreviewed = quotes.filter((q) => q.status === 'RECEIVED');

    if (unreviewed.length > 0) {
      items.push({
        id: `att_quote_${plan.id}`,
        planId: plan.id,
        planName: plan.name,
        priority: 'Time Sensitive',
        title: `${unreviewed.length} New Quotation Proposal Received`,
        issue: `Quotation from ${unreviewed[0].vendorName} is valid until ${unreviewed[0].validUntil}`,
        deadline: unreviewed[0].validUntil,
        actionText: 'Review Quote',
        actionType: 'review_quotes',
      });
    }

    if (!plan.eventDate) {
      items.push({
        id: `att_date_${plan.id}`,
        planId: plan.id,
        planName: plan.name,
        priority: 'Action Required',
        title: 'Celebration Date Unset',
        issue: 'Locking your event date allows vendors to confirm availability.',
        actionText: 'Set Target Date',
        actionType: 'set_date',
      });
    }
  }

  return items;
};

export const fetchPlanChecklist = async (planId: string): Promise<PlanningTask[]> => {
  const plan = await fetchPlanById(planId);
  if (!plan) return [];

  const services = await fetchPlanServices(planId);
  const quotes = await fetchPlanQuotes(planId);

  const hasDetails = Boolean(plan.name && plan.eventType && plan.city);
  const hasDate = Boolean(plan.eventDate);
  const hasBudget = Boolean(plan.budgetMax > 0);
  const hasServices = services.length > 0;
  const hasShortlisted = services.some((s) => s.shortlistedVendorIds.length > 0);
  const hasEnquiries = plan.enquiriesCount > 0;
  const hasQuotes = quotes.length > 0;
  const hasPreferred = services.some((s) => Boolean(s.preferredVendorId));

  return [
    { id: 't_details_type', section: 'details', title: 'Define event type & celebration city', completed: hasDetails, isDataDriven: true },
    { id: 't_details_date', section: 'details', title: 'Set target celebration date', completed: hasDate, isDataDriven: true },
    { id: 't_budget_alloc', section: 'budget', title: 'Set total budget and review allocation', completed: hasBudget, isDataDriven: true },
    { id: 't_services_req', section: 'services', title: 'Select required & recommended services', completed: hasServices, isDataDriven: true },
    { id: 't_vendors_short', section: 'vendors', title: 'Shortlist verified marketplace specialists', completed: hasShortlisted, isDataDriven: true },
    { id: 't_enquiries_send', section: 'enquiries', title: 'Send consultation enquiries for custom quotes', completed: hasEnquiries, isDataDriven: true },
    { id: 't_quotes_review', section: 'quotes', title: 'Compare quotations and review included items', completed: hasQuotes, isDataDriven: true },
    { id: 't_confirm_select', section: 'confirmation', title: 'Accept preferred quotations', completed: hasPreferred, isDataDriven: true },
  ];
};

// ============================================================
// Profile Services
// ============================================================

export const fetchCustomerProfile = async (): Promise<CustomerProfile> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) profileCache = { ...profileCache, ...JSON.parse(stored) };
    }
  } catch (_) {}

  try {
    const resp = await fetchWithTimeout(`${BASE_URL}/users/me/preferences`);
    if (resp.ok) {
      const data = await resp.json();
      if (data?.user) {
        profileCache = {
          ...profileCache,
          fullName: data.user.name || profileCache.fullName,
          email: data.user.email || profileCache.email,
          primaryCity: data.city || profileCache.primaryCity,
        };
      }
    }
  } catch (_) {}

  return { ...profileCache };
};

export const saveCustomerProfile = async (updated: Partial<CustomerProfile>): Promise<CustomerProfile> => {
  profileCache = { ...profileCache, ...updated };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileCache));
    }
  } catch (_) {}
  return { ...profileCache };
};

export const fetchNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) notificationPrefsCache = { ...notificationPrefsCache, ...JSON.parse(stored) };
    }
  } catch (_) {}
  return { ...notificationPrefsCache };
};

export const saveNotificationPreferences = async (prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  notificationPrefsCache = { ...notificationPrefsCache, ...prefs };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notificationPrefsCache));
    }
  } catch (_) {}
  return { ...notificationPrefsCache };
};

export const fetchSavedLocations = async (): Promise<SavedLocationItem[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (stored) savedLocationsCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...savedLocationsCache];
};

export const addSavedLocation = async (loc: Omit<SavedLocationItem, 'id'>): Promise<SavedLocationItem[]> => {
  const newItem: SavedLocationItem = { ...loc, id: `loc-${Date.now()}` };
  savedLocationsCache = [newItem, ...savedLocationsCache];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(savedLocationsCache));
    }
  } catch (_) {}
  return [...savedLocationsCache];
};

export const removeSavedLocation = async (id: string): Promise<SavedLocationItem[]> => {
  savedLocationsCache = savedLocationsCache.filter((item) => item.id !== id);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(savedLocationsCache));
    }
  } catch (_) {}
  return [...savedLocationsCache];
};

export const fetchActiveEventPlan = async (): Promise<ActiveEventPlan | null> => {
  const plans = await fetchCustomerPlans();
  const primary = plans.find((p) => p.isPrimary && p.status !== 'ARCHIVED' && p.status !== 'CANCELLED') || plans[0];
  if (!primary) return null;

  const services = await fetchPlanServices(primary.id);
  return {
    id: primary.id,
    title: primary.name,
    eventType: primary.eventType,
    city: primary.city,
    date: primary.eventDate,
    guestCount: primary.guestCount,
    budgetMin: primary.budgetMin,
    budgetMax: primary.budgetMax,
    vibe: primary.theme || 'Grand & Royal',
    requiredServices: services.map((s) => s.categoryName),
    shortlistedVendorsCount: services.reduce((acc, s) => acc + s.shortlistedVendorIds.length, 0),
    enquiriesSentCount: primary.enquiriesCount,
    completionPercentage: primary.progress,
    nextRecommendedStep: primary.nextRecommendedStep,
  };
};

// ============================================================
// Core Marketplace & Budget APIs
// ============================================================

export const fetchUserPreferences = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/me/preferences`);
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch user preferences:', err);
    throw err;
  }
};

export const saveUserPreferences = async (payload: any) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/me/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to save user preferences:', err);
    throw err;
  }
};

export const generateBudgetMatch = async (payload: BudgetPlannerInput) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/budget/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 8000);

    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.warn('AI backend unavailable; using the free local planner.', err);
    return createLocalBudgetPlan(payload);
  }
};

export const fetchBudgetDashboardData = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/budget/dashboard`);
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch budget dashboard:', err);
    throw err;
  }
};

export const fetchCitiesData = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/budget/cities`);
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch cities data:', err);
    throw err;
  }
};

export const fetchVendorPacks = async (budget: number) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/budget/vendor-packs?budget=${budget}`);
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch vendor packs:', err);
    throw err;
  }
};

export const fetchVendorsData = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/vendors/public?limit=100`);
    if (response.ok) {
      const data = await response.json();

      const grouped: Record<string, any[]> = {
        venue: [],
        catering: [],
        decor: [],
        photography: [],
        videography: [],
        makeup: [],
        mehendi: [],
        planning: [],
        entertainment: [],
        music: [],
        invitations: [],
        accommodation: [],
        transport: [],
        security: [],
        priest: [],
        ceremony: [],
      };

      const categoryAliases: Record<string, string> = {
        event_planner: 'planning',
        event_planning: 'planning',
        planner: 'planning',
        live_music: 'music',
        dj: 'entertainment',
        sound_lighting: 'entertainment',
        decoration: 'decor',
        decorator: 'decor',
        cake_desserts: 'catering',
        cake: 'catering',
        ceremony_services: 'ceremony',
        religious_services: 'ceremony',
      };

      if (Array.isArray(data.vendors)) {
        data.vendors.forEach((v: any) => {
          const rawCategory = (v.category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const cat = categoryAliases[rawCategory] || rawCategory;
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(v);
        });
      }

      return grouped;
    }
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch public vendors:', err);
    throw err;
  }
};

export const fetchPublicVendorById = async (vendorId: string): Promise<any> => {
  const response = await fetchWithTimeout(`${BASE_URL}/vendors/public/${encodeURIComponent(vendorId)}`);
  if (response.status === 404) {
    // Backward compatibility while older local backends are still running.
    const grouped = await fetchVendorsData();
    return (Object.values(grouped).flat() as any[])
      .find((vendor) => String(vendor?.id) === String(vendorId)) || null;
  }
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.vendor || null;
};

export const fetchEventInquiries = async (): Promise<EventInquiry[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (stored) inquiriesCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...inquiriesCache];
};

export const createEventInquiry = async (
  inquiryData: Omit<EventInquiry, 'id' | 'status' | 'createdAt'>
): Promise<EventInquiry> => {
  const newInquiry: EventInquiry = {
    ...inquiryData,
    id: `VEL-INQ-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Inquiry Sent',
    createdAt: new Date().toISOString(),
  };

  inquiriesCache = [newInquiry, ...inquiriesCache];

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiriesCache));
    }
  } catch (_) {}

  return newInquiry;
};

export const fetchSavedVendorIds = async (): Promise<string[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(SAVED_VENDORS_STORAGE_KEY);
      if (stored) savedVendorIdsCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...savedVendorIdsCache];
};

export const toggleSaveVendorId = async (vendorId: string): Promise<boolean> => {
  const exists = savedVendorIdsCache.includes(vendorId);
  if (exists) {
    savedVendorIdsCache = savedVendorIdsCache.filter((id) => id !== vendorId);
  } else {
    savedVendorIdsCache = [vendorId, ...savedVendorIdsCache];
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SAVED_VENDORS_STORAGE_KEY, JSON.stringify(savedVendorIdsCache));
    }
  } catch (_) {}

  return !exists;
};

export const fetchComparedVendorIds = async (): Promise<string[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(COMPARED_VENDORS_STORAGE_KEY);
      if (stored) comparedVendorIdsCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...comparedVendorIdsCache];
};

export const saveComparedVendorIds = async (vendorIds: string[]): Promise<string[]> => {
  comparedVendorIdsCache = [...new Set(vendorIds)].slice(0, 4);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COMPARED_VENDORS_STORAGE_KEY, JSON.stringify(comparedVendorIdsCache));
    }
  } catch (_) {}
  return [...comparedVendorIdsCache];
};

export const fetchSavedPackageIds = async (): Promise<string[]> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(SAVED_PACKAGES_STORAGE_KEY);
      if (stored) savedPackageIdsCache = JSON.parse(stored);
    }
  } catch (_) {}
  return [...savedPackageIdsCache];
};

export const toggleSavePackageId = async (packageId: string): Promise<boolean> => {
  const exists = savedPackageIdsCache.includes(packageId);
  if (exists) {
    savedPackageIdsCache = savedPackageIdsCache.filter((id) => id !== packageId);
  } else {
    savedPackageIdsCache = [packageId, ...savedPackageIdsCache];
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SAVED_PACKAGES_STORAGE_KEY, JSON.stringify(savedPackageIdsCache));
    }
  } catch (_) {}
  return !exists;
};
