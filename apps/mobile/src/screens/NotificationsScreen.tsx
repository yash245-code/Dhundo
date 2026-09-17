import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, useTheme } from '@dhundo/ui';
import { notificationsApi, Notification } from '@dhundo/shared';

export function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data.data as Notification[]);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((n) => n.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => markRead(item.id)} testID={`notif-${item.id}`}>
      <Card
        style={[
          styles.card,
          !item.read && { borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
        ]}
        elevation="sm"
      >
        <Text style={[styles.notifTitle, { color: theme.colors.textPrimary, fontWeight: item.read ? '400' : '700' }]}>
          {item.title}
        </Text>
        <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]}>{item.body}</Text>
        <Text style={[styles.notifDate, { color: theme.colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Notifications</Text>
        <TouchableOpacity onPress={async () => { await notificationsApi.markAllRead(); load(); }} testID="mark-all-read">
          <Text style={[styles.markAll, { color: theme.colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 36 }}>🔔</Text>
            <Text style={[{ color: theme.colors.textSecondary, fontSize: 15 }]}>No notifications yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700' },
  markAll: { fontSize: 13 },
  list: { padding: 16, gap: 10 },
  card: { marginBottom: 0 },
  notifTitle: { fontSize: 14, marginBottom: 2 },
  notifBody: { fontSize: 13 },
  notifDate: { fontSize: 11, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8 },
});
