import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle2, Info } from 'lucide-react-native';
import { VellureCard } from '../../ui/VellureCard';
import { VellureText } from '../../ui/VellureText';
import { VellureBadge } from '../../ui/VellureBadge';
import { colors } from '../../../constants/theme';
import { PackageAddon } from '../hooks/useAiPackageDetails';

export interface AiPackageAddonListProps {
  addOns: PackageAddon[];
  selectedAddonIds: string[];
  onToggleAddon: (id: string) => void;
  basePrice: number;
  addOnsTotal: number;
  formattedTotal: string;
  formattedPerGuest: string;
}

export function AiPackageAddonList({
  addOns,
  selectedAddonIds,
  onToggleAddon,
  basePrice,
  addOnsTotal,
  formattedTotal,
  formattedPerGuest,
}: AiPackageAddonListProps) {
  if (!addOns || addOns.length === 0) return null;

  return (
    <View style={styles.addOnsSection}>
      <View style={styles.sectionHeader}>
        <Sparkles size={16} color={colors.goldDark} />
        <VellureText variant="title" weight="heavy">
          AI Suggested Add-Ons & Upgrades
        </VellureText>
      </View>
      <VellureText variant="caption" color="secondary" style={styles.addOnsSubtitle}>
        Customize your celebration suite. Select optional additions to see live price adjustments.
      </VellureText>

      {addOns.map((addon) => {
        const isSelected = selectedAddonIds.includes(addon.id);
        return (
          <VellureCard
            key={addon.id}
            variant="outlined"
            padding="medium"
            onPress={() => onToggleAddon(addon.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={`${addon.name}, additional ₹${addon.cost.toLocaleString('en-IN')}`}
            style={[styles.addonCard, isSelected && styles.addonCardSelected]}
          >
            <View style={[styles.addonCheckbox, isSelected && styles.addonCheckboxSelected]}>
              {isSelected ? <CheckCircle2 size={16} color="#FFFFFF" /> : null}
            </View>

            <View style={styles.addonInfoCol}>
              <View style={styles.addonTopRow}>
                <VellureText
                  variant="body"
                  weight="bold"
                  color={isSelected ? 'brand' : 'default'}
                  style={styles.addonName}
                >
                  {addon.name}
                </VellureText>
                <VellureBadge
                  label={`+₹${addon.cost.toLocaleString('en-IN')}`}
                  tone={isSelected ? 'primary' : 'neutral'}
                  size="small"
                />
              </View>
              <VellureText variant="caption" color="secondary" style={styles.addonDescription}>
                {addon.description}
              </VellureText>
            </View>
          </VellureCard>
        );
      })}

      {/* Dynamic Add-Ons Summary Bar */}
      {selectedAddonIds.length > 0 ? (
        <VellureCard variant="champagne" padding="medium" style={styles.addonsSummaryBox}>
          <View style={styles.addonsSummaryRow}>
            <VellureText variant="caption" color="secondary" weight="semibold">
              Base Suite:
            </VellureText>
            <VellureText variant="bodySmall" weight="bold">
              ₹{basePrice.toLocaleString('en-IN')}
            </VellureText>
          </View>
          <View style={styles.addonsSummaryRow}>
            <VellureText variant="caption" color="secondary" weight="semibold">
              Selected Upgrades ({selectedAddonIds.length}):
            </VellureText>
            <VellureText variant="bodySmall" color="gold" weight="heavy">
              +₹{addOnsTotal.toLocaleString('en-IN')}
            </VellureText>
          </View>
          <View style={styles.addonsSummaryDivider} />
          <View style={styles.addonsSummaryRow}>
            <VellureText variant="body" color="brand" weight="heavy">
              New Reflected Total:
            </VellureText>
            <VellureText variant="title" color="brand" weight="heavy">
              {formattedTotal}
            </VellureText>
          </View>
        </VellureCard>
      ) : null}

      {/* AI Budget Alert / Advice if additions exceed target */}
      {addOnsTotal > 0 ? (
        <VellureCard variant="tinted" padding="small" style={styles.budgetAlertCard}>
          <Info size={14} color="#8A5A12" />
          <VellureText variant="caption" style={styles.budgetAlertText}>
            💡 <VellureText variant="caption" weight="bold">AI Budget Notice:</VellureText> With {selectedAddonIds.length} upgrade{selectedAddonIds.length > 1 ? 's' : ''}, your total investment updates to {formattedTotal} ({formattedPerGuest}/guest). You can confirm or adjust these options with your coordinator.
          </VellureText>
        </VellureCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addOnsSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  addOnsSubtitle: {
    marginBottom: 12,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  addonCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDF9',
  },
  addonCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C2B1A5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addonCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addonInfoCol: {
    flex: 1,
  },
  addonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  addonName: {
    flex: 1,
    marginRight: 8,
  },
  addonDescription: {
    lineHeight: 14,
  },
  addonsSummaryBox: {
    marginTop: 6,
    marginBottom: 10,
    gap: 4,
  },
  addonsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonsSummaryDivider: {
    height: 1,
    backgroundColor: '#EFE3CF',
    marginVertical: 4,
  },
  budgetAlertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#FFF9ED',
    borderColor: '#F3DEB8',
  },
  budgetAlertText: {
    color: '#8A5A12',
    lineHeight: 15,
    flex: 1,
  },
});
