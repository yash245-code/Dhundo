import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, TextInput, useTheme } from '@dhundo/ui';
import { authApi, useAuthStore } from '@dhundo/shared';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { setAuth } = useAuthStore();

  const [officeId, setOfficeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!officeId.trim() || !password) {
      setError('Please enter your office ID and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.login(officeId.trim().toUpperCase(), password);
      setAuth(res.data.data as any);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={[styles.container]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>🐛</Text>
          </View>
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>Dhundo</Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Internal Bug Tracker
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sign In</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Use your company office ID to continue
          </Text>

          <View style={styles.fields}>
            <TextInput
              label="Office ID"
              placeholder="e.g. EMP001"
              value={officeId}
              onChangeText={setOfficeId}
              autoCapitalize="characters"
              autoCorrect={false}
              testID="login-office-id-input"
            />
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="login-password-input"
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FEECEC', borderColor: '#F5C5C5' }]}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              testID="login-submit-button"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
            testID="login-register-link"
          >
            <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: -8,
  },
  fields: {
    gap: 12,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
  },
  registerLink: {
    alignItems: 'center',
    paddingTop: 4,
  },
  registerText: {
    fontSize: 14,
  },
});
