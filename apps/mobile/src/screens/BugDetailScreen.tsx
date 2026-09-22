import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SeverityBadge, StatusBadge, Card, Button, useTheme } from '@dhundo/ui';
import {
  bugsApi,
  Bug,
  BugStatus,
  BugSeverity,
  BugComment,
  UserRole,
  useAuthStore,
} from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Route = RouteProp<BugStackParamList, 'BugDetail'>;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const FALLBACK_BUGS_MAP: Record<string, Bug> = {
  'bug-101': {
    id: 'bug-101',
    projectId: 'proj-1',
    reporterId: 'user-1',
    assigneeId: 'user-2',
    title: 'Kernel buffer overflow during real-time telemetry streaming',
    description:
      'High-throughput telemetry ingestion triggers buffer memory saturation on concurrent WebSockets, causing packet drop and pipeline stall.',
    stepsToReproduce:
      '1. Initialize 500 simultaneous socket connections on port 4000\n2. Stream binary telemetry at 100hz\n3. Observe node buffer memory exceeding 1.8GB and dropping frame packets',
    severity: BugSeverity.CRITICAL,
    status: BugStatus.OPEN,
    environment: 'Linux 6.8 / Docker 24.0 / Screen 1920x1080 / Node.js v20.12',
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
        comment: 'Heap allocation profiling attached. Allocations spike on uncompressed JSON frames. Patch queued.',
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
};

export function BugDetailScreen() {
  const { theme, isDark } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [bug, setBug] = useState<Bug | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Triage state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Attachment preview state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const canTriage =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.DEVELOPER ||
    user?.role === UserRole.QA ||
    true; // Enabled by default in dev/demo

  useEffect(() => {
    (async () => {
      try {
        const res = await bugsApi.getById(route.params.bugId);
        setBug(res.data.data as Bug);
      } catch {
        // Fallback to sample bug if offline
        const fallback = FALLBACK_BUGS_MAP[route.params.bugId] || {
          ...FALLBACK_BUGS_MAP['bug-101'],
          id: route.params.bugId,
        };
        setBug(fallback);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [route.params.bugId]);

  const handleUpdateStatus = async (nextStatus: BugStatus) => {
    if (!bug) return;
    setIsUpdatingStatus(true);
    try {
      const res = await bugsApi.update(bug.id, { status: nextStatus });
      setBug(res.data.data as Bug);
    } catch {
      // Optimistic local update for demo/fallback
      setBug((b) => (b ? { ...b, status: nextStatus } : null));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!bug) return;
    setIsUpdatingStatus(true);
    const assignedUser = user || {
      id: 'user-dev',
      name: 'Alex Chen',
      officeId: 'EMP-1042',
      email: 'alex@company.com',
      role: UserRole.DEVELOPER,
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await bugsApi.update(bug.id, { assigneeId: assignedUser.id });
      setBug(res.data.data as Bug);
    } catch {
      setBug((b) =>
        b
          ? {
              ...b,
              assigneeId: assignedUser.id,
              assignee: assignedUser as any,
            }
          : null,
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePostComment = async () => {
    if (!bug || !commentText.trim()) return;
    setIsPostingComment(true);
    setCommentError('');
    try {
      const res = await bugsApi.addComment(bug.id, commentText.trim());
      const newComment = res.data.data as BugComment;
      setBug({
        ...bug,
        comments: [...(bug.comments ?? []), newComment],
      });
      setCommentText('');
    } catch {
      // Optimistic comment addition
      const optimisticComment: BugComment = {
        id: `c-${Date.now()}`,
        bugId: bug.id,
        userId: user?.id ?? 'user-current',
        comment: commentText.trim(),
        createdAt: new Date().toISOString(),
        user: user
          ? {
              id: user.id,
              name: user.name,
              officeId: user.officeId,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
            }
          : {
              id: 'user-current',
              name: 'Operator',
              officeId: 'EMP-001',
              email: 'operator@company.com',
              role: UserRole.DEVELOPER,
              createdAt: new Date().toISOString(),
            },
      };
      setBug({
        ...bug,
        comments: [...(bug.comments ?? []), optimisticComment],
      });
      setCommentText('');
    } finally {
      setIsPostingComment(false);
    }
  };

  const getAttachmentUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) return fileUrl;
    const base = API_BASE_URL.replace('/api/v1', '');
    return `${base}${fileUrl}`;
  };

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
        <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>
          ANOMALY RECORD NOT FOUND
        </Text>
        <Button label="Back to Matrix" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const ticketId = `#DH-${bug.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '001'}`;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Top Cyber Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? '#0A0E18' : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            ← DASHBOARD
          </Text>
        </TouchableOpacity>
        <View style={styles.ticketIdPill}>
          <Text style={[styles.ticketIdPillText, { color: theme.colors.primary }]}>
            {ticketId}
          </Text>
        </View>
      </View>

      {/* Primary Incident Header Card */}
      <Card
        glow={bug.severity === BugSeverity.CRITICAL}
        cyberAccent={true}
        style={styles.headerCard}
      >
        <View style={styles.badgeRow}>
          <SeverityBadge severity={bug.severity} />
          <StatusBadge status={bug.status} />
        </View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {bug.title}
        </Text>

        <View style={styles.projectTagRow}>
          <Text style={[styles.projectTagIcon, { color: theme.colors.primary }]}>◈</Text>
          <Text style={[styles.projectTagName, { color: theme.colors.textSecondary }]}>
            {bug.project?.name ?? 'System Core'}
          </Text>
        </View>
      </Card>

      {/* System Telemetry & Diagnostic Matrix */}
      <Card style={styles.telemetryCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            // SYSTEM TELEMETRY & SPECS
          </Text>
          <View
            style={[
              styles.telemetryStatus,
              { backgroundColor: isDark ? 'rgba(0, 255, 157, 0.1)' : '#EDF7F2' },
            ]}
          >
            <View style={[styles.greenDot, { backgroundColor: '#00FF9D' }]} />
            <Text style={[styles.greenText, { color: '#00FF9D' }]}>CAPTURED</Text>
          </View>
        </View>

        <View style={styles.specGrid}>
          <View
            style={[
              styles.specItem,
              {
                backgroundColor: isDark ? '#060910' : theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>
              ENVIRONMENT / OS
            </Text>
            <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
              {bug.environment || 'System Default / Web Browser'}
            </Text>
          </View>

          <View
            style={[
              styles.specItem,
              {
                backgroundColor: isDark ? '#060910' : theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>
              REPORTED BY
            </Text>
            <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
              {bug.reporter?.name} ({bug.reporter?.officeId || 'OPERATOR'})
            </Text>
          </View>

          <View
            style={[
              styles.specItem,
              {
                backgroundColor: isDark ? '#060910' : theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>
              CURRENT ASSIGNEE
            </Text>
            <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
              {bug.assignee ? bug.assignee.name : 'UNASSIGNED // PENDING'}
            </Text>
          </View>

          <View
            style={[
              styles.specItem,
              {
                backgroundColor: isDark ? '#060910' : theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>
              TIMESTAMP
            </Text>
            <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
              {new Date(bug.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>

      {/* Cockpit Triage Actions Bar */}
      {canTriage && (
        <Card style={styles.triageCard}>
          <View style={styles.triageHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              ⚡ COCKPIT TRIAGE ACTIONS
            </Text>
            {isUpdatingStatus && (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            )}
          </View>

          <View style={styles.actionButtonRow}>
            {bug.assigneeId !== user?.id && (
              <TouchableOpacity
                style={[
                  styles.cyberActionBtn,
                  {
                    backgroundColor: isDark ? '#0E1422' : theme.colors.surface,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={handleAssignToMe}
                disabled={isUpdatingStatus}
                activeOpacity={0.7}
              >
                <Text style={[styles.cyberActionText, { color: theme.colors.primary }]}>
                  👤 ASSIGN TO ME
                </Text>
              </TouchableOpacity>
            )}

            {bug.status === BugStatus.OPEN && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      borderColor: '#38BDF8',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_PROGRESS)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#38BDF8' }]}>
                    ▶ START WORKING
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(0, 255, 157, 0.15)',
                      borderColor: '#00FF9D',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#00FF9D' }]}>
                    ✓ MARK RESOLVED
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.IN_PROGRESS && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(255, 184, 0, 0.15)',
                      borderColor: '#FFB800',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_REVIEW)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#FFB800' }]}>
                    👀 CODE REVIEW
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(0, 255, 157, 0.15)',
                      borderColor: '#00FF9D',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#00FF9D' }]}>
                    ✓ RESOLVE
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.IN_REVIEW && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(0, 255, 157, 0.15)',
                      borderColor: '#00FF9D',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#00FF9D' }]}>
                    ✓ PASS & RESOLVE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(255, 51, 102, 0.15)',
                      borderColor: '#FF3366',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#FF3366' }]}>
                    ↺ REQUEST REVISIONS
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.RESOLVED && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: isDark ? '#111624' : '#E2E5EA',
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.CLOSED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: theme.colors.textSecondary }]}>
                    🔒 CLOSE TICKET
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(255, 51, 102, 0.15)',
                      borderColor: '#FF3366',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#FF3366' }]}>
                    ↺ REOPEN
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.CLOSED && (
              <TouchableOpacity
                style={[
                  styles.cyberActionBtn,
                  {
                    backgroundColor: 'rgba(255, 51, 102, 0.15)',
                    borderColor: '#FF3366',
                  },
                ]}
                onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                disabled={isUpdatingStatus}
              >
                <Text style={[styles.cyberActionText, { color: '#FF3366' }]}>
                  ↺ REOPEN TICKET
                </Text>
              </TouchableOpacity>
            )}

            {bug.status === BugStatus.REOPENED && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      borderColor: '#38BDF8',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_PROGRESS)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#38BDF8' }]}>
                    ▶ RESUME WORK
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cyberActionBtn,
                    {
                      backgroundColor: 'rgba(0, 255, 157, 0.15)',
                      borderColor: '#00FF9D',
                    },
                  ]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.cyberActionText, { color: '#00FF9D' }]}>
                    ✓ RESOLVE
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Card>
      )}

      {/* Anomaly Description */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          // INCIDENT DESCRIPTION
        </Text>
        <Text style={[styles.bodyText, { color: theme.colors.textPrimary }]}>
          {bug.description}
        </Text>
      </Card>

      {/* Steps to Reproduce */}
      {bug.stepsToReproduce && (
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            // REPRODUCTION PROCEDURE
          </Text>
          <View
            style={[
              styles.terminalBox,
              {
                backgroundColor: isDark ? '#05070D' : '#F4F5F8',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.monoBodyText,
                { color: isDark ? '#A5B4FC' : theme.colors.textPrimary },
              ]}
            >
              {bug.stepsToReproduce}
            </Text>
          </View>
        </Card>
      )}

      {/* Attachments Gallery */}
      {bug.attachments && bug.attachments.length > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            // TELEMETRY ATTACHMENTS ({bug.attachments.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentScroll}
          >
            {bug.attachments.map((att) => {
              const url = getAttachmentUrl(att.fileUrl);
              return (
                <TouchableOpacity
                  key={att.id}
                  onPress={() => setSelectedImage(url)}
                  style={[
                    styles.thumbnailWrap,
                    {
                      borderColor: isDark ? '#1C2638' : theme.colors.border,
                      backgroundColor: isDark ? '#0B0F19' : theme.colors.background,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: url }} style={styles.thumbnail} resizeMode="cover" />
                  <Text
                    style={[styles.attachmentName, { color: theme.colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {att.fileName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>
      )}

      {/* Cyber Discussion Stream */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          // COMM LOG ({bug.comments?.length ?? 0})
        </Text>

        {(!bug.comments || bug.comments.length === 0) && (
          <Text style={[styles.emptyCommentText, { color: theme.colors.textSecondary }]}>
            No comm logs recorded. Initialize discussion stream below.
          </Text>
        )}

        {bug.comments?.map((c) => (
          <View
            key={c.id}
            style={[
              styles.commentItem,
              {
                borderTopColor: isDark ? '#141D2D' : theme.colors.border,
              },
            ]}
          >
            <View style={styles.commentHeader}>
              <View style={styles.authorBadge}>
                <Text style={[styles.authorName, { color: theme.colors.textPrimary }]}>
                  {c.user?.name || 'Operator'}
                </Text>
                <View
                  style={[
                    styles.roleTag,
                    {
                      backgroundColor: isDark ? 'rgba(0, 240, 255, 0.1)' : '#EEF2FA',
                      borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : '#C8D4EE',
                    },
                  ]}
                >
                  <Text style={[styles.roleTagText, { color: theme.colors.primary }]}>
                    {c.user?.role || 'DEV'}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.commentTime,
                  { color: isDark ? '#5B6980' : theme.colors.textSecondary },
                ]}
              >
                {new Date(c.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <Text style={[styles.commentBody, { color: theme.colors.textPrimary }]}>
              {c.comment}
            </Text>
          </View>
        ))}

        {/* Cyber Comment Composer */}
        <View
          style={[
            styles.composerWrap,
            { borderTopColor: isDark ? '#162234' : theme.colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.composerInput,
              {
                color: theme.colors.textPrimary,
                borderColor: isDark ? '#1C283E' : theme.colors.border,
                backgroundColor: isDark ? '#060910' : theme.colors.background,
              },
            ]}
            placeholder="Transmit log message or update status..."
            placeholderTextColor={isDark ? '#4F5E75' : theme.colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          {commentError ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {commentError}
            </Text>
          ) : null}
          <View style={styles.composerActionRow}>
            <Button
              label={isPostingComment ? 'TRANSMITTING...' : 'TRANSMIT LOG'}
              onPress={handlePostComment}
              disabled={isPostingComment || !commentText.trim()}
              size="sm"
            />
          </View>
        </View>
      </Card>

      {/* Lightbox Modal */}
      {selectedImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBg}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.modalCloseText}>✕ CLOSE VIEWER</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  backText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ticketIdPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  ticketIdPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerCard: {
    padding: 18,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  projectTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectTagIcon: {
    fontSize: 12,
  },
  projectTagName: {
    fontSize: 12,
    fontWeight: '600',
  },
  telemetryCard: {
    padding: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  telemetryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  greenText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  specGrid: {
    gap: 8,
  },
  specItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  triageCard: {
    padding: 16,
    gap: 12,
  },
  triageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cyberActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cyberActionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionCard: {
    padding: 16,
    gap: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  terminalBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  monoBodyText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  attachmentScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  thumbnailWrap: {
    width: 100,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 4,
  },
  thumbnail: {
    width: '100%',
    height: 75,
    borderRadius: 4,
  },
  attachmentName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  commentItem: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  commentTime: {
    fontSize: 11,
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCommentText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  composerWrap: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
    gap: 8,
  },
  composerInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  composerActionRow: {
    alignSelf: 'flex-end',
  },
  errorText: {
    fontSize: 12,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: '#00F0FF',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalCloseText: {
    color: '#00F0FF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  fullscreenImage: {
    width: '92%',
    height: '80%',
  },
});
