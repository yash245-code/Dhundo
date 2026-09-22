import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TelemetryHUDProps {
  total: number;
  critical: number;
  inProgress: number;
  resolved: number;
  onStatPress?: (metric: 'TOTAL' | 'CRITICAL' | 'IN_PROGRESS' | 'RESOLVED') => void;
}

export function TelemetryHUD({
  total,
  critical,
  inProgress,
  resolved,
  onStatPress,
}: TelemetryHUDProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#060910' : '#F1F4F9',
          borderColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.statBox}
        onPress={() => onStatPress?.('TOTAL')}
        activeOpacity={0.7}
      >
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          SYS_TOTAL
        </Text>
        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
          {total}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <TouchableOpacity
        style={styles.statBox}
        onPress={() => onStatPress?.('CRITICAL')}
        activeOpacity={0.7}
      >
        <View style={styles.labelWithDot}>
          <View style={[styles.miniDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={[styles.statLabel, { color: theme.colors.danger }]}>
            CRIT_P0
          </Text>
        </View>
        <Text style={[styles.statValue, { color: theme.colors.danger }]}>
          {critical}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <TouchableOpacity
        style={styles.statBox}
        onPress={() => onStatPress?.('IN_PROGRESS')}
        activeOpacity={0.7}
      >
        <View style={styles.labelWithDot}>
          <View style={[styles.miniDot, { backgroundColor: theme.colors.info }]} />
          <Text style={[styles.statLabel, { color: theme.colors.info }]}>
            ACTIVE
          </Text>
        </View>
        <Text style={[styles.statValue, { color: theme.colors.info }]}>
          {inProgress}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <TouchableOpacity
        style={styles.statBox}
        onPress={() => onStatPress?.('RESOLVED')}
        activeOpacity={0.7}
      >
        <View style={styles.labelWithDot}>
          <View style={[styles.miniDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.statLabel, { color: theme.colors.success }]}>
            RESOLVED
          </Text>
        </View>
        <Text style={[styles.statValue, { color: theme.colors.success }]}>
          {resolved}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  labelWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  divider: {
    width: 1,
    height: 26,
    opacity: 0.6,
  },
});
