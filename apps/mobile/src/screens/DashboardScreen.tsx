import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SeverityBadge, StatusBadge, Card, useTheme } from '@dhundo/ui';
import { bugsApi, useBugsStore, Bug, BugSeverity, BugStatus } from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<BugStackParamList>;

export function DashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { bugs, isLoading, filters, pagination, setBugs, setFilters, setLoading } = useBugsStore();

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bugsApi.getAll(filters as Record<string, unknown>);
      setBugs(res.data.data as Bug[], res.data.pagination);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const renderBug = ({ item }: { item: Bug }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BugDetail', { bugId: item.id })}
      testID={`bug-card-${item.id}`}
    >
      <Card style={styles.bugCard} elevation="sm">
        <View style={styles.bugHeader}>
          <SeverityBadge severity={item.severity} />
          <StatusBadge status={item.status} />
        </View>
        <Text style={[styles.bugTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.bugMeta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            📁 {item.project?.name ?? '—'}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40 }}>✅</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No bugs found</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Adjust your filters or report a new bug.
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>Bug Dashboard</Text>
        <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
          {pagination.total} total
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
          placeholder="Search bugs..."
          placeholderTextColor={theme.colors.textSecondary}
          value={filters.search ?? ''}
          onChangeText={(t) => setFilters({ search: t })}
          testID="dashboard-search-input"
        />
      </View>

      <FlatList
        data={bugs}
        keyExtractor={(item) => item.id}
        renderItem={renderBug}
        contentContainerStyle={[styles.list, bugs.length === 0 && styles.listEmpty]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadBugs} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  screenTitle: { fontSize: 24, fontWeight: '700' },
  count: { fontSize: 13 },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  list: { padding: 16, gap: 12 },
  listEmpty: { flexGrow: 1 },
  bugCard: { marginBottom: 0 },
  bugHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bugTitle: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  bugMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaText: { fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
