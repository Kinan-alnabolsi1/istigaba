import { describe, expect, it } from 'vitest';
import { defaultLanguage, dirFor, isKnownErrorCode, resources, toLanguage } from '../src';

function keyPaths(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? keyPaths(v as object, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}
function values(obj: object): unknown[] {
  return Object.values(obj).flatMap((v) =>
    typeof v === 'object' && v !== null ? values(v as object) : [v],
  );
}

describe('NFR-022 i18n resources', () => {
  it('NFR-022 Arabic and English have identical key sets', () => {
    expect(keyPaths(resources.en).sort()).toEqual(keyPaths(resources.ar).sort());
  });

  it('NFR-022 every string is non-empty', () => {
    for (const lang of ['ar', 'en'] as const) {
      for (const v of values(resources[lang])) {
        expect(typeof v).toBe('string');
        expect((v as string).trim()).not.toBe('');
      }
    }
  });

  it('NFR-022 Arabic is the default language and is RTL', () => {
    expect(defaultLanguage).toBe('ar');
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('en')).toBe('ltr');
  });

  it('NFR-022 unknown or missing languages fall back to Arabic', () => {
    expect(toLanguage('en-GB')).toBe('en');
    expect(toLanguage('fr')).toBe('ar');
    expect(toLanguage(null)).toBe('ar');
  });

  it('NFR-022 every contract error code has a localized message', () => {
    const contractCodes = [
      'malformed_request',
      'unauthenticated',
      'forbidden',
      'not_found',
      'invalid_state_transition',
      'validation_failed',
      'rate_limited',
      'internal_error',
      'ai_component_unavailable',
    ];
    for (const code of contractCodes) expect(isKnownErrorCode(code)).toBe(true);
    expect(isKnownErrorCode('network_error')).toBe(true);
    expect(isKnownErrorCode('toString')).toBe(false);
  });

  it('NFR-006 FR-001 FR-002 every S1 identity error code has a localized message', () => {
    const s1Codes = [
      'invalid_credentials',
      'account_locked',
      'account_deactivated',
      'email_taken',
      'phone_taken',
      'invalid_current_password',
      'location_consent_required',
      'wrong_app_role',
    ];
    for (const code of s1Codes) expect(isKnownErrorCode(code)).toBe(true);
  });

  it('NFR-022 FR-002 the S1 web namespaces exist in both languages', () => {
    for (const lang of ['ar', 'en'] as const) {
      const r = resources[lang] as Record<string, unknown>;
      for (const ns of ['auth', 'profile', 'password', 'validation']) {
        expect(r[ns], `${lang}.${ns}`).toBeTypeOf('object');
      }
    }
    // Arabic needs all six CLDR plural forms for the lockout countdown.
    const ar = resources.ar as unknown as { auth: Record<string, string> };
    for (const form of ['zero', 'one', 'two', 'few', 'many', 'other']) {
      expect(ar.auth[`lockedMinutes_${form}`]).toContain('{{count}}');
    }
  });
});
