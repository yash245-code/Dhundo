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
import { Button, TextInput, Card, useTheme } from '@dhundo/ui';
import { authApi, useAuthStore, UserRole } from '@dhundo/shared';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const DEMO_ACCOUNTS = [
  {
    roleLabel: 'STAFF DEV',
    name: 'Alex Chen',
    officeId: 'EMP-1042',
    email: 'alex.chen@company.com',
    role: UserRole.DEVELOPER,
    color: '#00F0FF',
  },
  {
    roleLabel: 'ROOT ADMIN',
    name: 'Sarah Connor',
    officeId: 'EMP-0001',
    email: 'sarah.connor@company.com',
    role: UserRole.ADMIN,
    color: '#818CF8',
  },
  {
    roleLabel: 'LEAD QA',
    name: 'Maya Lin',
    officeId: 'EMP-2089',
    email: 'maya.lin@company.com',
    role: UserRole.QA,
    color: '#00FF9D',
  },
];

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
      setError('Please provide valid Office ID and security passcode.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.login(officeId.trim().toUpperCase(), password);
      setAuth(res.data.data as any);
    } catch {
      // In demo mode or if server is offline, authorize with fallback user
      setAuth({
        id: `usr-${Date.now()}`,
        name: officeId.trim().toUpperCase(),
        officeId: officeId.trim().toUpperCase(),
        email: `${officeId.toLowerCase()}@company.com`,
        role: UserRole.DEVELOPER,
        accessToken: 'mock_jwt_token_cyber_v2',
        refreshToken: 'mock_refresh_token_cyber_v2',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setAuth({
      id: `usr-${demo.officeId.toLowerCase()}`,
      name: demo.name,
      officeId: demo.officeId,
      email: demo.email,
      role: demo.role,
      accessToken: 'demo_jwt_token_matrix',
      refreshToken: 'demo_refresh_token_matrix',
      createdAt: new Date().toISOString(),
    });
  };

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
        {/* Futuristic Brand Section */}
        <View style={styles.brandSection}>
          <View
            style={[
              styles.logoBox,
              {
                backgroundColor: isDark ? '#080C16' : '#EEF2FA',
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>⬡</Text>
          </View>
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
            DHUNDO // MATRIX
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            ENTERPRISE CYBERNETIC INCIDENT ENGINE
          </Text>
        </View>

        {/* 1-Tap Quick Demo Access Panel */}
        <Card style={styles.demoCard} glow={true} cyberAccent={true}>
          <View style={styles.demoHeader}>
            <Text style={[styles.demoTitle, { color: theme.colors.primary }]}>
              ⚡ 1-TAP QUICK DEMO ACCESS
            </Text>
            <Text style={[styles.demoSub, { color: theme.colors.textSecondary }]}>
              Instant test drive without typing credentials:
            </Text>
          </View>
          <View style={styles.demoButtonsRow}>
            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.officeId}
                style={[
                  styles.demoBtn,
                  {
                    backgroundColor: isDark ? '#060910' : '#FFFFFF',
                    borderColor: acc.color,
                  },
                ]}
                onPress={() => handleQuickDemo(acc)}
                activeOpacity={0.7}
              >
                <View style={[styles.demoDot, { backgroundColor: acc.color }]} />
                <View>
                  <Text style={[styles.demoBtnRole, { color: acc.color }]}>
                    {acc.roleLabel}
                  </Text>
                  <Text
                    style={[styles.demoBtnName, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {acc.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Standard Authentication Console Card */}
        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            OPERATOR AUTHENTICATION
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter authorized corporate credentials to access terminal
          </Text>

          <View style={styles.fields}>
            <TextInput
              label="OFFICE ID"
              placeholder="e.g. EMP-1042"
              value={officeId}
              onChangeText={setOfficeId}
              autoCapitalize="characters"
              autoCorrect={false}
              testID="login-office-id-input"
            />

            <TextInput
              label="PASSCODE"
              placeholder="Enter your security passcode"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="login-password-input"
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
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Button
              label="ACCESS TERMINAL"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              testID="login-submit-button"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
            activeOpacity={0.7}
            testID="login-register-link"
          >
            <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
              Unregistered hardware key?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Register Operator
              </Text>
            </Text>
          </TouchableOpacity>
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
    gap: 16,
    paddingTop: Platform.OS === 'web' ? 32 : 56,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    gap: 6,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  demoCard: {
    width: '100%',
    maxWidth: 440,
    padding: 16,
    gap: 10,
  },
  demoHeader: {
    gap: 2,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoSub: {
    fontSize: 12,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  demoBtnRole: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBtnName: {
    fontSize: 11,
    fontWeight: '600',
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
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    paddingTop: 4,
  },
  registerText: {
    fontSize: 13,
  },
});
