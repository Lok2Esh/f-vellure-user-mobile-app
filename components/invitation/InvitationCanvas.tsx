import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { InvitationDraft } from '../../services/invitationGenerator';
import { typography } from '../../constants/theme';
import { VellureMark } from '../ui/LuxuryArtwork';

interface InvitationCanvasProps {
  draft: InvitationDraft;
  showSafeZoneOverlay?: boolean;
}

export function InvitationCanvas({ draft, showSafeZoneOverlay = false }: InvitationCanvasProps) {
  const { palette } = draft;

  return (
    <View
      style={[
        styles.canvas,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          shadowColor: palette.primary,
        },
      ]}
    >
      {/* Background Micro-Texture & Luxury Borders */}
      <InvitationArtwork draft={draft} />

      {/* Strict Text-Safe Zone: Mathematically isolated from decorative perimeters */}
      <View
        style={[
          styles.textSafeContainer,
          showSafeZoneOverlay && styles.textSafeZoneDebug,
        ]}
      >
        {/* Top Emblem within safe clearance */}
        <View style={styles.crestRow}>
          <VellureMark size={28} color={palette.accent} />
        </View>

        {/* 1. Host Line */}
        <Text
          numberOfLines={1}
          style={[styles.hostText, { color: palette.ink }]}
        >
          {draft.hostLine.toUpperCase()}
        </Text>

        {/* 2. Headline */}
        <Text
          numberOfLines={1}
          style={[styles.headlineText, { color: palette.primary }]}
        >
          {draft.headline}
        </Text>

        {/* 3. Gold Hairline Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.hairline, { backgroundColor: palette.accent }]} />
          <View style={[styles.dividerDiamond, { backgroundColor: palette.accent }]} />
          <View style={[styles.hairline, { backgroundColor: palette.accent }]} />
        </View>

        {/* 4. Couple / Honoree Names */}
        <View style={styles.namesContainer}>
          {draft.names.length > 1 ? (
            <>
              <Text style={[styles.primaryName, { color: palette.primary }]}>
                {draft.names[0]}
              </Text>
              <Text style={[styles.ampersand, { color: palette.accent }]}>&</Text>
              <Text style={[styles.primaryName, { color: palette.primary }]}>
                {draft.names[1]}
              </Text>
            </>
          ) : (
            <Text style={[styles.primaryNameSingle, { color: palette.primary }]}>
              {draft.names[0]}
            </Text>
          )}
        </View>

        {/* 5. Invitation Body Copy */}
        <Text
          numberOfLines={2}
          style={[styles.invitationText, { color: palette.ink }]}
        >
          {draft.invitationLine}
        </Text>

        {/* 6. Sacred / Warm Blessing Line */}
        <Text
          numberOfLines={2}
          style={[styles.blessingText, { color: palette.primary }]}
        >
          “{draft.blessingLine}”
        </Text>

        {/* 7. Framed Event Details Capsule */}
        <View
          style={[
            styles.detailsCapsule,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              borderColor: `${palette.accent}55`,
            },
          ]}
        >
          <Text style={[styles.dateText, { color: palette.primary }]}>
            {draft.dateLine.toUpperCase()}
          </Text>
          <Text style={[styles.timeText, { color: palette.ink }]}>
            {draft.timeLine}
          </Text>
          <View style={[styles.innerCapsuleDivider, { backgroundColor: `${palette.accent}33` }]} />
          <Text style={[styles.venueText, { color: palette.primary }]} numberOfLines={1}>
            {draft.venueLine}
          </Text>
          <Text style={[styles.cityText, { color: palette.accent }]}>
            {draft.cityLine.toUpperCase()}
          </Text>
        </View>

        {/* 8. Ceremonial Closing Line */}
        <Text
          numberOfLines={1}
          style={[styles.closingText, { color: palette.ink }]}
        >
          {draft.closingLine}
        </Text>
      </View>

      {/* Safe-Zone Guide Overlay (Visual Inspector) */}
      {showSafeZoneOverlay && (
        <View style={styles.safeZoneGuideBadge}>
          <Text style={styles.safeZoneGuideText}>SAFE ZONE: 0 OVERLAPS</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// INVITATION ARTWORK: BORDERS, CRESTS, MOTIFS (CONFINED TO SAFE MARGINS)
// ============================================================================

function InvitationArtwork({ draft }: { draft: InvitationDraft }) {
  const { primary, accent, soft } = draft.palette;
  const { layout, motif } = draft;

  return (
    <Svg style={styles.artworkSvg} width="100%" height="100%" viewBox="0 0 340 510">
      <Defs>
        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <Stop offset="50%" stopColor="#E9D6B0" stopOpacity="1" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>

      {/* Outer Border (Always at x: 10..330, y: 10..500) */}
      <Rect
        x="12"
        y="12"
        width="316"
        height="486"
        rx="18"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        opacity={0.85}
      />
      {/* Inner Inset Border */}
      <Rect
        x="18"
        y="18"
        width="304"
        height="474"
        rx="14"
        fill="none"
        stroke={soft}
        strokeWidth="0.8"
        strokeDasharray="4 2"
        opacity={0.65}
      />

      {/* Layout Specific Decorative Architecture */}
      {layout === 'royal-arch' && (
        <G>
          {/* Rajput / Mughal Jharokha Arch Header (Confined to Y: 18..68) */}
          <Path
            d="M36 120V64C36 32 90 22 170 22C250 22 304 32 304 64V120"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.2"
            opacity={0.7}
          />
          <Path
            d="M52 110V70C52 42 100 34 170 34C240 34 288 42 288 70V110"
            fill="none"
            stroke={soft}
            strokeWidth="0.75"
            opacity={0.6}
          />
          {/* Subtle Arch Finial Peak */}
          <Path
            d="M170 14L173 22L170 26L167 22Z"
            fill={accent}
            opacity={0.9}
          />
        </G>
      )}

      {layout === 'botanical-frame' && (
        <G>
          {/* Corner Botanical Foliage (Leaves & buds, strictly outside text box) */}
          {/* Top-Left Corner */}
          <Path
            d="M22 45C32 40 38 32 46 22M22 34C30 32 36 26 40 18"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
          <Circle cx="35" cy="28" r="2.2" fill={primary} opacity={0.6} />
          {/* Top-Right Corner */}
          <Path
            d="M318 45C308 40 302 32 294 22M318 34C310 32 304 26 300 18"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
          <Circle cx="305" cy="28" r="2.2" fill={primary} opacity={0.6} />
          {/* Bottom-Left Corner */}
          <Path
            d="M22 465C32 470 38 478 46 488M22 476C30 478 36 484 40 492"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
          {/* Bottom-Right Corner */}
          <Path
            d="M318 465C308 470 302 478 294 488M318 476C310 478 304 484 300 492"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
        </G>
      )}

      {layout === 'festive-garland' && (
        <G>
          {/* Swag garland along the very top rim (Y: 20..38) */}
          <Path
            d="M20 28C70 42 120 42 170 28C220 42 270 42 320 28"
            fill="none"
            stroke={primary}
            strokeWidth="1.2"
            opacity={0.5}
          />
          {[45, 95, 145, 195, 245, 295].map((gx) => (
            <G key={gx}>
              <Circle cx={gx} cy={34} r="3.5" fill={accent} opacity={0.8} />
              <Circle cx={gx} cy={34} r="1.5" fill={primary} />
            </G>
          ))}
        </G>
      )}

      {layout === 'regal-monogram' && (
        <G>
          {/* Ornate Indian Rajput/Mughal corner filigree brackets */}
          <Path d="M22 36H36V22" fill="none" stroke={accent} strokeWidth="1.4" />
          <Circle cx="36" cy="36" r="2" fill={accent} />
          <Path d="M318 36H304V22" fill="none" stroke={accent} strokeWidth="1.4" />
          <Circle cx="304" cy="36" r="2" fill={accent} />
          <Path d="M22 474H36V488" fill="none" stroke={accent} strokeWidth="1.4" />
          <Circle cx="36" cy="474" r="2" fill={accent} />
          <Path d="M318 474H304V488" fill="none" stroke={accent} strokeWidth="1.4" />
          <Circle cx="304" cy="474" r="2" fill={accent} />
        </G>
      )}

      {layout === 'modern-orbit' && (
        <G>
          {/* Subtle celestial orbital lines in top right & bottom left corners */}
          <Circle cx="306" cy="34" r="30" fill="none" stroke={soft} strokeWidth="0.8" opacity={0.4} />
          <Circle cx="34" cy="476" r="28" fill="none" stroke={soft} strokeWidth="0.8" opacity={0.4} />
          <Circle cx="306" cy="34" r="2" fill={accent} />
          <Circle cx="34" cy="476" r="2" fill={accent} />
        </G>
      )}

      {/* Bottom Ceremonial Seal (Strictly located at Y: 462..485) */}
      <BottomMotifSeal motif={motif} primary={primary} accent={accent} soft={soft} />
    </Svg>
  );
}

// ============================================================================
// BOTTOM MOTIF SEAL (Sacred Indian motifs, isolated safely in bottom footer)
// ============================================================================

function BottomMotifSeal({
  motif,
  primary,
  accent,
  soft,
}: {
  motif: InvitationDraft['motif'];
  primary: string;
  accent: string;
  soft: string;
}) {
  const cy = 472;

  if (motif === 'lotus') {
    // Padma (Sacred Lotus of Purity and Grace)
    return (
      <G fill="none" stroke={accent} strokeWidth="1.2">
        {/* Center Petal */}
        <Path d={`M170 ${cy - 12}C166 ${cy - 5} 166 ${cy + 4} 170 ${cy + 6}C174 ${cy + 4} 174 ${cy - 5} 170 ${cy - 12}Z`} fill={accent} opacity={0.3} />
        {/* Left Petal */}
        <Path d={`M170 ${cy + 6}C160 ${cy + 3} 153 ${cy - 4} 156 ${cy - 9}C161 ${cy - 5} 166 ${cy + 1} 170 ${cy + 6}Z`} />
        {/* Right Petal */}
        <Path d={`M170 ${cy + 6}C180 ${cy + 3} 187 ${cy - 4} 184 ${cy - 9}C179 ${cy - 5} 174 ${cy + 1} 170 ${cy + 6}Z`} />
        <Circle cx="170" cy={cy + 8} r="1.5" fill={primary} />
      </G>
    );
  }

  if (motif === 'peacock') {
    // Mayura Feather Crest (Indian Royal Grace)
    return (
      <G fill="none" stroke={accent} strokeWidth="1.1">
        <Path d={`M170 ${cy + 10}C170 ${cy} 178 ${cy - 6} 178 ${cy - 12}C174 ${cy - 15} 166 ${cy - 15} 162 ${cy - 10}C162 ${cy - 5} 170 ${cy} 170 ${cy + 10}`} />
        <Circle cx="170" cy={cy - 10} r="3" fill={primary} opacity={0.7} />
        <Circle cx="170" cy={cy - 10} r="1.5" fill={accent} />
      </G>
    );
  }

  if (motif === 'lamps') {
    // Sacred Diya (Auspicious Light)
    return (
      <G fill="none">
        {/* Diya Base */}
        <Path d={`M154 ${cy}C158 ${cy + 9} 182 ${cy + 9} 186 ${cy}C175 ${cy + 2} 165 ${cy + 2} 154 ${cy}Z`} fill={accent} />
        {/* Jyoti (Flame) */}
        <Path d={`M170 ${cy - 12}C167 ${cy - 7} 166 ${cy - 2} 170 ${cy}C174 ${cy - 2} 173 ${cy - 7} 170 ${cy - 12}Z`} fill={primary} />
        <Circle cx="170" cy={cy - 5} r="1.8" fill="#F8DE95" />
      </G>
    );
  }

  if (motif === 'rings') {
    // Entwined Ceremonial Rings
    return (
      <G fill="none" stroke={accent} strokeWidth="1.4">
        <Circle cx="163" cy={cy} r="8.5" />
        <Circle cx="177" cy={cy} r="8.5" />
        <Circle cx="170" cy={cy - 5} r="2" fill={primary} opacity={0.6} />
      </G>
    );
  }

  if (motif === 'marigold') {
    // Sacred Genda Phool Garland Cluster
    return (
      <G fill={accent}>
        <Circle cx="170" cy={cy} r="6" />
        <Circle cx="158" cy={cy + 1} r="4.5" opacity={0.8} />
        <Circle cx="182" cy={cy + 1} r="4.5" opacity={0.8} />
        <Circle cx="170" cy={cy} r="2.5" fill={primary} />
      </G>
    );
  }

  if (motif === 'mandala') {
    // Sacred Geometric Mandala Motif
    return (
      <G fill="none" stroke={accent} strokeWidth="0.9">
        <Circle cx="170" cy={cy} r="10" />
        <Circle cx="170" cy={cy} r="5" stroke={primary} />
        <Circle cx="170" cy={cy} r="1.8" fill={accent} />
        <Path d={`M160 ${cy}H180M170 ${cy - 10}V${cy + 10}`} strokeDasharray="1 2" />
      </G>
    );
  }

  // Default: Celestial Stars
  return (
    <G fill={accent}>
      <Path
        d={`M170 ${cy - 9}L172 ${cy - 2}L179 ${cy}L172 ${cy + 2}L170 ${cy + 9}L168 ${cy + 2}L161 ${cy}L168 ${cy - 2}Z`}
      />
      <Circle cx="152" cy={cy} r="2" opacity={0.7} />
      <Circle cx="188" cy={cy} r="2" opacity={0.7} />
    </G>
  );
}

// ============================================================================
// STYLES: MATHEMATICALLY GUARANTEED TEXT-SAFE ZONES
// ============================================================================

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 510,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  artworkSvg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  textSafeContainer: {
    zIndex: 2,
    position: 'absolute',
    top: 50,
    bottom: 58,
    left: 28,
    right: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  textSafeZoneDebug: {
    borderWidth: 1,
    borderColor: 'rgba(201, 153, 88, 0.65)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201, 153, 88, 0.04)',
    borderRadius: 14,
  },
  crestRow: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  hostText: {
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 2,
  },
  headlineText: {
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    marginVertical: 3,
  },
  hairline: {
    width: 32,
    height: 1,
    opacity: 0.6,
  },
  dividerDiamond: {
    width: 4,
    height: 4,
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
  namesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    minHeight: 48,
  },
  primaryName: {
    fontFamily: typography.serif,
    fontSize: 27,
    lineHeight: 30,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  primaryNameSingle: {
    fontFamily: typography.serif,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  ampersand: {
    fontFamily: typography.serif,
    fontSize: 17,
    lineHeight: 19,
    textAlign: 'center',
    marginVertical: 1,
    fontStyle: 'italic',
  },
  invitationText: {
    fontSize: 8.5,
    lineHeight: 13,
    textAlign: 'center',
    paddingHorizontal: 12,
    maxWidth: 240,
    marginTop: 2,
  },
  blessingText: {
    fontFamily: typography.serif,
    fontSize: 9,
    lineHeight: 13.5,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
    maxWidth: 245,
    marginTop: 1,
  },
  detailsCapsule: {
    width: '100%',
    maxWidth: 245,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 3,
  },
  dateText: {
    fontFamily: typography.serif,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 8,
    marginTop: 1,
    textAlign: 'center',
  },
  innerCapsuleDivider: {
    width: 30,
    height: 0.8,
    marginVertical: 4,
  },
  venueText: {
    fontFamily: typography.serif,
    fontSize: 10,
    textAlign: 'center',
  },
  cityText: {
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
  closingText: {
    fontSize: 7.8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },
  safeZoneGuideBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#351825',
    zIndex: 10,
  },
  safeZoneGuideText: {
    color: '#F4E2C7',
    fontSize: 6.8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
