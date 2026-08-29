import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import { View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Calendar, Users, MapPin, IndianRupee, ChevronRight, Store, Package } from 'lucide-react-native';
import { EventInquiry } from '../../services/api';
import { colors } from '../../constants/theme';

export interface InquiryCardProps {
  inquiry: EventInquiry;
  onPressTarget?: (inquiry: EventInquiry) => void;
  containerStyle?: StyleProp<ViewStyle>;
  ctaText?: string;
}

export function formatInquiryStatus(status: string) {
  switch (status) {
    case 'Quote Ready':
      return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', label: 'Quote Ready' };
    case 'Under Review':
      return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Under Review' };
    case 'Confirmed':
      return { bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE', label: 'Confirmed Plan' };
    default:
      return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Inquiry Sent' };
  }
}

export function InquiryCard({
  inquiry,
  onPressTarget,
  containerStyle,
  ctaText,
}: InquiryCardProps) {
  const badge = formatInquiryStatus(inquiry.status);
  const formattedDate = inquiry.createdAt
    ? new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={[styles.card, containerStyle]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <Text style={styles.categoryText}>
            {inquiry.targetCategory} {inquiry.isPackage ? '• Curated Package' : ''}
          </Text>
          <Text style={styles.titleText}>{inquiry.targetName}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Calendar size={11} color="#8A7A70" />
          <Text style={styles.gridText}>{inquiry.eventDate || 'Flexible Date'}</Text>
        </View>

        <View style={styles.gridItem}>
          <Users size={11} color="#8A7A70" />
          <Text style={styles.gridText}>{inquiry.guestCount} Guests</Text>
        </View>

        <View style={styles.gridItem}>
          <MapPin size={11} color="#8A7A70" />
          <Text style={styles.gridText}>{inquiry.city}</Text>
        </View>

        <View style={styles.gridItem}>
          <IndianRupee size={11} color="#8A7A70" />
          <Text style={styles.gridText}>₹{inquiry.estimatedBudget.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Special Notes */}
      {inquiry.specialNotes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText} numberOfLines={2}>
            "{inquiry.specialNotes}"
          </Text>
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.refInfo}>
          <Text style={styles.refCode}>Ref: {inquiry.id}</Text>
          {formattedDate ? <Text style={styles.refDate}>• Sent {formattedDate}</Text> : null}
        </View>

        {onPressTarget ? (
          <VellureButton
            style={styles.ctaBtn}
            onPress={() => onPressTarget(inquiry)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${inquiry.targetName}`}
          >
            <Text style={styles.ctaBtnText}>
              {ctaText || (inquiry.isPackage ? 'View Package' : 'View Partner')}
            </Text>
            <ChevronRight size={13} color="#641E3D" />
          </VellureButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftInfo: {
    flex: 1,
    paddingRight: 10,
  },
  categoryText: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  titleText: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridText: {
    color: '#4A3E44',
    fontSize: 11,
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#FAF5EC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  notesText: {
    color: '#4A3E44',
    fontSize: 11,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FAF5EC',
  },
  refInfo: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  refCode: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
  },
  refDate: {
    color: '#8A7A70',
    fontSize: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ctaBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
});
