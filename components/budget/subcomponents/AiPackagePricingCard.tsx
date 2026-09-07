import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Users, Layers, Award, Sparkles } from 'lucide-react-native';
import { VellureCard } from '../../ui/VellureCard';
import { VellureText } from '../../ui/VellureText';
import { colors } from '../../../constants/theme';

export interface AiPackagePricingCardProps {
  guestCount: number;
  servicesCount: number;
  eventType: string;
  formattedTotal: string;
  formattedPerGuest: string;
  savingsLabel?: string;
  city: string;
}

export function AiPackagePricingCard({
  guestCount,
  servicesCount,
  eventType,
  formattedTotal,
  formattedPerGuest,
  savingsLabel,
  city,
}: AiPackagePricingCardProps) {
  return (
    <>
      {/* Event Specs Bar */}
      <VellureCard variant="elevated" padding="small" style={styles.specsBar}>
        <View style={styles.specItem}>
          <Users size={15} color={colors.primary} />
          <VellureText variant="bodySmall" weight="heavy">
            {guestCount} Guests
          </VellureText>
          <VellureText variant="caption" color="secondary">
            Capacity
          </VellureText>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specItem}>
          <Layers size={15} color={colors.primary} />
          <VellureText variant="bodySmall" weight="heavy">
            {servicesCount} Services
          </VellureText>
          <VellureText variant="caption" color="secondary">
            Curated Core
          </VellureText>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specItem}>
          <Award size={15} color={colors.primary} />
          <VellureText variant="bodySmall" weight="heavy">
            {eventType}
          </VellureText>
          <VellureText variant="caption" color="secondary">
            Event Type
          </VellureText>
        </View>
      </VellureCard>

      {/* Price & Value Overview Card */}
      <VellureCard variant="champagne" padding="medium" style={styles.pricingCard}>
        <View style={styles.pricingTop}>
          <View>
            <VellureText variant="overline" color="secondary">
              Total Estimated Package
            </VellureText>
            <VellureText variant="price" color="brand" style={styles.priceMain}>
              {formattedTotal}
            </VellureText>
          </View>
          <View style={styles.perGuestBox}>
            <VellureText variant="title" color="gold" weight="heavy">
              {formattedPerGuest}
            </VellureText>
            <VellureText variant="caption" color="secondary">
              per guest
            </VellureText>
          </View>
        </View>

        {savingsLabel ? (
          <View style={styles.savingsBanner}>
            <Sparkles size={12} color={colors.goldDark} />
            <VellureText variant="bodySmall" color="gold" weight="bold">
              {savingsLabel}
            </VellureText>
          </View>
        ) : null}

        <VellureText variant="caption" color="muted" style={styles.priceFootnote}>
          * Final pricing reflects verified partner rates in {city} calibrated for {guestCount} guests. Taxes and optional add-ons may vary.
        </VellureText>
      </VellureCard>
    </>
  );
}

const styles = StyleSheet.create({
  specsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  specDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#EFE3CF',
  },
  pricingCard: {
    marginBottom: 18,
  },
  pricingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceMain: {
    fontSize: 24,
    marginTop: 2,
  },
  perGuestBox: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  priceFootnote: {
    fontStyle: 'italic',
  },
});
