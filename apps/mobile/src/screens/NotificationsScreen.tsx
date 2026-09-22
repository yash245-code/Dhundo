import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Card, CyberHeader, useTheme } from '@dhundo/ui';
import { notificationsApi, Notification } from '@dhundo/shared';

const FALLBACK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'ASSIGNED',
    title: 'CRITICAL ANOMALY ASSIGNED // DH-101',
    body: 'Sarah Connor assigned you to "Kernel buffer overflow during real-time telemetry streaming".',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'COMMENTED',
    title: 'NEW COMM LOG // DH-102',
    body: 'Maya Lin added a comment: "Reproduction telemetry verified on iOS 18.2 sandbox."',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'STATUS_CHANGED',
    title: 'STATUS UPDATE // DH-103',
    body: 'Ticket DH-103 moved from IN_PROGRESS to IN_REVIEW by Alex Chen.',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'MENTIONED',
    title: 'SYSTEM SECURITY SCAN PASSED',
    body: 'Automated static analysis completed for repository CyberCore Telemetry Engine. Zero high CVEs.',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getAll();
      const fetched = res.data.data as Notification[];
      if (fetched && fetched.length > 0) {
        setNotifications(fetched);
      } else {
        setNotifications(FALLBACK_NOTIFICATIONS);
      }
    } catch {
      setNotifications(FALLBACK_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
    } catch {
      // Optimistic
    }
    setNotifications((n) =>
      n.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
    } catch {
      // Optimistic
    }
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        onPress={() => markRead(item.id)}
        activeOpacity={0.8}
        testID={`notif-${item.id}`}
      >
        <Card
          style={[
            styles.card,
            isUnread && {
              borderColor: isDark ? 'rgba(0, 240, 255, 0.4)' : theme.colors.primary,
              backgroundColor: isDark ? '#080C16' : theme.colors.surface,
            },
          ]}
        >
          <View style={styles.cardTop}>
            <View style={styles.titleRow}>
              {isUnread && (
                <View
                  style={[
                    styles.unreadPip,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.notifTitle,
                  {
                    color: isUnread ? theme.colors.primary : theme.colors.textPrimary,
                    fontWeight: isUnread ? '800' : '600',
                  },
                ]}
              >
                {item.title}
              </Text>
            </View>
            <Text
              style={[
                styles.notifDate,
                { color: isDark ? '#5A677D' : theme.colors.textSecondary },
              ]}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <Text
            style={[
              styles.notifBody,
              { color: isDark ? '#B3BECE' : theme.colors.textSecondary },
            ]}
          >
            {item.body}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <CyberHeader
        title="ALERTS"
        subtitle={`INCIDENT RADAR · ${unreadCount} UNACKNOWLEDGED`}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={[
                styles.ackBtn,
                {
                  backgroundColor: isDark ? '#0D1422' : '#EEF2FA',
                  borderColor: theme.colors.primary,
                },
              ]}
              testID="mark-all-read"
            >
              <Text style={[styles.ackBtnText, { color: theme.colors.primary }]}>
                ACK ALL
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={load}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  card: { padding: 14, gap: 8 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  unreadPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  notifTitle: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
  notifDate: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  ackBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  ackBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
