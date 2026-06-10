import Constants from 'expo-constants';

// ============================================================
// API Service — Strict Database Enforcement Mode
// All fallbacks and dummy data have been removed.
// ============================================================

// Get the machine's local IP address from Expo constants
// This allows physical devices to reach the local backend automatically
const debuggerHost = Constants.expoConfig?.hostUri;
const host = debuggerHost?.split(':').shift() || 'localhost';

const BASE_URL = `http://${host}:3000/api`;


const TIMEOUT_MS = 30000; // 30 seconds (LLM can be slow for budget generation)

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// ---- User Preferences ----

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
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to save user preferences:', err);
    throw err;
  }
};

// ---- Budget Generation (Core AI endpoint) ----

export const generateBudgetMatch = async (payload: {
  totalBudget: number;
  guestCount: number;
  city: string;
  vibe: string;
  eventType?: string;
  date?: string;
  description?: string;
}) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/budget/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Budget generation failed:', err);
    throw err;
  }
};

// ---- Budget Dashboard ----

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

// ---- Cities ----

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

// ---- Vendor Packs ----

export const fetchVendorPacks = async (budget: number) => {
  try {
    // Passing budget as query param for backend filtering
    const response = await fetchWithTimeout(`${BASE_URL}/budget/vendor-packs?budget=${budget}`);
    if (response.ok) return await response.json();
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch vendor packs:', err);
    throw err;
  }
};

// ---- Public Vendors List ----

export const fetchVendorsData = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/vendors/public`);
    if (response.ok) {
      const data = await response.json();
      
      // Initialize all main categories conceptually, but let the UI handle empty arrays
      const grouped: Record<string, any[]> = {
        venue: [],
        catering: [],
        decor: [],
        photography: [],
        makeup: [],
        entertainment: [],
        priest: []
      };

      data.vendors.forEach((v: any) => {
        const cat = v.category.toLowerCase();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(v);
      });

      return grouped;
    }
    throw new Error(`API error: ${response.status}`);
  } catch (err) {
    console.error('Failed to fetch public vendors:', err);
    throw err;
  }
};
