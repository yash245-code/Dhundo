import { BugSeverity, BugStatus } from '@dhundo/shared';

/**
 * Dhundo Design Tokens — "Clean Slate" Theme
 * A calm, professional palette for daily internal use.
 */

export const palette = {
  // Primary
  slateBlue: '#3A5BA0',
  deepSlateBlue: '#2C4478',
  slateBlueLight: '#5C7FCB', // dark mode lightened

  // Backgrounds
  offWhite: '#F7F8FA',
  white: '#FFFFFF',

  // Dark mode backgrounds
  darkBg: '#14161C',
  darkSurface: '#1E212B',

  // Borders
  coolGray: '#E2E5EA',
  darkBorder: '#2A2E38',

  // Text
  charcoal: '#1F2430',
  slateGray: '#6B7280',
  lightText: '#F2F3F5',
  lightTextSecondary: '#9AA0AC',

  // Status / Severity
  mutedGreen: '#3FA66B',
  amber: '#E1A63A',
  mutedRed: '#D14D4D',
  softTeal: '#3AA0A0',

  // Utility
  transparent: 'transparent',
  black: '#000000',
} as const;

export type ColorPalette = typeof palette;

// ─── Severity Colors ─────────────────────────────────────────────────────────

export const severityColors = {
  LOW: { bg: '#EDF7F2', text: palette.mutedGreen, border: '#C6E8D5' },
  MEDIUM: { bg: '#FDF6E7', text: palette.amber, border: '#F5DCAB' },
  HIGH: { bg: '#FEECEC', text: palette.mutedRed, border: '#F5C5C5' },
  CRITICAL: { bg: '#FEE8E8', text: '#A83232', border: '#F0AAAA' },
} as const;

export const severityColorsDark = {
  LOW: { bg: 'rgba(0, 255, 157, 0.12)', text: '#00FF9D', border: 'rgba(0, 255, 157, 0.35)' },
  MEDIUM: { bg: 'rgba(255, 184, 0, 0.12)', text: '#FFB800', border: 'rgba(255, 184, 0, 0.35)' },
  HIGH: { bg: 'rgba(255, 128, 0, 0.14)', text: '#FF8800', border: 'rgba(255, 128, 0, 0.4)' },
  CRITICAL: { bg: 'rgba(255, 51, 102, 0.18)', text: '#FF3366', border: 'rgba(255, 51, 102, 0.5)' },
} as const;

// ─── Status Colors ────────────────────────────────────────────────────────────

export const statusColors = {
  OPEN: { bg: '#EEF2FA', text: palette.slateBlue, border: '#C8D4EE' },
  IN_PROGRESS: { bg: '#E7F5F5', text: palette.softTeal, border: '#B8DEDE' },
  IN_REVIEW: { bg: '#FDF6E7', text: palette.amber, border: '#F5DCAB' },
  RESOLVED: { bg: '#EDF7F2', text: palette.mutedGreen, border: '#C6E8D5' },
  CLOSED: { bg: '#F4F5F6', text: palette.slateGray, border: '#D5D8DE' },
  REOPENED: { bg: '#FEECEC', text: palette.mutedRed, border: '#F5C5C5' },
} as const;

export const statusColorsDark = {
  OPEN: { bg: 'rgba(0, 240, 255, 0.12)', text: '#00F0FF', border: 'rgba(0, 240, 255, 0.35)' },
  IN_PROGRESS: { bg: 'rgba(56, 189, 248, 0.12)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.35)' },
  IN_REVIEW: { bg: 'rgba(255, 184, 0, 0.12)', text: '#FFB800', border: 'rgba(255, 184, 0, 0.35)' },
  RESOLVED: { bg: 'rgba(0, 255, 157, 0.12)', text: '#00FF9D', border: 'rgba(0, 255, 157, 0.35)' },
  CLOSED: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.35)' },
  REOPENED: { bg: 'rgba(255, 51, 102, 0.15)', text: '#FF3366', border: 'rgba(255, 51, 102, 0.45)' },
} as const;

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  surfaceElevated?: string;
  border: string;
  borderGlow?: string;
  textPrimary: string;
  textSecondary: string;
  textMuted?: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  accent?: string;
  overlay: string;
  shadow: string;
}

export interface BadgeColorSet {
  bg: string;
  text: string;
  border: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  severity: Record<BugSeverity, BadgeColorSet>;
  status: Record<BugStatus, BadgeColorSet>;
}

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: palette.slateBlue,
    primaryHover: palette.deepSlateBlue,
    background: palette.offWhite,
    surface: palette.white,
    surfaceElevated: '#FFFFFF',
    border: palette.coolGray,
    borderGlow: 'rgba(58, 91, 160, 0.2)',
    textPrimary: palette.charcoal,
    textSecondary: palette.slateGray,
    textMuted: '#9AA0AC',
    success: palette.mutedGreen,
    warning: palette.amber,
    danger: palette.mutedRed,
    info: palette.softTeal,
    accent: '#6366F1',
    overlay: 'rgba(31, 36, 48, 0.5)',
    shadow: 'rgba(31, 36, 48, 0.08)',
  },
  severity: severityColors,
  status: statusColors,
};

// ─── Dark Theme (Futuristic Clean Black Cyberpunk-Executive) ──────────────────

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#00F0FF', // Electric Neon Cyan
    primaryHover: '#00D4E2',
    background: '#030508', // Pure Obsidian Cyber Black
    surface: '#0A0D15', // Deep Space Glassmorphic Surface
    surfaceElevated: '#111624', // Elevated Card Surface
    border: '#1A2336', // Hairline Cyber Border
    borderGlow: 'rgba(0, 240, 255, 0.3)', // Neon Edge Luminescence
    textPrimary: '#F8FAFC', // Ice White
    textSecondary: '#94A3B8', // Cool Cyber Slate
    textMuted: '#64748B', // Muted Telemetry Grey
    success: '#00FF9D', // Matrix Emerald
    warning: '#FFB800', // Solar Amber
    danger: '#FF3366', // Laser Crimson
    info: '#38BDF8', // Electric Blue
    accent: '#818CF8', // Quantum Violet
    overlay: 'rgba(0, 0, 0, 0.85)',
    shadow: 'rgba(0, 0, 0, 0.8)',
  },
  severity: severityColorsDark,
  status: statusColorsDark,
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: palette.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: palette.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
