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
  const guestMatch =
    text.match(/(\d+)\s*(?:guests?|people|pax|persons?|attendees?|members?)/i) ||
    text.match(/(?:for|around|about)\s*(\d+)\s*(?:guests?|people|pax)?/i);

  if (guestMatch && guestMatch[1]) {
    const parsed = parseInt(guestMatch[1], 10);
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
  const lakhMatch =
    text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|lacs?|l\b)/i) ||
    text.match(/budget\s*(?:is|around|of|approx)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|lacs?|l\b)/i);

  const kMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);
  const rawNumMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d{4,8})\b/i) || text.match(/budget\s*(?:is|around|of|approx)?\s*(\d{4,8})\b/i);

  if (lakhMatch && lakhMatch[1]) {
    detectedBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch && kMatch[1]) {
    detectedBudget = Math.round(parseFloat(kMatch[1]) * 1000);
  } else if (rawNumMatch && rawNumMatch[1]) {
    detectedBudget = parseInt(rawNumMatch[1], 10);
  } else {
    // Standard default budget based on event type & guests
    if (detectedType === 'Wedding') detectedBudget = 1500000;
    else if (detectedType === 'Engagement') detectedBudget = 400000;
    else if (detectedType === 'Birthday') detectedBudget = 100000;
    else detectedBudget = 300000;
    assumptions.push(`Budget estimated at ₹${(detectedBudget / 100000).toFixed(1)} Lakh for ${detectedGuests} guests`);
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

  if (detectedServices.length === 0) {
    detectedServices.push('Venue & Catering', 'Decor & Lighting', 'Photography');
    assumptions.push('Included standard core services: Venue & Catering, Decor & Lighting, Photography');
  } else {
    if (!detectedServices.includes('Venue & Catering') && (text.includes('food') || text.includes('catering') || text.includes('venue'))) {
      detectedServices.push('Venue & Catering');
    }
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
    requiredServices: detectedServices,
    assumptions,
    missingInfo,
    confidence,
    rawPrompt: prompt,
  };
}
