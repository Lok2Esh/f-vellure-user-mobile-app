import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { theme } from '../../constants/theme';

interface CalendarModalProps {
  visible: boolean;
  currentDate: string;
  onClose: () => void;
  onDateSelect: (dateString: string, formattedDate: string) => void;
}

export function CalendarModal({ visible, currentDate, onClose, onDateSelect }: CalendarModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center px-5" style={{ backgroundColor: theme.colors.background.modalOverlay }}>
        <View className="w-full p-5 rounded-[24px] shadow-2xl elevation-xl border" 
              style={{ backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.medium }}>
          
          <Calendar
            current={currentDate}
            onDayPress={(day: any) => {
              const d = new Date(day.timestamp);
              const formattedDate = d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              onDateSelect(day.dateString, formattedDate);
            }}
            theme={{
              backgroundColor: theme.colors.background.primary,
              calendarBackground: theme.colors.background.primary,
              textSectionTitleColor: theme.colors.text.disabled,
              selectedDayBackgroundColor: theme.colors.brand.burgundyLight,
              selectedDayTextColor: theme.colors.text.inverse,
              todayTextColor: theme.colors.brand.goldDark,
              dayTextColor: theme.colors.text.secondary,
              textDisabledColor: '#D9e1e8',
              arrowColor: theme.colors.brand.burgundyLight,
              monthTextColor: theme.colors.brand.burgundyDark,
              indicatorColor: theme.colors.brand.burgundyLight,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 11
            }}
            markedDates={{
              [currentDate]: { 
                selected: true, 
                disableTouchEvent: true, 
                selectedColor: theme.colors.brand.burgundyLight, 
                selectedTextColor: theme.colors.text.inverse 
              }
            }}
            style={{ borderRadius: 16, paddingBottom: 10 }}
          />
          
          <TouchableOpacity 
            className="mt-3 py-3.5 rounded-xl border items-center"
            style={{ backgroundColor: theme.colors.background.cancelBtn, borderColor: theme.colors.border.goldSoft }}
            onPress={onClose}
          >
            <Text className="font-bold text-[14px] tracking-wide" style={{ color: theme.colors.brand.burgundyDark }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
