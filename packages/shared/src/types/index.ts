// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  ADMIN = 'ADMIN',
}

export enum BugSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  officeId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  createdAt: string;
}

// ─── Bug ──────────────────────────────────────────────────────────────────────

export interface Bug {
  id: string;
  projectId: string;
  project?: Project;
  reporterId: string;
  reporter?: User;
  assigneeId?: string;
  assignee?: User;
  title: string;
  description: string;
  stepsToReproduce?: string;
  severity: BugSeverity;
  status: BugStatus;
  environment?: string; // e.g. "iOS 17 / iPhone 15 Pro"
  createdAt: string;
  updatedAt: string;
  comments?: BugComment[];
  attachments?: BugAttachment[];
}

export interface CreateBugDto {
  projectId: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  severity: BugSeverity;
  environment?: string;
}

export interface UpdateBugDto {
  title?: string;
  description?: string;
  stepsToReproduce?: string;
  severity?: BugSeverity;
  status?: BugStatus;
  assigneeId?: string;
  environment?: string;
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface BugComment {
  id: string;
  bugId: string;
  userId: string;
  user?: User;
  comment: string;
  createdAt: string;
}

export interface CreateCommentDto {
  comment: string;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface BugAttachment {
  id: string;
  bugId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface BugFilters {
  projectId?: string;
  severity?: BugSeverity;
  status?: BugStatus;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'ASSIGNED' | 'COMMENTED' | 'STATUS_CHANGED' | 'MENTIONED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  bugId?: string;
  read: boolean;
  createdAt: string;
}
