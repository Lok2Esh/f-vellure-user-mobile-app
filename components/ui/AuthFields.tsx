import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';
import { PrimaryPill } from './LuxuryLayout';
import { VellureTextInput, VellureTextInputProps } from './VellureControls';

export function AuthField({ label, icon: Icon, ...props }: VellureTextInputProps & { label: string; icon: LucideIcon }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Icon size={17} color={colors.primary} strokeWidth={1.6} />
        <VellureTextInput {...props} style={[styles.input, props.style]} />
      </View>
    </View>
  );
}

export function AuthSubmit({ label, onPress }: { label: string; onPress: () => void }) {
  return <PrimaryPill label={label} onPress={onPress} style={styles.submit} />;
}

export function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.line} /><Text style={styles.or}>OR CONTINUE WITH</Text><View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 13 },
  label: { color: colors.textPrimary, fontSize: 10.5, fontWeight: '700', marginBottom: 7, marginLeft: 2 },
  field: { minHeight: 52, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  input: { flex: 1, height: 50, color: colors.textPrimary, fontSize: 12.5 },
  submit: { marginTop: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  or: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
});
