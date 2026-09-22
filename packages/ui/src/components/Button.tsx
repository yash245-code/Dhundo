import React from 'react';
import {
  View,
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
  icon?: React.ReactNode;
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
  icon,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const containerStyles: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size],
    ...(isPrimary && {
      backgroundColor: disabled ? (isDark ? '#1E293B' : theme.colors.border) : theme.colors.primary,
      ...(isDark && !disabled && {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 4,
      }),
    }),
    ...(isSecondary && {
      backgroundColor: isDark ? theme.colors.surface : theme.colors.surface,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.border : theme.colors.border,
    }),
    ...(isDanger && {
      backgroundColor: disabled ? (isDark ? '#1E293B' : theme.colors.border) : theme.colors.danger,
      ...(isDark && !disabled && {
        shadowColor: theme.colors.danger,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 4,
      }),
    }),
    ...(isGhost && {
      backgroundColor: 'transparent',
    }),
    opacity: disabled || isLoading ? 0.5 : 1,
    ...style,
  };

  const labelColor = isPrimary
    ? isDark
      ? '#020617' // high-contrast obsidian black on glowing cyan
      : '#FFFFFF'
    : isDanger
      ? '#FFFFFF'
      : isGhost
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
        <>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: labelColor,
                fontWeight: isPrimary ? '700' : '600',
                letterSpacing: 0.3,
                ...labelSizeStyles[size],
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
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
