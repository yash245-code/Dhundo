import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();

  const containerStyles: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size],
    ...(variant === 'primary' && {
      backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
    }),
    ...(variant === 'secondary' && {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    }),
    ...(variant === 'danger' && {
      backgroundColor: disabled ? theme.colors.border : theme.colors.danger,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
    opacity: disabled || isLoading ? 0.6 : 1,
    ...style,
  };

  const labelColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.textPrimary;

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <Text style={[styles.label, { color: labelColor, ...labelSizeStyles[size] }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontWeight: typography.fontWeights.semibold,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], minHeight: 36 },
  md: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], minHeight: 46 },
  lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[6], minHeight: 54 },
};

const labelSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: typography.fontSizes.sm },
  md: { fontSize: typography.fontSizes.base },
  lg: { fontSize: typography.fontSizes.md },
};
