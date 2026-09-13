import React, { useState } from 'react';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { AuthShell } from '../../components/ui/AuthShell';
import { AuthField, AuthSubmit } from '../../components/ui/AuthFields';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  return (
    <AuthShell title="Reset Your Password" subtitle="Enter your registered email and we’ll send a secure verification code.">
      <AuthField label="Email address" icon={Mail} value={email} onChangeText={setEmail} placeholder="sneha@example.com" autoCapitalize="none" />
      <AuthSubmit label="Send Verification Code" onPress={() => router.push('/auth/otp')} />
    </AuthShell>
  );
}
