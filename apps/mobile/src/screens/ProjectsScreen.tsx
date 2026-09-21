import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Card, useTheme } from '@dhundo/ui';
import { projectsApi, useProjectsStore, Project } from '@dhundo/shared';

export function ProjectsScreen() {
  const { theme } = useTheme();
  const { projects, setProjects, isLoading, setLoading } = useProjectsStore();

  const load = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data.data as Project[]);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderProject = ({ item }: { item: Project }) => (
    <Card style={styles.card} testID={`project-card-${item.id}`}>
      <Text style={[styles.projectName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
      <Text style={[styles.projectDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      {item.repoUrl ? (
        <Text style={[styles.repoUrl, { color: theme.colors.primary }]} numberOfLines={1}>
          🔗 {item.repoUrl}
        </Text>
      ) : null}
    </Card>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Projects</Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        renderItem={renderProject}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 36 }}>📁</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No projects yet.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 16 : 56, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  projectName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  projectDesc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  repoUrl: { fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8 },
  emptyText: { fontSize: 16 },
});
