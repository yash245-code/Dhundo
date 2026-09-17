export const APP_NAME = 'Dhundo';
export const API_VERSION = 'v1';

export const SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Employee',
  DEVELOPER: 'Developer',
  QA: 'QA',
  ADMIN: 'Admin',
};

// Status workflow: which statuses can transition to which
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['IN_REVIEW', 'OPEN'],
  IN_REVIEW: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'CLOSED'],
};

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const MAX_ATTACHMENT_SIZE_MB = 10;
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'video/mp4',
  'application/pdf',
  'text/plain',
];
