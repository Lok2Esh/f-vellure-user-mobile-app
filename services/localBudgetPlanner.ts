import { PLANNER_SERVICES, getDefaultServicesForCelebration } from '../constants/plannerServices';

export type BudgetPlannerInput = {
  totalBudget: number;
  guestCount: number;
  city: string;
  vibe: string;
  eventType?: string;
  date?: string;
  description?: string;
  services?: string[];
  confirmedDetails?: boolean;
};

type PricingRule = { base: number; perGuest: number; lowFactor: number; highFactor: number; color: string; basis: string };

const RULES: Record<string, PricingRule> = {
  venue: { base: 110000, perGuest: 520, lowFactor: 0.8, highFactor: 1.45, color: '#5B263E', basis: 'venue hire, standard furniture, and hospitality infrastructure' },
  catering: { base: 18000, perGuest: 1650, lowFactor: 0.82, highFactor: 1.55, color: '#8D5166', basis: 'multi-cuisine menu, service staff, and non-alcoholic beverages' },
  decor: { base: 125000, perGuest: 260, lowFactor: 0.72, highFactor: 1.65, color: '#B67883', basis: 'stage or mandap, florals, entrance styling, and ambient lighting' },
  photography: { base: 95000, perGuest: 80, lowFactor: 0.78, highFactor: 1.5, color: '#C99958', basis: 'candid and traditional photography for one event day' },
  videography: { base: 85000, perGuest: 55, lowFactor: 0.78, highFactor: 1.55, color: '#B58A57', basis: 'cinematic coverage, highlight edit, and standard delivery' },
  makeup: { base: 42000, perGuest: 0, lowFactor: 0.75, highFactor: 1.8, color: '#D09AA8', basis: 'bridal makeup, hair, draping, and one trial consultation' },
  attire: { base: 120000, perGuest: 0, lowFactor: 0.65, highFactor: 2.2, color: '#A98591', basis: 'indicative couple attire allowance' },
  live_music: { base: 65000, perGuest: 55, lowFactor: 0.75, highFactor: 1.7, color: '#776174', basis: 'live ensemble or premium DJ with performance setup' },
  entertainment: { base: 55000, perGuest: 65, lowFactor: 0.75, highFactor: 1.8, color: '#776174', basis: 'host, performers, and entertainment production' },
  mehendi: { base: 26000, perGuest: 65, lowFactor: 0.75, highFactor: 1.5, color: '#A56F62', basis: 'bridal mehendi plus a small guest artist team' },
  priest: { base: 26000, perGuest: 0, lowFactor: 0.75, highFactor: 1.5, color: '#A97637', basis: 'ceremony officiant, guidance, and standard ritual requirements' },
  planning: { base: 65000, perGuest: 170, lowFactor: 0.8, highFactor: 1.5, color: '#765062', basis: 'planning support, vendor coordination, and event-day management' },
  cake: { base: 12000, perGuest: 120, lowFactor: 0.75, highFactor: 1.55, color: '#C58F9D', basis: 'designer cake and coordinated dessert portions' },
  transport: { base: 38000, perGuest: 120, lowFactor: 0.75, highFactor: 1.5, color: '#8B817B', basis: 'local guest movement and core vendor logistics' },
  accommodation: { base: 50000, perGuest: 950, lowFactor: 0.75, highFactor: 1.65, color: '#8C6A5E', basis: 'indicative rooms for a limited outstation guest group' },
  invitations: { base: 12000, perGuest: 180, lowFactor: 0.7, highFactor: 1.55, color: '#B27B7D', basis: 'digital invitation plus limited premium printed stationery' },
  gifts: { base: 15000, perGuest: 450, lowFactor: 0.65, highFactor: 1.8, color: '#B8925C', basis: 'guest favors at a mid-premium per-person allowance' },
  sound_lighting: { base: 65000, perGuest: 80, lowFactor: 0.78, highFactor: 1.6, color: '#695A72', basis: 'professional PA, stage lighting, console, and technicians' },
  security: { base: 24000, perGuest: 45, lowFactor: 0.8, highFactor: 1.4, color: '#766D67', basis: 'guest access, valet coordination, and event security staff' },
};

const CITY_MULTIPLIERS: Record<string, number> = {
  mumbai: 1.28, delhi: 1.2, 'delhi ncr': 1.2, gurugram: 1.2, bengaluru: 1.16, bangalore: 1.16,
  goa: 1.22, udaipur: 1.2, jaipur: 1.1, hyderabad: 1.08, pune: 1.08, chandigarh: 1.06,
  ahmedabad: 1.02, patiala: 0.92, ludhiana: 0.95,
};

function resolveServiceKeys(input: BudgetPlannerInput): string[] {
  const requested = input.services?.length ? input.services : getDefaultServicesForCelebration(input.eventType || 'Wedding');
  const legacy: Record<string, string[]> = {
    'Venue & Catering': ['venue', 'catering'], 'Attire & Makeup': ['attire', 'makeup'],
    'Miscellaneous & Rituals': ['priest', 'invitations'], 'Entertainment & Music': ['live_music', 'sound_lighting'],
  };
  return [...new Set(requested.flatMap((value) => {
    if (legacy[value]) return legacy[value];
    const catalog = PLANNER_SERVICES.find((service) => service.key === value || service.name.toLowerCase() === value.toLowerCase());
    return catalog ? [catalog.key] : [];
  }))].filter((key) => Boolean(RULES[key]));
}

function eventMultiplier(eventType: string, vibe: string): number {
  const value = `${eventType} ${vibe}`.toLowerCase();
  let multiplier = /wedding|reception|destination/.test(value) ? 1.16 : /engagement|sangeet|mehendi/.test(value) ? 1.05 : 0.94;
  if (/royal|luxury|grand|heritage|palace/.test(value)) multiplier *= 1.18;
  if (/minimal|intimate|simple/.test(value)) multiplier *= 0.88;
  return multiplier;
}

export function createLocalBudgetPlan(input: BudgetPlannerInput) {
  const guestCount = Math.max(10, Math.min(5000, Number(input.guestCount) || 200));
  const totalBudget = Math.max(50000, Number(input.totalBudget) || 500000);
  const city = input.city || 'your city';
  const cityFactor = CITY_MULTIPLIERS[city.toLowerCase()] || 1;
  const celebrationFactor = eventMultiplier(input.eventType || 'Event', input.vibe || 'Elegant');
  const serviceKeys = resolveServiceKeys(input);
  const selectedKeys = serviceKeys.length ? serviceKeys : ['venue', 'catering', 'decor', 'photography'];
  const contingency = Math.max(15000, Math.round(totalBudget * 0.08));
  const spendableBudget = Math.max(1, totalBudget - contingency);
  const benchmarkItems = selectedKeys.map((key) => {
    const rule = RULES[key];
    return { key, rule, estimate: Math.round((rule.base + rule.perGuest * guestCount) * cityFactor * celebrationFactor) };
  });
  const benchmarkTotal = benchmarkItems.reduce((sum, item) => sum + item.estimate, 0);
  const fitFactor = benchmarkTotal > 0 ? spendableBudget / benchmarkTotal : 1;
  const categories = benchmarkItems.map((item, index) => {
    const catalog = PLANNER_SERVICES.find((service) => service.key === item.key);
    const amount = Math.max(5000, Math.round(item.estimate * fitFactor));
    return {
      id: `pricing_${item.key}_${index}`, service: item.key, name: catalog?.name || item.key, amount,
      percentage: Math.round((amount / totalBudget) * 100), color: item.rule.color,
      lowEstimate: Math.round(item.estimate * item.rule.lowFactor), highEstimate: Math.round(item.estimate * item.rule.highFactor),
      basis: `${item.rule.basis}; adjusted for ${guestCount} guests and the ${city} market`,
    };
  });
  categories.push({ id: 'pricing_buffer', service: 'buffer', name: 'Contingency & Flexibility', amount: contingency,
    percentage: Math.round((contingency / totalBudget) * 100), color: '#D5C5B8', lowEstimate: contingency,
    highEstimate: contingency, basis: '8% reserve for taxes, date premiums, and final scope changes' });
  const allocated = categories.reduce((sum, category) => sum + category.amount, 0);
  categories[0].amount += totalBudget - allocated;
  categories[0].percentage = Math.round((categories[0].amount / totalBudget) * 100);
  const feasible = totalBudget >= benchmarkTotal * 0.82;
  const checkedAt = new Date().toISOString();
  return {
    totalBudget, categories, lineItems: categories, matchedVendors: {}, aiGenerated: false,
    provider: 'local-planner' as const, model: 'vellure-india-pricing-v3', aiStatus: 'fallback' as const,
    feasibility: feasible ? 'fits' : 'needs-quotes', interpretation: { services: selectedKeys }, clarificationQuestions: [],
    gaps: feasible ? [] : [`The ₹${totalBudget.toLocaleString('en-IN')} target is below the indicative ₹${benchmarkTotal.toLocaleString('en-IN')} mid-market scope. Confirm priorities or request local quotes.`],
    assumptions: [`Pricing uses a ${cityFactor.toFixed(2)} city-market factor and ${celebrationFactor.toFixed(2)} style factor.`, 'Figures are planning ranges before final vendor scope, availability, travel, and taxes.', `${Math.round((contingency / totalBudget) * 100)}% is protected as contingency.`],
    sources: [{ id: 'vellure-benchmark-v3', title: 'Vellure India event pricing benchmark v3', type: 'guide', checkedAt }],
    reasoning: `Built from ${selectedKeys.length} requested services using guest-scaled Indian baselines, a ${city} cost adjustment, celebration complexity, and a protected reserve. Final vendor quotes remain authoritative.`,
  };
}
