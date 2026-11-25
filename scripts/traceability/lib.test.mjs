import { describe, expect, it } from 'vitest';
import { evaluate, idsInSrs, idsInTest } from './lib.mjs';

const SRS = '* **`FR-006`:** SOS.\n* **`NFR-012`:** data.\n* **`NFR-021`:** expansion.';

describe('S0 traceability: parsing', () => {
  it('S0 reads the FR/NFR universe from the SRS', () => {
    expect([...idsInSrs(SRS)].sort()).toEqual(['FR-006', 'NFR-012', 'NFR-021']);
  });

  it('S0 finds IDs in Pest, Vitest/Jest and pytest test names', () => {
    expect(idsInTest("it('FR-006 creates SOS report')->group('FR-006');")).toEqual(['FR-006']);
    expect(idsInTest("it('NFR-022 theme follows system', () => {})")).toEqual(['NFR-022']);
    expect(idsInTest('def test_nfr_014_only_allowlisted_fields() -> None:')).toEqual(['NFR-014']);
    expect(idsInTest('def test_fr_013_transcribes(): ...')).toEqual(['FR-013']);
  });
});

describe('S0 traceability: verdict', () => {
  const universe = idsInSrs(SRS);

  it('S0 passes when every implemented ID has a test', () => {
    const result = evaluate({
      universe,
      implemented: ['NFR-021'],
      tests: [{ file: 'a.php', ids: ['NFR-021'] }],
    });
    expect(result.errors).toEqual([]);
    expect(result.matrix.get('NFR-021')).toEqual(['a.php']);
  });

  it('S0 fails when an implemented ID has no test', () => {
    const result = evaluate({ universe, implemented: ['FR-006'], tests: [] });
    expect(result.errors).toEqual(['FR-006 is declared implemented but no test names it']);
  });

  it('S0 fails when a test or the manifest names an ID that is not in the SRS', () => {
    const result = evaluate({
      universe,
      implemented: ['FR-099'],
      tests: [{ file: 'b.ts', ids: ['NFR-077'] }],
    });
    expect(result.errors).toContain(
      'FR-099 in docs/traceability/implemented.json is not in docs/srs.md',
    );
    expect(result.errors).toContain('b.ts names NFR-077, which is not in docs/srs.md');
  });
});
