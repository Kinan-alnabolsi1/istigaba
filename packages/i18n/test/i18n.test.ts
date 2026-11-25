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
});
