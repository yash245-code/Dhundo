import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTheme } from '@dhundo/ui';

import { RootStackParamList, MainTabParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { NewBugScreen } from '../screens/NewBugScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BugDetailScreen } from '../screens/BugDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { theme, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#05070D' : theme.colors.surface,
          borderTopColor: isDark ? '#141C2C' : theme.colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? '#5B6882' : theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const isCenterAction = route.name === 'NewBug';

          if (isCenterAction) {
            return (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -18,
                  borderWidth: 3,
                  borderColor: isDark ? '#05070D' : '#FFFFFF',
                  ...(isDark
                    ? {
                        shadowColor: theme.colors.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 10,
                        elevation: 6,
                      }
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      }),
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: isDark ? '#020617' : '#FFFFFF',
                    lineHeight: 24,
                  }}
                >
                  +
                </Text>
              </View>
            );
          }

          const cyberIcons: Record<string, string> = {
            Dashboard: '⚡',
            Projects: '◈',
            Notifications: '🔔',
            Profile: '👤',
          };

          return (
            <View style={{ alignItems: 'center', position: 'relative' }}>
              {focused && (
                <View
                  style={{
                    position: 'absolute',
                    top: -8,
                    width: 20,
                    height: 2,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 1,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                  }}
                />
              )}
              <Text style={{ fontSize: 18, color }}>
                {cyberIcons[route.name] || '•'}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'DASHBOARD' }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: 'PROJECTS' }} />
      <Tab.Screen
        name="NewBug"
        component={NewBugScreen}
        options={{
          title: 'REPORT',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'ALERTS' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'OPERATOR' }} />
    </Tab.Navigator>
  );
}

interface Props {
  isAuthenticated: boolean;
}

export function RootNavigator({ isAuthenticated }: Props) {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs as any} />
          <Stack.Screen name="BugDetail" component={BugDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
