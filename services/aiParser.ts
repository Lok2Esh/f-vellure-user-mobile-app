import { PLANNER_SERVICES, plannerServiceKeys, getDefaultServicesForCelebration } from '../constants/plannerServices';
export interface ParsedEventPlan {
  eventType: string;
  city: string;
  guestCount: number;
  totalBudget: number;
  theme: string;
  requiredServices: string[];
  assumptions: string[];
  missingInfo: string[];
  confidence: number;
  eventDate?: string;
  selectedServiceKeys?: string[];
  confirmedDetails?: boolean;
  rawPrompt: string;
}

const INDIAN_CITIES_LIST = [
  'Patiala',
  'Chandigarh',
  'Ludhiana',
  'Amritsar',
  'Jalandhar',
  'Delhi NCR',
  'Delhi',
  'Gurugram',
  'Noida',
  'Jaipur',
  'Udaipur',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Lucknow',
  'Dehradun',
  'Shimla',
  'Goa',
  'Indore',
  'Bhopal',
];

const EVENT_TYPE_KEYWORDS: Record<string, string[]> = {
  Wedding: ['wedding', 'shadi', 'shaadi', 'anand karaj', 'marriage', 'vivaah', 'nikah'],
  Engagement: ['engagement', 'roka', 'ring ceremony', 'sagai'],
  'Sangeet & Mehendi': ['sangeet', 'mehendi', 'mehndi', 'haldi', 'dhol night', 'ladies sangeet'],
  Reception: ['reception', 'walima'],
  Birthday: ['birthday', 'bday', '1st birthday', '50th birthday'],
  Anniversary: ['anniversary', 'silver jubilee', 'golden jubilee'],
  'Corporate Event': ['corporate', 'conference', 'summit', 'annual meet', 'gala dinner', 'seminar'],
  'Puja / Path': ['puja', 'pooja', 'path', 'paath', 'havan', 'katha', 'mata ki chowki', 'jagran'],
  'Baby Shower': ['baby shower', 'godh bharai', 'naamkaran'],
  Housewarming: ['housewarming', 'griha pravesh', 'grah pravesh'],
};

const SERVICE_KEYWORDS: Record<string, string[]> = {
  'Venue & Catering': ['catering', 'caterer', 'food', 'buffet', 'feast', 'banquet', 'venue', 'resort', 'palace', 'lawn', 'farmhouse', 'hall'],
  'Decor & Lighting': ['decor', 'decoration', 'floral', 'lighting', 'stage', 'mandap', 'flower', 'props', 'led'],
  'Photography': ['photography', 'photographer', 'photo', 'video', 'videography', 'cinematography', 'drone', 'candid'],
  'Entertainment': ['live music', 'music', 'dj', 'singer', 'band', 'dhol', 'anchor', 'emcee', 'performers', 'orchestra'],
  'Attire & Makeup': ['makeup', 'make up', 'bridal makeup', 'hair', 'groom attire', 'bridal wear', 'mehendi artist'],
  'Miscellaneous & Rituals': ['priest', 'pandit ji', 'pandit', 'granthi', 'invitation', 'cake', 'transport', 'security', 'favors', 'gifts'],
};

export function parseNaturalLanguagePrompt(
  prompt: string,
  defaultCity: string = 'Patiala'
): ParsedEventPlan {
  const text = prompt.toLowerCase();
  const assumptions: string[] = [];
  const missingInfo: string[] = [];

  // 1. Detect Event Type
  let detectedType = 'Wedding';
  let typeFound = false;
  for (const [eventType, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      detectedType = eventType;
      typeFound = true;
      break;
    }
  }
  if (!typeFound) {
    assumptions.push('Defaulted event category to Wedding celebration');
  }

  // 2. Detect City
  let detectedCity = defaultCity;
  let cityFound = false;
  for (const city of INDIAN_CITIES_LIST) {
    if (text.includes(city.toLowerCase())) {
      detectedCity = city;
      cityFound = true;
      break;
    }
  }
  if (!cityFound) {
    assumptions.push(`City assumed as ${defaultCity} (current market preference)`);
    missingInfo.push('Exact host city or venue locality not specified');
  }

  // 3. Detect Guest Count
  let detectedGuests = 150;
  const guestMatch = text.match(/(\d[\d,]*)\s*(?:guests?|people|pax|persons?|attendees?|members?)\b/i);

  if (guestMatch && guestMatch[1]) {
    const parsed = parseInt(guestMatch[1].replace(/,/g, ''), 10);
    if (parsed > 0 && parsed <= 5000) {
      detectedGuests = parsed;
    }
  } else {
    if (detectedType === 'Wedding') detectedGuests = 250;
    else if (detectedType === 'Engagement') detectedGuests = 150;
    else if (detectedType === 'Birthday') detectedGuests = 50;
    else detectedGuests = 100;
    assumptions.push(`Guest count estimated at ${detectedGuests} based on standard ${detectedType} scale`);
    missingInfo.push('Exact guest count not specified');
  }

  // 4. Detect Budget (Handles: ₹4 lakh, 4L, 400000, 25 lakh, 3.5L, 50k, etc.)
  let detectedBudget = 400000;
  const moneyPattern = /(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|l\b|k\b|thousand)?/i;
  const budgetText = text.includes('total budget') ? text.slice(text.indexOf('total budget')) : text;
  const budgetClause = budgetText.match(/(?:total budget|budget)\s*(?:is|around|of|approx|under|:|=)?\s*([^;.!]*?(?:\d[\d,]*(?:\.\d+)?\s*(?:crores?|cr|lakhs?|lacs?|l\b|k\b|thousand)?))/i);
  const currency = budgetClause?.[1]?.match(moneyPattern);
  if (currency) {
    const unit = (currency[2] || '').toLowerCase();
    const multiplier = /^(crore|cr)/.test(unit) ? 10000000 : /^(lakh|lac|l$)/.test(unit) ? 100000 : /^(k|thousand)/.test(unit) ? 1000 : 1;
    detectedBudget = Math.round(Number(currency[1].replace(/,/g, '')) * multiplier);
  } else {
    detectedBudget = detectedType === 'Wedding' ? 1500000 : detectedType === 'Engagement' ? 400000 : 100000;
    assumptions.push('Budget is a starter value; confirm your total spending limit.');
    missingInfo.push('Target budget limit not specified');
  }

  // 5. Detect Theme / Vibe
  let detectedTheme = 'Contemporary Celebration';
  if (text.includes('outdoor') || text.includes('garden') || text.includes('lawn')) {
    detectedTheme = 'Outdoor Floral & Garden';
    assumptions.push('Assumed open-air lawn / outdoor venue setup with weather contingency');
  } else if (text.includes('royal') || text.includes('palace') || text.includes('heritage') || text.includes('grand')) {
    detectedTheme = 'Grand & Royal Heritage';
  } else if (text.includes('traditional') || text.includes('vedic') || text.includes('spiritual')) {
    detectedTheme = 'Spiritual & Traditional';
  } else if (text.includes('intimate') || text.includes('simple') || text.includes('minimal')) {
    detectedTheme = 'Intimate & Minimal';
  } else if (text.includes('modern') || text.includes('chic')) {
    detectedTheme = 'Modern Minimalist Chic';
  } else if (text.includes('punjabi') || text.includes('folk') || text.includes('vibrant')) {
    detectedTheme = 'Vibrant Cultural & Folk';
  }

  // 6. Detect Required Services
  const detectedServices: string[] = [];
  for (const [serviceCategory, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      detectedServices.push(serviceCategory);
    }
  }

  let finalRequiredServices: string[];
  if (detectedServices.length === 0) {
    // Culturally reflect all essential services based on the detected Celebration Type
    finalRequiredServices = getDefaultServicesForCelebration(detectedType);
    assumptions.push(`Auto-curated services tailored to ${detectedType}: ${finalRequiredServices.slice(0, 4).join(', ')}...`);
  } else {
    if (!detectedServices.includes('Venue & Catering') && (text.includes('food') || text.includes('catering') || text.includes('venue'))) {
      detectedServices.push('Venue & Catering');
    }
    const mapped = PLANNER_SERVICES.filter(service => plannerServiceKeys(detectedServices).includes(service.key)).map(service => service.name);
    finalRequiredServices = mapped.length > 0 ? mapped : getDefaultServicesForCelebration(detectedType);
  }

  // Missing info check
  if (!text.includes('date') && !text.match(/\d{4}-\d{2}-\d{2}/) && !text.match(/\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
    missingInfo.push('Target celebration date not specified (marked as Flexible)');
  }

  let confidence = 0.95;
  if (missingInfo.length > 2) confidence = 0.8;
  else if (missingInfo.length > 0) confidence = 0.88;

  return {
    eventType: detectedType,
    city: detectedCity,
    guestCount: detectedGuests,
    totalBudget: detectedBudget,
    theme: detectedTheme,
    requiredServices: finalRequiredServices,
    assumptions,
    missingInfo,
    confidence,
    eventDate: text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0],
    rawPrompt: prompt,
  };
}
