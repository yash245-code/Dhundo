import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Card, CyberHeader, useTheme } from '@dhundo/ui';
import { projectsApi, useProjectsStore, Project } from '@dhundo/shared';

const FALLBACK_PROJECTS: (Project & { code: string; status: string; activeBugs: number })[] = [
  {
    id: 'proj-1',
    code: 'PROJ://01',
    name: 'CyberCore Telemetry Engine',
    description:
      'High-throughput distributed event stream processor & cluster telemetry daemon with gRPC conduits.',
    repoUrl: 'github.com/company/cybercore',
    status: 'SYSTEM_OPTIMAL',
    activeBugs: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    code: 'PROJ://02',
    name: 'Sentinel Mobile Gateway',
    description:
      'Cross-platform native iOS & Android client with hardware-accelerated telemetry rendering.',
    repoUrl: 'github.com/company/sentinel-mobile',
    status: 'ACTIVE_TRIAGE',
    activeBugs: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    code: 'PROJ://03',
    name: 'Apollo Design System',
    description:
      'Cyberpunk UI tokens, primitives, telemetry HUD components, and cross-platform design specifications.',
    repoUrl: 'github.com/company/apollo-ui',
    status: 'MAINTENANCE',
    activeBugs: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-4',
    code: 'PROJ://04',
    name: 'Aether Auth Gateway',
    description:
      'Zero-trust SSO gateway with hardware token verification and role-based clearance orchestration.',
    repoUrl: 'github.com/company/aether-auth',
    status: 'SECURE',
    activeBugs: 0,
    createdAt: new Date().toISOString(),
  },
];

export function ProjectsScreen() {
  const { theme, isDark } = useTheme();
  const { projects, setProjects, isLoading, setLoading } = useProjectsStore();

  const load = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll();
      const fetched = res.data.data as Project[];
      if (fetched && fetched.length > 0) {
        setProjects(fetched);
      } else {
        setProjects(FALLBACK_PROJECTS);
      }
    } catch {
      setProjects(FALLBACK_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  const renderProject = ({ item, index }: { item: any; index: number }) => {
    const code = item.code || `PROJ://0${index + 1}`;
    const status = item.status || 'ACTIVE';
    const activeBugs = item.activeBugs ?? (item.bugs ? item.bugs.length : 1);

    return (
      <Card style={styles.card} testID={`project-card-${item.id}`}>
        {/* Card Header: Code & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.codeTag}>
            <Text style={[styles.codeText, { color: theme.colors.primary }]}>
              {code}
            </Text>
          </View>
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor: isDark ? 'rgba(0, 255, 157, 0.1)' : '#EDF7F2',
                borderColor: isDark ? 'rgba(0, 255, 157, 0.3)' : '#C6E8D5',
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#00FF9D' }]} />
            <Text style={[styles.statusText, { color: '#00FF9D' }]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Project Title */}
        <Text style={[styles.projectName, { color: theme.colors.textPrimary }]}>
          {item.name}
        </Text>

        {/* Project Description */}
        <Text
          style={[styles.projectDesc, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Card Footer */}
        <View
          style={[
            styles.cardFooter,
            { borderTopColor: isDark ? '#141D2D' : theme.colors.border },
          ]}
        >
          {item.repoUrl ? (
            <View style={styles.repoBox}>
              <Text style={[styles.repoIcon, { color: theme.colors.primary }]}>⌲</Text>
              <Text
                style={[styles.repoUrl, { color: theme.colors.primary }]}
                numberOfLines={1}
              >
                {item.repoUrl}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <View
            style={[
              styles.bugCountBadge,
              {
                backgroundColor: isDark ? '#0D1320' : '#EEF2FA',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.bugCountText,
                { color: activeBugs > 0 ? theme.colors.warning : theme.colors.success },
              ]}
            >
              {activeBugs} ACTIVE
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <CyberHeader
        title="PROJECTS"
        subtitle="SYSTEM REGISTRY & MODULE INDEX"
      />

      <FlatList
        data={displayProjects}
        keyExtractor={(p) => p.id}
        renderItem={renderProject}
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
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { padding: 16, gap: 10 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeTag: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  projectDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  repoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '70%',
  },
  repoIcon: {
    fontSize: 12,
  },
  repoUrl: {
    fontSize: 12,
    fontWeight: '600',
  },
  bugCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  bugCountText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
