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
import { useRoute, RouteProp } from '@react-navigation/native';
import { SeverityBadge, StatusBadge, Card, Button, useTheme } from '@dhundo/ui';
import { bugsApi, Bug, BugStatus, BugComment, UserRole, useAuthStore } from '@dhundo/shared';
import { BugStackParamList } from '../navigation/types';

type Route = RouteProp<BugStackParamList, 'BugDetail'>;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export function BugDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
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
    user?.role === UserRole.QA;

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

  const handleUpdateStatus = async (nextStatus: BugStatus) => {
    if (!bug) return;
    setIsUpdatingStatus(true);
    try {
      const res = await bugsApi.update(bug.id, { status: nextStatus });
      setBug(res.data.data as Bug);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!bug || !user) return;
    setIsUpdatingStatus(true);
    try {
      const res = await bugsApi.update(bug.id, { assigneeId: user.id });
      setBug(res.data.data as Bug);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to assign bug.');
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
    } catch (err: any) {
      setCommentError(err?.response?.data?.message ?? 'Failed to post comment.');
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
          📁 {bug.project?.name} · Reported by {bug.reporter?.name}
        </Text>
        {bug.assignee && (
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            👤 Assigned to {bug.assignee.name}
          </Text>
        )}
      </Card>

      {/* Triage & Quick Actions (Dev / QA / Admin) */}
      {canTriage && (
        <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
          <View style={styles.triageHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 0 }]}>
              ⚡ Triage & Actions
            </Text>
            {isUpdatingStatus && <ActivityIndicator size="small" color={theme.colors.primary} />}
          </View>
          <View style={styles.actionButtonRow}>
            {bug.assigneeId !== user?.id && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={handleAssignToMe}
                disabled={isUpdatingStatus}
              >
                <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>👤 Assign to Me</Text>
              </TouchableOpacity>
            )}

            {bug.status === BugStatus.OPEN && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.info, borderColor: theme.colors.info }]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_PROGRESS)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>▶ Start Working</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>✓ Resolve</Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.IN_PROGRESS && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.warning, borderColor: theme.colors.warning }]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_REVIEW)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>👀 In Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>✓ Resolve</Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.IN_REVIEW && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>✓ Resolve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger }]}
                  onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>↺ Request Changes</Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.RESOLVED && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.textSecondary, borderColor: theme.colors.textSecondary }]}
                  onPress={() => handleUpdateStatus(BugStatus.CLOSED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>🔒 Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger }]}
                  onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>↺ Reopen</Text>
                </TouchableOpacity>
              </>
            )}

            {bug.status === BugStatus.CLOSED && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger }]}
                onPress={() => handleUpdateStatus(BugStatus.REOPENED)}
                disabled={isUpdatingStatus}
              >
                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>↺ Reopen Bug</Text>
              </TouchableOpacity>
            )}

            {bug.status === BugStatus.REOPENED && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.info, borderColor: theme.colors.info }]}
                  onPress={() => handleUpdateStatus(BugStatus.IN_PROGRESS)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>▶ Start Working</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }]}
                  onPress={() => handleUpdateStatus(BugStatus.RESOLVED)}
                  disabled={isUpdatingStatus}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>✓ Resolve</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Card>
      )}

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

      {/* Attachments Gallery */}
      {bug.attachments && bug.attachments.length > 0 && (
        <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Attachments ({bug.attachments.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentScroll}>
            {bug.attachments.map((att) => {
              const url = getAttachmentUrl(att.fileUrl);
              return (
                <TouchableOpacity
                  key={att.id}
                  onPress={() => setSelectedImage(url)}
                  style={[styles.thumbnailWrap, { borderColor: theme.colors.border }]}
                >
                  <Image source={{ uri: url }} style={styles.thumbnail} resizeMode="cover" />
                  <Text style={[styles.attachmentName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {att.fileName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>
      )}

      {/* Comments */}
      <Card elevation="none" style={[styles.section, { borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Comments ({bug.comments?.length ?? 0})
        </Text>
        {bug.comments?.length === 0 && (
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>No comments yet. Be the first to comment!</Text>
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

        {/* Comment Composer */}
        <View style={[styles.composerContainer, { borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[
              styles.composerInput,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
            placeholder="Write a comment or update..."
            placeholderTextColor={theme.colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          {commentError ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{commentError}</Text>
          ) : null}
          <View style={styles.composerActions}>
            <Button
              label={isPostingComment ? 'Posting...' : 'Post Comment'}
              onPress={handlePostComment}
              disabled={isPostingComment || !commentText.trim()}
              size="sm"
            />
          </View>
        </View>
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBg}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedImage(null)}>
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, gap: 12, paddingTop: Platform.OS === 'web' ? 20 : 56 },
  section: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 26 },
  meta: { fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 22 },
  triageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  actionButtonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  attachmentScroll: { gap: 10, paddingVertical: 4 },
  thumbnailWrap: { width: 100, borderRadius: 8, borderWidth: 1, overflow: 'hidden', padding: 4 },
  thumbnail: { width: '100%', height: 75, borderRadius: 4 },
  attachmentName: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  commentRow: { borderTopWidth: 1, paddingTop: 12, gap: 2 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentDate: { fontSize: 11, marginTop: 2 },
  composerContainer: { borderTopWidth: 1, paddingTop: 14, marginTop: 8, gap: 8 },
  composerInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top' },
  composerActions: { alignSelf: 'flex-end' },
  errorText: { fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  modalCloseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  fullscreenImage: { width: '92%', height: '80%' },
});
