import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Sparkles, Edit3, Bell, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react-native';
import { CustomerProfile } from '../../services/api';
import { colors } from '../../constants/theme';

interface ProfileHeaderProps {
  profile: CustomerProfile;
  unreadNotificationsCount?: number;
  onEditPress: () => void;
  onNotificationsPress: () => void;
  onSignInPress?: () => void;
}

export function ProfileHeader({
  profile,
  unreadNotificationsCount = 0,
  onEditPress,
  onNotificationsPress,
  onSignInPress,
}: ProfileHeaderProps) {
  const isGuest = !profile.isAuthenticated;

  const initials = profile.fullName
    ? profile.fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'H';

  // Mask sensitive contact details for display
  const maskedPhone = profile.phone
    ? profile.phone.replace(/(\+?\d{2,3}\s?\d{2})\d{3}(\d{3})/, '$1 *** $2')
    : 'Phone unlinked';

  const maskedEmail = profile.email
    ? profile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          {profile.phoneVerified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Identity Copy */}
        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            <View style={styles.vipPill}>
              <Sparkles size={11} color="#D2AD6B" />
              <Text style={styles.vipText}>
                {isGuest ? 'Guest Host' : 'Verified Event Host'}
              </Text>
            </View>
          </View>

          <Text style={styles.nameText} numberOfLines={1}>
            {profile.fullName || 'Welcome, Guest'}
          </Text>

          <View style={styles.metaRow}>
            <MapPin size={12} color="#8A7A70" />
            <Text style={styles.metaText}>{profile.primaryCity || 'India'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              {profile.phoneVerified ? 'Phone Verified' : 'Standard Account'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onNotificationsPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Open notification preferences"
          >
            <Bell size={17} color={colors.primary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.unreadDot}>
                <Text style={styles.unreadDotText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={isGuest && onSignInPress ? onSignInPress : onEditPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={isGuest ? 'Sign in to account' : 'Edit profile'}
          >
            <Edit3 size={17} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Guest Callout or Contact Preview */}
      {isGuest ? (
        <View style={styles.guestBanner}>
          <Text style={styles.guestTitle}>Sign in to save plans & sync across devices</Text>
          <TouchableOpacity
            style={styles.guestSignInBtn}
            onPress={onSignInPress}
            activeOpacity={0.85}
          >
            <Text style={styles.guestSignInText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contactBar}>
          <Text style={styles.contactText}>
            🔒 {maskedPhone} • {maskedEmail}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 16,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#641E3D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FAF1E3',
  },
  avatarInitials: {
    color: '#F4D374',
    fontSize: 20,
    fontWeight: '900',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2F7D62',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    marginBottom: 3,
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF1E3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  vipText: {
    color: '#8A6A23',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  nameText: {
    color: '#2D2025',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    color: '#A08F7E',
    fontSize: 10,
  },
  actionsCol: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#641E3D',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadDotText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  guestBanner: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestTitle: {
    color: '#786B70',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  guestSignInBtn: {
    backgroundColor: '#641E3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  guestSignInText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  contactBar: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7EFE2',
  },
  contactText: {
    color: '#8A7A70',
    fontSize: 11,
    fontWeight: '600',
  },
});
