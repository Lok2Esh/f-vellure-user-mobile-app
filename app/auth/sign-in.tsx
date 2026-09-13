import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Apple, LockKeyhole, Mail, Phone } from 'lucide-react-native';
import { AuthShell } from '../../components/ui/AuthShell';
import { AuthField, AuthSubmit, OrDivider } from '../../components/ui/AuthFields';
import { VellureButton } from '../../components/ui/VellureControls';
import { colors, typography } from '../../constants/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to continue planning extraordinary moments." footer={<Text style={styles.footer}>New to Vellure? <Text style={styles.link} onPress={() => router.push('/auth/create-account')}>Create an account</Text></Text>}>
      <AuthField label="Email or phone number" icon={Mail} value={email} onChangeText={setEmail} placeholder="sneha@example.com" autoCapitalize="none" />
      <AuthField label="Password" icon={LockKeyhole} value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
      <VellureButton onPress={() => router.push('/auth/forgot-password')}><Text style={styles.forgot}>Forgot password?</Text></VellureButton>
      <AuthSubmit label="Sign In" onPress={() => router.replace('/(tabs)')} />
      <OrDivider />
      <View style={styles.socialRow}>
        <VellureButton style={styles.social}><Text style={styles.google}>G</Text></VellureButton>
        <VellureButton style={styles.social}><Apple size={20} color={colors.textPrimary} fill={colors.textPrimary} /></VellureButton>
        <VellureButton style={styles.social}><Phone size={19} color={colors.success} /></VellureButton>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgot: { color: colors.primary, fontSize: 10.5, fontWeight: '600', textAlign: 'right', marginTop: -4, marginBottom: 6 },
  socialRow: { flexDirection: 'row', gap: 10 },
  social: { flex: 1, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderLight },
  google: { color: '#B44739', fontSize: 18, fontWeight: '800' },
  footer: { color: colors.textSecondary, fontSize: 11 },
  link: { color: colors.primary, fontFamily: typography.serif, textDecorationLine: 'underline' },
});
