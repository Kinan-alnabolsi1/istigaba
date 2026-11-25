// FR/NFR traceability core (CLAUDE.md §3.1). Pure functions, unit-tested in lib.test.mjs.

const SRS_ID = /\b(FR|NFR)-(\d{3})\b/g;
// Pest/Vitest/Jest names and groups use "FR-006"; pytest names use "fr_006" / "nfr_014".
const TEST_ID = /\b(FR|NFR)-(\d{3})\b|(?<![a-z0-9])(fr|nfr)_(\d{3})(?![0-9])/gi;

/** @returns {Set<string>} every FR-xxx / NFR-xxx mentioned in the SRS */
export function idsInSrs(text) {
  return new Set([...text.matchAll(SRS_ID)].map((m) => `${m[1]}-${m[2]}`));
}

/** @returns {string[]} unique IDs named in a test file, normalised to FR-xxx / NFR-xxx */
export function idsInTest(text) {
  const ids = [...text.matchAll(TEST_ID)].map((m) =>
    m[1] ? `${m[1].toUpperCase()}-${m[2]}` : `${m[3].toUpperCase()}-${m[4]}`,
  );
  return [...new Set(ids)];
}

/**
 * @param {{ universe: Set<string>, implemented: string[], tests: { file: string, ids: string[] }[] }} input
 * @returns {{ errors: string[], matrix: Map<string, string[]> }}
 */
export function evaluate({ universe, implemented, tests }) {
  const errors = [];
  const matrix = new Map();
  for (const { file, ids } of tests) {
    for (const id of ids) {
      if (!universe.has(id)) errors.push(`${file} names ${id}, which is not in docs/srs.md`);
      matrix.set(id, [...(matrix.get(id) ?? []), file]);
    }
  }
  for (const id of implemented) {
    if (!universe.has(id)) {
      errors.push(`${id} in docs/traceability/implemented.json is not in docs/srs.md`);
    } else if (!matrix.has(id)) {
      errors.push(`${id} is declared implemented but no test names it`);
    }
  }
  return { errors, matrix };
}
