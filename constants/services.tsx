import React from 'react';
import { 
  MapPin, 
  Flower, 
  Camera, 
  BadgeCheck, 
  Utensils, 
  Music, 
  Scissors, 
  Car, 
  Gift, 
  Wine 
} from 'lucide-react-native';

export interface ServiceMetadata {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export const SERVICE_REGISTRY: Record<string, ServiceMetadata> = {
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
  }
};

/**
 * Helper to get metadata for a category name, with a fallback.
 */
export function getServiceMetadata(categoryName: string): ServiceMetadata {
  const key = Object.keys(SERVICE_REGISTRY).find(k => 
    categoryName.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(categoryName.toLowerCase())
  );

  return SERVICE_REGISTRY[key || 'Miscellaneous'] || SERVICE_REGISTRY['Miscellaneous'];
}
