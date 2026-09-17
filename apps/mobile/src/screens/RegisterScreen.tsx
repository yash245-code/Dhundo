import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, TextInput, useTheme } from '@dhundo/ui';
import { authApi, useAuthStore } from '@dhundo/shared';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ name: '', officeId: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const { name, officeId, email, password } = form;
    if (!name || !officeId || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.register({
        name,
        officeId: officeId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      setAuth(res.data.data as any);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your office ID must be pre-approved by an admin.
          </Text>

          <View style={styles.fields}>
            <TextInput label="Full Name" placeholder="Your name" value={form.name} onChangeText={update('name')} testID="reg-name-input" />
            <TextInput label="Office ID" placeholder="e.g. EMP001" value={form.officeId} onChangeText={update('officeId')} autoCapitalize="characters" testID="reg-officeid-input" />
            <TextInput label="Email" placeholder="you@company.com" value={form.email} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none" testID="reg-email-input" />
            <TextInput label="Password" placeholder="Min. 8 characters" value={form.password} onChangeText={update('password')} secureTextEntry testID="reg-password-input" />

            {error ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
            ) : null}

            <Button label="Create Account" onPress={handleRegister} isLoading={isLoading} testID="reg-submit-button" />
            <Button
              label="Back to Sign In"
              onPress={() => navigation.goBack()}
              variant="ghost"
              testID="reg-back-button"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: 16, borderWidth: 1, padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: -8 },
  fields: { gap: 12 },
  error: { fontSize: 13 },
});
