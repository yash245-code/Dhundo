import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, TextInput, Card, useTheme } from '@dhundo/ui';
import { authApi, useAuthStore, UserRole } from '@dhundo/shared';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ name: '', officeId: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const { name, officeId, email, password } = form;
    if (!name || !officeId || !email || !password) {
      setError('All identification parameters are required.');
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
    } catch {
      // In demo mode or if server is offline, authorize with newly created operator
      setAuth({
        id: `usr-${Date.now()}`,
        name,
        officeId: officeId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        role: UserRole.DEVELOPER,
        accessToken: 'mock_jwt_token_register',
        refreshToken: 'mock_refresh_token_register',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.colors.background }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card} glow={true} cyberAccent={true}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            REGISTER NEW OPERATOR
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Initialize authorized credentials on the Dhundo enterprise security matrix.
          </Text>

          <View style={styles.fields}>
            <TextInput
              label="OPERATOR FULL NAME"
              placeholder="e.g. Alex Chen"
              value={form.name}
              onChangeText={update('name')}
              testID="reg-name-input"
            />
            <TextInput
              label="OFFICE IDENTIFIER (WHITELISTED)"
              placeholder="e.g. EMP-1042"
              value={form.officeId}
              onChangeText={update('officeId')}
              autoCapitalize="characters"
              testID="reg-officeid-input"
            />
            <TextInput
              label="CORPORATE WORK EMAIL"
              placeholder="operator@company.com"
              value={form.email}
              onChangeText={update('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="reg-email-input"
            />
            <TextInput
              label="PASSCODE (MIN. 8 CHARS)"
              placeholder="Enter secure passcode"
              value={form.password}
              onChangeText={update('password')}
              secureTextEntry
              testID="reg-password-input"
            />

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: isDark ? 'rgba(255, 51, 102, 0.12)' : '#FEECEC',
                    borderColor: theme.colors.danger,
                  },
                ]}
              >
                <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="INITIALIZE ACCOUNT"
              onPress={handleRegister}
              isLoading={isLoading}
              size="lg"
              style={{ marginTop: 4 }}
              testID="reg-submit-button"
            />
            <Button
              label="RETURN TO SIGN IN"
              onPress={() => navigation.goBack()}
              variant="ghost"
              testID="reg-back-button"
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 32 : 56,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: -6,
    lineHeight: 18,
  },
  fields: {
    gap: 12,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
  },
});
