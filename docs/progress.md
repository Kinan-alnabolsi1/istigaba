# Progress

## Current slice

**S0 Foundation**: implemented and verified locally (2026-11-26). Remaining DoD items are push + CI green on GitHub, and a reset of the local dev database (see Blockers).

## Done (S0)

- Plan `docs/plans/S0.md` approved with owner decisions B1–B8 and Q1–Q4.
- Reference docs copied byte-identical into `docs/` (B1).
- Root tooling: pnpm 12 workspace + catalogs, Node 26.13.1 pins, LF line endings, editorconfig, Prettier, base tsconfig, root scripts, `pnpm doctor`.
- `packages/api-types` generated from the unchanged `openapi.yaml`; `packages/api-client` (typed Axios with Bearer, Accept-Language, Idempotency-Key, single-flight refresh + queued retry, error normalisation); `packages/i18n`; `packages/config` (tokens + generated web CSS + NativeWind preset); `packages/web-ui` (shadcn Button, theme/language stores, inline head script, CSP plugin, switchers); `packages/ui` (NativeWind v4 ThemeProvider, tokens, Text/Num).
- `apps/api`: Laravel 13 with 10 module skeletons, architecture tests, request id, error envelope with contract codes in ar/en, locale, security headers, CORS, JSON logs with redaction, `/health` (B5), local-only Telescope; base migrations for all 19 DBML tables; DB setup script; schema-drift check.
- `apps/ai-service`: FastAPI skeleton (health, X-Internal-Key protected-router factory, request id, allowlist-only JSON logging), hashed locks, committed OpenAPI snapshot.
- `apps/web-ops`, `apps/web-admin`: Vite shells with the structures from their CLAUDE.md; verified in the browser in ar/en and Light/Dark.
- `apps/mobile-citizen`, `apps/mobile-field`: Expo 57 shells with the structures from their CLAUDE.md; Android JS bundles export.
- ESLint boundary/frontend rules proven by fixtures; traceability script + `docs/traceability/implemented.json`; Redocly lint; gitleaks config; GitHub Actions `ci.yml`.

## Next

- Push to `main` and confirm all CI jobs are green on GitHub.
- S1 Identity: write `docs/plans/S1.md` (FR-001..004) for approval.

## Blockers

- None for code. One pending owner action: approve `migrate:fresh` on the local **dev** database `istigaba`. It was migrated before the timestamp-precision fix, so its timestamps are `timestamp(0)`. It holds no data; the test database is correct.

## Open decisions

- Framework tables (`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations`) are allowlisted in the drift check (B2). Telescope's tables exist only in the local dev DB: its migration is loaded from the package when `APP_ENV=local`.
- GIST indexes on geography columns: deferred to S10 (B7).
- `report_types` category for "SOS عام": still open (seed-proposal.md), needed in S2.
- Contract quality (no change made, `openapi.yaml` is frozen). Redocly reports 18 `no-invalid-media-type-examples` warnings:
  - examples for `GET /field/assignments/{assignmentId}` and `POST .../assignments/active/reassign` lack required properties;
  - a `discriminator` on the boolean `is_anonymous` (operations report schemas) is invalid for OpenAPI discriminators.
  - Prism serves these examples, so the mock returns them as written. An owner-approved contract fix is needed before S3/S7 screens rely on them.
- Placeholder app identifiers `example.istigaba.citizen` / `example.istigaba.field` in `app.json`: the real bundle ids are needed before the first EAS build (S3).
- `GET /report-types` and `GET /settings/public` require a bearer token in the contract (global `bearerAuth`), so the `Public` resource prefix (Q1) means "reads for every authenticated role", not anonymous access.

## Deviations from the S0 plan (all minor)

- pnpm settings live in `pnpm-workspace.yaml` instead of `.npmrc` (pnpm ≥ 11).
- A wrong HTTP method returns 404 `not_found` (the contract defines no 405 code).
- Dev DB precision: Laravel's `timestampTz` defaults to precision 0; `Schema::defaultTimePrecision(null)` makes it match DBML `timestamptz`. The drift check caught this.
- The test-DB guard lives in `TestCase::refreshApplication()`: trait methods override parent methods, so `beforeRefreshingDatabase()` was not usable.
- Web theme/language stores, the head script and the CSP plugin are shared from `packages/web-ui` instead of being duplicated per app. The CSP meta is inserted right after `<meta charset>`.
- React: web apps use 19.2.9 (react-router 8.5 peer); mobile keeps Expo's 19.2.3.
- `react-native-css-interop` is a direct dependency of the mobile apps (Metro under pnpm isolated installs); no hoisting was needed (R4).
- ai-service tests were written right after the code instead of before it. Their bite was proven by mutating the log formatter (NFR-014 tests went red).
- The CI commit-message check (optional in the plan) was not added: the three pre-S0 commits on `main` carry no IDs.

## Verification log

| Date | Command | Result |
|---|---|---|
| 2026-11-26 | `pnpm doctor` | All toolchain checks ok (PHP 8.4.22 via Herd after `source ~/.bashrc`) |
| 2026-11-26 | `composer test` (apps/api) | 112/112 passed (Architecture 76, Feature/Unit, Database incl. eloquent-spatial on PostGIS 3.7, Contract spike, Privacy placeholder) |
| 2026-11-26 | Architecture rules bite | 6 deliberately violating classes produced 6 red rules; removed, back to green |
| 2026-11-26 | `composer lint -- --test`, `composer analyse` | Pint ok; Larastan level 6: 0 errors |
| 2026-11-26 | `pnpm schema:drift` | No drift: 19 tables, 8 enums (it first caught `timestamp(0)`, now fixed) |
| 2026-11-26 | `pnpm test` | 108 JS tests passed (root scripts + ESLint fixtures 37, packages 55, web 6, mobile 10) |
| 2026-11-26 | `pnpm lint`, `pnpm typecheck` | Clean |
| 2026-11-26 | `pnpm test:ai`, ruff, mypy strict | 22 passed; clean. NFR-014 tests proven by mutation |
| 2026-11-26 | `pnpm traceability` | 61 SRS IDs; S0 NFR-008/012/014/021/022 each covered |
| 2026-11-26 | `pnpm openapi:lint` | Valid, 0 errors, 18 warnings (see Open decisions) |
| 2026-11-26 | `pnpm api-types:check`, `pnpm tokens:check`, AI snapshot | Current |
| 2026-11-26 | Web builds; built CSP | Both build; CSP meta right after charset (byte 56); inline script hash matches |
| 2026-11-26 | Browser (web-ops, web-admin) | ar/RTL and en/LTR, Light and Dark, admin chrome override, only `istigaba-theme`/`istigaba-lang` in storage, no console errors |
| 2026-11-26 | `expo export --platform android` (both apps) | Exported (Hermes bundle ~4.1 MB); native EAS builds not part of S0 |
| 2026-11-26 | Audits | composer: none; pip-audit: none; pnpm: 0 high after overrides (1 dev-only high ignored, 2 moderate) |
| 2026-11-26 | Prism `pnpm mock:api` | Serves at root (no `/api/v1`); bearer-protected examples returned |
| — | GitHub Actions CI | **Not yet run**: waiting for the push |
