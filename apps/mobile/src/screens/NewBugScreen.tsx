import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Button, TextInput, useTheme } from '@dhundo/ui';
import { bugsApi, projectsApi, useProjectsStore, BugSeverity, Project } from '@dhundo/shared';

const SEVERITIES: BugSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function NewBugScreen() {
  const { theme } = useTheme();
  const { projects, setProjects } = useProjectsStore();

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    stepsToReproduce: '',
    severity: 'MEDIUM' as BugSeverity,
    environment: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data as Project[]));
  }, []);

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.projectId || !form.title || !form.description) {
      setError('Project, title, and description are required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await bugsApi.create(form);
      setSuccess(true);
      setForm({ projectId: '', title: '', description: '', stepsToReproduce: '', severity: 'MEDIUM', environment: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to submit bug. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ fontSize: 52 }}>✅</Text>
        <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Bug Reported!</Text>
        <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
          Thank you. The team will look into it.
        </Text>
        <Button label="Report Another" onPress={() => setSuccess(false)} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Report a Bug</Text>

        {/* Project selector */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Project *</Text>
          <View style={styles.projectGrid}>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => update('projectId')(p.id)}
                style={[
                  styles.projectChip,
                  {
                    backgroundColor: form.projectId === p.id ? theme.colors.primary : theme.colors.surface,
                    borderColor: form.projectId === p.id ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                testID={`project-chip-${p.id}`}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: form.projectId === p.id ? '#FFFFFF' : theme.colors.textPrimary,
                  }}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput label="Title *" placeholder="Short summary of the bug" value={form.title} onChangeText={update('title')} testID="newbug-title-input" />
        <TextInput label="Description *" placeholder="What went wrong?" value={form.description} onChangeText={update('description')} multiline numberOfLines={4} testID="newbug-desc-input" />
        <TextInput label="Steps to Reproduce" placeholder="1. Go to...\n2. Click...\n3. See error" value={form.stepsToReproduce} onChangeText={update('stepsToReproduce')} multiline numberOfLines={4} testID="newbug-steps-input" />
        <TextInput label="Environment" placeholder="e.g. iOS 17 / iPhone 15 Pro" value={form.environment} onChangeText={update('environment')} testID="newbug-env-input" />

        {/* Severity */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Severity</Text>
          <View style={styles.severityRow}>
            {SEVERITIES.map((s) => {
              const colors = theme.severity[s];
              const selected = form.severity === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => update('severity')(s)}
                  style={[
                    styles.severityChip,
                    {
                      backgroundColor: selected ? colors.bg : theme.colors.surface,
                      borderColor: selected ? colors.border : theme.colors.border,
                    },
                  ]}
                  testID={`severity-chip-${s}`}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? colors.text : theme.colors.textSecondary }}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        <Button label="Submit Bug Report" onPress={handleSubmit} isLoading={isLoading} testID="newbug-submit-button" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  successTitle: { fontSize: 22, fontWeight: '700' },
  successSub: { fontSize: 14, textAlign: 'center' },
  container: { padding: 20, paddingTop: 56, gap: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500' },
  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  projectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  error: { fontSize: 13 },
});
