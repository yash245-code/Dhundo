import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, TextInput, useTheme } from '@dhundo/ui';
import { bugsApi, projectsApi, useProjectsStore, BugSeverity, Project, Bug } from '@dhundo/shared';

const SEVERITIES: BugSeverity[] = [
  BugSeverity.LOW,
  BugSeverity.MEDIUM,
  BugSeverity.HIGH,
  BugSeverity.CRITICAL,
];

export function NewBugScreen() {
  const { theme } = useTheme();
  const { projects, setProjects } = useProjectsStore();

  const getDeviceInfo = () => {
    const { width, height } = Dimensions.get('window');
    const osName =
      Platform.OS === 'ios'
        ? 'iOS'
        : Platform.OS === 'android'
        ? 'Android'
        : Platform.OS.toUpperCase();
    return `${osName} ${Platform.Version} · Screen ${Math.round(width)}x${Math.round(height)}`;
  };

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    stepsToReproduce: '',
    severity: BugSeverity.MEDIUM,
    environment: getDeviceInfo(),
  });
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data as Project[]));
  }, []);

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err: any) {
      setError('Could not open image picker: ' + (err?.message ?? 'unknown error'));
    }
  };

  const handleSubmit = async () => {
    if (!form.projectId || !form.title || !form.description) {
      setError('Project, title, and description are required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await bugsApi.create(form);
      const createdBug = res.data.data as Bug;

      // Upload attachment if selected
      if (selectedImage) {
        const uri = selectedImage.uri;
        const filename = uri.split('/').pop() || 'screenshot.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);

        try {
          await bugsApi.uploadAttachment(createdBug.id, formData);
        } catch {
          // Non-blocking if attachment upload fails after bug creation
        }
      }

      setSuccess(true);
      setForm({
        projectId: '',
        title: '',
        description: '',
        stepsToReproduce: '',
        severity: BugSeverity.MEDIUM,
        environment: getDeviceInfo(),
      });
      setSelectedImage(null);
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

        <TextInput
          label="Title *"
          placeholder="Short summary of the bug"
          value={form.title}
          onChangeText={update('title')}
          testID="newbug-title-input"
        />
        <TextInput
          label="Description *"
          placeholder="What went wrong?"
          value={form.description}
          onChangeText={update('description')}
          multiline
          numberOfLines={4}
          testID="newbug-desc-input"
        />
        <TextInput
          label="Steps to Reproduce"
          placeholder="1. Go to...\n2. Click...\n3. See error"
          value={form.stepsToReproduce}
          onChangeText={update('stepsToReproduce')}
          multiline
          numberOfLines={4}
          testID="newbug-steps-input"
        />

        {/* Environment with Auto-Detect */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Environment</Text>
            <TouchableOpacity
              onPress={() => update('environment')(getDeviceInfo())}
              style={[styles.autoDetectBtn, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.autoDetectText, { color: theme.colors.primary }]}>⚡ Auto-Detect</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="e.g. iOS 17 / iPhone 15 Pro"
            value={form.environment}
            onChangeText={update('environment')}
            testID="newbug-env-input"
          />
        </View>

        {/* Screenshot Attachment */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Screenshot / Attachment</Text>
          {selectedImage ? (
            <View style={[styles.previewContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewMeta}>
                <Text style={[styles.previewName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {selectedImage.fileName ?? 'Selected Image'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeBtn}>
                  <Text style={[styles.removeText, { color: theme.colors.danger }]}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              style={[styles.attachBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Text style={{ fontSize: 20 }}>📷</Text>
              <Text style={[styles.attachText, { color: theme.colors.primary }]}>Attach Screenshot or Image</Text>
            </TouchableOpacity>
          )}
        </View>

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

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500' },
  autoDetectBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  autoDetectText: { fontSize: 12, fontWeight: '600' },
  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  projectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  attachText: { fontSize: 14, fontWeight: '500' },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  previewImage: { width: 64, height: 64, borderRadius: 6 },
  previewMeta: { flex: 1, gap: 4 },
  previewName: { fontSize: 13, fontWeight: '500' },
  removeBtn: { alignSelf: 'flex-start' },
  removeText: { fontSize: 12, fontWeight: '600' },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  error: { fontSize: 13 },
});
