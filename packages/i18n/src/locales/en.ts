import type { LocaleShape } from '../types';

// English. Keys must match ar.ts exactly (enforced by test and by the LocaleShape type).
export const en = {
  common: {
    appName: 'Istigaba',
    loading: 'Loading…',
    retry: 'Try again',
  },
  apps: {
    ops: 'Operations Room',
    admin: 'System Administration',
    citizen: 'Citizen App',
    field: 'Field Unit App',
  },
  theme: {
    label: 'Appearance',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  language: {
    label: 'Language',
    ar: 'العربية',
    en: 'English',
  },
  errors: {
    malformed_request: 'The request could not be understood.',
    unauthenticated: 'Your session has ended. Please sign in again.',
    forbidden: 'You do not have permission to do this.',
    not_found: 'The requested item was not found.',
    invalid_state_transition: 'This action is not allowed in the current state.',
    validation_failed: 'Please check the highlighted fields.',
    rate_limited: 'Too many requests. Please try again shortly.',
    internal_error: 'Something went wrong. Please try again later.',
    ai_component_unavailable:
      'The assistant is unavailable right now. You can submit a manual report.',
    network_error: 'No network connection.',
    unknown_error: 'Something went wrong. Please try again.',
  },
} as const satisfies LocaleShape;
