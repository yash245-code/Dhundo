import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@dhundo/ui';
import { useAuthStore, configureApiClient } from '@dhundo/shared';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, accessToken, refreshToken, setAccessToken, clearAuth } = useAuthStore();

  useEffect(() => {
    // Wire up the API client with token getters and callbacks
    configureApiClient({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      onTokenRefreshed: setAccessToken,
      onAuthFailed: clearAuth,
    });
  }, [accessToken, refreshToken]);

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#000000' : theme.colors.background }]}>
      <View
        style={[
          styles.webShell,
          {
            backgroundColor: theme.colors.background,
            borderColor: isDark ? '#162032' : theme.colors.border,
          },
        ]}
      >
        <NavigationContainer>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <RootNavigator isAuthenticated={isAuthenticated} />
        </NavigationContainer>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    ...(Platform.OS === 'web'
      ? {
          borderLeftWidth: 1,
          borderRightWidth: 1,
          boxShadow: '0 0 50px rgba(0, 240, 255, 0.03)',
        }
      : {}),
  },
});
