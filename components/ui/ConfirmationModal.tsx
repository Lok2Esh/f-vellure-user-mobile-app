import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  HelpCircle,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { VellureButton } from './VellureControls';

export type ConfirmationModalIcon = 'trash' | 'alert' | 'logout' | 'help' | 'info' | 'sparkles';

export type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: ConfirmationModalIcon;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  icon = 'trash',
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!visible) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 size={24} color="#B63A4A" strokeWidth={2.2} />;
      case 'logout':
        return <LogOut size={24} color="#641E3D" strokeWidth={2.2} />;
      case 'alert':
        return <AlertTriangle size={24} color="#D97706" strokeWidth={2.2} />;
      case 'sparkles':
        return <Sparkles size={24} color="#D2AD6B" strokeWidth={2.2} />;
      case 'info':
        return <Info size={24} color="#287857" strokeWidth={2.2} />;
      default:
        return <HelpCircle size={24} color="#641E3D" strokeWidth={2.2} />;
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case 'trash':
        return '#FDE8EA';
      case 'logout':
        return '#FAF5EC';
      case 'alert':
        return '#FEF3C7';
      case 'sparkles':
        return '#FAF5EC';
      case 'info':
        return '#E6F4EA';
      default:
        return '#FAF5EC';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.dialogCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Icon Badge */}
          <View style={[styles.iconCircle, { backgroundColor: getIconBgColor() }]}>
            {renderIcon()}
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <VellureButton
              onPress={onClose}
              style={styles.cancelBtn}
              accessibilityLabel={cancelText}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </VellureButton>

            <VellureButton
              onPress={() => {
                onConfirm();
                onClose();
              }}
              style={[
                styles.confirmBtn,
                isDestructive ? styles.confirmBtnDestructive : styles.confirmBtnPrimary,
              ]}
              accessibilityLabel={confirmText}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </VellureButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    ...Platform.select({
      ios: {
        shadowColor: '#2A121E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 12px 36px rgba(42, 18, 30, 0.18)',
      } as any,
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#2A121E',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    color: '#786B70',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#786B70',
    fontSize: 12.5,
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDestructive: {
    backgroundColor: '#B63A4A',
    shadowColor: '#B63A4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnPrimary: {
    backgroundColor: '#641E3D',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
