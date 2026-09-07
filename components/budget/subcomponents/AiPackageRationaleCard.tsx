import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';
import { VellureCard } from '../../ui/VellureCard';
import { VellureText } from '../../ui/VellureText';
import { colors } from '../../../constants/theme';

export interface AiPackageRationaleCardProps {
  rationale: string;
  highlights: string[];
}

export function AiPackageRationaleCard({
  rationale,
  highlights,
}: AiPackageRationaleCardProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Sparkles size={16} color={colors.goldDark} />
        <VellureText variant="title" weight="heavy">
          AI Curation Rationale
        </VellureText>
      </View>

      <VellureCard variant="outlined" padding="medium" style={styles.rationaleCard}>
        <VellureText variant="body" color="primary" style={styles.rationaleText}>
          {rationale}
        </VellureText>

        <View style={styles.highlightsWrap}>
          {highlights.map((highlight, idx) => (
            <View key={idx} style={styles.highlightRow}>
              <CheckCircle2 size={13} color={colors.goldDark} />
              <VellureText variant="caption" weight="semibold" style={styles.highlightText}>
                {highlight}
              </VellureText>
            </View>
          ))}
        </View>
      </VellureCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  rationaleCard: {
    marginBottom: 18,
  },
  rationaleText: {
    lineHeight: 18,
    marginBottom: 10,
  },
  highlightsWrap: {
    gap: 6,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightText: {
    flex: 1,
  },
});
