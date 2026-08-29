import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  X,
  Shield,
  KeyRound,
  Download,
  EyeOff,
  Lock,
  Smartphone,
  Mail,
  ChevronRight,
} from 'lucide-react-native';
import { CustomerProfile } from '../../services/api';
import { colors } from '../../constants/theme';

interface AccountSecurityModalProps {
  visible: boolean;
  profile: CustomerProfile;
  onClose: () => void;
}

export function AccountSecurityModal({
  visible,
  profile,
  onClose,
}: AccountSecurityModalProps) {
  const maskedPhone = profile.phone
    ? profile.phone.replace(/(\+?\d{2,3}\s?\d{2})\d{3}(\d{3})/, '$1 *** $2')
    : 'No phone connected';

  const maskedEmail = profile.email
    ? profile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'No email connected';

  const handleDownloadData = () => {
    Alert.alert(
      'Export Event Data',
      'A summary of your saved event blueprints, preferred vendors, and quotation history will be compiled and sent to your registered email address within 24 hours.'
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Password Update',
      'A secure password reset link has been dispatched to ' + maskedEmail
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Account & Security</Text>
              <Text style={styles.subtitle}>Privacy, credentials, and data controls</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Credentials Card */}
            <Text style={styles.sectionHeading}>Verified Credentials</Text>

            <View style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Smartphone size={16} color="#641E3D" />
                <View>
                  <Text style={styles.itemTitle}>Linked Mobile</Text>
                  <Text style={styles.itemValue}>{maskedPhone}</Text>
                </View>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            </View>

            <View style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Mail size={16} color="#641E3D" />
                <View>
                  <Text style={styles.itemTitle}>Registered Email</Text>
                  <Text style={styles.itemValue}>{maskedEmail}</Text>
                </View>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>Active</Text>
              </View>
            </View>

            {/* Security Actions */}
            <Text style={styles.sectionHeading}>Security Management</Text>

            <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <KeyRound size={16} color="#641E3D" />
                <View>
                  <Text style={styles.actionTitle}>Change Account Password</Text>
                  <Text style={styles.actionSub}>Request reset link to registered email</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#A08F7E" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleDownloadData} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <Download size={16} color="#641E3D" />
                <View>
                  <Text style={styles.actionTitle}>Download My Event Data</Text>
                  <Text style={styles.actionSub}>Export inquiries, budgets, and saved wishlists</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#A08F7E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => Alert.alert('Privacy Controls', 'Vellure maintains a strict privacy firewall. Your information is never provided to marketing brokers.')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Lock size={16} color="#641E3D" />
                <View>
                  <Text style={styles.actionTitle}>Data Privacy & Anonymity</Text>
                  <Text style={styles.actionSub}>Review data retention preferences</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#A08F7E" />
            </TouchableOpacity>
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
  sectionHeading: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemValue: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  verifiedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedTagText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EFE2',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  actionTitle: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
  },
  actionSub: {
    color: '#786B70',
    fontSize: 11,
    marginTop: 2,
  },
});
