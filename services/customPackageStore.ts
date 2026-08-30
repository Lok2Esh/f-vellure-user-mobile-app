import { createEventInquiry } from './api';

export type CustomPackageVendorItem = {
  vendorId: string;
  businessName: string;
  category: string;
  city: string;
  image?: string;
  basePrice: number;
  priceType: string;
  calculatedPrice: number;
  rating?: number;
  reviewsCount?: number;
  addedAt: string;
};

export type PackageStatus = 'DRAFT' | 'READY' | 'INQUIRED' | 'CONFIRMED';

export type CustomPackage = {
  id: string;
  name: string;
  eventType: string;
  city: string;
  guestCount: number;
  eventDays: number;
  targetBudget: number;
  categoryBudgets?: Record<string, number>;
  eventDate?: string;
  status: PackageStatus;
  vendors: CustomPackageVendorItem[];
  subtotal: number;
  estimatedTax: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  inquiryDetails?: {
    date: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    note?: string;
    sentAt: string;
  };
};

export const DEFAULT_CATEGORY_BUDGET_SPLIT: Record<string, number> = {
  VENUE: 0.25,
  CATERING: 0.35,
  PHOTOGRAPHY: 0.12,
  DECOR: 0.15,
  MAKEUP: 0.05,
  ENTERTAINMENT: 0.04,
  PRIEST: 0.02,
  PLANNING: 0.03,
};

export function getCategoryBudget(pkg: CustomPackage, categoryKey?: string | null): number {
  if (!categoryKey) return Math.round((pkg.targetBudget || 1500000) * 0.2);
  const normKey = categoryKey.toUpperCase();
  if (pkg.categoryBudgets && pkg.categoryBudgets[normKey] != null && pkg.categoryBudgets[normKey] > 0) {
    return pkg.categoryBudgets[normKey];
  }
  const ratio = DEFAULT_CATEGORY_BUDGET_SPLIT[normKey] || 0.15;
  return Math.round((pkg.targetBudget || 1500000) * ratio);
}

const STORAGE_KEY_PACKAGES = 'vellure_custom_packages_v2';
const STORAGE_KEY_ACTIVE_ID = 'vellure_active_package_id_v2';

export function calculateVendorPrice(
  vendor: { basePrice?: number; priceNumeric?: number; priceType?: string },
  guestCount: number = 300,
  eventDays: number = 1
): number {
  const base = Number(vendor.basePrice || vendor.priceNumeric || 0);
  const type = String(vendor.priceType || 'STARTING_PRICE').toUpperCase();

  if (type === 'PER_PLATE' || type === 'PER_GUEST') {
    return Math.round(base * (guestCount > 0 ? guestCount : 300));
  }
  if (type === 'PER_DAY') {
    return Math.round(base * (eventDays > 0 ? eventDays : 1));
  }
  return base > 0 ? base : 50000;
}

export function recalculatePackage(pkg: CustomPackage): CustomPackage {
  const updatedVendors = (pkg.vendors || []).map((v) => ({
    ...v,
    calculatedPrice: calculateVendorPrice(v, pkg.guestCount, pkg.eventDays),
  }));

  const subtotal = updatedVendors.reduce((sum, v) => sum + v.calculatedPrice, 0);
  const estimatedTax = subtotal > 0 ? Math.round(subtotal * 0.18) : 0;
  const totalPrice = subtotal + estimatedTax;

  let status: PackageStatus = pkg.status || 'DRAFT';
  if (status !== 'INQUIRED' && status !== 'CONFIRMED') {
    status = updatedVendors.length >= 2 ? 'READY' : 'DRAFT';
  }

  return {
    ...pkg,
    status,
    vendors: updatedVendors,
    subtotal,
    estimatedTax,
    totalPrice,
    updatedAt: new Date().toISOString(),
  };
}

const DEFAULT_PACKAGES: CustomPackage[] = [
  recalculatePackage({
    id: 'pkg_bespoke_suite_1',
    name: 'My Bespoke Celebration Suite',
    eventType: 'Grand Wedding',
    city: 'Patiala',
    guestCount: 300,
    eventDays: 1,
    targetBudget: 1500000,
    status: 'DRAFT',
    vendors: [],
    subtotal: 0,
    estimatedTax: 0,
    totalPrice: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];

let packagesStore: CustomPackage[] = [...DEFAULT_PACKAGES];
let activePackageId: string = DEFAULT_PACKAGES[0].id;

// Load from persistence (ignoring legacy dummy package ids)
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY_PACKAGES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy dummy entries
        const cleanList = parsed.filter(
          (p) => p.id !== 'pkg_grand_wedding' && p.id !== 'pkg_sangeet_cocktail'
        );
        if (cleanList.length > 0) {
          packagesStore = cleanList.map((p) => recalculatePackage(p));
        }
      }
    }
    const savedActiveId = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (
      savedActiveId &&
      savedActiveId !== 'pkg_grand_wedding' &&
      savedActiveId !== 'pkg_sangeet_cocktail' &&
      packagesStore.some((p) => p.id === savedActiveId)
    ) {
      activePackageId = savedActiveId;
    } else if (packagesStore.length > 0) {
      activePackageId = packagesStore[0].id;
    }
  } catch (_) {}
}

type StoreListener = (packages: CustomPackage[], activePackage: CustomPackage) => void;
const storeListeners: StoreListener[] = [];

function persistAndNotify() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(packagesStore));
      window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activePackageId);
    } catch (_) {}
  }
  const activePkg = getCustomPackage();
  storeListeners.forEach((fn) => fn([...packagesStore], { ...activePkg }));
}

// -------------------------------------------------------------
// Getters
// -------------------------------------------------------------

export function getAllCustomPackages(): CustomPackage[] {
  return [...packagesStore];
}

export function getActivePackageId(): string {
  return activePackageId;
}

export function getCustomPackage(): CustomPackage {
  const found = packagesStore.find((p) => p.id === activePackageId);
  if (found) return { ...found };
  if (packagesStore.length > 0) {
    activePackageId = packagesStore[0].id;
    return { ...packagesStore[0] };
  }
  const newPkg = createNewCustomPackage();
  return { ...newPkg };
}

export function getPackageById(packageId: string): CustomPackage | null {
  const found = packagesStore.find((p) => p.id === packageId);
  return found ? { ...found } : null;
}

// -------------------------------------------------------------
// Package Operations (Create, Select, Duplicate, Delete, Draft)
// -------------------------------------------------------------

export function setActivePackage(packageId: string): CustomPackage {
  const found = packagesStore.find((p) => p.id === packageId);
  if (found) {
    activePackageId = packageId;
    persistAndNotify();
    return { ...found };
  }
  return getCustomPackage();
}

export function createNewCustomPackage(specs?: Partial<CustomPackage>): CustomPackage {
  const newId = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const count = packagesStore.length + 1;
  const newPkg: CustomPackage = recalculatePackage({
    id: newId,
    name: specs?.name?.trim() || `Celebration Suite #${count}`,
    eventType: specs?.eventType || 'Grand Wedding',
    city: specs?.city || 'Patiala',
    guestCount: specs?.guestCount || 300,
    eventDays: specs?.eventDays || 1,
    targetBudget: specs?.targetBudget || 1500000,
    eventDate: specs?.eventDate || 'Dec 2025',
    status: 'DRAFT',
    vendors: specs?.vendors || [],
    subtotal: 0,
    estimatedTax: 0,
    totalPrice: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  packagesStore = [newPkg, ...packagesStore];
  activePackageId = newId;
  persistAndNotify();
  return { ...newPkg };
}

export function duplicateCustomPackage(packageId: string): CustomPackage {
  const target = getPackageById(packageId) || getCustomPackage();
  const clonedId = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clonedPkg: CustomPackage = recalculatePackage({
    ...target,
    id: clonedId,
    name: `${target.name} (Copy)`,
    status: 'DRAFT',
    inquiryDetails: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  packagesStore = [clonedPkg, ...packagesStore];
  activePackageId = clonedId;
  persistAndNotify();
  return { ...clonedPkg };
}

export function savePackageAsDraft(packageId: string): CustomPackage {
  const targetIdx = packagesStore.findIndex((p) => p.id === packageId);
  if (targetIdx >= 0) {
    packagesStore[targetIdx] = {
      ...packagesStore[targetIdx],
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
    };
    persistAndNotify();
    return { ...packagesStore[targetIdx] };
  }
  return getCustomPackage();
}

export function deleteCustomPackage(packageId: string): { success: boolean; activePackage: CustomPackage } {
  const targetIdStr = String(packageId || '').trim();
  if (packagesStore.length <= 1) {
    // If only one package, reset it instead of leaving empty
    packagesStore = [
      recalculatePackage({
        id: `pkg_${Date.now()}`,
        name: 'My Bespoke Celebration Suite',
        eventType: 'Grand Wedding',
        city: 'Patiala',
        guestCount: 300,
        eventDays: 1,
        targetBudget: 1500000,
        status: 'DRAFT',
        vendors: [],
        subtotal: 0,
        estimatedTax: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ];
    activePackageId = packagesStore[0].id;
    persistAndNotify();
    return { success: true, activePackage: { ...packagesStore[0] } };
  }

  packagesStore = packagesStore.filter((p) => String(p.id).trim() !== targetIdStr);
  if (String(activePackageId).trim() === targetIdStr) {
    activePackageId = packagesStore[0].id;
  }
  persistAndNotify();
  return { success: true, activePackage: getCustomPackage() };
}

export function updateCustomPackageSettings(settings: {
  packageId?: string;
  name?: string;
  eventType?: string;
  city?: string;
  guestCount?: number;
  eventDays?: number;
  targetBudget?: number;
  categoryBudgets?: Record<string, number>;
  eventDate?: string;
  status?: PackageStatus;
}): CustomPackage {
  const targetId = settings.packageId || activePackageId;
  const targetIdx = packagesStore.findIndex((p) => p.id === targetId);

  if (targetIdx >= 0) {
    const existing = packagesStore[targetIdx];
    packagesStore[targetIdx] = recalculatePackage({
      ...existing,
      ...settings,
      categoryBudgets: settings.categoryBudgets || existing.categoryBudgets,
      guestCount:
        settings.guestCount !== undefined ? Math.max(10, settings.guestCount) : existing.guestCount,
      eventDays:
        settings.eventDays !== undefined ? Math.max(1, settings.eventDays) : existing.eventDays,
      targetBudget:
        settings.targetBudget !== undefined ? Math.max(0, settings.targetBudget) : existing.targetBudget,
    });
    persistAndNotify();
    return { ...packagesStore[targetIdx] };
  }

  return getCustomPackage();
}

export function updateCategoryBudget(categoryKey: string, budget: number, packageId?: string): CustomPackage {
  const targetId = packageId || activePackageId;
  const targetIdx = packagesStore.findIndex((p) => p.id === targetId);
  if (targetIdx < 0) return getCustomPackage();

  const currentPkg = packagesStore[targetIdx];
  const normKey = categoryKey.toUpperCase();
  const nextBudgets = { ...(currentPkg.categoryBudgets || {}), [normKey]: Math.max(0, budget) };

  packagesStore[targetIdx] = {
    ...currentPkg,
    categoryBudgets: nextBudgets,
    updatedAt: new Date().toISOString(),
  };
  persistAndNotify();
  return { ...packagesStore[targetIdx] };
}

// -------------------------------------------------------------
// Vendor Item Actions in Active Package
// -------------------------------------------------------------

export function isVendorInCustomPackage(vendorId: string, packageId?: string): boolean {
  if (!vendorId) return false;
  const targetPkg = packageId ? getPackageById(packageId) : getCustomPackage();
  if (!targetPkg) return false;
  return (targetPkg.vendors || []).some((v) => String(v.vendorId) === String(vendorId));
}

export function addVendorToCustomPackage(
  vendor: {
    id?: string;
    vendorId?: string;
    businessName?: string;
    name?: string;
    category?: string;
    city?: string;
    image?: string;
    basePrice?: number;
    priceNumeric?: number;
    priceType?: string;
    rating?: number;
    reviewsCount?: number;
    reviews?: number;
  },
  packageId?: string
): { success: boolean; package: CustomPackage } {
  const vId = String(vendor.id || vendor.vendorId || '');
  const targetId = packageId || activePackageId;
  const targetIdx = packagesStore.findIndex((p) => p.id === targetId);
  if (targetIdx < 0 || !vId) return { success: false, package: getCustomPackage() };

  const currentPkg = packagesStore[targetIdx];
  const existingIdx = currentPkg.vendors.findIndex((v) => v.vendorId === vId);
  if (existingIdx >= 0) {
    return { success: true, package: { ...currentPkg } };
  }

  const basePrice = Number(vendor.basePrice || vendor.priceNumeric || 45000);
  const priceType = vendor.priceType || 'STARTING_PRICE';
  const calculatedPrice = calculateVendorPrice(
    { basePrice, priceType },
    currentPkg.guestCount,
    currentPkg.eventDays
  );

  const newVendorItem: CustomPackageVendorItem = {
    vendorId: vId,
    businessName: vendor.businessName || vendor.name || 'Verified Partner',
    category: vendor.category || 'VENUE',
    city: vendor.city || currentPkg.city,
    image: vendor.image,
    basePrice,
    priceType,
    calculatedPrice,
    rating: typeof vendor.rating === 'number' ? vendor.rating : 4.9,
    reviewsCount: vendor.reviewsCount || vendor.reviews || 24,
    addedAt: new Date().toISOString(),
  };

  packagesStore[targetIdx] = recalculatePackage({
    ...currentPkg,
    vendors: [...currentPkg.vendors, newVendorItem],
  });

  persistAndNotify();
  return { success: true, package: { ...packagesStore[targetIdx] } };
}

export function removeVendorFromCustomPackage(vendorId: string, packageId?: string): CustomPackage {
  const targetId = packageId || activePackageId;
  const targetIdx = packagesStore.findIndex((p) => p.id === targetId);
  const vIdStr = String(vendorId || '').trim();

  if (targetIdx >= 0 && vIdStr) {
    const currentPkg = packagesStore[targetIdx];
    const remainingVendors = currentPkg.vendors.filter(
      (v) => String(v.vendorId || (v as any).id || '').trim() !== vIdStr
    );
    packagesStore[targetIdx] = recalculatePackage({
      ...currentPkg,
      vendors: remainingVendors,
      updatedAt: new Date().toISOString(),
    });
    persistAndNotify();
    return { ...packagesStore[targetIdx] };
  }
  return getCustomPackage();
}

export function toggleVendorInCustomPackage(vendor: any, packageId?: string): {
  added: boolean;
  package: CustomPackage;
} {
  const vId = String(vendor.id || vendor.vendorId || '');
  const targetId = packageId || activePackageId;
  if (isVendorInCustomPackage(vId, targetId)) {
    const pkg = removeVendorFromCustomPackage(vId, targetId);
    return { added: false, package: pkg };
  } else {
    const res = addVendorToCustomPackage(vendor, targetId);
    return { added: true, package: res.package };
  }
}

export function clearCustomPackage(packageId?: string): CustomPackage {
  const targetId = packageId || activePackageId;
  const targetIdx = packagesStore.findIndex((p) => p.id === targetId);
  if (targetIdx >= 0) {
    packagesStore[targetIdx] = recalculatePackage({
      ...packagesStore[targetIdx],
      vendors: [],
      subtotal: 0,
      estimatedTax: 0,
      totalPrice: 0,
    });
    persistAndNotify();
    return { ...packagesStore[targetIdx] };
  }
  return getCustomPackage();
}

// -------------------------------------------------------------
// ⚡ 1-Click Send Availability Message to All Vendors
// -------------------------------------------------------------

export async function sendAvailabilityBroadcastToAllVendors(
  packageId: string,
  inquiry: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    date: string;
    note?: string;
  }
): Promise<{ success: boolean; vendorsCount: number; message: string }> {
  const targetIdx = packagesStore.findIndex((p) => p.id === packageId);
  if (targetIdx < 0) {
    return { success: false, vendorsCount: 0, message: 'Package not found.' };
  }

  const pkg = packagesStore[targetIdx];
  if (!pkg.vendors || pkg.vendors.length === 0) {
    return { success: false, vendorsCount: 0, message: 'Please add at least 1 specialist to the package.' };
  }

  // Record inquiry for each vendor
  const broadcastPromises = pkg.vendors.map((v) =>
    createEventInquiry({
      targetId: v.vendorId,
      targetName: `${v.businessName} (Package: ${pkg.name})`,
      targetCategory: v.category,
      userName: inquiry.clientName,
      userPhone: inquiry.clientPhone,
      userEmail: inquiry.clientEmail,
      eventDate: inquiry.date || pkg.eventDate || 'Upcoming Celebration',
      city: pkg.city,
      guestCount: pkg.guestCount,
      estimatedBudget: v.calculatedPrice,
      eventType: pkg.eventType,
      specialNotes: inquiry.note || `1-Click Availability check for ${pkg.name} celebration bundle (${pkg.guestCount} guests, ${pkg.eventDays} day(s)).`,
    }).catch((err: unknown) => {
      console.warn('Failed to record inquiry for vendor:', v.vendorId, err);
      return null;
    })
  );

  await Promise.all(broadcastPromises);

  // Update Package Status to INQUIRED
  packagesStore[targetIdx] = {
    ...pkg,
    status: 'INQUIRED',
    eventDate: inquiry.date || pkg.eventDate,
    inquiryDetails: {
      date: inquiry.date,
      clientName: inquiry.clientName,
      clientPhone: inquiry.clientPhone,
      clientEmail: inquiry.clientEmail,
      note: inquiry.note,
      sentAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };

  persistAndNotify();

  return {
    success: true,
    vendorsCount: pkg.vendors.length,
    message: `Availability check broadcasted successfully to all ${pkg.vendors.length} specialists!`,
  };
}

// -------------------------------------------------------------
// Subscriptions
// -------------------------------------------------------------

export function subscribeCustomPackage(listener: (pkg: CustomPackage) => void): () => void {
  const storeListener: StoreListener = (_, activePkg) => listener(activePkg);
  storeListeners.push(storeListener);
  listener(getCustomPackage());

  return () => {
    const idx = storeListeners.indexOf(storeListener);
    if (idx >= 0) storeListeners.splice(idx, 1);
  };
}

export function subscribeAllCustomPackages(
  listener: (packages: CustomPackage[], activePkg: CustomPackage) => void
): () => void {
  storeListeners.push(listener);
  listener([...packagesStore], getCustomPackage());

  return () => {
    const idx = storeListeners.indexOf(listener);
    if (idx >= 0) storeListeners.splice(idx, 1);
  };
}
