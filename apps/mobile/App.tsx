import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@dhundo/ui';
import { useAuthStore, configureApiClient } from '@dhundo/shared';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated, accessToken, refreshToken, setAccessToken, clearAuth } = useAuthStore();

  useEffect(() => {
    // Wire up the API client with token getters and callbacks
    configureApiClient({
      baseURL: 'http://localhost:4000/api/v1',
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      onTokenRefreshed: setAccessToken,
      onAuthFailed: clearAuth,
    });
  }, [accessToken, refreshToken]);

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
