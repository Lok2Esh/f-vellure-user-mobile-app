import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Store, Star, BadgeCheck, MapPin, IndianRupee, ChevronRight, Send, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/theme';

export interface RecommendedVendor {
  id: string;
  name: string;
  category: string;
  rating?: number;
  ratingCount?: number;
  city: string;
  startingPrice: number;
  priceType?: string;
  imageUrl?: string;
  isVerified?: boolean;
}

export interface AiVendorRecommendationsProps {
  matchedVendors: Record<string, RecommendedVendor[]>;
  hostCity: string;
  onInquireVendor?: (vendor: RecommendedVendor) => void;
}

export function AiVendorRecommendations({
  matchedVendors,
  hostCity,
  onInquireVendor,
}: AiVendorRecommendationsProps) {
  const categoryKeys = Object.keys(matchedVendors).filter(
    (k) => matchedVendors[k] && matchedVendors[k].length > 0
  );

  if (categoryKeys.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Store size={12} color="#641E3D" />
            <Text style={styles.badgeText}>AI Matched Partners in {hostCity}</Text>
          </View>
          <Text style={styles.heading}>Verified Local Specialists</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(tabs)/vendors',
              params: { city: hostCity },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>View All ({hostCity})</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimerText}>
        * Starting rates shown. Final quotes and calendar availability require direct partner consultation.
      </Text>

      {categoryKeys.map((catKey) => {
        const vendorList = matchedVendors[catKey];
        const topVendor = vendorList[0];
        if (!topVendor) return null;

        return (
          <View key={catKey} style={styles.vendorCard}>
            <View style={styles.cardHeader}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{catKey}</Text>
              </View>
              <Text style={styles.priceEstimate}>
                Starting ₹{(topVendor.startingPrice || 50000).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.vendorBody}>
              {topVendor.imageUrl ? (
                <Image source={{ uri: topVendor.imageUrl }} style={styles.vendorImage} />
              ) : (
                <View style={styles.vendorImagePlaceholder}>
                  <Store size={20} color="#D2AD6B" />
                </View>
              )}

              <View style={styles.vendorInfo}>
                <View style={styles.vendorNameRow}>
                  <Text style={styles.vendorName}>{topVendor.name}</Text>
                  <BadgeCheck size={14} color="#D2AD6B" />
                </View>

                <View style={styles.vendorMetaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={11} color="#8A7A70" />
                    <Text style={styles.metaText}>{topVendor.city}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={11} color="#D2AD6B" fill="#D2AD6B" />
                    <Text style={styles.metaText}>
                      {topVendor.rating ? topVendor.rating.toFixed(1) : '4.9'} ({topVendor.ratingCount || 28})
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push(`/vendor/${topVendor.id}`)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`View portfolio for ${topVendor.name}`}
              >
                <Text style={styles.profileBtnText}>View Portfolio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inquireBtn}
                onPress={() => onInquireVendor && onInquireVendor(topVendor)}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={`Consult with ${topVendor.name}`}
              >
                <Send size={12} color="#FFFFFF" />
                <Text style={styles.inquireBtnText}>Request Consultation</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    color: '#641E3D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heading: {
    color: '#2D2025',
    fontSize: 16,
    fontWeight: '900',
  },
  viewAllText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  disclaimerText: {
    color: '#8A7A70',
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 12,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EC',
  },
  catBadge: {
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceEstimate: {
    color: '#2D2025',
    fontSize: 12,
    fontWeight: '800',
  },
  vendorBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vendorImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
  },
  vendorImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  vendorName: {
    color: '#2D2025',
    fontSize: 14,
    fontWeight: '900',
  },
  vendorMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EC',
    paddingVertical: 9,
    borderRadius: 10,
  },
  profileBtnText: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
  },
  inquireBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#641E3D',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  inquireBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
