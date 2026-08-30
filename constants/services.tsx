import React from 'react';
import { 
  MapPin, 
  Flower, 
  Camera, 
  Utensils, 
  Music, 
  Scissors, 
  Car, 
  Gift, 
  Wine,
  Building2,
  CakeSlice,
  Video,
  Mic2,
  BedDouble,
  ClipboardList,
  Lightbulb,
  Mail,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
} from 'lucide-react-native';

export interface ServiceMetadata {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export const SERVICE_REGISTRY: Record<string, ServiceMetadata> = {
  'Venue': {
    id: 'venue',
    label: 'Venues',
    icon: Building2,
    color: '#641E3D'
  },
  'Venue & Catering': {
    id: 'venue_catering',
    label: 'Venue & Catering',
    icon: MapPin,
    color: '#800020' // Burgundy
  },
  'Decor & Lighting': {
    id: 'decor_lighting',
    label: 'Decor & Lighting',
    icon: Flower,
    color: '#D4AF37' // Gold
  },
  'Photography': {
    id: 'photography',
    label: 'Photography',
    icon: Camera,
    color: '#BA0F6B' // Deep Pink
  },
  'Videography': {
    id: 'videography',
    label: 'Videography & Films',
    icon: Video,
    color: '#7A3154'
  },
  'Catering': {
    id: 'catering',
    label: 'Catering',
    icon: Utensils,
    color: '#A35E2E'
  },
  'Cake & Desserts': {
    id: 'cake_desserts',
    label: 'Cakes & Desserts',
    icon: CakeSlice,
    color: '#B85772'
  },
  'Bridal Wear': {
    id: 'bridal_wear',
    label: 'Bridal Wear',
    icon: Sparkles,
    color: '#A63F69'
  },
  'Groom Wear': {
    id: 'groom_wear',
    label: 'Groom Wear',
    icon: Scissors,
    color: '#415A77'
  },
  'Choreography': {
    id: 'choreography',
    label: 'Choreography',
    icon: Music,
    color: '#8B5E83'
  },
  'Gifts': {
    id: 'gifts',
    label: 'Gifts & Favors',
    icon: Gift,
    color: '#9A7634'
  },
  'Makeup': {
    id: 'makeup',
    label: 'Makeup & Styling',
    icon: Scissors,
    color: '#BA0F6B'
  },
  'Mehendi': {
    id: 'mehendi',
    label: 'Mehendi Artists',
    icon: Sparkles,
    color: '#557A46'
  },
  'Attire & Makeup': {
    id: 'attire_makeup',
    label: 'Attire & Makeup',
    icon: Scissors,
    color: '#F8C8DC' // Soft Pink
  },
  'Miscellaneous': {
    id: 'miscellaneous',
    label: 'Miscellaneous',
    icon: Gift,
    color: '#A0A0A0' // Grey
  },
  // Add new services here easily:
  'Entertainment': {
    id: 'entertainment',
    label: 'Music & DJ',
    icon: Music,
    color: '#7B68EE' // Slate Blue
  },
  'DJ': {
    id: 'dj',
    label: 'DJ & Music',
    icon: Music,
    color: '#6852A3'
  },
  'Live Music': {
    id: 'live_music',
    label: 'Live Music',
    icon: Mic2,
    color: '#6F4C8B'
  },
  'Bartending': {
    id: 'bartending',
    label: 'Drinks & Bar',
    icon: Wine,
    color: '#FF6347' // Tomato
  },
  'Transport': {
    id: 'transport',
    label: 'Fleet & Cars',
    icon: Car,
    color: '#4682B4' // Steel Blue
  },
  'Accommodation': {
    id: 'accommodation',
    label: 'Guest Accommodation',
    icon: BedDouble,
    color: '#4C6B7C'
  },
  'Event Planning': {
    id: 'event_planning',
    label: 'Event Planners',
    icon: ClipboardList,
    color: '#8A5C32'
  },
  'Sound & Lighting': {
    id: 'sound_lighting',
    label: 'Sound & Lighting',
    icon: Lightbulb,
    color: '#A47720'
  },
  'Invitations': {
    id: 'invitations',
    label: 'Invitations & Printing',
    icon: Mail,
    color: '#8C5A72'
  },
  'Security': {
    id: 'security',
    label: 'Security & Guest Safety',
    icon: ShieldCheck,
    color: '#3F6B63'
  },
  'Ceremony Services': {
    id: 'ceremony_services',
    label: 'Ceremony Services',
    icon: HeartHandshake,
    color: '#9A6C29'
  },
  'Priest': {
    id: 'priest',
    label: 'Ceremony Services',
    icon: HeartHandshake,
    color: '#9A6C29'
  }
};

/**
 * Helper to get metadata for a category name, with a fallback.
 */
export function getServiceMetadata(categoryName: string): ServiceMetadata {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normalizedCategory = normalize(categoryName);
  const key = Object.keys(SERVICE_REGISTRY).find(k => {
    const normalizedKey = normalize(k);
    return normalizedCategory.includes(normalizedKey) || normalizedKey.includes(normalizedCategory);
  });

  return SERVICE_REGISTRY[key || 'Miscellaneous'] || SERVICE_REGISTRY['Miscellaneous'];
}
