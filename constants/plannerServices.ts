// Service keys accepted by the backend planner.
export const PLANNER_SERVICES = [
  {
    "key": "venue",
    "name": "Venue"
  },
  {
    "key": "catering",
    "name": "Catering"
  },
  {
    "key": "decor",
    "name": "Decor & Lighting"
  },
  {
    "key": "photography",
    "name": "Photography"
  },
  {
    "key": "videography",
    "name": "Videography"
  },
  {
    "key": "makeup",
    "name": "Makeup"
  },
  {
    "key": "attire",
    "name": "Attire"
  },
  {
    "key": "live_music",
    "name": "Live Music"
  },
  {
    "key": "entertainment",
    "name": "Entertainment"
  },
  {
    "key": "mehendi",
    "name": "Mehendi Artist"
  },
  {
    "key": "priest",
    "name": "Priest & Rituals"
  },
  {
    "key": "planning",
    "name": "Event Planning"
  },
  {
    "key": "cake",
    "name": "Cake & Desserts"
  },
  {
    "key": "transport",
    "name": "Transport"
  },
  {
    "key": "accommodation",
    "name": "Accommodation"
  },
  {
    "key": "invitations",
    "name": "Invitations"
  },
  {
    "key": "gifts",
    "name": "Gifts & Favors"
  },
  {
    "key": "sound_lighting",
    "name": "Sound & Lighting"
  },
  {
    "key": "security",
    "name": "Security"
  }
] as const;

export function plannerServiceKeys(labels: string[]): string[] {
  const legacy: Record<string, string[]> = { 'Venue & Catering': ['venue', 'catering'], 'Attire & Makeup': ['attire', 'makeup'], 'Miscellaneous & Rituals': ['priest'], 'Entertainment & Music': ['live_music'] };
  return [...new Set(labels.flatMap(label => legacy[label] || PLANNER_SERVICES.filter(service => service.name === label || service.key === label).map(service => service.key)))];
}

/**
 * Returns culturally authentic and logistically essential services
 * tailored to the selected Indian celebration type.
 */
export function getDefaultServicesForCelebration(celebrationType: string): string[] {
  const typeLower = (celebrationType || '').toLowerCase().trim();

  // 1. Weddings & Grand Nuptials (Hindu, Sikh, Muslim, Christian)
  if (
    typeLower.includes('wedding') ||
    typeLower.includes('nikah') ||
    typeLower.includes('walima') ||
    typeLower.includes('shaadi') ||
    typeLower.includes('vivaah') ||
    typeLower.includes('anand karaj')
  ) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Photography',
      'Videography',
      'Makeup',
      'Priest & Rituals',
      'Live Music',
      'Transport',
    ];
  }

  // 2. Sangeet, Mehendi, Haldi & Pre-Wedding Festivities
  if (
    typeLower.includes('sangeet') ||
    typeLower.includes('mehendi') ||
    typeLower.includes('mehndi') ||
    typeLower.includes('haldi') ||
    typeLower.includes('bridal shower')
  ) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Mehendi Artist',
      'Live Music',
      'Photography',
      'Makeup',
    ];
  }

  // 3. Engagement, Roka, Ring Ceremony
  if (
    typeLower.includes('engagement') ||
    typeLower.includes('roka') ||
    typeLower.includes('ring ceremony') ||
    typeLower.includes('sagai')
  ) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Photography',
      'Makeup',
      'Live Music',
      'Cake & Desserts',
    ];
  }

  // 4. Post-Wedding Reception
  if (typeLower.includes('reception')) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Photography',
      'Videography',
      'Live Music',
      'Makeup',
      'Transport',
    ];
  }

  // 5. Birthday Parties & Milestone Birthdays
  if (typeLower.includes('birthday') || typeLower.includes('bday')) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Cake & Desserts',
      'Photography',
      'Entertainment',
    ];
  }

  // 6. Anniversary Celebrations
  if (typeLower.includes('anniversary') || typeLower.includes('jubilee')) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Cake & Desserts',
      'Photography',
      'Live Music',
    ];
  }

  // 7. Baby Shower & Naming Ceremony (Godh Bharai / Naamkaran)
  if (
    typeLower.includes('baby shower') ||
    typeLower.includes('naming ceremony') ||
    typeLower.includes('godh bharai') ||
    typeLower.includes('naamkaran')
  ) {
    return [
      'Venue',
      'Catering',
      'Decor & Lighting',
      'Cake & Desserts',
      'Photography',
      'Gifts & Favors',
    ];
  }

  // 8. Spiritual, Religious & Traditional Ceremonies (Puja, Path, Jagran, Kirtan)
  if (
    typeLower.includes('puja') ||
    typeLower.includes('pooja') ||
    typeLower.includes('path') ||
    typeLower.includes('paath') ||
    typeLower.includes('kirtan') ||
    typeLower.includes('jagran') ||
    typeLower.includes('chowki') ||
    typeLower.includes('prayer') ||
    typeLower.includes('baptism') ||
    typeLower.includes('communion')
  ) {
    return [
      'Priest & Rituals',
      'Catering',
      'Decor & Lighting',
      'Sound & Lighting',
      'Gifts & Favors',
    ];
  }

  // 9. Cocktail, Private Party & Housewarming (Griha Pravesh)
  if (
    typeLower.includes('cocktail') ||
    typeLower.includes('party') ||
    typeLower.includes('housewarming') ||
    typeLower.includes('griha pravesh')
  ) {
    return [
      'Venue',
      'Catering',
      'Sound & Lighting',
      'Live Music',
      'Photography',
      'Decor & Lighting',
    ];
  }

  // 10. Corporate Events, Conferences & Product Launches
  if (
    typeLower.includes('corporate') ||
    typeLower.includes('conference') ||
    typeLower.includes('seminar') ||
    typeLower.includes('launch') ||
    typeLower.includes('summit')
  ) {
    return [
      'Venue',
      'Catering',
      'Sound & Lighting',
      'Photography',
      'Event Planning',
      'Transport',
    ];
  }

  // 11. Default fallback celebration
  return ['Venue', 'Catering', 'Decor & Lighting', 'Photography'];
}
