import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, Bell, Mail, MessageSquare, Sparkles, Tag, Shield } from 'lucide-react-native';
import {
  NotificationPreferences,
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from '../../services/api';
import { colors } from '../../constants/theme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    vendorResponses: true,
    quoteUpdates: true,
    eventReminders: true,
    planningRecommendations: true,
    partnerOffers: false,
    emailMarketing: false,
    smsMarketing: true,
    pushEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchNotificationPreferences().then((p) => {
        setPrefs(p);
        setIsLoading(false);
      });
    }
  }, [visible]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await saveNotificationPreferences(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notification Settings</Text>
              <Text style={styles.subtitle}>Manage quotation alerts and updates</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color="#641E3D" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* Essential Updates */}
              <Text style={styles.sectionHeading}>Essential Service Notifications</Text>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Vendor Responses</Text>
                  <Text style={styles.rowDesc}>Immediate alerts when a partner replies to your enquiry</Text>
                </View>
                <Switch
                  value={prefs.vendorResponses}
                  onValueChange={() => handleToggle('vendorResponses')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Quotation Updates</Text>
                  <Text style={styles.rowDesc}>Notifies when official quote sheets are ready</Text>
                </View>
                <Switch
                  value={prefs.quoteUpdates}
                  onValueChange={() => handleToggle('quoteUpdates')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Event Milestones & Reminders</Text>
                  <Text style={styles.rowDesc}>Checklist reminders for booking key vendors on time</Text>
                </View>
                <Switch
                  value={prefs.eventReminders}
                  onValueChange={() => handleToggle('eventReminders')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Marketing & Offers */}
              <Text style={styles.sectionHeading}>Recommendations & Perks</Text>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>AI Planning Suggestions</Text>
                  <Text style={styles.rowDesc}>Personalized package breakdowns based on your city</Text>
                </View>
                <Switch
                  value={prefs.planningRecommendations}
                  onValueChange={() => handleToggle('planningRecommendations')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Partner Benefits & Perks</Text>
                  <Text style={styles.rowDesc}>Seasonal upgrades and complimentary partner value-adds</Text>
                </View>
                <Switch
                  value={prefs.partnerOffers}
                  onValueChange={() => handleToggle('partnerOffers')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Delivery Channels */}
              <Text style={styles.sectionHeading}>Delivery Channels</Text>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Push Notifications</Text>
                  <Text style={styles.rowDesc}>In-app and mobile device banner notifications</Text>
                </View>
                <Switch
                  value={prefs.pushEnabled}
                  onValueChange={() => handleToggle('pushEnabled')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>SMS Enquiry Alerts</Text>
                  <Text style={styles.rowDesc}>Critical quotation alerts via verified SMS</Text>
                </View>
                <Switch
                  value={prefs.smsMarketing}
                  onValueChange={() => handleToggle('smsMarketing')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Email Digests</Text>
                  <Text style={styles.rowDesc}>Weekly event blueprint status summaries</Text>
                </View>
                <Switch
                  value={prefs.emailMarketing}
                  onValueChange={() => handleToggle('emailMarketing')}
                  trackColor={{ false: '#EFE3CF', true: '#641E3D' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>
          )}
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
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 28,
  },
  sectionHeading: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  rowInfo: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
  },
  rowDesc: {
    color: '#786B70',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
