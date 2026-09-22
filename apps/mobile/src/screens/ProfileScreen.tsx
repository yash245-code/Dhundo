import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Card, Button, CyberHeader, useTheme } from '@dhundo/ui';
import { useAuthStore, UserRole } from '@dhundo/shared';

const ROLE_CLEARANCES: Record<string, string> = {
  EMPLOYEE: 'CLEARANCE LEVEL 1 // OPERATOR',
  DEVELOPER: 'CLEARANCE LEVEL 3 // STAFF ENGINEER',
  QA: 'CLEARANCE LEVEL 3 // LEAD QA',
  ADMIN: 'CLEARANCE LEVEL 4 // ROOT ADMINISTRATOR',
};

export function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();

  const currentUser = user || {
    id: 'user-default',
    name: 'Alex Chen',
    officeId: 'EMP-1042',
    email: 'alex.chen@company.com',
    role: UserRole.DEVELOPER,
    createdAt: '2025-01-15T08:00:00.000Z',
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <CyberHeader
        title="OPERATOR"
        subtitle="IDENTITY MATRIX & SECURITY CREDENTIALS"
      />

      <View style={styles.content}>
        {/* Futuristic Operator ID Badge Card */}
        <Card style={styles.badgeCard} glow={true} cyberAccent={true}>
          {/* Top Bar with Chip ID */}
          <View style={styles.chipRow}>
            <View style={styles.cyberChip}>
              <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                ID-CHIP // SECURE
              </Text>
            </View>
            <Text style={[styles.officeIdCode, { color: theme.colors.textSecondary }]}>
              {currentUser.officeId}
            </Text>
          </View>

          {/* Avatar & Clearance Info */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarGlowRing,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: isDark ? '#060910' : '#EEF2FA',
                },
              ]}
            >
              <Text style={[styles.avatarGlyph, { color: theme.colors.primary }]}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.operatorName, { color: theme.colors.textPrimary }]}>
              {currentUser.name}
            </Text>

            <View
              style={[
                styles.clearanceBadge,
                {
                  backgroundColor: isDark ? 'rgba(0, 240, 255, 0.1)' : '#EEF2FA',
                  borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : '#C8D4EE',
                },
              ]}
            >
              <View style={[styles.clearanceDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.clearanceText, { color: theme.colors.primary }]}>
                {ROLE_CLEARANCES[currentUser.role] ?? currentUser.role}
              </Text>
            </View>
          </View>

          {/* Details Grid */}
          <View
            style={[
              styles.infoGrid,
              { borderTopColor: isDark ? '#141D2D' : theme.colors.border },
            ]}
          >
            <InfoRow label="WORK EMAIL" value={currentUser.email} theme={theme} isDark={isDark} />
            <InfoRow label="OFFICE ID" value={currentUser.officeId} theme={theme} isDark={isDark} />
            <InfoRow
              label="AUTHORIZED SINCE"
              value={new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              theme={theme}
              isDark={isDark}
            />
            <InfoRow label="SECURITY STATUS" value="ACTIVE // VERIFIED" theme={theme} isDark={isDark} isHighlight />
          </View>
        </Card>

        {/* Interface Mode Preference Card */}
        <Card style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={[styles.prefTitle, { color: theme.colors.textPrimary }]}>
                INTERFACE THEME
              </Text>
              <Text style={[styles.prefSub, { color: theme.colors.textSecondary }]}>
                {isDark ? 'Obsidian Cyber Black Mode' : 'Clean Slate Light Mode'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.themeButton,
                {
                  backgroundColor: isDark ? '#0D1422' : '#EEF2FA',
                  borderColor: theme.colors.primary,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.themeBtnText, { color: theme.colors.primary }]}>
                {isDark ? '⚡ CYBER DARK' : '☀️ LIGHT'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Terminate Session / Sign Out */}
        <Button
          label="TERMINATE SESSION // SIGN OUT"
          onPress={clearAuth}
          variant="danger"
          style={{ width: '100%', marginTop: 4 }}
          testID="profile-signout-button"
        />
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  theme,
  isDark,
  isHighlight = false,
}: {
  label: string;
  value: string;
  theme: any;
  isDark: boolean;
  isHighlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: isDark ? '#6B7A92' : theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.infoValue,
          {
            color: isHighlight ? theme.colors.success : theme.colors.textPrimary,
            fontWeight: isHighlight ? '800' : '600',
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  badgeCard: {
    width: '100%',
    padding: 18,
    gap: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cyberChip: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  officeIdCode: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarGlowRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  avatarGlyph: {
    fontSize: 32,
    fontWeight: '800',
  },
  operatorName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  clearanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  clearanceText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoGrid: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  prefCard: {
    width: '100%',
    padding: 16,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefTextCol: {
    gap: 2,
  },
  prefTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  prefSub: {
    fontSize: 12,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
