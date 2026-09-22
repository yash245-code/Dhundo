import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BugSeverity, BugStatus } from '@dhundo/shared';
import { borderRadius, typography, spacing } from '../theme';

// ─── Severity Badge ───────────────────────────────────────────────────────────

interface SeverityBadgeProps {
  severity: BugSeverity;
}

const SEVERITY_LABELS: Record<BugSeverity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { theme, isDark } = useTheme();
  const colors = theme.severity[severity];

  const dotColor = colors.text;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        isDark && {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {SEVERITY_LABELS[severity].toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: BugStatus;
}

const STATUS_LABELS: Record<BugStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { theme, isDark } = useTheme();
  const colors = theme.status[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        isDark && {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {STATUS_LABELS[status].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
