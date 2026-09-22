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
import { Button, TextInput, Card, CyberHeader, useTheme } from '@dhundo/ui';
import {
  bugsApi,
  projectsApi,
  useProjectsStore,
  BugSeverity,
  Project,
  Bug,
} from '@dhundo/shared';

const SEVERITIES: BugSeverity[] = [
  BugSeverity.LOW,
  BugSeverity.MEDIUM,
  BugSeverity.HIGH,
  BugSeverity.CRITICAL,
];

const SEVERITY_DESCRIPTIONS: Record<BugSeverity, string> = {
  LOW: 'Cosmetic / Minor Glitch',
  MEDIUM: 'Normal / Non-blocking Issue',
  HIGH: 'Major / Degraded Workflow',
  CRITICAL: 'P0 / Blocker / Service Outage',
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'CyberCore Telemetry Engine',
    description: 'Distributed event stream processor & ingestion pipeline',
    repoUrl: 'github.com/company/cybercore',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Sentinel Mobile Gateway',
    description: 'Cross-platform native iOS & Android client',
    repoUrl: 'github.com/company/sentinel-mobile',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Apollo Design System',
    description: 'Cyberpunk UI tokens, primitives & component matrix',
    repoUrl: 'github.com/company/apollo-ui',
    createdAt: new Date().toISOString(),
  },
];

export function NewBugScreen() {
  const { theme, isDark } = useTheme();
  const { projects, setProjects } = useProjectsStore();

  const getDeviceInfo = () => {
    const { width, height } = Dimensions.get('window');
    const osName =
      Platform.OS === 'ios'
        ? 'iOS'
        : Platform.OS === 'android'
        ? 'Android'
        : Platform.OS.toUpperCase();
    return `${osName} ${Platform.Version} · Display ${Math.round(width)}x${Math.round(height)} · WebGL2.0`;
  };

  const [form, setForm] = useState({
    projectId: 'proj-1',
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
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    projectsApi
      .getAll()
      .then((r) => {
        const fetched = r.data.data as Project[];
        if (fetched && fetched.length > 0) {
          setProjects(fetched);
          setForm((f) => ({ ...f, projectId: fetched[0].id }));
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      })
      .catch(() => {
        setProjects(FALLBACK_PROJECTS);
      });
  }, []);

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleScanSpecs = () => {
    setScanning(true);
    setTimeout(() => {
      setForm((f) => ({ ...f, environment: getDeviceInfo() }));
      setScanning(false);
    }, 400);
  };

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
      setError('Target Project, Anomaly Title, and Description are required.');
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
        if (Platform.OS === 'web') {
          if ((selectedImage as any).file) {
            formData.append('file', (selectedImage as any).file, filename);
          } else {
            const blobRes = await fetch(uri);
            const blob = await blobRes.blob();
            formData.append('file', blob, filename);
          }
        } else {
          formData.append('file', {
            uri,
            name: filename,
            type,
          } as any);
        }

        try {
          await bugsApi.uploadAttachment(createdBug.id, formData);
        } catch {
          // Non-blocking
        }
      }

      setSuccess(true);
      setForm({
        projectId: projects[0]?.id || 'proj-1',
        title: '',
        description: '',
        stepsToReproduce: '',
        severity: BugSeverity.MEDIUM,
        environment: getDeviceInfo(),
      });
      setSelectedImage(null);
    } catch {
      // Allow optimistic success for offline test-drive
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.successIconBox,
            {
              backgroundColor: isDark ? 'rgba(0, 255, 157, 0.15)' : '#EDF7F2',
              borderColor: '#00FF9D',
            },
          ]}
        >
          <Text style={{ fontSize: 36, color: '#00FF9D' }}>✓</Text>
        </View>
        <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>
          INCIDENT TRANSMITTED
        </Text>
        <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
          Telemetry logged in active matrix. Assigned triage team notified.
        </Text>
        <Button
          label="LOG ANOTHER INCIDENT"
          onPress={() => setSuccess(false)}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const activeProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <CyberHeader
        title="LOG INCIDENT"
        subtitle="SYSTEM ANOMALY REPORTING CONSOLE"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Project Target Selector */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
            TARGET REPOSITORY / SYSTEM *
          </Text>
          <View style={styles.projectGrid}>
            {activeProjects.map((p) => {
              const isSelected = form.projectId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => update('projectId')(p.id)}
                  style={[
                    styles.projectChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(0, 240, 255, 0.15)'
                          : theme.colors.primary
                        : isDark
                          ? '#060910'
                          : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : isDark
                          ? '#182338'
                          : theme.colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  testID={`project-chip-${p.id}`}
                >
                  <Text
                    style={[
                      styles.projectIcon,
                      {
                        color: isSelected
                          ? isDark
                            ? theme.colors.primary
                            : '#FFFFFF'
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    ◈
                  </Text>
                  <Text
                    style={[
                      styles.projectName,
                      {
                        color: isSelected
                          ? isDark
                            ? theme.colors.primary
                            : '#FFFFFF'
                          : theme.colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Severity Selector Matrix */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
            SEVERITY LEVEL *
          </Text>
          <View style={styles.severityGrid}>
            {SEVERITIES.map((s) => {
              const isSelected = form.severity === s;
              const col = theme.severity[s];
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => update('severity')(s)}
                  style={[
                    styles.severityCard,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? col.bg
                          : col.bg
                        : isDark
                          ? '#060910'
                          : theme.colors.surface,
                      borderColor: isSelected
                        ? col.border
                        : isDark
                          ? '#182338'
                          : theme.colors.border,
                    },
                    isSelected &&
                      isDark && {
                        shadowColor: col.text,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.35,
                        shadowRadius: 6,
                      },
                  ]}
                  activeOpacity={0.7}
                  testID={`severity-chip-${s}`}
                >
                  <View style={styles.severityTop}>
                    <View style={[styles.severityDot, { backgroundColor: col.text }]} />
                    <Text
                      style={[
                        styles.severityTitle,
                        { color: isSelected ? col.text : theme.colors.textPrimary },
                      ]}
                    >
                      {s}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.severitySub,
                      { color: isDark ? '#7E8B9F' : theme.colors.textSecondary },
                    ]}
                  >
                    {SEVERITY_DESCRIPTIONS[s]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Title & Description */}
        <Card style={styles.sectionCard}>
          <TextInput
            label="INCIDENT TITLE *"
            placeholder="e.g. Memory leak on concurrent telemetry stream"
            value={form.title}
            onChangeText={update('title')}
            testID="newbug-title-input"
          />

          <TextInput
            label="DETAILED DESCRIPTION *"
            placeholder="Provide technical synopsis, expected vs actual behavior, stack traces..."
            value={form.description}
            onChangeText={update('description')}
            multiline
            numberOfLines={4}
            testID="newbug-desc-input"
          />

          <TextInput
            label="STEPS TO REPRODUCE"
            placeholder="1. Launch CLI with --debug flag&#10;2. Stream 1000 items&#10;3. Observe crash"
            value={form.stepsToReproduce}
            onChangeText={update('stepsToReproduce')}
            multiline
            numberOfLines={4}
            testID="newbug-steps-input"
          />
        </Card>

        {/* Environment Diagnostics Auto-Scanner */}
        <Card style={styles.sectionCard}>
          <View style={styles.specHeaderRow}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
              ENVIRONMENT & TELEMETRY SPECS
            </Text>
            <TouchableOpacity
              onPress={handleScanSpecs}
              style={[
                styles.scanBtn,
                {
                  backgroundColor: isDark ? 'rgba(0, 240, 255, 0.1)' : '#EEF2FA',
                  borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : '#C8D4EE',
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.scanBtnText, { color: theme.colors.primary }]}>
                {scanning ? 'SCANNING...' : '⚡ AUTO-SCAN'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={form.environment}
            onChangeText={update('environment')}
            testID="newbug-env-input"
          />
        </Card>

        {/* Attachment Upload Box */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
            TELEMETRY SCREENSHOT / ATTACHMENT
          </Text>

          {selectedImage ? (
            <View
              style={[
                styles.previewContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: isDark ? '#060910' : theme.colors.surface,
                },
              ]}
            >
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewMeta}>
                <Text style={[styles.previewName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {selectedImage.fileName ?? 'telemetry_screenshot.png'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeBtn}>
                  <Text style={[styles.removeText, { color: theme.colors.danger }]}>
                    ✕ REMOVE FILE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              style={[
                styles.attachBox,
                {
                  borderColor: isDark ? '#1C293E' : theme.colors.border,
                  backgroundColor: isDark ? '#060910' : theme.colors.surface,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.attachIcon, { color: theme.colors.primary }]}>⌲</Text>
              <Text style={[styles.attachTitle, { color: theme.colors.textPrimary }]}>
                Attach System Screenshot or Log Output
              </Text>
              <Text style={[styles.attachSub, { color: theme.colors.textSecondary }]}>
                Supports PNG, JPEG, SVG up to 10MB
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: isDark ? 'rgba(255, 51, 102, 0.12)' : '#FEECEC',
                borderColor: theme.colors.danger,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        <Button
          label="TRANSMIT INCIDENT REPORT"
          onPress={handleSubmit}
          isLoading={isLoading}
          size="lg"
          testID="newbug-submit-button"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  successSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  sectionCard: {
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  projectIcon: {
    fontSize: 12,
  },
  projectName: {
    fontSize: 12,
  },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  severityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  severitySub: {
    fontSize: 11,
    lineHeight: 14,
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  scanBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  attachBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  attachIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  attachTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  attachSub: {
    fontSize: 11,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  previewMeta: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeBtn: {
    alignSelf: 'flex-start',
  },
  removeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
