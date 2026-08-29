import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
} from 'react-native';
import { AlertCircle, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react-native';
import { AttentionItem } from '../../services/api';
import { colors } from '../../constants/theme';

interface AttentionCardProps {
  items: AttentionItem[];
  onActionPress: (item: AttentionItem) => void;
}

export function AttentionCard({ items, onActionPress }: AttentionCardProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Attention Required</Text>
      {items.map((item) => {
        const isUrgent = item.priority === 'Time Sensitive';
        const isAction = item.priority === 'Action Required';

        return (
          <View
            key={item.id}
            style={[styles.card, isUrgent && styles.cardUrgent, isAction && styles.cardAction]}
          >
            <View style={styles.topRow}>
              <View
                style={[
                  styles.priorityPill,
                  isUrgent && styles.priorityUrgent,
                  isAction && styles.priorityAction,
                ]}
              >
                {isUrgent ? (
                  <Clock size={10} color="#B63A4A" />
                ) : (
                  <AlertCircle size={10} color="#8A6A23" />
                )}
                <Text
                  style={[
                    styles.priorityText,
                    isUrgent && styles.priorityTextUrgent,
                    isAction && styles.priorityTextAction,
                  ]}
                >
                  {item.priority}
                </Text>
              </View>

              <Text style={styles.planNameText}>{item.planName}</Text>
            </View>

            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.issueText}>{item.issue}</Text>

            <View style={styles.footerRow}>
              {item.deadline ? (
                <Text style={styles.deadlineText}>Valid until {item.deadline}</Text>
              ) : (
                <View />
              )}

              <VellureButton
                style={[styles.actionBtn, isUrgent && styles.actionBtnUrgent]}
                onPress={() => onActionPress(item)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.actionText}
              >
                <Text style={styles.actionBtnText}>{item.actionText}</Text>
                <ArrowRight size={12} color="#FFFFFF" />
              </VellureButton>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#641E3D',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 8,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUrgent: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  cardAction: {
    borderColor: '#ECD8B5',
    backgroundColor: '#FAF5EC',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  priorityUrgent: {
    backgroundColor: '#FEE2E2',
  },
  priorityAction: {
    backgroundColor: '#FAF1E3',
  },
  priorityText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  priorityTextUrgent: {
    color: '#B63A4A',
  },
  priorityTextAction: {
    color: '#8A6A23',
  },
  planNameText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  titleText: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  issueText: {
    color: '#5C4E53',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlineText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnUrgent: {
    backgroundColor: '#B63A4A',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
