import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState,
  useEffect,
  useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  FolderKanban,
  FileText,
  Heart,
  Package,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  Bell,
  ShieldCheck,
  Headphones,
  HelpCircle,
  ShieldAlert,
  FileLock,
  LogOut,
  Trash2,
  Columns3,
  Flame,
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';

// Services & Models
import {
  CustomerProfile,
  ActiveEventPlan,
  EventInquiry,
  fetchCustomerProfile,
  fetchActiveEventPlan,
  fetchEventInquiries,
  fetchSavedVendorIds,
  fetchVendorsData,
} from '../../services/api';
import { getSelectedLocation, subscribeSelectedLocation } from '../../services/locationStore';
import { colors } from '../../constants/theme';

// Profile Components
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ActiveEventSnapshotCard } from '../../components/profile/ActiveEventSnapshotCard';
import { ActivitySummaryGrid } from '../../components/profile/ActivitySummaryGrid';
import { ProfileSection, ProfileMenuItem } from '../../components/profile/ProfileSection';

// Modal Flows
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { EventPreferencesModal } from '../../components/profile/EventPreferencesModal';
import { SavedLocationsModal } from '../../components/profile/SavedLocationsModal';
import { NotificationsModal } from '../../components/profile/NotificationsModal';
import { ConciergeModal } from '../../components/profile/ConciergeModal';
import { ReportVendorModal } from '../../components/profile/ReportVendorModal';
import { LegalInfoModal } from '../../components/profile/LegalInfoModal';
import { AccountSecurityModal } from '../../components/profile/AccountSecurityModal';
import { DeleteAccountModal } from '../../components/profile/DeleteAccountModal';
import { EnquiriesModal } from '../../components/profile/EnquiriesModal';
import { SavedVendorsModal } from '../../components/profile/SavedVendorsModal';
import { SavedPackagesModal } from '../../components/profile/SavedPackagesModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  // State
  const [profile, setProfile] = useState<CustomerProfile>({
    id: 'guest_user',
    fullName: 'Event Host',
    displayName: 'Host',
    primaryCity: 'Patiala',
    emailVerified: true,
    phoneVerified: true,
    isAuthenticated: true,
  });

  const [activePlan, setActivePlan] = useState<ActiveEventPlan | null>(null);
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [savedVendors, setSavedVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Visibility States
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [reportVendorOpen, setReportVendorOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [enquiriesOpen, setEnquiriesOpen] = useState(false);
  const [savedVendorsOpen, setSavedVendorsOpen] = useState(false);
  const [savedPackagesOpen, setSavedPackagesOpen] = useState(false);

  // Reusable Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    icon?: 'trash' | 'alert' | 'logout' | 'help' | 'info' | 'sparkles';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadData = useCallback(async () => {
    try {
      const [prof, plan, inqs, savedIds, vendorsData] = await Promise.all([
        fetchCustomerProfile(),
        fetchActiveEventPlan(),
        fetchEventInquiries(),
        fetchSavedVendorIds(),
        fetchVendorsData().catch(() => ({})),
      ]);

      const activeCity = getSelectedLocation().city;
      setProfile(prof ? { ...prof, primaryCity: activeCity || prof.primaryCity } : prof);
      setActivePlan(plan);
      setInquiries(inqs);

      const allVendors = Object.values(vendorsData).flat() as any[];
      const matched = allVendors.filter((v) => savedIds.includes(String(v.id)));
      setSavedVendors(matched);
    } catch (e) {
      console.error('Profile data load error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSelectedLocation((loc) => {
      setProfile((p) => (p ? { ...p, primaryCity: loc.city } : p));
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    setConfirmModal({
      visible: true,
      title: 'Log Out of Vellure',
      message: 'Are you sure you want to log out? Local preferences will be reset, while cloud data remains safe.',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'logout',
      onConfirm: () => {
        setProfile({
          id: 'guest_user',
          fullName: 'Guest Host',
          displayName: 'Guest',
          primaryCity: 'Patiala',
          emailVerified: false,
          phoneVerified: false,
          isAuthenticated: false,
        });
      },
    });
  };

  const quotesReceivedCount = inquiries.filter(
    (i) => i.status === 'Quote Ready' || (i.quoteAmount && i.quoteAmount > 0)
  ).length;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#641E3D" />
        <Text style={styles.loadingText}>Loading Host Account Center...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.container}>
          {/* ──── SECTION 1: PREMIUM PROFILE HEADER ──── */}
          <ProfileHeader
            profile={profile}
            unreadNotificationsCount={quotesReceivedCount}
            onEditPress={() => setEditProfileOpen(true)}
            onNotificationsPress={() => setNotificationsOpen(true)}
            onSignInPress={() => setEditProfileOpen(true)}
          />

          {/* ──── SECTION 2: ACTIVE EVENT SNAPSHOT ──── */}
          <ActiveEventSnapshotCard
            plan={activePlan}
            onResumePlan={() => router.push('/(tabs)/budget')}
            onViewDetails={() => router.push('/(tabs)/plans')}
            onPlanNew={() => router.push('/(tabs)/budget')}
          />

          {/* ──── SECTION 3: ACTIVITY SUMMARY GRID (REAL COUNTS) ──── */}
          <ActivitySummaryGrid
            activePlansCount={activePlan ? 1 : 0}
            enquiriesCount={inquiries.length}
            savedVendorsCount={savedVendors.length}
            quotesReceivedCount={quotesReceivedCount}
            onPlansPress={() => router.push('/(tabs)/plans')}
            onEnquiriesPress={() => setEnquiriesOpen(true)}
            onSavedVendorsPress={() => setSavedVendorsOpen(true)}
            onQuotesPress={() => setEnquiriesOpen(true)}
          />

          {/* ──── SECTION 4: MY EVENT PLANNING ──── */}
          <ProfileSection
            title="My Event Planning"
            subtitle="Manage blueprints, shortlisted partners, and quotations"
          >
            <ProfileMenuItem
              icon={<FolderKanban size={17} color="#641E3D" />}
              title="My Events & Blueprints"
              description="Active and past celebration timelines"
              badgeValue={activePlan ? '1 Active' : undefined}
              badgeType="gold"
              onPress={() => router.push('/(tabs)/plans')}
            />
            <ProfileMenuItem
              icon={<FileText size={17} color="#641E3D" />}
              title="Enquiries and Quotes"
              description="Review quotation proposals from verified specialists"
              badgeValue={inquiries.length > 0 ? `${inquiries.length} Sent` : undefined}
              badgeType={quotesReceivedCount > 0 ? 'success' : 'default'}
              onPress={() => setEnquiriesOpen(true)}
            />
            <ProfileMenuItem
              icon={<Heart size={17} color="#641E3D" />}
              title="Saved Vendors Wishlist"
              description="Shortlisted venues, photographers, and caterers"
              badgeValue={savedVendors.length > 0 ? `${savedVendors.length} Saved` : undefined}
              onPress={() => setSavedVendorsOpen(true)}
            />
            <ProfileMenuItem
              icon={<Package size={17} color="#641E3D" />}
              title="Saved Curated Packages"
              description="Bundled celebrations with pre-negotiated rates"
              badgeValue="2 Bundles"
              onPress={() => setSavedPackagesOpen(true)}
            />
            <ProfileMenuItem
              icon={<SlidersHorizontal size={17} color="#641E3D" />}
              title="Event Preferences"
              description="Theme, dietary, and celebration priorities"
              isLast
              onPress={() => setPreferencesOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 5: PERSONALIZATION ──── */}
          <ProfileSection
            title="Personalization"
            subtitle="Tailor local suggestions and celebration styles"
          >
            <ProfileMenuItem
              icon={<MapPin size={17} color="#641E3D" />}
              title="Preferred City"
              description="Current host market"
              badgeValue={profile.primaryCity || 'Patiala'}
              badgeType="gold"
              onPress={() => setLocationsOpen(true)}
            />
            <ProfileMenuItem
              icon={<Columns3 size={17} color="#641E3D" />}
              title="Saved Locations & Venues"
              description="Residences, celebration palaces, and cities"
              onPress={() => setLocationsOpen(true)}
            />
            <ProfileMenuItem
              icon={<Sparkles size={17} color="#641E3D" />}
              title="Ceremony & Dietary Settings"
              description="Inclusive traditions and multi-cuisine preferences"
              isLast
              onPress={() => setPreferencesOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 6: NOTIFICATIONS & COMMUNICATION ──── */}
          <ProfileSection
            title="Notifications & Communication"
            subtitle="Configure quotation alerts, reminders, and digests"
          >
            <ProfileMenuItem
              icon={<Bell size={17} color="#641E3D" />}
              title="Notification Center & Alerts"
              description="Instant SMS, push, and email quote updates"
              badgeValue="Active"
              badgeType="success"
              onPress={() => setNotificationsOpen(true)}
            />
            <ProfileMenuItem
              icon={<Flame size={17} color="#641E3D" />}
              title="Partner Perks & Recommendations"
              description="Seasonal upgrades and exclusive partner offers"
              isLast
              onPress={() => setNotificationsOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 7: ACCOUNT AND SECURITY ──── */}
          <ProfileSection
            title="Account and Security"
            subtitle="Verified credentials, privacy controls, and data exports"
          >
            <ProfileMenuItem
              icon={<ShieldCheck size={17} color="#641E3D" />}
              title="Personal Information & Credentials"
              description="Linked mobile number and registered email"
              onPress={() => setSecurityOpen(true)}
            />
            <ProfileMenuItem
              icon={<FileLock size={17} color="#641E3D" />}
              title="Privacy Controls & Export Data"
              description="Manage data retention and download event summary"
              isLast
              onPress={() => setSecurityOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 8: SUPPORT AND CONCIERGE ──── */}
          <ProfileSection
            title="Support and Concierge"
            subtitle="Dedicated event advisor desk and safety help"
          >
            <ProfileMenuItem
              icon={<Headphones size={17} color="#641E3D" />}
              title="Vellure Event Concierge"
              description="Senior advisor helpline: 1800 200 4500 (9am-9pm IST)"
              badgeValue="Advisor Desk"
              badgeType="gold"
              onPress={() => setConciergeOpen(true)}
            />
            <ProfileMenuItem
              icon={<HelpCircle size={17} color="#641E3D" />}
              title="Help Center & FAQs"
              description="Common questions about booking and verification"
              onPress={() => setLegalOpen(true)}
            />
            <ProfileMenuItem
              icon={<ShieldAlert size={17} color="#B63A4A" />}
              title="Report a Vendor or Concern"
              description="Submit an inquiry to Vellure Trust & Safety"
              isLast
              onPress={() => setReportVendorOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 9: LEGAL AND INFORMATION ──── */}
          <ProfileSection
            title="About Vellure"
            subtitle="Transparent policies and marketplace terms"
          >
            <ProfileMenuItem
              icon={<FileText size={17} color="#641E3D" />}
              title="How Vellure Works & Policies"
              description="Verification standards, pricing transparency & privacy"
              badgeValue="v1.0.0"
              isLast
              onPress={() => setLegalOpen(true)}
            />
          </ProfileSection>

          {/* ──── SECTION 10: ACCOUNT ACTIONS ──── */}
          <View style={styles.accountActionsWrap}>
            <VellureButton
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Log out of account"
            >
              <LogOut size={16} color="#641E3D" />
              <Text style={styles.logoutBtnText}>Log Out of Account</Text>
            </VellureButton>

            <VellureButton
              style={styles.deleteAccountBtn}
              onPress={() => setDeleteAccountOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete Vellure account"
            >
              <Trash2 size={14} color="#B63A4A" />
              <Text style={styles.deleteAccountBtnText}>Clear Saved Data / Delete Account</Text>
            </VellureButton>
          </View>
        </View>
      </ScrollView>

      {/* ──── ALL SUB-SCREEN MODALS ──── */}
      <EditProfileModal
        visible={editProfileOpen}
        profile={profile}
        onClose={() => setEditProfileOpen(false)}
        onProfileUpdated={(updated) => setProfile(updated)}
      />

      <EventPreferencesModal
        visible={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        onSaved={loadData}
      />

      <SavedLocationsModal
        visible={locationsOpen}
        onClose={() => setLocationsOpen(false)}
      />

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <ConciergeModal
        visible={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
      />

      <ReportVendorModal
        visible={reportVendorOpen}
        onClose={() => setReportVendorOpen(false)}
      />

      <LegalInfoModal
        visible={legalOpen}
        onClose={() => setLegalOpen(false)}
      />

      <AccountSecurityModal
        visible={securityOpen}
        profile={profile}
        onClose={() => setSecurityOpen(false)}
      />

      <DeleteAccountModal
        visible={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onAccountDeleted={() => {
          setInquiries([]);
          setSavedVendors([]);
          setActivePlan(null);
        }}
      />

      <EnquiriesModal
        visible={enquiriesOpen}
        inquiries={inquiries}
        onClose={() => setEnquiriesOpen(false)}
      />

      <SavedVendorsModal
        visible={savedVendorsOpen}
        savedVendors={savedVendors}
        onClose={() => setSavedVendorsOpen(false)}
        onVendorRemoved={(id) => {
          setSavedVendors((prev) => prev.filter((v) => String(v.id) !== String(id)));
        }}
      />

      <SavedPackagesModal
        visible={savedPackagesOpen}
        onClose={() => setSavedPackagesOpen(false)}
      />

      {/* ⚠️ Reusable Confirmation Dialog */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Confirm'}
        cancelText={confirmModal.cancelText || 'Cancel'}
        isDestructive={confirmModal.isDestructive ?? true}
        icon={confirmModal.icon || 'logout'}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  centerScreen: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#641E3D',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
  scrollContent: {
    paddingTop: 52,
    paddingBottom: 40,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  accountActionsWrap: {
    marginTop: 10,
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    width: '100%',
    gap: 8,
  },
  logoutBtnText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  deleteAccountBtnText: {
    color: '#B63A4A',
    fontSize: 11,
    fontWeight: '700',
  },
});
