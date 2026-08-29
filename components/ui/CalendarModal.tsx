import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../constants/theme';

interface CalendarModalProps {
  visible: boolean;
  currentDate?: string;
  onClose: () => void;
  onDateSelect: (dateString: string, formattedDate: string) => void;
}

export function CalendarModal({
  visible,
  currentDate = new Date().toISOString().split('T')[0],
  onClose,
  onDateSelect,
}: CalendarModalProps) {
  const safeDate = currentDate || new Date().toISOString().split('T')[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Event Date</Text>
          <Calendar
            current={safeDate}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day: any) => {
              if (!day?.timestamp) return;
              const d = new Date(day.timestamp);
              const formattedDate = d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              onDateSelect(day.dateString, formattedDate);
            }}
            theme={{
              backgroundColor: '#FDFBF7',
              calendarBackground: '#FDFBF7',
              textSectionTitleColor: '#8C7B73',
              selectedDayBackgroundColor: colors?.wine || '#78123C',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: colors?.gold || '#D2AD6B',
              dayTextColor: colors?.textPrimary || '#2D2025',
              textDisabledColor: '#D9D1C5',
              arrowColor: colors?.primary || '#641E3D',
              monthTextColor: colors?.primary || '#641E3D',
              indicatorColor: colors?.primary || '#641E3D',
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 17,
              textDayHeaderFontSize: 11,
            }}
            markedDates={{
              [safeDate]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: colors?.wine || '#78123C',
                selectedTextColor: '#FFFFFF',
              },
            }}
            style={styles.calendarStyle}
          />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cancel date selection"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    color: '#641E3D',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  calendarStyle: {
    borderRadius: 16,
    paddingBottom: 8,
    backgroundColor: '#FDFBF7',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FAF1E3',
    borderWidth: 1,
    borderColor: '#ECD8B5',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#641E3D',
    fontSize: 13,
    fontWeight: '800',
  },
});
