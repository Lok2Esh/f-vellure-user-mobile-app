import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  X,
  FileText,
  Calendar,
  Users,
  MapPin,
  IndianRupee,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { EventInquiry } from '../../services/api';
import { colors } from '../../constants/theme';
import { EmptyStateCard } from '../ui/EmptyStateCard';
import { InquiryCard } from '../ui/InquiryCard';

interface EnquiriesModalProps {
  visible: boolean;
  inquiries: EventInquiry[];
  onClose: () => void;
}

type StatusFilter = 'All' | 'Sent' | 'Under Review' | 'Quote Ready' | 'Confirmed';

export function EnquiriesModal({ visible, inquiries, onClose }: EnquiriesModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');

  const filteredInquiries = inquiries.filter((inq) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Sent') return inq.status === 'Inquiry Sent';
    return inq.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Quote Ready':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'Under Review':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Confirmed':
        return { bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE' };
      default:
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    }
  };

  const handleOpenTarget = (inq: EventInquiry) => {
    onClose();
    if (!inq.isPackage && inq.targetId) {
      router.push(`/vendor/${inq.targetId}`);
    } else {
      router.push('/(tabs)/budget');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Enquiries & Quotations</Text>
              <Text style={styles.subtitle}>Track your partner quotation requests</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          {/* Status Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusTabsScroll}
          >
            {(['All', 'Sent', 'Under Review', 'Quote Ready', 'Confirmed'] as const).map((s) => {
              const count =
                s === 'All'
                  ? inquiries.length
                  : s === 'Sent'
                  ? inquiries.filter((i) => i.status === 'Inquiry Sent').length
                  : inquiries.filter((i) => i.status === s).length;
              const isActive = selectedStatus === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusTab, isActive && styles.statusTabActive]}
                  onPress={() => setSelectedStatus(s)}
                >
                  <Text style={[styles.statusTabText, isActive && styles.statusTabTextActive]}>
                    {s} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {filteredInquiries.length === 0 ? (
              <EmptyStateCard
                icon={<FileText size={32} color="#D2AD6B" />}
                title="No Enquiries Found"
                description={
                  selectedStatus === 'All'
                    ? 'You have not submitted any quotation or consultation requests yet.'
                    : `No inquiries currently marked as "${selectedStatus}".`
                }
                actionText="Explore Partners"
                onAction={() => {
                  onClose();
                  router.push('/(tabs)/vendors');
                }}
              />
            ) : (
              filteredInquiries.map((inq) => (
                <InquiryCard
                  key={inq.id}
                  inquiry={inq}
                  onPressTarget={handleOpenTarget}
                  ctaText={inq.isPackage ? 'View Package' : 'View Partner Profile'}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#641E3D',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  statusTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  statusTabActive: {
    backgroundColor: '#641E3D',
    borderColor: '#641E3D',
  },
  statusTabText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '700',
  },
  statusTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    paddingBottom: 28,
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inquiryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inquiryInfo: {
    flex: 1,
    paddingRight: 8,
  },
  inquiryCategory: {
    color: '#8A7A70',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  inquiryTitle: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#FAF5EC',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: '#4A3E44',
    fontSize: 10,
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: '#FDFBF7',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    marginBottom: 8,
  },
  notesText: {
    color: '#6A5A52',
    fontSize: 10,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
  },
  refText: {
    color: '#9A8E94',
    fontSize: 10,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
});
