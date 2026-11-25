// packages/config/src/tokens.ts: Istigaba design tokens (single source of truth).
// Transcribed verbatim from docs/design/DESIGN_TOKENS.md §9.2 (v1.1.0). Change the doc first, then this file.
// Platform-agnostic: no imports from react-native, nativewind or tailwind.

export type Scheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';
export type Lang = 'ar' | 'en';
export type AppId = 'citizen' | 'field' | 'ops' | 'admin';
export const THEME_STORAGE_KEY = 'istigaba-theme';

/* ------------------------------------------------------------------ colours */
// Keys are the CSS custom-property names without "--". Same key on every platform.
export const color = {
  light: {
    // shadcn core
    background: '#F3F5F8',
    foreground: '#0E1B2C',
    card: '#FFFFFF',
    'card-foreground': '#0E1B2C',
    popover: '#FFFFFF',
    'popover-foreground': '#0E1B2C',
    primary: '#0F2A47',
    'primary-foreground': '#FFFFFF',
    secondary: '#EEF1F5',
    'secondary-foreground': '#0F2A47',
    muted: '#EEF1F5',
    'muted-foreground': '#566579',
    accent: '#E1EAF6',
    'accent-foreground': '#0F2A47',
    destructive: '#B3261E',
    'destructive-foreground': '#FFFFFF',
    border: '#D5DDE6',
    input: '#8493A6',
    ring: '#0B57B0',
    // sidebar (Ops default; Admin via appOverrides)
    sidebar: '#0F2A47',
    'sidebar-foreground': '#E4EBF4',
    'sidebar-primary': '#FFFFFF',
    'sidebar-primary-foreground': '#0F2A47',
    'sidebar-accent': '#FFFFFF',
    'sidebar-accent-foreground': '#0F2A47',
    'sidebar-border': 'rgba(255, 255, 255, 0.22)',
    'sidebar-ring': '#FFFFFF',
    'sidebar-hover': 'rgba(255, 255, 255, 0.10)',
    'sidebar-badge': 'rgba(255, 255, 255, 0.16)',
    'sidebar-muted-foreground': '#D5DFEC',
    'sidebar-restricted': '#FFB4AB',
    'sidebar-restricted-active': '#9B1C1C',
    // surfaces & text
    'surface-raised': '#FFFFFF',
    'surface-tint': '#E1EAF6',
    'surface-selected': '#EEF4FB',
    'border-subtle': '#C3CEDA',
    'text-secondary': '#3D4D63',
    'text-placeholder': '#5D6C80',
    'text-disabled': '#8493A6',
    'text-on-chrome': '#FFFFFF',
    'text-on-chrome-muted': '#D5DFEC',
    link: '#0B57B0',
    'link-hover': '#083F80',
    'danger-text': '#B3261E',
    'warning-text': '#8A4B00',
    topbar: '#FFFFFF',
    // mobile chrome
    'field-header': '#0F2A47',
    'field-header-foreground': '#FFFFFF',
    'field-header-muted': '#D5DFEC',
    'field-header-border': 'transparent',
    tabbar: '#FFFFFF',
    'tabbar-active': '#0F2A47',
    'tabbar-inactive': '#566579',
    // interactive states
    'primary-hover': '#183A60',
    'primary-pressed': '#0A1E34',
    'destructive-hover': '#9E211A',
    'state-hover': 'rgba(15, 42, 71, 0.06)',
    'state-pressed': 'rgba(15, 42, 71, 0.12)',
    'selected-border': '#0F2A47',
    'disabled-bg': '#EEF1F5',
    'toggle-on': '#17703F',
    'toggle-off': '#6B7A8D',
    // status & timeline
    'status-progress-bg': '#E1EAF6',
    'status-progress-fg': '#0F2A47',
    'status-done-bg': '#DFF2E7',
    'status-done-fg': '#145C34',
    'status-closed-bg': '#E3E8EE',
    'status-closed-fg': '#3D4D63',
    'timeline-done': '#0F2A47',
    'timeline-current-ring': '#C9D8EC',
    'timeline-pending': '#8493A6',
    'timeline-line': '#C3CEDA',
    // anonymous reporter
    'anon-bg': '#1F2937',
    'anon-fg': '#FFFFFF',
    'anon-banner-bg': '#1F2937',
    'anon-banner-fg': '#FFFFFF',
    // role pills
    'role-admin-bg': '#0B1420',
    'role-admin-fg': '#FFFFFF',
    'role-admin-border': '#0B1420',
    'role-dispatcher-bg': '#E1EAF6',
    'role-dispatcher-fg': '#0F2A47',
    'role-dispatcher-border': '#B9CCE6',
    'role-field-bg': '#EEF1F5',
    'role-field-fg': '#0E1B2C',
    'role-field-border': '#AEBBCB',
    'role-citizen-bg': '#FFFFFF',
    'role-citizen-fg': '#3D4D63',
    'role-citizen-border': '#AEBBCB',
    // callouts & live
    'callout-info-bg': '#E1EAF6',
    'callout-info-border': '#B9CCE6',
    'callout-info-fg': '#0F2A47',
    'callout-warning-bg': '#FFF4D6',
    'callout-warning-border': '#B7791F',
    'callout-warning-fg': '#3F2A06',
    'callout-danger-bg': '#FBE3E1',
    'callout-danger-border': '#C9463D',
    'callout-danger-fg': '#6E1414',
    'callout-success-bg': '#DFF2E7',
    'callout-success-border': '#DFF2E7',
    'callout-success-fg': '#145C34',
    'live-dot': '#17703F',
    'live-halo': '#CDEBD9',
    'live-fg': '#145C34',
    // severity
    'sev-critical-bg': '#9B1C1C',
    'sev-critical-fg': '#FFFFFF',
    'sev-critical-border': 'transparent',
    'sev-critical-solid': '#9B1C1C',
    'sev-high-bg': '#C2410C',
    'sev-high-fg': '#FFFFFF',
    'sev-high-border': 'transparent',
    'sev-high-solid': '#C2410C',
    'sev-medium-bg': '#FCD34D',
    'sev-medium-fg': '#3F2A06',
    'sev-medium-border': 'transparent',
    'sev-medium-solid': '#A97A00',
    'sev-low-bg': '#D8E2EE',
    'sev-low-fg': '#1F3A5C',
    'sev-low-border': 'transparent',
    'sev-low-solid': '#3E6596',
    // unit availability
    'avail-available-bg': '#17703F',
    'avail-available-fg': '#FFFFFF',
    'avail-available-border': 'transparent',
    'avail-available-solid': '#17703F',
    'avail-busy-bg': '#C2410C',
    'avail-busy-fg': '#FFFFFF',
    'avail-busy-border': 'transparent',
    'avail-busy-solid': '#C2410C',
    'avail-offline-bg': '#5B6878',
    'avail-offline-fg': '#FFFFFF',
    'avail-offline-border': 'transparent',
    'avail-offline-solid': '#5B6878',
    // SOS, recording, sensitive
    'sos-surface': '#9B1C1C',
    'sos-foreground': '#FFFFFF',
    'sos-panel': 'rgba(0, 0, 0, 0.25)',
    'sos-ring-track': 'rgba(255, 255, 255, 0.30)',
    'sos-button-bg': '#FFFFFF',
    'sos-button-fg': '#9B1C1C',
    'sos-button-ring': 'rgba(255, 255, 255, 0.22)',
    'recording-fg': '#9B1C1C',
    'record-button': '#9B1C1C',
    'record-button-ring': 'rgba(155, 28, 28, 0.14)',
    'waveform-active': '#0F2A47',
    'waveform-idle': '#AEBBCB',
    'sensitive-header': '#9B1C1C',
    'sensitive-header-fg': '#FFFFFF',
    'sensitive-border': '#9B1C1C',
    'sensitive-strip': '#6E1414',
    'sensitive-row': '#FFF7F6',
    // code
    'code-bg': '#EEF1F5',
    'code-fg': '#0E1B2C',
    'code-border': '#C3CEDA',
    'code-danger-bg': '#FBE3E1',
    'code-danger-fg': '#6E1414',
    'code-danger-border': '#C9463D',
    'codeblock-bg': '#0B1420',
    'codeblock-fg': '#E4EBF4',
    // overlays
    scrim: 'rgba(14, 27, 44, 0.60)',
    'scrim-admin': 'rgba(11, 20, 32, 0.62)',
    'scrim-sensitive': 'rgba(11, 20, 32, 0.82)',
    // map, markers, heat
    'map-ground': '#DDE5EE',
    'map-building': '#CFD9E4',
    'map-park': '#C5DBC5',
    'map-water': '#B5D0EA',
    'map-road-major': '#FFFFFF',
    'map-road-minor': '#F1F4F8',
    'map-label': '#4A5A70',
    'map-label-halo': '#DDE5EE',
    'marker-stroke': '#FFFFFF',
    'marker-selected': '#0F2A47',
    'marker-critical-halo': 'rgba(155, 28, 28, 0.25)',
    'marker-critical-fill': '#9B1C1C',
    'marker-critical-icon': '#FFFFFF',
    'marker-high-fill': '#C2410C',
    'marker-high-icon': '#FFFFFF',
    'marker-medium-fill': '#A97A00',
    'marker-medium-icon': '#FFFFFF',
    'marker-low-fill': '#3E6596',
    'marker-low-icon': '#FFFFFF',
    'unit-marker-stroke': '#FFFFFF',
    'unit-available-fill': '#17703F',
    'unit-available-icon': '#FFFFFF',
    'unit-busy-fill': '#C2410C',
    'unit-busy-icon': '#FFFFFF',
    'unit-offline-fill': '#5B6878',
    'unit-offline-icon': '#FFFFFF',
    'alert-circle-fill': 'rgba(155, 28, 28, 0.16)',
    'alert-circle-stroke': '#9B1C1C',
    'heat-1': '#D0BDC4',
    'heat-1-fg': '#5A0F0F',
    'heat-2': '#C69FA5',
    'heat-2-fg': '#5A0F0F',
    'heat-3': '#BF8B90',
    'heat-3-fg': '#5A0F0F',
    'heat-4': '#AF585B',
    'heat-4-fg': '#FFFFFF',
    'heat-5': '#A23031',
    'heat-5-fg': '#FFFFFF',
    // charts
    'chart-1': '#0F2A47',
    'chart-2': '#0B57B0',
    'chart-3': '#C2410C',
    'chart-4': '#17703F',
    'chart-5': '#7E3AA8',
    'chart-6': '#5B6878',
    'chart-grid': '#E3E8EE',
    'chart-axis': '#566579',
    'chart-track': '#EEF1F5',
    'chart-tooltip-bg': '#FFFFFF',
    'chart-tooltip-border': '#D5DDE6',
  },
  dark: {
    // shadcn core
    background: '#0B1220',
    foreground: '#EEF2F7',
    card: '#131C2B',
    'card-foreground': '#EEF2F7',
    popover: '#1A2537',
    'popover-foreground': '#EEF2F7',
    primary: '#8AB4F8',
    'primary-foreground': '#0B1A2E',
    secondary: '#1C2738',
    'secondary-foreground': '#EEF2F7',
    muted: '#1C2738',
    'muted-foreground': '#97A5B8',
    accent: '#1C3354',
    'accent-foreground': '#D4E3F6',
    destructive: '#B83A31',
    'destructive-foreground': '#FFFFFF',
    border: '#2C3A4F',
    input: '#6E7F97',
    ring: '#8AB4F8',
    // sidebar (Ops default; Admin via appOverrides)
    sidebar: '#0C1D31',
    'sidebar-foreground': '#E4EBF4',
    'sidebar-primary': '#E4EBF4',
    'sidebar-primary-foreground': '#0C1D31',
    'sidebar-accent': '#E4EBF4',
    'sidebar-accent-foreground': '#0C1D31',
    'sidebar-border': 'rgba(255, 255, 255, 0.12)',
    'sidebar-ring': '#8AB4F8',
    'sidebar-hover': 'rgba(255, 255, 255, 0.08)',
    'sidebar-badge': 'rgba(255, 255, 255, 0.14)',
    'sidebar-muted-foreground': '#B9C5D4',
    'sidebar-restricted': '#FFB4AB',
    'sidebar-restricted-active': '#9B1C1C',
    // surfaces & text
    'surface-raised': '#1A2537',
    'surface-tint': '#1C3354',
    'surface-selected': '#1C3354',
    'border-subtle': '#3A4A62',
    'text-secondary': '#B9C5D4',
    'text-placeholder': '#8796AB',
    'text-disabled': '#5B6C84',
    'text-on-chrome': '#FFFFFF',
    'text-on-chrome-muted': '#B9C5D4',
    link: '#8AB4F8',
    'link-hover': '#A3C4FA',
    'danger-text': '#FF9C94',
    'warning-text': '#F5B35C',
    topbar: '#131C2B',
    // mobile chrome
    'field-header': '#0C1D31',
    'field-header-foreground': '#FFFFFF',
    'field-header-muted': '#B9C5D4',
    'field-header-border': '#2C3A4F',
    tabbar: '#131C2B',
    'tabbar-active': '#8AB4F8',
    'tabbar-inactive': '#97A5B8',
    // interactive states
    'primary-hover': '#A3C4FA',
    'primary-pressed': '#7AA6EE',
    'destructive-hover': '#A3322A',
    'state-hover': 'rgba(238, 242, 247, 0.08)',
    'state-pressed': 'rgba(238, 242, 247, 0.14)',
    'selected-border': '#8AB4F8',
    'disabled-bg': '#1C2738',
    'toggle-on': '#34C77B',
    'toggle-off': '#7D8CA1',
    // status & timeline
    'status-progress-bg': '#1C3354',
    'status-progress-fg': '#D4E3F6',
    'status-done-bg': '#123824',
    'status-done-fg': '#A6F0C6',
    'status-closed-bg': '#273244',
    'status-closed-fg': '#CBD4E0',
    'timeline-done': '#8AB4F8',
    'timeline-current-ring': 'rgba(138, 180, 248, 0.30)',
    'timeline-pending': '#6E7F97',
    'timeline-line': '#3A4A62',
    // anonymous reporter
    'anon-bg': '#E5E9F0',
    'anon-fg': '#0E1B2C',
    'anon-banner-bg': '#273244',
    'anon-banner-fg': '#EEF2F7',
    // role pills
    'role-admin-bg': '#E5E9F0',
    'role-admin-fg': '#04070C',
    'role-admin-border': '#E5E9F0',
    'role-dispatcher-bg': '#1C3354',
    'role-dispatcher-fg': '#D4E3F6',
    'role-dispatcher-border': '#3A5F8F',
    'role-field-bg': '#1C2738',
    'role-field-fg': '#EEF2F7',
    'role-field-border': '#3A4A62',
    'role-citizen-bg': 'transparent',
    'role-citizen-fg': '#B9C5D4',
    'role-citizen-border': '#3A4A62',
    // callouts & live
    'callout-info-bg': '#142742',
    'callout-info-border': '#3A5F8F',
    'callout-info-fg': '#D4E3F6',
    'callout-warning-bg': '#3A2C08',
    'callout-warning-border': '#B7791F',
    'callout-warning-fg': '#FDE7A6',
    'callout-danger-bg': '#3D1213',
    'callout-danger-border': '#E0564C',
    'callout-danger-fg': '#FFD2CE',
    'callout-success-bg': '#10301F',
    'callout-success-border': '#1E5A3A',
    'callout-success-fg': '#A6F0C6',
    'live-dot': '#34C77B',
    'live-halo': 'rgba(52, 199, 123, 0.25)',
    'live-fg': '#6EE7A8',
    // severity
    'sev-critical-bg': '#5C1517',
    'sev-critical-fg': '#FFD7D4',
    'sev-critical-border': '#F0625D',
    'sev-critical-solid': '#F0625D',
    'sev-high-bg': '#5A2508',
    'sev-high-fg': '#FFD9BF',
    'sev-high-border': '#F08A4B',
    'sev-high-solid': '#F08A4B',
    'sev-medium-bg': '#4D3A06',
    'sev-medium-fg': '#FDE68A',
    'sev-medium-border': '#E9B949',
    'sev-medium-solid': '#E9B949',
    'sev-low-bg': '#1E3350',
    'sev-low-fg': '#D4E3F6',
    'sev-low-border': '#7FA6D6',
    'sev-low-solid': '#7FA6D6',
    // unit availability
    'avail-available-bg': '#0F3D27',
    'avail-available-fg': '#A6F0C6',
    'avail-available-border': '#34C77B',
    'avail-available-solid': '#34C77B',
    'avail-busy-bg': '#5A2508',
    'avail-busy-fg': '#FFD9BF',
    'avail-busy-border': '#F08A4B',
    'avail-busy-solid': '#F08A4B',
    'avail-offline-bg': '#273244',
    'avail-offline-fg': '#CBD4E0',
    'avail-offline-border': '#7D8CA1',
    'avail-offline-solid': '#7D8CA1',
    // SOS, recording, sensitive
    'sos-surface': '#7A1515',
    'sos-foreground': '#FFFFFF',
    'sos-panel': 'rgba(0, 0, 0, 0.25)',
    'sos-ring-track': 'rgba(255, 255, 255, 0.30)',
    'sos-button-bg': '#FFFFFF',
    'sos-button-fg': '#7A1515',
    'sos-button-ring': 'rgba(255, 255, 255, 0.18)',
    'recording-fg': '#FF9C94',
    'record-button': '#D9534D',
    'record-button-ring': 'rgba(240, 98, 93, 0.20)',
    'waveform-active': '#8AB4F8',
    'waveform-idle': '#3A4A62',
    'sensitive-header': '#8E1B1B',
    'sensitive-header-fg': '#FFFFFF',
    'sensitive-border': '#F0625D',
    'sensitive-strip': '#4A1012',
    'sensitive-row': '#2A1415',
    // code
    'code-bg': '#1C2738',
    'code-fg': '#EEF2F7',
    'code-border': '#3A4A62',
    'code-danger-bg': '#3D1213',
    'code-danger-fg': '#FFD2CE',
    'code-danger-border': '#E0564C',
    'codeblock-bg': '#04070C',
    'codeblock-fg': '#E4EBF4',
    // overlays
    scrim: 'rgba(0, 0, 0, 0.70)',
    'scrim-admin': 'rgba(0, 0, 0, 0.72)',
    'scrim-sensitive': 'rgba(0, 0, 0, 0.85)',
    // map, markers, heat
    'map-ground': '#141D2B',
    'map-building': '#1C2738',
    'map-park': '#17302A',
    'map-water': '#1A3550',
    'map-road-major': '#2C3A4F',
    'map-road-minor': '#222E40',
    'map-label': '#A3B1C4',
    'map-label-halo': '#0B1220',
    'marker-stroke': '#0B1220',
    'marker-selected': '#EEF2F7',
    'marker-critical-halo': 'rgba(240, 98, 93, 0.35)',
    'marker-critical-fill': '#F0625D',
    'marker-critical-icon': '#1A0505',
    'marker-high-fill': '#F08A4B',
    'marker-high-icon': '#1A0B02',
    'marker-medium-fill': '#E9B949',
    'marker-medium-icon': '#1A1302',
    'marker-low-fill': '#7FA6D6',
    'marker-low-icon': '#07121F',
    'unit-marker-stroke': '#0B1220',
    'unit-available-fill': '#34C77B',
    'unit-available-icon': '#05140C',
    'unit-busy-fill': '#F08A4B',
    'unit-busy-icon': '#1A0B02',
    'unit-offline-fill': '#7D8CA1',
    'unit-offline-icon': '#0B1220',
    'alert-circle-fill': 'rgba(240, 98, 93, 0.18)',
    'alert-circle-stroke': '#F0625D',
    'heat-1': '#3A1E28',
    'heat-1-fg': '#FFFFFF',
    'heat-2': '#6A2530',
    'heat-2-fg': '#FFFFFF',
    'heat-3': '#A1323A',
    'heat-3-fg': '#FFFFFF',
    'heat-4': '#D9534D',
    'heat-4-fg': '#1A0505',
    'heat-5': '#FF8A7A',
    'heat-5-fg': '#1A0505',
    // charts
    'chart-1': '#7FB2F0',
    'chart-2': '#F08A4B',
    'chart-3': '#34C77B',
    'chart-4': '#C9A0F0',
    'chart-5': '#E9B949',
    'chart-6': '#A3B1C4',
    'chart-grid': '#253247',
    'chart-axis': '#97A5B8',
    'chart-track': '#1C2738',
    'chart-tooltip-bg': '#1A2537',
    'chart-tooltip-border': '#2C3A4F',
  },
} as const satisfies Record<Scheme, Record<string, string>>;

export type ColorToken = keyof typeof color.light;

/** Per-app overrides. Only the System Administrator differs (near-black chrome). */
export const appOverrides: Partial<
  Record<AppId, Partial<Record<Scheme, Partial<Record<ColorToken, string>>>>>
> = {
  admin: {
    light: {
      sidebar: '#0B1420',
      'sidebar-primary-foreground': '#0B1420',
      'sidebar-accent-foreground': '#0B1420',
    },
    dark: {
      sidebar: '#04070C',
      'sidebar-primary-foreground': '#04070C',
      'sidebar-accent-foreground': '#04070C',
    },
  },
};

export function colorsFor(scheme: Scheme, app: AppId = 'ops'): Record<ColorToken, string> {
  return { ...color[scheme], ...appOverrides[app]?.[scheme] } as Record<ColorToken, string>;
}

/** `{ '--background': '#F3F5F8', … }`, for CSS generation and runtime variable providers. */
export function cssVars(scheme: Scheme, app: AppId = 'ops'): Record<`--${string}`, string> {
  const c = colorsFor(scheme, app);
  const out: Record<`--${string}`, string> = {};
  for (const k in c) out[`--${k}`] = c[k as ColorToken];
  for (const k in shadow[scheme]) out[`--shadow-${k}`] = shadow[scheme][k as ShadowToken];
  return out;
}

/* ------------------------------------------------------- domain metadata */
export const severityLevels = ['critical', 'high', 'medium', 'low'] as const;
export type Severity = (typeof severityLevels)[number];
export const severityMeta: Record<
  Severity,
  { label: Record<Lang, string>; icon: string; markerSize: number; halo: boolean }
> = {
  critical: {
    label: { ar: 'حرجة', en: 'Critical' },
    icon: 'octagon-alert',
    markerSize: 34,
    halo: true,
  },
  high: { label: { ar: 'عالية', en: 'High' }, icon: 'triangle-alert', markerSize: 30, halo: false },
  medium: {
    label: { ar: 'متوسطة', en: 'Medium' },
    icon: 'circle-alert',
    markerSize: 30,
    halo: false,
  },
  low: { label: { ar: 'منخفضة', en: 'Low' }, icon: 'info', markerSize: 30, halo: false },
};

export const availabilityLevels = ['available', 'busy', 'offline'] as const;
export type Availability = (typeof availabilityLevels)[number];
export const availabilityMeta: Record<Availability, { label: Record<Lang, string>; icon: string }> =
  {
    available: { label: { ar: 'متاحة', en: 'Available' }, icon: 'circle-check' },
    busy: { label: { ar: 'مشغولة', en: 'Busy' }, icon: 'clock' },
    offline: { label: { ar: 'غير متصلة', en: 'Offline' }, icon: 'circle-off' },
  };

/** Report status (openapi `ReportStatus`) and mission status (`MissionStatus`) to chip tone. */
export const statusTone = {
  received: 'progress',
  under_review: 'progress',
  assigned: 'progress',
  en_route: 'progress',
  on_site: 'progress',
  mission_completed: 'done',
  closed: 'closed',
  cancelled: 'closed',
} as const;

/* ------------------------------------------------------------ typography */
export const font = {
  // Web: full CSS stacks (fallbacks allowed)
  web: {
    arabic: "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif",
    latin: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  // Native: one family per weight, no fallbacks (expo-google-fonts names)
  native: {
    ar: {
      400: 'IBMPlexSansArabic_400Regular',
      500: 'IBMPlexSansArabic_500Medium',
      600: 'IBMPlexSansArabic_600SemiBold',
      700: 'IBMPlexSansArabic_700Bold',
    },
    en: {
      400: 'Inter_400Regular',
      500: 'Inter_500Medium',
      600: 'Inter_600SemiBold',
      700: 'Inter_700Bold',
    },
    mono: { ios: 'Menlo', android: 'monospace' },
  },
} as const;
export type Weight = 400 | 500 | 600 | 700;

export const leading = {
  body: { ar: 1.6, en: 1.5 },
  heading: 1.35,
  display: 1.1,
  single: 1.0,
} as const;

type TypeStyle = {
  size: number;
  weight: Weight;
  leading: 'body' | 'heading' | 'display' | 'single';
  latin?: true;
  tracking?: number;
};
export const typeScale = {
  'display-sos': { size: 104, weight: 700, leading: 'single', latin: true },
  'display-timer': { size: 64, weight: 700, leading: 'display', latin: true },
  'display-hero': { size: 40, weight: 700, leading: 'heading' },
  'sos-label': { size: 32, weight: 700, leading: 'single', latin: true, tracking: 1 },
  'brand-wordmark': { size: 30, weight: 700, leading: 'heading' },
  kpi: { size: 30, weight: 700, leading: 'single', latin: true },
  'headline-lg': { size: 26, weight: 700, leading: 'heading' },
  'headline-sm': { size: 24, weight: 700, leading: 'heading' },
  headline: { size: 22, weight: 700, leading: 'heading' },
  'title-lg': { size: 20, weight: 700, leading: 'heading' },
  'title-md': { size: 18, weight: 700, leading: 'heading' },
  'title-sm': { size: 16, weight: 700, leading: 'heading' },
  'body-lg': { size: 15, weight: 400, leading: 'body' },
  body: { size: 14, weight: 400, leading: 'body' },
  label: { size: 13, weight: 600, leading: 'heading' },
  'label-web': { size: 12, weight: 700, leading: 'heading' },
  caption: { size: 12, weight: 500, leading: 'heading' },
  micro: { size: 11, weight: 600, leading: 'heading' },
  'button-mobile': { size: 16, weight: 600, leading: 'single' },
  'button-web': { size: 14, weight: 700, leading: 'single' },
} as const satisfies Record<string, TypeStyle>;
export type TypeVariant = keyof typeof typeScale;

/** Absolute line height in px (React Native needs px). */
export function lineHeightPx(v: TypeVariant, lang: Lang): number {
  const s: TypeStyle = typeScale[v];
  const r = s.leading === 'body' ? leading.body[lang] : leading[s.leading];
  return Math.round(s.size * r);
}

/* ------------------------------------------------ spacing, size, radius */
export const space = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 48] as const;

export const size = {
  touchMin: 44,
  mobile: {
    button: 52,
    buttonCta: 60,
    buttonSos: 64,
    buttonCompact: 48,
    input: 48,
    appBar: 56,
    tabBar: 64,
    pill: 26,
    filterChip: 44,
    sosButton: 112,
    recordButton: 96,
  },
  web: {
    button: 40,
    buttonCompact: 36,
    buttonLarge: 44,
    input: 40,
    topBar: 60,
    sidebar: 228,
    pill: 26,
    filterChip: 32,
  },
  marker: { report: 30, reportCritical: 34, unit: 28 },
  icon: { xs: 14, sm: 16, md: 18, lg: 20, xl: 22 },
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  unit: 7,
  md: 9,
  'input-m': 10,
  lg: 12,
  xl: 14,
  '2xl': 16,
  full: 9999,
} as const;

/* --------------------------------------------------------------- shadows */
export const shadow = {
  light: {
    marker: '0 2px 6px rgba(14, 27, 44, 0.35)',
    popover: '0 8px 24px rgba(14, 27, 44, 0.22)',
    dialog: '0 24px 64px rgba(14, 27, 44, 0.40)',
    'dialog-admin': '0 24px 64px rgba(11, 20, 32, 0.45)',
    sensitive: '0 24px 72px rgba(0, 0, 0, 0.60)',
  },
  dark: {
    marker: '0 2px 6px rgba(0, 0, 0, 0.60)',
    popover: '0 8px 24px rgba(0, 0, 0, 0.50)',
    dialog: '0 24px 64px rgba(0, 0, 0, 0.60)',
    'dialog-admin': '0 24px 64px rgba(0, 0, 0, 0.65)',
    sensitive: '0 24px 72px rgba(0, 0, 0, 0.70)',
  },
} as const;
export type ShadowToken = keyof typeof shadow.light;

/** For renderers without CSS box-shadow (NativeWind v4, react-native-svg overlays). */
export const shadowNative = {
  light: {
    marker: {
      shadowColor: '#0E1B2C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 3,
    },
    popover: {
      shadowColor: '#0E1B2C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 8,
    },
    dialog: {
      shadowColor: '#0E1B2C',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.4,
      shadowRadius: 32,
      elevation: 24,
    },
  },
  dark: {
    marker: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 3,
      elevation: 3,
    },
    popover: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    dialog: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.6,
      shadowRadius: 32,
      elevation: 24,
    },
  },
} as const;

export const motion = { fast: 150, dialog: 200, dialogRise: 8, livePulse: 2000 } as const;

/* ------------------------------------------------------- maps & charts */
export const heat = {
  thresholds: [0.2, 0.4, 0.6, 0.8] as const,
  steps: ['heat-1', 'heat-2', 'heat-3', 'heat-4', 'heat-5'] as const,
};

/** Bucket a cell count (0..max) into heat step 1–5. */
export const heatStep = (count: number, max: number) =>
  (heat.thresholds.findIndex((t) => count / Math.max(max, 1) <= t) + 1 || 5) as 1 | 2 | 3 | 4 | 5;

function mapFor(s: Scheme) {
  const c = color[s];
  return {
    ground: c['map-ground'],
    building: c['map-building'],
    park: c['map-park'],
    water: c['map-water'],
    roadMajor: c['map-road-major'],
    roadMinor: c['map-road-minor'],
    label: c['map-label'],
    labelHalo: c['map-label-halo'],
    markerStroke: c['marker-stroke'],
    markerSelected: c['marker-selected'],
    criticalHalo: c['marker-critical-halo'],
    marker: {
      critical: { fill: c['marker-critical-fill'], icon: c['marker-critical-icon'] },
      high: { fill: c['marker-high-fill'], icon: c['marker-high-icon'] },
      medium: { fill: c['marker-medium-fill'], icon: c['marker-medium-icon'] },
      low: { fill: c['marker-low-fill'], icon: c['marker-low-icon'] },
    },
    unitStroke: c['unit-marker-stroke'],
    unit: {
      available: { fill: c['unit-available-fill'], icon: c['unit-available-icon'] },
      busy: { fill: c['unit-busy-fill'], icon: c['unit-busy-icon'] },
      offline: { fill: c['unit-offline-fill'], icon: c['unit-offline-icon'] },
    },
    alertCircle: {
      fill: c['alert-circle-fill'],
      stroke: c['alert-circle-stroke'],
      dash: [6, 4] as const,
      width: 2,
    },
    heat: heat.steps.map((k) => ({ fill: c[k], label: c[`${k}-fg` as ColorToken] })),
  };
}
export const mapTokens = { light: mapFor('light'), dark: mapFor('dark') };

function chartFor(s: Scheme) {
  const c = color[s];
  return {
    series: [c['chart-1'], c['chart-2'], c['chart-3'], c['chart-4'], c['chart-5'], c['chart-6']],
    severity: {
      critical: c['sev-critical-solid'],
      high: c['sev-high-solid'],
      medium: c['sev-medium-solid'],
      low: c['sev-low-solid'],
    },
    availability: {
      available: c['avail-available-solid'],
      busy: c['avail-busy-solid'],
      offline: c['avail-offline-solid'],
    },
    grid: c['chart-grid'],
    axis: c['chart-axis'],
    track: c['chart-track'],
    label: c.foreground,
    tooltip: { bg: c['chart-tooltip-bg'], border: c['chart-tooltip-border'] },
  };
}
export const chartTokens = { light: chartFor('light'), dark: chartFor('dark') };
