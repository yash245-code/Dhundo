import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Card, Button, useTheme } from '@dhundo/ui';
import { useAuthStore } from '@dhundo/shared';

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Employee',
  DEVELOPER: 'Developer',
  QA: 'QA Engineer',
  ADMIN: 'Administrator',
};

export function ProfileScreen() {
  const { theme } = useTheme();
  const { user, clearAuth } = useAuthStore();

  if (!user) return null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.role, { color: theme.colors.primary }]}>
          {ROLE_LABELS[user.role] ?? user.role}
        </Text>

        {/* Info Card */}
        <Card style={styles.infoCard} elevation="sm">
          <InfoRow label="Office ID" value={user.officeId} theme={theme} />
          <InfoRow label="Email" value={user.email} theme={theme} />
          <InfoRow label="Member since" value={new Date(user.createdAt).toLocaleDateString()} theme={theme} />
        </Card>

        {/* Sign out */}
        <Button
          label="Sign Out"
          onPress={clearAuth}
          variant="secondary"
          style={{ marginTop: 8 }}
          testID="profile-signout-button"
        />
      </View>
    </View>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 16 : 56, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '700' },
  content: { alignItems: 'center', padding: 24, gap: 12 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700' },
  role: { fontSize: 14, fontWeight: '600' },
  infoCard: { width: '100%', gap: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500' },
});
