import { create } from 'zustand';
import { Bug, BugFilters, BugStatus } from '../types';

interface BugsState {
  bugs: Bug[];
  selectedBug: Bug | null;
  filters: BugFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  setBugs: (bugs: Bug[], pagination?: BugsState['pagination']) => void;
  setSelectedBug: (bug: Bug | null) => void;
  addBug: (bug: Bug) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  removeBug: (id: string) => void;
  setFilters: (filters: Partial<BugFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBugsStore = create<BugsState>((set) => ({
  bugs: [],
  selectedBug: null,
  filters: { page: 1, limit: 20 },
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

  setBugs: (bugs, pagination) =>
    set((state) => ({
      bugs,
      pagination: pagination ?? state.pagination,
    })),

  setSelectedBug: (bug) => set({ selectedBug: bug }),

  addBug: (bug) => set((state) => ({ bugs: [bug, ...state.bugs] })),

  updateBug: (id, updates) =>
    set((state) => ({
      bugs: state.bugs.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      selectedBug:
        state.selectedBug?.id === id ? { ...state.selectedBug, ...updates } : state.selectedBug,
    })),

  removeBug: (id) =>
    set((state) => ({
      bugs: state.bugs.filter((b) => b.id !== id),
      selectedBug: state.selectedBug?.id === id ? null : state.selectedBug,
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 },
    })),

  clearFilters: () => set({ filters: { page: 1, limit: 20 } }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
