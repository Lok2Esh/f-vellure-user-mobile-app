import {
  VellureButton } from "@/components/ui/VellureControls";
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, ShieldCheck, Scale, FileText, Info } from 'lucide-react-native';
import { colors } from '../../constants/theme';

interface LegalInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LegalInfoModal({ visible, onClose }: LegalInfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>About Vellure & Legal Policies</Text>
              <Text style={styles.subtitle}>Trust, verification, and transparency guidelines</Text>
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* 1. About Vellure */}
            <View style={styles.article}>
              <View style={styles.articleHeader}>
                <Info size={15} color="#641E3D" />
                <Text style={styles.articleTitle}>About Vellure</Text>
              </View>
              <Text style={styles.bodyText}>
                Vellure is an AI-powered Indian event-planning and multi-vendor marketplace. We connect event hosts with verified local service providers—including heritage venues, artisanal caterers, bespoke decorators, cinematic photographers, and cultural artists across India.
              </Text>
            </View>

            {/* 2. Verification Process */}
            <View style={styles.article}>
              <View style={styles.articleHeader}>
                <ShieldCheck size={15} color="#2F7D62" />
                <Text style={styles.articleTitle}>Partner Verification Process</Text>
              </View>
              <Text style={styles.bodyText}>
                Partners marked as "Verified" have completed Vellure's onboarding check, which includes identity verification, portfolio review, and business credential review. Availability and quotes remain subject to direct confirmation by the partner.
              </Text>
            </View>

            {/* 3. Pricing Transparency */}
            <View style={styles.article}>
              <View style={styles.articleHeader}>
                <Scale size={15} color="#8A6A23" />
                <Text style={styles.articleTitle}>Pricing Transparency & Estimates</Text>
              </View>
              <Text style={styles.bodyText}>
                Prices shown on Vellure represent estimated benchmark rates or starting-from packages. Final quotes may vary depending on guest count, peak celebration dates, custom menu selections, and logistical requirements.
              </Text>
            </View>

            {/* 4. Privacy & Terms */}
            <View style={styles.article}>
              <View style={styles.articleHeader}>
                <FileText size={15} color="#641E3D" />
                <Text style={styles.articleTitle}>Privacy Policy & Data Security</Text>
              </View>
              <Text style={styles.bodyText}>
                Your contact details are kept secure and shared exclusively with vendors you choose to consult. Vellure does not sell customer personal data to third parties.
              </Text>
            </View>

            {/* App Meta */}
            <View style={styles.metaCard}>
              <Text style={styles.metaTitle}>Vellure Mobile Customer Experience</Text>
              <Text style={styles.metaSub}>Version 1.0.0 (Release Candidate)</Text>
              <Text style={styles.metaSub}>© 2026 Vellure Technologies Pvt. Ltd. All rights reserved.</Text>
            </View>
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
  article: {
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  articleTitle: {
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '800',
  },
  bodyText: {
    color: '#4A3E44',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },
  metaCard: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  metaTitle: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaSub: {
    color: '#9A8E94',
    fontSize: 10,
    marginTop: 2,
  },
});
