import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SeverityBadge, StatusBadge, Card, useTheme } from '@dhundo/ui';
import { bugsApi, Bug } from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Route = RouteProp<BugStackParamList, 'BugDetail'>;

export function BugDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const [bug, setBug] = useState<Bug | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bugsApi.getById(route.params.bugId);
        setBug(res.data.data as Bug);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [route.params.bugId]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!bug) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.danger }}>Bug not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      {/* Title & Badges */}
      <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
        <View style={styles.badgeRow}>
          <SeverityBadge severity={bug.severity} />
          <StatusBadge status={bug.status} />
        </View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{bug.title}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          📁 {bug.project?.name}  ·  Reported by {bug.reporter?.name}
        </Text>
        {bug.assignee && (
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            👤 Assigned to {bug.assignee.name}
          </Text>
        )}
      </Card>

      {/* Description */}
      <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Description</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{bug.description}</Text>
      </Card>

      {/* Steps to Reproduce */}
      {bug.stepsToReproduce && (
        <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Steps to Reproduce</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{bug.stepsToReproduce}</Text>
        </Card>
      )}

      {/* Environment */}
      {bug.environment && (
        <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Environment</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{bug.environment}</Text>
        </Card>
      )}

      {/* Comments */}
      <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Comments ({bug.comments?.length ?? 0})
        </Text>
        {bug.comments?.length === 0 && (
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>No comments yet.</Text>
        )}
        {bug.comments?.map((c) => (
          <View key={c.id} style={[styles.commentRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.commentAuthor, { color: theme.colors.textPrimary }]}>{c.user?.name}</Text>
            <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>{c.comment}</Text>
            <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
              {new Date(c.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, gap: 12, paddingTop: 56 },
  section: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 26 },
  meta: { fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 22 },
  commentRow: { borderTopWidth: 1, paddingTop: 12, gap: 2 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentDate: { fontSize: 11, marginTop: 2 },
});
