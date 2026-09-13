import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { LockKeyhole, Mail, Phone, UserRound } from 'lucide-react-native';
import { AuthShell } from '../../components/ui/AuthShell';
import { AuthField, AuthSubmit } from '../../components/ui/AuthFields';
import { colors } from '../../constants/theme';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthShell title="Create Your Account" subtitle="Your beautifully organized celebration begins here." footer={<Text style={{ color: colors.textSecondary, fontSize: 10.5 }}>By continuing, you agree to Vellure’s Terms and Privacy Policy.</Text>}>
      <AuthField label="Full name" icon={UserRound} value={name} onChangeText={setName} placeholder="Sneha Iyer" />
      <AuthField label="Email address" icon={Mail} value={email} onChangeText={setEmail} placeholder="sneha@example.com" autoCapitalize="none" />
      <AuthField label="Mobile number" icon={Phone} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
      <AuthField label="Create password" icon={LockKeyhole} value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
      <AuthSubmit label="Create Account" onPress={() => router.push('/auth/otp')} />
    </AuthShell>
  );
}
