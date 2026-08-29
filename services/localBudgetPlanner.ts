export type BudgetPlannerInput = {
  totalBudget: number;
  guestCount: number;
  city: string;
  vibe: string;
  eventType?: string;
  date?: string;
  description?: string;
};

type AllocationKey = 'venue' | 'decor' | 'photography' | 'attire' | 'misc';

const META: Record<AllocationKey, { name: string; color: string; icon: string }> = {
  venue: { name: 'Venue & Catering', color: '#641E3D', icon: 'hotel' },
  decor: { name: 'Decor & Lighting', color: '#9E3A5A', icon: 'flower' },
  photography: { name: 'Photography', color: '#D2AD6B', icon: 'camera' },
  attire: { name: 'Attire & Makeup', color: '#C7839F', icon: 'brush' },
  misc: { name: 'Miscellaneous', color: '#A08F7E', icon: 'more-horizontal' },
};

function baseAllocation(vibe: string): Record<AllocationKey, number> {
  const value = vibe.toLowerCase();
  if (/(grand|royal|luxury)/.test(value)) {
    return { venue: 42, decor: 20, photography: 12, attire: 14, misc: 12 };
  }
  if (/(intimate|minimal|simple)/.test(value)) {
    return { venue: 28, decor: 16, photography: 18, attire: 22, misc: 16 };
  }
  if (value.includes('destination')) {
    return { venue: 48, decor: 16, photography: 13, attire: 11, misc: 12 };
  }
  if (/(rustic|bohemian|boho)/.test(value)) {
    return { venue: 35, decor: 14, photography: 18, attire: 18, misc: 15 };
  }
  return { venue: 38, decor: 18, photography: 15, attire: 16, misc: 13 };
}

function normalize(values: Record<AllocationKey, number>): Record<AllocationKey, number> {
  const keys = Object.keys(values) as AllocationKey[];
  const total = keys.reduce((sum, key) => sum + values[key], 0) || 1;
  const normalized = { ...values };
  keys.forEach((key) => {
    normalized[key] = Math.max(1, Math.round((values[key] / total) * 100));
  });
  normalized.venue += 100 - keys.reduce((sum, key) => sum + normalized[key], 0);
  return normalized;
}

export function createLocalBudgetPlan(input: BudgetPlannerInput) {
  const guestCount = Math.max(1, Number(input.guestCount) || 200);
  const totalBudget = Math.max(1, Number(input.totalBudget) || 500000);
  const allocation = baseAllocation(input.vibe || 'Elegant');

  if (guestCount > 500) {
    allocation.venue += 8;
    allocation.photography -= 3;
    allocation.attire -= 3;
    allocation.misc -= 2;
  } else if (guestCount > 300) {
    allocation.venue += 4;
    allocation.photography -= 2;
    allocation.attire -= 2;
  } else if (guestCount < 100) {
    allocation.venue -= 8;
    allocation.photography += 3;
    allocation.attire += 3;
    allocation.misc += 2;
  }

  const percentages = normalize(allocation);
  const keys = Object.keys(META) as AllocationKey[];
  const categories = keys.map((key, index) => ({
    id: `cat_${index + 1}`,
    name: META[key].name,
    percentage: percentages[key],
    amount: Math.round((totalBudget * percentages[key]) / 100),
    color: META[key].color,
    icon: META[key].icon,
  }));
  const allocated = categories.reduce((sum, category) => sum + category.amount, 0);
  categories[0].amount += totalBudget - allocated;

  return {
    totalBudget,
    categories,
    matchedVendors: {},
    aiGenerated: false,
    provider: 'local-planner' as const,
    model: 'vellure-rules-v1',
    aiStatus: 'fallback' as const,
    reasoning: `Free on-device planning for a ${input.vibe || 'balanced'} ${input.eventType || 'event'} in ${input.city || 'your city'} with ${guestCount} guests. No API key, cloud AI, or paid credits were used.`,
  };
}
