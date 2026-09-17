import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

let _baseURL = 'http://localhost:4000/api/v1';
let _getAccessToken: (() => string | null) | null = null;
let _getRefreshToken: (() => string | null) | null = null;
let _onTokenRefreshed: ((accessToken: string) => void) | null = null;
let _onAuthFailed: (() => void) | null = null;

export function configureApiClient(config: {
  baseURL: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string) => void;
  onAuthFailed: () => void;
}) {
  _baseURL = config.baseURL;
  _getAccessToken = config.getAccessToken;
  _getRefreshToken = config.getRefreshToken;
  _onTokenRefreshed = config.onTokenRefreshed;
  _onAuthFailed = config.onAuthFailed;
  setupInterceptors();
}

const api: AxiosInstance = axios.create({
  baseURL: _baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

function setupInterceptors() {
  // Request interceptor — attach access token
  api.interceptors.request.use(
    (config) => {
      const token = _getAccessToken?.();
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor — handle 401 + token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = _getRefreshToken?.();
        if (!refreshToken) {
          _onAuthFailed?.();
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${_baseURL}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = response.data.data.accessToken;
          _onTokenRefreshed?.(newAccessToken);
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          _onAuthFailed?.();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (officeId: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>(
      '/auth/login',
      { officeId, password },
    ),
  register: (data: { name: string; officeId: string; email: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>(
      '/auth/register',
      data,
    ),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<unknown>>('/auth/me'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<unknown>>(`/projects/${id}`),
  create: (data: unknown) => api.post<ApiResponse<unknown>>('/projects', data),
  update: (id: string, data: unknown) => api.put<ApiResponse<unknown>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ─── Bugs ─────────────────────────────────────────────────────────────────────

export const bugsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<unknown>>('/bugs', { params }),
  getById: (id: string) => api.get<ApiResponse<unknown>>(`/bugs/${id}`),
  create: (data: unknown) => api.post<ApiResponse<unknown>>('/bugs', data),
  update: (id: string, data: unknown) => api.put<ApiResponse<unknown>>(`/bugs/${id}`, data),
  delete: (id: string) => api.delete(`/bugs/${id}`),
  addComment: (bugId: string, comment: string) =>
    api.post<ApiResponse<unknown>>(`/bugs/${bugId}/comments`, { comment }),
  getComments: (bugId: string) =>
    api.get<ApiResponse<unknown[]>>(`/bugs/${bugId}/comments`),
  uploadAttachment: (bugId: string, formData: FormData) =>
    api.post<ApiResponse<unknown>>(`/bugs/${bugId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Users (Admin) ────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/users'),
  getById: (id: string) => api.get<ApiResponse<unknown>>(`/users/${id}`),
  updateRole: (id: string, role: string) =>
    api.patch<ApiResponse<unknown>>(`/users/${id}/role`, { role }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;
