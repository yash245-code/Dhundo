import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CyberHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showThemeToggle?: boolean;
  showTelemetryPulse?: boolean;
}

export function CyberHeader({
  title,
  subtitle,
  rightAction,
  showThemeToggle = true,
  showTelemetryPulse = true,
}: CyberHeaderProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? '#030508' : theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          {showTelemetryPulse && (
            <View
              style={[
                styles.pulseBadge,
                {
                  backgroundColor: isDark ? 'rgba(0, 255, 157, 0.12)' : '#EDF7F2',
                  borderColor: isDark ? 'rgba(0, 255, 157, 0.3)' : '#C6E8D5',
                },
              ]}
            >
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: isDark ? '#00FF9D' : '#3FA66B' },
                ]}
              />
              <Text
                style={[
                  styles.pulseText,
                  { color: isDark ? '#00FF9D' : '#3FA66B' },
                ]}
              >
                ONLINE
              </Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightCol}>
        {rightAction}
        {showThemeToggle && (
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark ? '#111624' : '#EEF2FA',
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.7}
            testID="theme-toggle-button"
          >
            <Text style={styles.toggleIcon}>{isDark ? '⚡' : '🌙'}</Text>
            <Text
              style={[
                styles.toggleText,
                { color: isDark ? theme.colors.primary : theme.colors.textPrimary },
              ]}
            >
              {isDark ? 'CYBER' : 'LIGHT'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  leftCol: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleIcon: {
    fontSize: 11,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
