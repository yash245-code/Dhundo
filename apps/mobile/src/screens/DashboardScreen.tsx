import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SeverityBadge,
  StatusBadge,
  Card,
  CyberHeader,
  TelemetryHUD,
  useTheme,
} from '@dhundo/ui';
import {
  bugsApi,
  useBugsStore,
  useAuthStore,
  Bug,
  BugSeverity,
  BugStatus,
  UserRole,
} from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<BugStackParamList>;

type FilterChipKey = 'ALL' | 'ASSIGNED_TO_ME' | 'MY_REPORTS' | 'CRITICAL' | 'IN_PROGRESS' | 'OPEN';

interface FilterChipItem {
  key: FilterChipKey;
  label: string;
  tag?: string;
}

const FILTER_CHIPS: FilterChipItem[] = [
  { key: 'ALL', label: 'ALL ISSUES' },
  { key: 'ASSIGNED_TO_ME', label: 'ASSIGNED TO ME' },
  { key: 'MY_REPORTS', label: 'MY REPORTS' },
  { key: 'CRITICAL', label: 'CRITICAL', tag: 'P0' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { key: 'OPEN', label: 'OPEN' },
];

const FALLBACK_BUGS: Bug[] = [
  {
    id: 'bug-101',
    projectId: 'proj-1',
    reporterId: 'user-1',
    assigneeId: 'user-2',
    title: 'Kernel buffer overflow during real-time telemetry streaming',
    description:
      'High-throughput telemetry ingestion triggers buffer memory saturation on concurrent WebSockets, causing packet drop.',
    stepsToReproduce:
      '1. Initialize 500 simultaneous socket connections\n2. Stream telemetry at 100hz\n3. Observe node buffer overflow in logs',
    severity: BugSeverity.CRITICAL,
    status: BugStatus.OPEN,
    environment: 'Linux 6.8 / Docker 24.0 / Screen 1920x1080',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    project: {
      id: 'proj-1',
      name: 'CyberCore Telemetry Engine',
      description: 'Distributed event stream processor',
      repoUrl: 'github.com/company/cybercore',
      createdAt: new Date().toISOString(),
    },
    reporter: {
      id: 'user-1',
      name: 'Alex Chen',
      officeId: 'EMP-1042',
      email: 'alex.chen@company.com',
      role: UserRole.DEVELOPER,
      createdAt: new Date().toISOString(),
    },
    assignee: {
      id: 'user-2',
      name: 'Sarah Connor',
      officeId: 'EMP-0001',
      email: 'sarah.connor@company.com',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
    },
    comments: [
      {
        id: 'c-1',
        bugId: 'bug-101',
        userId: 'user-2',
        comment: 'Investigating heap allocation logs. Patch branch queued for testing.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        user: {
          id: 'user-2',
          name: 'Sarah Connor',
          officeId: 'EMP-0001',
          email: 'sarah@company.com',
          role: UserRole.ADMIN,
          createdAt: new Date().toISOString(),
        },
      },
    ],
  },
  {
    id: 'bug-102',
    projectId: 'proj-2',
    reporterId: 'user-3',
    assigneeId: 'user-1',
    title: 'OAuth2 session refresh deadlock on rapid reconnects',
    description:
      'Intermittent network switches result in multiple concurrent token refresh calls triggering race condition.',
    stepsToReproduce:
      '1. Enable simulated 3G network\n2. Toggle airplane mode repeatedly\n3. Observe 401 retry loop',
    severity: BugSeverity.HIGH,
    status: BugStatus.IN_PROGRESS,
    environment: 'iOS 18.2 / iPhone 16 Pro / Screen 393x852',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    project: {
      id: 'proj-2',
      name: 'Sentinel Mobile Gateway',
      description: 'Cross-platform native client',
      repoUrl: 'github.com/company/sentinel-mobile',
      createdAt: new Date().toISOString(),
    },
    reporter: {
      id: 'user-3',
      name: 'Maya Lin',
      officeId: 'EMP-2089',
      email: 'maya.lin@company.com',
      role: UserRole.QA,
      createdAt: new Date().toISOString(),
    },
    assignee: {
      id: 'user-1',
      name: 'Alex Chen',
      officeId: 'EMP-1042',
      email: 'alex.chen@company.com',
      role: UserRole.DEVELOPER,
      createdAt: new Date().toISOString(),
    },
    comments: [],
  },
  {
    id: 'bug-103',
    projectId: 'proj-1',
    reporterId: 'user-2',
    assigneeId: 'user-3',
    title: 'Quantum HUD visualizer clipping at ultra-wide resolutions',
    description:
      'Telemetry canvas matrix overflows viewport on display dimensions exceeding 3440px wide.',
    stepsToReproduce:
      '1. Open dashboard on 4K or ultra-wide display\n2. Inspect right margin of timeline chart',
    severity: BugSeverity.MEDIUM,
    status: BugStatus.IN_REVIEW,
    environment: 'macOS Sonoma / Chromium 128 / Screen 3440x1440',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    project: {
      id: 'proj-1',
      name: 'CyberCore Telemetry Engine',
      description: 'Distributed event stream processor',
      repoUrl: 'github.com/company/cybercore',
      createdAt: new Date().toISOString(),
    },
    reporter: {
      id: 'user-2',
      name: 'Sarah Connor',
      officeId: 'EMP-0001',
      email: 'sarah.connor@company.com',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
    },
    assignee: {
      id: 'user-3',
      name: 'Maya Lin',
      officeId: 'EMP-2089',
      email: 'maya.lin@company.com',
      role: UserRole.QA,
      createdAt: new Date().toISOString(),
    },
    comments: [],
  },
  {
    id: 'bug-104',
    projectId: 'proj-3',
    reporterId: 'user-1',
    title: 'Obsidian dark mode luminous bleed in high-contrast data table',
    description:
      'Subtle glow effect on table headers causes border anti-aliasing artifacts on Safari.',
    stepsToReproduce: '1. Launch Web Client\n2. Switch to Dark Mode\n3. Zoom to 125%',
    severity: BugSeverity.LOW,
    status: BugStatus.RESOLVED,
    environment: 'Web / Safari 17.5 / Screen 1728x1117',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    project: {
      id: 'proj-3',
      name: 'Apollo Design System',
      description: 'Cyberpunk UI tokens & components',
      repoUrl: 'github.com/company/apollo-ui',
      createdAt: new Date().toISOString(),
    },
    reporter: {
      id: 'user-1',
      name: 'Alex Chen',
      officeId: 'EMP-1042',
      email: 'alex.chen@company.com',
      role: UserRole.DEVELOPER,
      createdAt: new Date().toISOString(),
    },
    comments: [],
  },
];

export function DashboardScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { bugs, isLoading, filters, pagination, setBugs, setFilters, setLoading } = useBugsStore();
  const [activeChip, setActiveChip] = useState<FilterChipKey>('ALL');

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bugsApi.getAll(filters as Record<string, unknown>);
      const fetched = res.data.data as Bug[];
      if (fetched && fetched.length > 0) {
        setBugs(fetched, res.data.pagination);
      } else {
        setBugs(FALLBACK_BUGS, { page: 1, limit: 20, total: FALLBACK_BUGS.length, totalPages: 1 });
      }
    } catch {
      // Fallback to rich futuristic sample data if API fails / offline
      setBugs(FALLBACK_BUGS, { page: 1, limit: 20, total: FALLBACK_BUGS.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  // Compute Telemetry Stats
  const displayList = bugs.length > 0 ? bugs : FALLBACK_BUGS;
  const stats = useMemo(() => {
    return {
      total: displayList.length,
      critical: displayList.filter((b) => b.severity === BugSeverity.CRITICAL).length,
      inProgress: displayList.filter((b) => b.status === BugStatus.IN_PROGRESS).length,
      resolved: displayList.filter((b) => b.status === BugStatus.RESOLVED).length,
    };
  }, [displayList]);

  const handleSelectChip = (chipKey: FilterChipKey) => {
    setActiveChip(chipKey);
    switch (chipKey) {
      case 'ALL':
        setFilters({ status: undefined, severity: undefined, assigneeId: undefined, reporterId: undefined });
        break;
      case 'ASSIGNED_TO_ME':
        setFilters({ assigneeId: user?.id ?? 'user-1', reporterId: undefined, status: undefined, severity: undefined });
        break;
      case 'MY_REPORTS':
        setFilters({ reporterId: user?.id ?? 'user-1', assigneeId: undefined, status: undefined, severity: undefined });
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

  const handleStatPress = (metric: 'TOTAL' | 'CRITICAL' | 'IN_PROGRESS' | 'RESOLVED') => {
    if (metric === 'TOTAL') handleSelectChip('ALL');
    if (metric === 'CRITICAL') handleSelectChip('CRITICAL');
    if (metric === 'IN_PROGRESS') handleSelectChip('IN_PROGRESS');
    if (metric === 'RESOLVED') {
      setActiveChip('ALL');
      setFilters({ status: BugStatus.RESOLVED, severity: undefined });
    }
  };

  const renderBug = ({ item }: { item: Bug }) => {
    const ticketId = `#DH-${item.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '001'}`;
    const isCritical = item.severity === BugSeverity.CRITICAL;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('BugDetail', { bugId: item.id })}
        activeOpacity={0.8}
        testID={`bug-card-${item.id}`}
      >
        <Card
          style={[styles.bugCard, isCritical && isDark && styles.criticalCardGlow]}
          glow={isCritical}
          cyberAccent={isCritical}
        >
          {/* Card Top Row: Ticket ID, Severity, Status */}
          <View style={styles.cardHeader}>
            <View style={styles.ticketTag}>
              <Text
                style={[
                  styles.ticketIdText,
                  { color: isDark ? theme.colors.primary : theme.colors.primary },
                ]}
              >
                {ticketId}
              </Text>
            </View>
            <View style={styles.badgeGroup}>
              <SeverityBadge severity={item.severity} />
              <StatusBadge status={item.status} />
            </View>
          </View>

          {/* Title */}
          <Text
            style={[styles.bugTitle, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* Description snippet */}
          {item.description ? (
            <Text
              style={[styles.bugDesc, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          {/* Cyber Meta Bar */}
          <View
            style={[
              styles.cardFooter,
              { borderTopColor: isDark ? '#141D2D' : theme.colors.border },
            ]}
          >
            <View style={styles.projectPill}>
              <Text style={[styles.projectIcon, { color: theme.colors.primary }]}>◈</Text>
              <Text
                style={[styles.projectName, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.project?.name ?? 'General'}
              </Text>
            </View>

            <View style={styles.reporterInfo}>
              <Text style={[styles.reporterName, { color: theme.colors.textSecondary }]}>
                {item.reporter?.name?.split(' ')[0] ?? 'Operator'}
              </Text>
              <Text style={[styles.timestamp, { color: isDark ? '#5A677D' : theme.colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={{ fontSize: 44 }}>⬡</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        ALL TELEMETRY CLEAR
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        No active anomalies matching current filter parameters.
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Cyber Header with telemetry status & theme switcher */}
      <CyberHeader
        title="DHUNDO // HUD"
        subtitle="INCIDENT MATRIX & TELEMETRY STREAM"
      />

      {/* Top Telemetry Metric HUD */}
      <TelemetryHUD
        total={stats.total}
        critical={stats.critical}
        inProgress={stats.inProgress}
        resolved={stats.resolved}
        onStatPress={handleStatPress}
      />

      {/* Cyber Search Bar */}
      <View
        style={[
          styles.searchRow,
          {
            backgroundColor: isDark ? '#05070D' : theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#0B0F19' : theme.colors.background,
              borderColor: isDark ? '#192336' : theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.searchPrefix, { color: theme.colors.primary }]}>
            ⌕
          </Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search anomalies, ticket codes, stacks..."
            placeholderTextColor={isDark ? '#4E5D73' : theme.colors.textSecondary}
            value={filters.search ?? ''}
            onChangeText={(t) => setFilters({ search: t })}
            testID="dashboard-search-input"
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => setFilters({ search: '' })}>
              <Text style={[styles.clearBtn, { color: theme.colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips Bar */}
      <View
        style={[
          styles.chipsWrapper,
          {
            backgroundColor: isDark ? '#04060B' : theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
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
                    backgroundColor: isActive
                      ? isDark
                        ? 'rgba(0, 240, 255, 0.15)'
                        : theme.colors.primary
                      : isDark
                        ? '#0A0E18'
                        : theme.colors.background,
                    borderColor: isActive
                      ? theme.colors.primary
                      : isDark
                        ? '#182338'
                        : theme.colors.border,
                  },
                  isActive && isDark && styles.activeChipGlow,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive
                        ? isDark
                          ? theme.colors.primary
                          : '#FFFFFF'
                        : theme.colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
                {chip.tag && (
                  <View
                    style={[
                      styles.chipTag,
                      {
                        backgroundColor: isActive
                          ? theme.colors.danger
                          : isDark
                            ? 'rgba(255, 51, 102, 0.2)'
                            : '#FEECEC',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipTagText,
                        { color: isActive ? '#FFFFFF' : theme.colors.danger },
                      ]}
                    >
                      {chip.tag}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Incident FlatList */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        renderItem={renderBug}
        contentContainerStyle={[
          styles.list,
          displayList.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadBugs}
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
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchPrefix: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    padding: 4,
  },
  chipsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeChipGlow: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  chipText: {
    fontSize: 11,
    letterSpacing: 0.6,
  },
  chipTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  chipTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
  },
  bugCard: {
    marginBottom: 0,
    padding: 16,
  },
  criticalCardGlow: {
    borderColor: 'rgba(255, 51, 102, 0.4)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketTag: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ticketIdText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.6,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  bugTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  bugDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '60%',
  },
  projectIcon: {
    fontSize: 11,
  },
  projectName: {
    fontSize: 12,
    fontWeight: '500',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reporterName: {
    fontSize: 11,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
