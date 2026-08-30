import { CityEntry } from '../components/ui/CityPickerModal';
import { saveUserPreferences } from './api';

export interface SelectedLocation {
  city: string;
  state?: string;
  locality?: string;
  tier?: string;
  isAutoDetected?: boolean;
}

export const POPULAR_CITIES: CityEntry[] = [
  { city: 'Patiala', state: 'Punjab' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Gurgaon', state: 'Haryana' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Goa', state: 'Goa' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Shimla', state: 'Himachal Pradesh' },
  { city: 'Dehradun', state: 'Uttarakhand' },
];

const STORAGE_KEY = 'vellure_selected_location_v2';

let currentLocation: SelectedLocation = {
  city: 'Patiala',
  state: 'Punjab',
  tier: 'Tier 2',
};

// Initialize location from storage immediately
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.city) {
        currentLocation = { ...currentLocation, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to load initial location from localStorage:', e);
  }
}

const subscribers: Array<(location: SelectedLocation) => void> = [];

function notifySubscribers() {
  const snapshot = { ...currentLocation };
  subscribers.forEach((cb) => {
    try {
      cb(snapshot);
    } catch (e) {
      console.error('Error in location subscriber callback:', e);
    }
  });
}

export function getSelectedLocation(): SelectedLocation {
  return { ...currentLocation };
}

export function getSelectedCity(): string {
  return currentLocation.city;
}

export function setSelectedLocation(
  target: string | SelectedLocation,
  fallbackState?: string
): SelectedLocation {
  let nextCity = '';
  let nextState = fallbackState || '';
  let locality = '';

  if (typeof target === 'string') {
    nextCity = target.trim();
    const matched = POPULAR_CITIES.find(
      (c) => c.city.toLowerCase() === nextCity.toLowerCase()
    );
    if (matched) {
      nextState = matched.state || nextState;
    }
  } else if (target && typeof target === 'object') {
    nextCity = target.city ? target.city.trim() : 'Patiala';
    nextState = target.state || nextState;
    locality = target.locality || '';
  }

  if (!nextCity) nextCity = 'Patiala';
  if (!nextState) nextState = 'Punjab';

  currentLocation = {
    city: nextCity,
    state: nextState,
    locality,
    tier: nextCity.toLowerCase().includes('delhi') || nextCity.toLowerCase().includes('mumbai') || nextCity.toLowerCase().includes('chandigarh') ? 'Tier 1' : 'Tier 2',
  };

  // 1. Notify all in-app components & screens immediately
  notifySubscribers();

  // 2. Persist to storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation));
    } catch (err) {
      console.error('Failed to save selected location to localStorage:', err);
    }
  }

  // 3. Sync to backend preferences in background
  try {
    saveUserPreferences({ city: nextCity }).catch(() => {});
  } catch (_) {}

  return { ...currentLocation };
}

export function subscribeSelectedLocation(
  callback: (location: SelectedLocation) => void
): () => void {
  subscribers.push(callback);
  // Immediate invocation with current snapshot
  try {
    callback({ ...currentLocation });
  } catch (e) {
    console.error('Error in initial location subscriber call:', e);
  }

  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx >= 0) {
      subscribers.splice(idx, 1);
    }
  };
}

/**
 * Checks if a vendor operates in or serves the target city
 */
export function isVendorInCity(vendor: any, targetCity?: string): boolean {
  const city = (targetCity || currentLocation.city || '').toLowerCase().trim();
  if (!city) return true;

  const vendorCity = (vendor.city || '').toLowerCase().trim();
  if (vendorCity === city) return true;

  // Check if vendor locality or state matches
  if (vendor.locality && vendor.locality.toLowerCase().includes(city)) return true;

  // Check service cities list if defined
  if (Array.isArray(vendor.serviceCities)) {
    if (vendor.serviceCities.some((c: string) => String(c).toLowerCase().trim() === city)) {
      return true;
    }
  }

  // Check if vendor has wide service radius that encompasses the city in region (e.g. Punjab region)
  if (
    (vendor.serviceRadiusKm && vendor.serviceRadiusKm >= 150) ||
    vendorCity.includes('chandigarh') ||
    vendorCity.includes('patiala') ||
    vendorCity.includes('ludhiana')
  ) {
    // Shared Punjab/North territory
    if (['patiala', 'chandigarh', 'ludhiana', 'amritsar'].includes(city) &&
        ['patiala', 'chandigarh', 'ludhiana', 'amritsar'].includes(vendorCity)) {
      return true;
    }
  }

  return false;
}
