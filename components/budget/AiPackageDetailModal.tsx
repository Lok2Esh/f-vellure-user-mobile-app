import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Layers } from 'lucide-react-native';
import { router } from 'expo-router';
import { EventInquiryModal } from '../inquiry/EventInquiryModal';
import { VellureText } from '../ui/VellureText';
import { colors } from '../../constants/theme';
import {
  AiCuratedPackage,
  PackageServiceItem,
  PackageAddon,
  useAiPackageDetails,
} from './hooks/useAiPackageDetails';
import { AiPackageHero } from './subcomponents/AiPackageHero';
import { AiPackagePricingCard } from './subcomponents/AiPackagePricingCard';
import { AiPackageRationaleCard } from './subcomponents/AiPackageRationaleCard';
import { AiPackageServiceItemRow } from './subcomponents/AiPackageServiceItemRow';
import { AiPackageAddonList } from './subcomponents/AiPackageAddonList';
import { AiPackageActionsBar } from './subcomponents/AiPackageActionsBar';

export type { AiCuratedPackage, PackageServiceItem, PackageAddon };

export interface AiPackageDetailModalProps {
  visible: boolean;
  onClose: () => void;
  pack: AiCuratedPackage | null;
  onSaved?: () => void;
}

export function AiPackageDetailModal({
  visible,
  onClose,
  pack,
  onSaved,
}: AiPackageDetailModalProps) {
  const {
    showInquiryModal,
    setShowInquiryModal,
    isSaved,
    selectedAddonIds,
    toggleAddon,
    addOnsTotal,
    dynamicTotal,
    formattedTotal,
    formattedPerGuest,
    handleSaveToPlans,
  } = useAiPackageDetails({ pack, onSaved });

  if (!pack) return null;

  const handleVendorPress = (vendorId?: string) => {
    if (!vendorId) return;
    onClose();
    router.push(`/vendor/${vendorId}`);
  };

  return (
    <>
      <Modal
        visible={visible && !showInquiryModal}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Header Hero Banner */}
            <AiPackageHero
              title={pack.title}
              tagline={pack.tagline}
              image={pack.image}
              badge={pack.badge}
              badgeColor={pack.badgeColor}
              city={pack.city}
              onClose={onClose}
            />

            {/* Scrollable Content Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* Specs and Pricing Breakdown */}
              <AiPackagePricingCard
                guestCount={pack.guestCount}
                servicesCount={pack.serviceItems.length}
                eventType={pack.eventType}
                formattedTotal={formattedTotal}
                formattedPerGuest={formattedPerGuest}
                savingsLabel={pack.savingsLabel}
                city={pack.city}
              />

              {/* AI Curation Rationale */}
              <AiPackageRationaleCard
                rationale={pack.rationale}
                highlights={pack.highlights}
              />

              {/* Included Services & Vendors */}
              <View style={styles.sectionHeader}>
                <Layers size={16} color={colors.primary} />
                <VellureText variant="title" weight="heavy">
                  Included Services & Vendors ({pack.serviceItems.length})
                </VellureText>
              </View>

              {pack.serviceItems.map((item, idx) => (
                <AiPackageServiceItemRow
                  key={item.id || idx}
                  item={item}
                  onVendorPress={handleVendorPress}
                />
              ))}

              {/* AI Suggested Add-Ons & Upgrades */}
              <AiPackageAddonList
                addOns={pack.addOns || []}
                selectedAddonIds={selectedAddonIds}
                onToggleAddon={toggleAddon}
                basePrice={pack.totalPrice}
                addOnsTotal={addOnsTotal}
                formattedTotal={formattedTotal}
                formattedPerGuest={formattedPerGuest}
              />

              {/* Guarantee and Sticky Bottom Actions */}
              <AiPackageActionsBar
                isSaved={isSaved}
                formattedTotal={formattedTotal}
                onSaveToPlans={handleSaveToPlans}
                onOpenInquiry={() => setShowInquiryModal(true)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Inquiry Form Modal */}
      <EventInquiryModal
        visible={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        targetId={pack.id}
        targetName={
          pack.title +
          (selectedAddonIds.length > 0 ? ` (+${selectedAddonIds.length} Add-Ons)` : '')
        }
        targetCategory="Curated Package"
        isPackage={true}
        initialCity={pack.city}
        initialBudget={dynamicTotal}
        initialGuestCount={pack.guestCount}
        initialEventType={pack.eventType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    height: '92%',
    overflow: 'hidden',
  },
  scrollBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
});
