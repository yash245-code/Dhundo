import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SeverityBadge, StatusBadge, Card, useTheme } from '@dhundo/ui';
import { bugsApi, useBugsStore, useAuthStore, Bug, BugSeverity, BugStatus } from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<BugStackParamList>;

type FilterChipKey = 'ALL' | 'ASSIGNED_TO_ME' | 'MY_REPORTS' | 'CRITICAL' | 'IN_PROGRESS' | 'OPEN';

interface FilterChipItem {
  key: FilterChipKey;
  label: string;
  icon?: string;
}

const FILTER_CHIPS: FilterChipItem[] = [
  { key: 'ALL', label: 'All Bugs' },
  { key: 'ASSIGNED_TO_ME', label: 'Assigned to Me' },
  { key: 'MY_REPORTS', label: 'My Reports' },
  { key: 'CRITICAL', label: 'Critical' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'OPEN', label: 'Open' },
];

export function DashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { bugs, isLoading, filters, pagination, setBugs, setFilters, setLoading } = useBugsStore();
  const [activeChip, setActiveChip] = useState<FilterChipKey>('ALL');

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

  const handleSelectChip = (chipKey: FilterChipKey) => {
    setActiveChip(chipKey);
    switch (chipKey) {
      case 'ALL':
        setFilters({ status: undefined, severity: undefined, assigneeId: undefined, reporterId: undefined });
        break;
      case 'ASSIGNED_TO_ME':
        setFilters({ assigneeId: user?.id, reporterId: undefined, status: undefined, severity: undefined });
        break;
      case 'MY_REPORTS':
        setFilters({ reporterId: user?.id, assigneeId: undefined, status: undefined, severity: undefined });
        break;
      case 'CRITICAL':
        setFilters({ severity: BugSeverity.CRITICAL, status: undefined, assigneeId: undefined, reporterId: undefined });
        break;
      case 'IN_PROGRESS':
        setFilters({ status: BugStatus.IN_PROGRESS, severity: undefined, assigneeId: undefined, reporterId: undefined });
        break;
      case 'OPEN':
        setFilters({ status: BugStatus.OPEN, severity: undefined, assigneeId: undefined, reporterId: undefined });
        break;
    }
  };

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

      {/* Filter Chips Bar */}
      <View style={[styles.chipsWrapper, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeChip === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => handleSelectChip(chip.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.background,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? '#FFFFFF' : theme.colors.textPrimary,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  chipsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
