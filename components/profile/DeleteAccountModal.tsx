import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle, Trash2 } from 'lucide-react-native';
import { colors } from '../../constants/theme';
import { VellureInputField } from '../ui/VellureInputField';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

export function DeleteAccountModal({
  visible,
  onClose,
  onAccountDeleted,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE in the box below to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      onAccountDeleted();
      Alert.alert('Account Cleared', 'Your saved event plans, inquiries, and preferences have been permanently cleared.');
      onClose();
    }, 700);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <AlertTriangle size={20} color="#B63A4A" />
            </View>
            <VellureButton onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#2D2025" />
            </VellureButton>
          </View>

          <Text style={styles.title}>Delete Vellure Account?</Text>
          <Text style={styles.sub}>
            This action cannot be undone. All your saved event blueprints, quotation requests, shortlisted partners, and personal preferences will be permanently erased.
          </Text>

          <VellureInputField
            label="Type DELETE to confirm"
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="DELETE"
            autoCapitalize="characters"
            containerStyle={{ marginBottom: 14 }}
          />

          <View style={styles.actionsRow}>
            <VellureButton style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Keep Account</Text>
            </VellureButton>

            <VellureButton
              style={[
                styles.deleteBtn,
                confirmText.trim().toUpperCase() !== 'DELETE' && styles.deleteBtnDisabled,
              ]}
              onPress={handleDelete}
              disabled={confirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
              activeOpacity={0.88}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Trash2 size={14} color="#FFFFFF" />
                  <Text style={styles.deleteBtnText}>Delete Permanently</Text>
                </>
              )}
            </VellureButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    color: '#B63A4A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  sub: {
    color: '#786B70',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#2D2025',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 18,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#786B70',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B63A4A',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
