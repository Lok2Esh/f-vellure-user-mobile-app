import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  X,
  Package,
  Calendar,
  Users,
  IndianRupee,
  ChevronRight,
  Sparkles,
  Send,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/theme';
import { EmptyStateCard } from '../ui/EmptyStateCard';
import { PackageCard } from '../ui/PackageCard';

interface SavedPackagesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPackage?: (pack: any) => void;
}

const SAVED_PACKAGES_DATA = [
  {
    id: 'pack_essential',
    title: 'Heritage Palace & Feast Bundle',
    tagline: 'Venue + Royal Catering for 300 guests',
    category: 'Curated Bundle',
    eventType: 'Wedding',
    city: 'Patiala',
    guestCount: 300,
    estimatedPrice: 1450000,
    includedServices: ['Royal Banquet Hall', '3-Course Punjabi Feast', 'Floral Entrance Arch', 'Sound & Stage'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  },
  {
    id: 'pack_premium',
    title: 'Couture Sangeet & Visuals Suite',
    tagline: 'Mood lighting + Candid Cinema + DJ',
    category: 'Entertainment & Decor',
    eventType: 'Sangeet / Mehendi',
    city: 'Patiala',
    guestCount: 200,
    estimatedPrice: 480000,
    includedServices: ['LED Stage & Trussing', 'Bespoke DJ Setup', '2 Cinematic Cameras', 'Dhol Troupe'],
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
  },
];

export function SavedPackagesModal({
  visible,
  onClose,
  onSelectPackage,
}: SavedPackagesModalProps) {
  const [packages, setPackages] = useState(SAVED_PACKAGES_DATA);

  const handleInquirePackage = (pack: any) => {
    onClose();
    router.push({
      pathname: '/(tabs)/budget',
      params: {
        eventType: pack.eventType,
        city: pack.city,
        guestCount: String(pack.guestCount),
        budget: String(pack.estimatedPrice),
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Saved Curated Packages</Text>
              <Text style={styles.subtitle}>Bundled celebrations with transparent benchmarks</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {packages.length === 0 ? (
              <EmptyStateCard
                icon={<Package size={32} color="#D2AD6B" />}
                title="No Saved Packages Yet"
                description="Explore starter celebration packages on the home screen to shortlist complete bundles."
                actionText="Explore Packages"
                onAction={() => {
                  onClose();
                  router.push('/(tabs)');
                }}
              />
            ) : (
              packages.map((pack) => (
                <PackageCard
                  key={pack.id}
                  pack={pack}
                  onInquire={() => handleInquirePackage(pack)}
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
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
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
  scroll: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#2A121E',
  },
  cardBody: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    color: '#8A6A23',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceText: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '900',
  },
  titleText: {
    color: '#2D2025',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  taglineText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  servicePill: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  servicePillText: {
    color: '#4A3E44',
    fontSize: 10,
    fontWeight: '700',
  },
  inquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  inquireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
