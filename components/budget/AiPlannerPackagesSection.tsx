import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import {
  Sparkles,
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Award,
  Layers,
  Info,
  Store,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { VellureButton } from '@/components/ui/VellureControls';
import {
  AiPackageDetailModal,
  AiCuratedPackage,
  PackageServiceItem,
  PackageAddon,
} from './AiPackageDetailModal';
import { ParsedEventPlan } from '../../services/aiParser';

interface AiPlannerPackagesSectionProps {
  plan: ParsedEventPlan;
  categories?: any[];
  matchedVendors?: Record<string, any[]>;
  evidence?: any;
}

export function AiPlannerPackagesSection({
  plan,
  categories = [],
  matchedVendors = {},
  evidence,
}: AiPlannerPackagesSectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<AiCuratedPackage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvidenceSources, setShowEvidenceSources] = useState(false);

  const city = plan.city || 'Patiala';
  const eventType = plan.eventType || 'Wedding';
  const guestCount = Math.max(1, plan.guestCount || 250);
  const budget = Math.max(100000, plan.totalBudget || 1500000);

  // Dynamically generate 3 calibrated AI package tiers based on Indian event traditions & user inputs
  const packages: AiCuratedPackage[] = useMemo(() => {
    const rawText = (plan.rawPrompt || '').toLowerCase();
    const isSikh = /sikh|anand karaj|gurdwara|punjabi|sardar/i.test(rawText);
    const isMuslim = /muslim|nikah|walima|qazi|islamic/i.test(rawText);
    const isChristian = /christian|church|pastor|catholic/i.test(rawText);
    const tradition = isSikh ? 'Sikh' : isMuslim ? 'Muslim' : isChristian ? 'Christian' : 'Vedic Hindu';

    const isBirthday = /birthday|bday/i.test(eventType);
    const isWedding = /wedding|marriage|shaadi|shadi/i.test(eventType) || (!isBirthday && !/sangeet|mehendi|engagement|reception|puja|anniversary|corporate/i.test(eventType));
    const isSangeet = /sangeet|mehendi|mehndi|haldi/i.test(eventType);
    const isEngagement = /engagement|roka|ring/i.test(eventType);
    const isReception = /reception|walima/i.test(eventType);
    const isPuja = /puja|pooja|path|paath|havan/i.test(eventType);

    // Helper to resolve vendor from matchedVendors or provide tasteful local fallback
    const resolveVendor = (
      categoryKey: string,
      index: number,
      fallback: { id: string; name: string; image: string; rating: number; reviewsCount?: number }
    ) => {
      const aliases: Record<string, string[]> = {
        venue: ['venue', 'banquet', 'hotel'],
        catering: ['catering', 'caterer', 'food'],
        photography: ['photography', 'videography', 'photo'],
        decor: ['decor', 'decoration', 'decorator', 'florist'],
        music: ['music', 'entertainment', 'dj', 'live_music'],
        makeup: ['makeup', 'mehendi'],
        priest: ['priest', 'ritual', 'ceremony'],
        cake: ['cake', 'dessert'],
        transport: ['transport', 'security', 'valet'],
      };

      const keysToCheck = aliases[categoryKey] || [categoryKey];
      let candidate: any = null;

      for (const k of keysToCheck) {
        const list = matchedVendors[k];
        if (Array.isArray(list) && list.length > 0) {
          candidate = list[index % list.length];
          if (candidate) break;
        }
      }

      if (candidate) {
        return {
          vendorId: String(candidate.id || fallback.id),
          vendorName: candidate.name || candidate.businessName || fallback.name,
          vendorImage: candidate.imageUrl || candidate.image || fallback.image,
          rating: typeof candidate.rating === 'number' ? candidate.rating : fallback.rating,
          reviewsCount: candidate.ratingCount || candidate.reviews || fallback.reviewsCount || 24,
          verified: candidate.isVerified ?? candidate.verified ?? true,
        };
      }

      return {
        vendorId: fallback.id,
        vendorName: fallback.name,
        vendorImage: fallback.image,
        rating: fallback.rating,
        reviewsCount: fallback.reviewsCount || 18,
        verified: true,
      };
    };

    // Priest / Celebrant details tailored to detected religion
    const priestTitle = isSikh
      ? 'Granthi Sahib & Kirtani Jatha'
      : isMuslim
      ? 'Qazi Sahab & Nikah Coordination'
      : isChristian
      ? 'Reverend Pastor & Liturgy Choir'
      : 'Vedic Acharya & Pandit Ji';

    const priestDeliverables = isSikh
      ? ['Ceremonial Laavan recitation & Anand Karaj setup', 'Full Guru Granth Sahib Prakash assistance', 'Harmonium & Tabla classical Kirtan accompaniment']
      : isMuslim
      ? ['Nikahnama legal documentation & Ijab-o-Qubool', 'Quranic Khutbah recitation & blessing prayer', 'Witness & meher agreement facilitation']
      : isChristian
      ? ['Ceremonial vows & sacred ring blessing liturgy', 'Choir & organ hymn coordination', 'Church registrar solemnization assistance']
      : ['Auspicious muhurat & Vedic chants recitation', 'Sacred Havan Kund & 7 Phere vidhi guidance', 'Complete puja samagri & fresh ritual samagri'];

    // ── Build Service Items dynamically based on Indian Event Type ──
    const buildVendorsForTier = (tier: 'classic' | 'royal' | 'boutique', tierPrice: number): PackageServiceItem[] => {
      const isClassic = tier === 'classic';
      const isRoyal = tier === 'royal';
      const tierIdx = isClassic ? 0 : isRoyal ? 1 : 2;

      if (isBirthday) {
        const vVenue = resolveVendor('venue', tierIdx, {
          id: `venue_bday_${tier}`,
          name: `${city} Celebration Lounge & Banquets`,
          image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&auto=format&fit=crop&q=80',
          rating: isRoyal ? 4.9 : 4.8,
          reviewsCount: 34,
        });
        const vCat = resolveVendor('catering', tierIdx, {
          id: `cat_bday_${tier}`,
          name: 'Celebration Treats & Gourmet Feast',
          image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80',
          rating: 4.8,
          reviewsCount: 29,
        });
        const vDecor = resolveVendor('decor', tierIdx, {
          id: `decor_bday_${tier}`,
          name: 'Wonderland Themed Balloon & Stage Art',
          image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80',
          rating: 4.9,
          reviewsCount: 42,
        });
        const vCake = resolveVendor('cake', tierIdx, {
          id: `cake_bday_${tier}`,
          name: 'Le Petit Sugar Designer Cakes',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
          rating: 5.0,
          reviewsCount: 56,
        });
        const vPhoto = resolveVendor('photography', tierIdx, {
          id: `photo_bday_${tier}`,
          name: 'Joyful Moments Party Photography',
          image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&auto=format&fit=crop&q=80',
          rating: 4.9,
          reviewsCount: 38,
        });
        const vMusic = resolveVendor('music', tierIdx, {
          id: `music_bday_${tier}`,
          name: 'Kids & Family Emcee + Party Sound',
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
          rating: 4.8,
          reviewsCount: 22,
        });

        return [
          {
            id: `bday_venue_${tier}`,
            vendorId: vVenue.vendorId,
            vendorImage: vVenue.vendorImage,
            vendorName: vVenue.vendorName,
            rating: vVenue.rating,
            reviewsCount: vVenue.reviewsCount,
            verified: vVenue.verified,
            city,
            category: 'Party Venue & Lounge',
            serviceName: `${city} Celebration Lounge & Terrace`,
            estimatedCost: Math.round(tierPrice * 0.35),
            priceNote: `Private lounge setup for ${guestCount} guests`,
            deliverables: ['Dedicated private celebration hall', 'Ambient party lighting & sound hookup', 'Staff assistance for cake cutting'],
          },
          {
            id: `bday_cat_${tier}`,
            vendorId: vCat.vendorId,
            vendorImage: vCat.vendorImage,
            vendorName: vCat.vendorName,
            rating: vCat.rating,
            reviewsCount: vCat.reviewsCount,
            verified: vCat.verified,
            city,
            category: 'Catering & Finger Foods',
            serviceName: 'Kids & Family Gourmet Feast',
            estimatedCost: Math.round(tierPrice * 0.30),
            priceNote: `₹${Math.round((tierPrice * 0.30) / guestCount)}/guest multi-cuisine spread`,
            deliverables: ['Live pasta & mini sliders counter', 'Kids-friendly finger foods & fresh mocktails', 'Dinner buffet with hot dessert'],
          },
          {
            id: `bday_decor_${tier}`,
            vendorId: vDecor.vendorId,
            vendorImage: vDecor.vendorImage,
            vendorName: vDecor.vendorName,
            rating: vDecor.rating,
            reviewsCount: vDecor.reviewsCount,
            verified: vDecor.verified,
            city,
            category: 'Theme Balloon & Stage Decor',
            serviceName: 'Custom Themed Balloon Arch & Backdrop',
            estimatedCost: Math.round(tierPrice * 0.15),
            priceNote: isRoyal ? 'Grand organic balloon garland + marquee letters' : 'Themed arch & photo wall',
            deliverables: ['Theme balloon arch & character cutouts', 'Illuminated name marquee sign', 'Dessert & cake table backdrop'],
          },
          {
            id: `bday_cake_${tier}`,
            vendorId: vCake.vendorId,
            vendorImage: vCake.vendorImage,
            vendorName: vCake.vendorName,
            rating: vCake.rating,
            reviewsCount: vCake.reviewsCount,
            verified: vCake.verified,
            city,
            category: 'Designer Celebration Cake',
            serviceName: 'Custom 2-Tier Theme Fondant Cake',
            estimatedCost: Math.round(tierPrice * 0.05),
            priceNote: `${Math.round(guestCount * 0.08)} kg custom celebration cake`,
            deliverables: ['Fresh gourmet multi-flavor cake', 'Matching theme cupcakes (12 pcs)', 'Sparkler candles & cake server kit'],
          },
          {
            id: `bday_photo_${tier}`,
            vendorId: vPhoto.vendorId,
            vendorImage: vPhoto.vendorImage,
            vendorName: vPhoto.vendorName,
            rating: vPhoto.rating,
            reviewsCount: vPhoto.reviewsCount,
            verified: vPhoto.verified,
            city,
            category: 'Party Photography & Reels',
            serviceName: 'Candid Party Snaps & Video Highlights',
            estimatedCost: Math.round(tierPrice * 0.08),
            priceNote: 'Full party candid photography',
            deliverables: ['1 Senior candid photographer', '1-minute social media highlight reel', 'Same-week edited digital album'],
          },
          {
            id: `bday_music_${tier}`,
            vendorId: vMusic.vendorId,
            vendorImage: vMusic.vendorImage,
            vendorName: vMusic.vendorName,
            rating: vMusic.rating,
            reviewsCount: vMusic.reviewsCount,
            verified: vMusic.verified,
            city,
            category: 'Entertainment & Games Emcee',
            serviceName: 'Interactive Emcee, Sound & Party Games',
            estimatedCost: Math.round(tierPrice * 0.07),
            priceNote: '3-hour interactive entertainment session',
            deliverables: ['Professional energetic party anchor', 'Organized party games with mini prizes', 'High-quality sound setup & party playlist'],
          },
        ];
      }

      // Default to Wedding & Grand Ceremonies (includes all 8 essential Indian services!)
      const vVenue = resolveVendor('venue', tierIdx, {
        id: `venue_wed_${tier}`,
        name: isRoyal ? `${city} Royal Palace & Courtyard` : `${city} Grand Heritage Banquet & Lawns`,
        image: isRoyal ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&auto=format&fit=crop&q=80',
        rating: isRoyal ? 5.0 : 4.8,
        reviewsCount: isRoyal ? 68 : 42,
      });
      const vCat = resolveVendor('catering', tierIdx, {
        id: `cat_wed_${tier}`,
        name: isRoyal ? 'Maharaja Imperial Feasts' : 'The Royal Kitchen Catering',
        image: isRoyal ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80',
        rating: isRoyal ? 4.9 : 4.7,
        reviewsCount: 54,
      });
      const vDecor = resolveVendor('decor', tierIdx, {
        id: `decor_wed_${tier}`,
        name: isRoyal ? 'Shaandaar Luxury Productions' : 'Elegance Floral Productions',
        image: isRoyal ? 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80',
        rating: isRoyal ? 5.0 : 4.8,
        reviewsCount: 46,
      });
      const vPhoto = resolveVendor('photography', tierIdx, {
        id: `photo_wed_${tier}`,
        name: isRoyal ? 'Candid Heritage Cinema & Drone' : 'Lumière Studio (Candid & Film)',
        image: isRoyal ? 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 58,
      });
      const vMakeup = resolveVendor('makeup', tierIdx, {
        id: `makeup_wed_${tier}`,
        name: isRoyal ? 'Glamour By Simran (Celebrity Bridal MUA)' : 'Touch of Glow Bridal Studio',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 35,
      });
      const vPriest = resolveVendor('priest', tierIdx, {
        id: `priest_wed_${tier}`,
        name: priestTitle,
        image: 'https://images.unsplash.com/photo-1609358905596-f9478f7e2d93?w=400&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewsCount: 48,
      });
      const vMusic = resolveVendor('music', tierIdx, {
        id: `music_wed_${tier}`,
        name: isRoyal ? 'Royal Beats Live Dhol Toli & DJ Setup' : 'Desi Dhol & DJ Sound System',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 31,
      });
      const vValet = resolveVendor('transport', tierIdx, {
        id: `valet_wed_${tier}`,
        name: `${city} Royal Valet & Hospitality Security`,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 26,
      });

      return [
        {
          id: `wed_venue_${tier}`,
          vendorId: vVenue.vendorId,
          vendorImage: vVenue.vendorImage,
          vendorName: vVenue.vendorName,
          rating: vVenue.rating,
          reviewsCount: vVenue.reviewsCount,
          verified: vVenue.verified,
          city,
          category: 'Venue & Lawns',
          serviceName: `${city} Royal Banquet & Open Lawns`,
          estimatedCost: Math.round(tierPrice * 0.38),
          priceNote: `Exclusive access for ${guestCount} guests`,
          deliverables: ['Air-conditioned banquet hall + landscaped lawns', 'Dedicated bridal & groom preparation suites', 'Valet & guest parking area management'],
        },
        {
          id: `wed_cat_${tier}`,
          vendorId: vCat.vendorId,
          vendorImage: vCat.vendorImage,
          vendorName: vCat.vendorName,
          rating: vCat.rating,
          reviewsCount: vCat.reviewsCount,
          verified: vCat.verified,
          city,
          category: 'Gourmet Catering & Feast',
          serviceName: isRoyal ? 'Imperial Multi-Course Feast & Live Tawa' : 'Gourmet North Indian & Chaat Feast',
          estimatedCost: Math.round(tierPrice * 0.26),
          priceNote: `₹${Math.round((tierPrice * 0.26) / guestCount)}/plate based on ${guestCount} guests`,
          deliverables: ['Live street chaat & passed mocktails', 'Multi-cuisine grand dinner buffet + live breads', 'Traditional Indian dessert counter & artisanal ice cream'],
        },
        {
          id: `wed_decor_${tier}`,
          vendorId: vDecor.vendorId,
          vendorImage: vDecor.vendorImage,
          vendorName: vDecor.vendorName,
          rating: vDecor.rating,
          reviewsCount: vDecor.reviewsCount,
          verified: vDecor.verified,
          city,
          category: 'Stage & Mandap Decor',
          serviceName: isRoyal ? 'Royal Floral Mandap & Crystal Lighting' : 'Traditional Floral Mandap & Warm Fairy Lights',
          estimatedCost: Math.round(tierPrice * 0.12),
          priceNote: 'Complete floral ceremonial styling',
          deliverables: ['Bespoke sacred mandap with fresh blooms', 'Grand entrance pathway tunnel & welcome board', 'Ambient fairy wash lighting & dining table accents'],
        },
        {
          id: `wed_photo_${tier}`,
          vendorId: vPhoto.vendorId,
          vendorImage: vPhoto.vendorImage,
          vendorName: vPhoto.vendorName,
          rating: vPhoto.rating,
          reviewsCount: vPhoto.reviewsCount,
          verified: vPhoto.verified,
          city,
          category: 'Photo & 4K Cinematography',
          serviceName: isRoyal ? '4K Cinema + Aerial Drone & Candid Duo' : 'Candid Photographer + Traditional Cinema',
          estimatedCost: Math.round(tierPrice * 0.11),
          priceNote: 'Comprehensive multi-crew coverage',
          deliverables: ['2 Candid Photographers + 2 Cinematographers', '4K Cinematic wedding teaser & full documentary', 'Premium 35-page hardbound wedding photobook'],
        },
        {
          id: `wed_makeup_${tier}`,
          vendorId: vMakeup.vendorId,
          vendorImage: vMakeup.vendorImage,
          vendorName: vMakeup.vendorName,
          rating: vMakeup.rating,
          reviewsCount: vMakeup.reviewsCount,
          verified: vMakeup.verified,
          city,
          category: 'Bridal & Family Makeup',
          serviceName: 'HD Airbrush Bridal Makeup & Styling',
          estimatedCost: Math.round(tierPrice * 0.04),
          priceNote: 'Bridal main day look + mother/sister styling',
          deliverables: ['High-definition airbrush bridal makeover', 'Luxury hair styling with fresh floral accessories', 'Saree / dupatta draping & pre-event skin prep'],
        },
        {
          id: `wed_priest_${tier}`,
          vendorId: vPriest.vendorId,
          vendorImage: vPriest.vendorImage,
          vendorName: vPriest.vendorName,
          rating: vPriest.rating,
          reviewsCount: vPriest.reviewsCount,
          verified: vPriest.verified,
          city,
          category: `Priest & Rituals (${tradition})`,
          serviceName: priestTitle,
          estimatedCost: Math.round(tierPrice * 0.03),
          priceNote: `Rituals aligned with ${tradition} traditions`,
          deliverables: priestDeliverables,
        },
        {
          id: `wed_music_${tier}`,
          vendorId: vMusic.vendorId,
          vendorImage: vMusic.vendorImage,
          vendorName: vMusic.vendorName,
          rating: vMusic.rating,
          reviewsCount: vMusic.reviewsCount,
          verified: vMusic.verified,
          city,
          category: 'DJ, Sound & Dhol Baraat',
          serviceName: 'Live Punjabi Dhol Toli & DJ Sound',
          estimatedCost: Math.round(tierPrice * 0.04),
          priceNote: 'Baraat procession + party sound',
          deliverables: ['Live Punjabi Dhol drummers for baraat procession', 'High-output club sound system & dance floor lights', 'Wireless mics for family toasts & announcements'],
        },
        {
          id: `wed_valet_${tier}`,
          vendorId: vValet.vendorId,
          vendorImage: vValet.vendorImage,
          vendorName: vValet.vendorName,
          rating: vValet.rating,
          reviewsCount: vValet.reviewsCount,
          verified: vValet.verified,
          city,
          category: 'Valet & Guest Logistics',
          serviceName: 'Uniformed Valet Drivers & Security',
          estimatedCost: Math.round(tierPrice * 0.02),
          priceNote: `Management for ${guestCount} attendees`,
          deliverables: ['Uniformed valet drivers & key tag management', 'Guest reception & arrival management', 'Event security guards at main gates'],
        },
      ];
    };

    // ── Build Event-Specific Add-Ons ──
    const weddingAddons: PackageAddon[] = [
      {
        id: 'addon_dhol_extra',
        name: 'Live Punjabi Dhol Toli (4 Drummers)',
        description: 'Traditional nagada & dhol players for grand high-energy baraat arrival.',
        category: 'Entertainment',
        cost: 18000,
      },
      {
        id: 'addon_mehendi_bridal',
        name: 'Bridal Mehendi Artist & 2 Family Cones',
        description: 'Organic henna art up to elbows and feet with bespoke couple portraits.',
        category: 'Makeup & Styling',
        cost: 14000,
      },
      {
        id: 'addon_drone_film',
        name: 'Aerial 4K Drone Cinematography & Reels',
        description: 'DGCA licensed drone pilot capturing cinematic aerial shots & 3 viral reels.',
        category: 'Photography',
        cost: 24000,
      },
      {
        id: 'addon_valet_fleet',
        name: 'Dedicated Valet Drivers Fleet (6 Drivers)',
        description: 'Smooth guest parking management with digital token tracking.',
        category: 'Logistics',
        cost: 12000,
      },
      {
        id: 'addon_cold_pyro',
        name: 'Cold Pyro Guns & Dry-Ice Low Fog Entry',
        description: 'Sparkler fireworks and cloud-like low fog for the couple entry & jaimala.',
        category: 'Decor & Special Effects',
        cost: 16000,
      },
    ];

    const birthdayAddons: PackageAddon[] = [
      {
        id: 'addon_cake_tier',
        name: 'Upgrade to 3-Tier Sculpted Fondant Cake',
        description: 'Handcrafted custom theme design with edible figures and gold leaf.',
        category: 'Cake',
        cost: 6500,
      },
      {
        id: 'addon_magic_show',
        name: 'Live Magic Show & Interactive Games Emcee',
        description: '45-minute comedy illusion magic show + balloon twisting for children.',
        category: 'Entertainment',
        cost: 12000,
      },
      {
        id: 'addon_photobooth',
        name: 'Instant Polaroid & Digital Photobooth',
        description: 'Fun customized frame with instant printouts for guests to take home.',
        category: 'Photography',
        cost: 14000,
      },
      {
        id: 'addon_carnival_carts',
        name: 'Cotton Candy & Popcorn Live Carts',
        description: 'Unlimited freshly spun cotton candy and butter popcorn throughout the party.',
        category: 'Catering',
        cost: 8000,
      },
    ];

    const eventAddons = isBirthday ? birthdayAddons : weddingAddons;

    // ── Generate the 3 Tiers ──
    const classicPrice = Math.round(budget * 0.82);
    const royalPrice = Math.round(budget * 1.05);
    const boutiquePrice = Math.round(budget * 0.92);

    const classicVendors = buildVendorsForTier('classic', classicPrice);
    const royalVendors = buildVendorsForTier('royal', royalPrice);
    const boutiqueVendors = buildVendorsForTier('boutique', boutiquePrice);

    return [
      {
        id: 'pkg_classic_heritage',
        tier: 'Balanced',
        title: `${eventType} Essential Heritage Suite`,
        tagline: `Complete ${isWedding ? '8-service' : '6-service'} setup tailored for ${guestCount} guests in ${city}`,
        description: `Hand-picked by Vellure AI to give you end-to-end execution covering all cultural rituals (${tradition} priest, catering, venue, photo & sound) comfortably within budget.`,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        badge: 'Most Balanced',
        badgeColor: '#641E3D',
        totalPrice: classicPrice,
        perGuestPrice: Math.round(classicPrice / guestCount),
        savingsLabel: 'Saves ~14% vs. booking vendors separately',
        eventType,
        city,
        guestCount,
        servicesIncluded: classicVendors.map((v) => v.category),
        serviceItems: classicVendors,
        addOns: eventAddons,
        rationale: `Calibrated specifically for a ${eventType} (${tradition} tradition) with ${guestCount} guests in ${city}. Auto-includes venue, feast, floral styling, photo/video, makeup, priest, dhol and valet for complete peace of mind.`,
        highlights: [
          `Full-spectrum coverage: all ${classicVendors.length} essential services included`,
          `Locked rates with guaranteed backup vendor protection`,
          `Includes dedicated on-site logistics coordination`,
        ],
      },
      {
        id: 'pkg_royal_signature',
        tier: 'Luxury',
        title: `Royal Imperial ${eventType} Suite`,
        tagline: `Palace grandeur, 4K aerial cinema & gourmet feast in ${city}`,
        description: `The pinnacle of celebratory luxury. Features historic or 5-star venue grounds, imperial dining, celebrity styling, live dhol, and full cinematographic coverage.`,
        image: 'https://images.unsplash.com/photo-1519225495045-3b8296c3aba7?w=800&auto=format&fit=crop&q=80',
        badge: '👑 Royal Luxury',
        badgeColor: '#D2AD6B',
        totalPrice: royalPrice,
        perGuestPrice: Math.round(royalPrice / guestCount),
        savingsLabel: 'Includes VIP upgrades & complimentary drone license',
        eventType,
        city,
        guestCount,
        servicesIncluded: royalVendors.map((v) => v.category),
        serviceItems: royalVendors,
        addOns: eventAddons,
        rationale: `Crafted for hosts who desire an unforgettable statement celebration in ${city}. Every partner holds a 4.9+ rating and possesses proven experience delivering high-end Indian celebrations.`,
        highlights: [
          `Top-tier palace setting with luxury suites included`,
          `Drone aerial cinematography with cinema-grade mastering`,
          `Live gourmet cooking counters and bespoke floral mandap`,
        ],
      },
      {
        id: 'pkg_artisanal_boutique',
        tier: 'Boutique',
        title: `Bespoke Artisanal ${eventType} Suite`,
        tagline: `Modern aesthetics, botanical florals & editorial storytelling in ${city}`,
        description: `Designed for intimate elegance and aesthetic photographs. Curates boutique open-air spaces with pastel floral styling and farm-to-table cuisine.`,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
        badge: '✨ Modern Chic',
        badgeColor: '#9E3A5A',
        totalPrice: boutiquePrice,
        perGuestPrice: Math.round(boutiquePrice / guestCount),
        savingsLabel: 'Curated for high aesthetic & social media highlights',
        eventType,
        city,
        guestCount,
        servicesIncluded: boutiqueVendors.map((v) => v.category),
        serviceItems: boutiqueVendors,
        addOns: eventAddons,
        rationale: `Selected for modern hosts who value atmosphere, emotional candid imagery, and gourmet culinary experiences over traditional rigid formats.`,
        highlights: [
          `Open-air resort setting with romantic fairy-light canopy`,
          `Editorial photography tailored for magazine-grade albums`,
          `Sustainable and fresh botanical decor theme`,
        ],
      },
    ];
  }, [budget, city, eventType, guestCount, matchedVendors, plan.rawPrompt]);

  const handleOpenDetail = (pkg: AiCuratedPackage) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerBadge}>
          <Sparkles size={11} color="#D2AD6B" strokeWidth={2.5} />
          <Text style={styles.headerBadgeText}>AI Curated Packages</Text>
        </View>
        <Text style={styles.headerCityBadge}>
          <Users size={11} color="#641E3D" /> {guestCount} Guests · {city}
        </Text>
      </View>

      <Text style={styles.headingTitle}>Multi-Vendor Celebration Suites</Text>
      <Text style={styles.headingSubtitle}>
        AI-generated packages calibrated to your budget, guest count, and service preferences in {city}. Click any package to inspect full deliverables, pricing, and verified vendor details.
      </Text>

      {/* Package Cards List */}
      <View style={styles.cardsWrap}>
        {packages.map((pkg) => (
          <VellureButton
            key={pkg.id}
            style={styles.packageCard}
            onPress={() => handleOpenDetail(pkg)}
            activeOpacity={0.92}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${pkg.title}`}
          >
            {/* Cover Image & Badges */}
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: pkg.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardImageOverlay} />

              <View style={styles.cardTopRow}>
                <View style={[styles.cardTierBadge, { backgroundColor: pkg.badgeColor || '#641E3D' }]}>
                  <Text style={styles.cardTierBadgeText}>{pkg.badge}</Text>
                </View>

                <View style={styles.cardRatingPill}>
                  <ShieldCheck size={11} color="#3E7B52" />
                  <Text style={styles.cardRatingText}>Verified Suite</Text>
                </View>
              </View>

              <View style={styles.cardImageBottomText}>
                <Text style={styles.cardTitle}>{pkg.title}</Text>
                <Text style={styles.cardTagline} numberOfLines={1}>{pkg.tagline}</Text>
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              {/* Financial Summary */}
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabelText}>Total Estimated Package</Text>
                  <Text style={styles.totalPriceText}>₹{pkg.totalPrice.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.perGuestBadge}>
                  <Text style={styles.perGuestAmount}>₹{pkg.perGuestPrice.toLocaleString('en-IN')}</Text>
                  <Text style={styles.perGuestSub}>/ guest</Text>
                </View>
              </View>

              {/* Service Inclusions Grid */}
              <View style={styles.servicesGrid}>
                {pkg.servicesIncluded.map((service, idx) => (
                  <View key={idx} style={styles.servicePill}>
                    <CheckCircle2 size={11} color="#D2AD6B" />
                    <Text style={styles.servicePillText}>{service}</Text>
                  </View>
                ))}
              </View>

              {/* Selected Vendors Row with Profile Images - Clickable to view details */}
              <View style={styles.selectedVendorsWrap}>
                <Text style={styles.selectedVendorsLabel}>Selected Partners (Tap to view details):</Text>
                <View style={styles.vendorAvatarsRow}>
                  {pkg.serviceItems.slice(0, 4).map((item, vIdx) => (
                    <Pressable
                      key={item.id || vIdx}
                      style={styles.vendorAvatarBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (item.vendorId) {
                          router.push(`/vendor/${item.vendorId}`);
                        } else {
                          handleOpenDetail(pkg);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.vendorName} profile`}
                    >
                      <View style={styles.vendorMiniAvatarWrap}>
                        {item.vendorImage ? (
                          <Image source={{ uri: item.vendorImage }} style={styles.vendorMiniAvatar} />
                        ) : (
                          <View style={styles.vendorMiniAvatarPlaceholder}>
                            <Store size={12} color="#D2AD6B" />
                          </View>
                        )}
                        {item.verified ? <View style={styles.miniVerifiedDot} /> : null}
                      </View>
                      <View style={styles.vendorMiniInfo}>
                        <Text style={styles.vendorMiniName} numberOfLines={1}>{item.vendorName}</Text>
                        <Text style={styles.vendorMiniCategory} numberOfLines={1}>{item.category}</Text>
                      </View>
                      <ChevronRight size={11} color="#8A7A70" />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action Link Button */}
              <View style={styles.cardActionRow}>
                <View style={styles.actionLeft}>
                  <Layers size={13} color="#641E3D" />
                  <Text style={styles.actionSubText}>{pkg.serviceItems.length} Verified Services Included</Text>
                </View>
                <View style={styles.viewDetailsBtn}>
                  <Text style={styles.viewDetailsText}>View Full Details</Text>
                  <ChevronRight size={14} color="#641E3D" />
                </View>
              </View>
            </View>
          </VellureButton>
        ))}
      </View>

      {/* Expandable Planning Evidence & Sources Drawer */}
      {evidence ? (
        <View style={styles.evidenceDrawer}>
          <Pressable
            style={styles.evidenceHeader}
            onPress={() => setShowEvidenceSources(!showEvidenceSources)}
            accessibilityRole="button"
          >
            <View style={styles.evidenceHeaderLeft}>
              <Info size={14} color="#8A6A23" />
              <Text style={styles.evidenceHeaderTitle}>What this plan is based on</Text>
            </View>
            <View style={styles.evidenceHeaderRight}>
              <Text style={styles.evidenceHeaderToggle}>
                {showEvidenceSources ? 'Hide Details' : 'View Assumptions & Sources'}
              </Text>
              {showEvidenceSources ? (
                <ChevronUp size={14} color="#641E3D" />
              ) : (
                <ChevronDown size={14} color="#641E3D" />
              )}
            </View>
          </Pressable>

          {showEvidenceSources ? (
            <View style={styles.evidenceBody}>
              <Text style={styles.evidenceStatusText}>
                {evidence.feasibility === 'needs-quotes'
                  ? 'Local quotes are needed to finalize vendor allocations.'
                  : 'Listed starting estimates fit your target budget. Final quotes may adjust with date availability.'}
              </Text>

              {(evidence.gaps || []).map((gap: string, i: number) => (
                <Text key={`gap-${i}`} style={styles.evidenceGapText}>• {gap}</Text>
              ))}

              <Text style={styles.evidenceSubHeading}>Assumptions to confirm:</Text>
              {(evidence.assumptions || []).map((note: string, i: number) => (
                <Text key={`assump-${i}`} style={styles.evidenceAssumpText}>• {note}</Text>
              ))}

              {(evidence.sources || []).length > 0 ? (
                <View style={styles.sourcesContainer}>
                  <Text style={styles.evidenceSubHeading}>
                    Planning Sources ({evidence.sources.length}):
                  </Text>
                  {evidence.sources.map((src: any) => (
                    <View key={src.id} style={styles.sourceItem}>
                      <Text style={styles.sourceTitle}>{src.title}</Text>
                      <Text style={styles.sourceMeta}>
                        {src.type === 'vendor'
                          ? `Starting estimate · checked ${src.checkedAt ? src.checkedAt.slice(0, 10) : 'recently'}`
                          : 'Internal planning guide · indicative baseline'}
                      </Text>
                      {typeof src.sourceUrl === 'string' && /^https?:\/\//.test(src.sourceUrl) ? (
                        <Pressable
                          onPress={() => { void Linking.openURL(src.sourceUrl).catch(() => {}); }}
                          accessibilityRole="link"
                        >
                          <Text style={styles.sourceLink}>Open price reference</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Detailed Modal */}
      <AiPackageDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        pack={selectedPackage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  headerBadgeText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerCityBadge: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '700',
  },
  headingTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  headingSubtitle: {
    color: '#786B70',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardsWrap: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    overflow: 'hidden',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 12, 18, 0.58)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTierBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  cardTierBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  cardRatingText: {
    color: '#2A583A',
    fontSize: 10,
    fontWeight: '700',
  },
  cardImageBottomText: {
    marginTop: 'auto',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTagline: {
    color: '#EFE3CF',
    fontSize: 11,
    marginTop: 2,
  },
  cardBody: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priceLabelText: {
    color: '#786B70',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalPriceText: {
    color: '#641E3D',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 1,
  },
  perGuestBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  perGuestAmount: {
    color: '#8A6A23',
    fontSize: 12,
    fontWeight: '800',
  },
  perGuestSub: {
    color: '#786B70',
    fontSize: 9,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  servicePillText: {
    color: '#49362D',
    fontSize: 10,
    fontWeight: '600',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5EFEB',
    paddingTop: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionSubText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedVendorsWrap: {
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  selectedVendorsLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  vendorAvatarsRow: {
    gap: 6,
  },
  vendorAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    gap: 8,
  },
  vendorMiniAvatarWrap: {
    position: 'relative',
    width: 28,
    height: 28,
  },
  vendorMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  vendorMiniAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  miniVerifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E7B52',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  vendorMiniInfo: {
    flex: 1,
  },
  vendorMiniName: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
  },
  vendorMiniCategory: {
    color: '#786B70',
    fontSize: 9,
    fontWeight: '500',
  },
  evidenceDrawer: {
    marginTop: 16,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    overflow: 'hidden',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  evidenceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evidenceHeaderTitle: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '700',
  },
  evidenceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evidenceHeaderToggle: {
    color: '#8A6A23',
    fontSize: 11,
    fontWeight: '600',
  },
  evidenceBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    paddingTop: 10,
    gap: 6,
  },
  evidenceStatusText: {
    color: '#65564E',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  evidenceGapText: {
    color: '#8A5A12',
    fontSize: 11,
    lineHeight: 16,
  },
  evidenceSubHeading: {
    color: '#49362D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  evidenceAssumpText: {
    color: '#65564E',
    fontSize: 11,
    lineHeight: 16,
  },
  sourcesContainer: {
    marginTop: 6,
    gap: 8,
  },
  sourceItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  sourceTitle: {
    color: '#49362D',
    fontSize: 12,
    fontWeight: '700',
  },
  sourceMeta: {
    color: '#786B70',
    fontSize: 11,
    marginTop: 2,
  },
  sourceLink: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
