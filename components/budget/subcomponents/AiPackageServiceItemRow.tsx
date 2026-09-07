import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Store, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { VellureCard } from '../../ui/VellureCard';
import { VellureText } from '../../ui/VellureText';
import { VellureBadge } from '../../ui/VellureBadge';
import { RatingDisplay } from '../../ui/RatingDisplay';
import { PriceDisplay } from '../../ui/PriceDisplay';
import { colors } from '../../../constants/theme';
import { PackageServiceItem } from '../hooks/useAiPackageDetails';

export interface AiPackageServiceItemRowProps {
  item: PackageServiceItem;
  onVendorPress: (vendorId?: string) => void;
}

export function AiPackageServiceItemRow({
  item,
  onVendorPress,
}: AiPackageServiceItemRowProps) {
  return (
    <VellureCard variant="outlined" padding="medium" style={styles.serviceItemCard}>
      <View style={styles.serviceItemTop}>
        <VellureBadge
          label={item.category.toUpperCase()}
          tone="neutral"
          size="small"
        />
        <PriceDisplay
          price={item.estimatedCost}
          priceType="FIXED"
          size="medium"
        />
      </View>

      <VellureText variant="title" weight="heavy" style={styles.serviceItemTitle}>
        {item.serviceName}
      </VellureText>

      {/* Selected Vendor Profile Block */}
      <VellureCard
        variant="champagne"
        padding="small"
        onPress={() => onVendorPress(item.vendorId)}
        accessibilityLabel={`View full vendor details for ${item.vendorName}`}
        style={styles.vendorProfileBlock}
      >
        <View style={styles.vendorAvatarWrap}>
          {item.vendorImage ? (
            <Image source={{ uri: item.vendorImage }} style={styles.vendorAvatar} />
          ) : (
            <View style={styles.vendorAvatarPlaceholder}>
              <Store size={18} color={colors.goldDark} />
            </View>
          )}
          {item.verified ? (
            <View style={styles.avatarVerifiedBadge}>
              <ShieldCheck size={9} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          ) : null}
        </View>

        <View style={styles.vendorInfoCol}>
          <View style={styles.vendorNameRow}>
            <VellureText variant="body" weight="heavy" numberOfLines={1} style={styles.vendorNameText}>
              {item.vendorName}
            </VellureText>
            <ChevronRight size={14} color={colors.primary} />
          </View>

          <View style={styles.vendorMetaRow}>
            <VellureText variant="caption" color="secondary">
              Selected Partner
            </VellureText>
            {item.rating ? (
              <RatingDisplay rating={item.rating} reviewsCount={item.reviewsCount} size="small" />
            ) : null}
          </View>

          <VellureText variant="caption" color="brand" weight="bold">
            Click to view full vendor profile & portfolio →
          </VellureText>
        </View>
      </VellureCard>

      {item.priceNote ? (
        <VellureText variant="caption" color="muted" style={styles.servicePriceNote}>
          {item.priceNote}
        </VellureText>
      ) : null}

      {/* Deliverables List */}
      <View style={styles.deliverablesList}>
        {item.deliverables.map((deliv, dIdx) => (
          <View key={dIdx} style={styles.deliverableRow}>
            <View style={styles.bulletDot} />
            <VellureText variant="caption" color="primary" style={styles.deliverableText}>
              {deliv}
            </VellureText>
          </View>
        ))}
      </View>
    </VellureCard>
  );
}

const styles = StyleSheet.create({
  serviceItemCard: {
    marginBottom: 12,
  },
  serviceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceItemTitle: {
    marginTop: 2,
    marginBottom: 6,
  },
  vendorProfileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    gap: 10,
  },
  vendorAvatarWrap: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  vendorAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3E7B52',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  vendorInfoCol: {
    flex: 1,
    gap: 2,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendorNameText: {
    flex: 1,
  },
  vendorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 1,
  },
  servicePriceNote: {
    fontStyle: 'italic',
    marginBottom: 8,
  },
  deliverablesList: {
    borderTopWidth: 1,
    borderTopColor: '#F5EFEB',
    paddingTop: 8,
    gap: 4,
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  deliverableText: {
    flex: 1,
    lineHeight: 16,
  },
});
