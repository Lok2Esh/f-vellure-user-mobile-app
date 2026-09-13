import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';
import { VellureMark } from './LuxuryArtwork';
import { LuxuryScreen } from './LuxuryLayout';
import { VellureButton } from './VellureControls';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  style,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LuxuryScreen contentStyle={[styles.content, style]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topRow}>
          <VellureButton style={styles.back} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </VellureButton>
          <Text style={styles.wordmark}>Vellure</Text>
          <View style={styles.back} />
        </View>
        <View style={styles.mark}><VellureMark size={43} /></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.form}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  wordmark: { color: colors.primary, fontFamily: typography.serif, fontSize: 25 },
  mark: { alignItems: 'center', marginTop: 16 },
  title: { color: colors.primary, fontFamily: typography.serif, fontSize: 29, lineHeight: 35, textAlign: 'center', marginTop: 9 },
  subtitle: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, textAlign: 'center', paddingHorizontal: 22, marginTop: 5 },
  form: { marginTop: 25 },
  footer: { alignItems: 'center', marginTop: 20 },
});
