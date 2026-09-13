import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthShell } from '../../components/ui/AuthShell';
import { AuthSubmit } from '../../components/ui/AuthFields';
import { VellureTextInput } from '../../components/ui/VellureControls';
import { colors, typography } from '../../constants/theme';

export default function OtpScreen() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = useRef<Array<TextInput | null>>([]);
  return (
    <AuthShell title="Verify Your Number" subtitle="We sent a four-digit code to +91 98765 43210.">
      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <VellureTextInput
            key={index}
            ref={(node) => { refs.current[index] = node; }}
            value={digit}
            onChangeText={(value) => {
              const next = [...digits];
              next[index] = value.slice(-1);
              setDigits(next);
              if (value && index < 3) refs.current[index + 1]?.focus();
            }}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.otp}
          />
        ))}
      </View>
      <Text style={styles.timer}>Resend code in <Text style={styles.timerStrong}>00:42</Text></Text>
      <AuthSubmit label="Verify & Continue" onPress={() => router.replace('/event-setup')} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 11 },
  otp: { width: 58, height: 62, borderRadius: 17, textAlign: 'center', color: colors.primary, fontFamily: typography.serif, fontSize: 24, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderMedium },
  timer: { color: colors.textSecondary, fontSize: 10.5, textAlign: 'center', marginVertical: 18 },
  timerStrong: { color: colors.primary, fontWeight: '700' },
});
