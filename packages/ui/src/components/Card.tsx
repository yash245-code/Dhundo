import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, shadows, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: boolean;
  glow?: boolean;
  cyberAccent?: boolean;
  testID?: string;
}

export function Card({
  children,
  style,
  elevation = 'sm',
  padding = true,
  glow = false,
  cyberAccent = false,
  testID,
}: CardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? theme.colors.surface : theme.colors.surface,
          borderColor: glow ? (theme.colors.borderGlow || theme.colors.primary) : theme.colors.border,
        },
        isDark && glow && {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 4,
        },
        !isDark && elevation !== 'none' && shadows[elevation],
        padding && styles.padding,
        style,
      ]}
    >
      {cyberAccent && (
        <View
          style={[
            styles.cyberAccentBar,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cyberAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  padding: {
    padding: spacing[4],
  },
});
