import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../constants/theme';

interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onAction ? (
        <VellureButton
          style={styles.actionBtn}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{actionText}</Text>
        </VellureButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE5D5',
    marginVertical: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF2E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAD7BC',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
