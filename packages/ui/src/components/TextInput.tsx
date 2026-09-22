import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextInput({
  label,
  error,
  hint,
  containerStyle,
  leftIcon,
  rightIcon,
  ...props
}: TextInputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : isFocused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? theme.colors.primary : theme.colors.textPrimary,
              letterSpacing: 0.2,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: isDark ? (theme.colors.surfaceElevated || '#0B0F19') : theme.colors.surface,
            borderWidth: isFocused ? 1.5 : 1,
          },
          isDark && isFocused && {
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              paddingLeft: leftIcon ? 0 : spacing[3],
              paddingRight: rightIcon ? 0 : spacing[3],
            },
          ]}
          placeholderTextColor={isDark ? '#526078' : theme.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>}
      {hint && !error && (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    minHeight: 46,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    paddingVertical: spacing[3],
  },
  iconLeft: { paddingLeft: spacing[3], paddingRight: spacing[2] },
  iconRight: { paddingRight: spacing[3], paddingLeft: spacing[2] },
  error: { fontSize: typography.fontSizes.xs },
  hint: { fontSize: typography.fontSizes.xs },
});
