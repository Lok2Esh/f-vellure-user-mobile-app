import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShieldCheck, BookmarkCheck, ArrowRight } from 'lucide-react-native';
import { VellureCard } from '../../ui/VellureCard';
import { VellureButton } from '../../ui/VellureControls';
import { VellureText } from '../../ui/VellureText';
import { colors } from '../../../constants/theme';

export interface AiPackageActionsBarProps {
  isSaved: boolean;
  formattedTotal: string;
  onSaveToPlans: () => void;
  onOpenInquiry: () => void;
}

export function AiPackageActionsBar({
  isSaved,
  formattedTotal,
  onSaveToPlans,
  onOpenInquiry,
}: AiPackageActionsBarProps) {
  return (
    <>
      {/* Vellure Trust Guarantee */}
      <VellureCard variant="champagne" padding="medium" style={styles.guaranteeCard}>
        <ShieldCheck size={20} color={colors.primary} />
        <View style={styles.guaranteeContent}>
          <VellureText variant="bodySmall" color="brand" weight="heavy">
            The Vellure Guarantee
          </VellureText>
          <VellureText variant="caption" color="secondary" style={styles.guaranteeText}>
            All vendors in this curated suite are vetted for on-time delivery, clear pricing, and emergency backup availability.
          </VellureText>
        </View>
      </VellureCard>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <VellureButton
          style={styles.saveBtn}
          onPress={onSaveToPlans}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save package to my plans"
        >
          <BookmarkCheck size={16} color={isSaved ? '#3E7B52' : colors.primary} />
          <VellureText
            variant="bodySmall"
            weight="heavy"
            color={isSaved ? 'success' : 'brand'}
          >
            {isSaved ? 'Saved to Plans' : 'Save Suite'}
          </VellureText>
        </VellureButton>

        <VellureButton
          style={styles.inquireBtn}
          onPress={onOpenInquiry}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Inquire this curated package"
        >
          <VellureText variant="title" color="inverse" weight="heavy">
            Inquire Suite ({formattedTotal})
          </VellureText>
          <ArrowRight size={16} color="#FFFFFF" />
        </VellureButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  guaranteeContent: {
    flex: 1,
    gap: 2,
  },
  guaranteeText: {
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: '#EFE3CF',
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  inquireBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
