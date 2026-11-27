# Progress

## Current slice

**S0 Foundation**: complete. Verified locally and green in GitHub Actions (2026-11-26). Only open item: the local dev database reset (see Blockers).

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
| 2026-11-26 | GitHub Actions run 45719398255 (`c8cff40`) | JS, API (incl. schema drift on `postgis/postgis:18-3.7`) and AI green; secret scan flagged the dummy ai-service test key |
| 2026-11-26 | gitleaks 8.30.1 locally (checksum-verified) | Finding located and reviewed: test key in `apps/ai-service/tests/conftest.py` (not a secret). Tests now generate the key at runtime; historical fingerprint in `.gitleaksignore`. History and tree: no leaks |
| 2026-11-26 | GitHub Actions run 45720158785 (`b7442ed`) | **All 4 jobs green** (Secret scan, JS, API, AI): https://github.com/Kinan-alnabolsi1/istigaba/actions/runs/45720158785 |

---

# S1 Identity (FR-001..FR-004), Track A — 2026-11-27

**Status: complete on Track A** (plan `docs/plans/S1.md`, approved with Q1–Q7). Pushed at Checkpoint 1 (`0c44255`) and Checkpoint 2 (`31a8248`); Checkpoint 3 (web) committed locally, push pending owner confirmation.

## Done (S1)

- **Contract** (`a9c4941`, owner-approved §9): login 401 `invalid_credentials`, 403 `account_deactivated`, 429 `rate_limited|account_locked`; refresh 401; 409 `email_taken|phone_taken` on register/profile/createUser/updateUser; E.164 on every writable `phone`; logout and consent texts. `packages/api-types` regenerated in the same commit.
- **api-client** (`2376951`): no refresh on public auth calls or token-less requests (`noRefreshPaths`), offline refresh keeps the session, 204 typed `void`, `isApiError`, `ApiErrorCode`.
- **i18n**: S1 error codes (`0c44255`); `auth`, `profile`, `password`, `validation` namespaces with full Arabic plural forms (Checkpoint 3).
- **api** (`4a37aa5`, `31a8248`): jwt-auth 2.10.0; register (Citizen only), login (any role), refresh rotation with reuse detection, logout `jti` denylist, lockout (5 failures / 15 min per email and per IP, audited without PII), `/me`, profile, password (revokes all sessions), location consent (D-15) and `PUT /me/location`, `role`/`permission` middleware (also rejects deactivated users), admin roles/permissions API (audited), RBAC seeders (20 D-34 codes = contract) and first admin from env, Argon2id, named rate limiters, ar/en validation messages, minimal append-only Audit writer.
- **web** (Checkpoint 3): `@istigaba/web-ui` primitives (Input, Label, Card, Alert, TextField, PasswordField), `@istigaba/web-ui/auth` (session factory: access token in memory, refresh token in `sessionStorage`, single-flight refresh/bootstrap, reject-and-log-out on a role mismatch; Login/Profile/ChangePassword forms with RHF + Zod). web-ops (Dispatcher) and web-admin (System Administrator): `/login`, guarded routes, `/profile`, `/profile/password`, header account menu. ESLint: `sessionStorage` banned in apps; inside web-ui only `auth/token-storage.ts` (refresh token) and `theme/storage.ts` (preferences) touch storage.
- `docs/traceability/implemented.json`: S1 = FR-001..004, NFR-006, NFR-007, NFR-010, NFR-011. FR-027 is only partly done (consent + location write) and is not declared.

## Next

- Push Checkpoint 3 and tell Track B (shared `@istigaba/web-ui` is web-only; i18n namespaces added).
- S2 Administration (FR-034..036): write `docs/plans/S2.md` for approval. The web-admin role/permission editor UI belongs there (S1 shipped the API only).

## Blockers

- None for code. Still pending from S0: owner approval for `migrate:fresh` on the local **dev** DB `istigaba`. After it: set `JWT_SECRET` (`php artisan jwt:secret`) and `ADMIN_*` in `apps/api/.env`, then `php artisan db:seed`.

## Open decisions

- **Q8**: `PUT /me/location` enforces 10/min but the contract lists no 429 for it (`CLAUDE.md` §10: ask before adding). The 429 test checks the envelope only.
- Reuse detection: a duplicated browser tab (copied `sessionStorage`) or a lost refresh response makes the next refresh look like reuse and signs that user out everywhere (safe; documented in S1.md R1).

## Deviations from the S1 plan

- Route-authorization test lives in `tests/Feature/Security` (needs the booted app; the Architecture suite runs without it).
- Architecture rule "DB facade only in Actions/Queries/Support" now also allows `Database\Seeders` and `Database\Factories`.
- `IdentitySeeder` grants role → permission pairs only for codes it creates, so a re-seed never re-grants a pair an admin removed (the plan said "insert missing pairs", which would have undone audited admin changes).
- The login/profile/password forms live in `@istigaba/web-ui/auth` (shared by both consoles) instead of being duplicated per app; each app keeps routing and data wiring. `@hookform/resolvers` pinned to 7.0.6 (newest ≥ 2 weeks old) in the pnpm catalog; `axios-mock-adapter` moved into the catalog.
- No `UserPolicy`: `/me*` always acts on the token's own user, so the policy would have no decision to make. `RolePolicy` guards `replaceRolePermissions` behind the middleware.

## Bugs found and fixed during S1

- jwt-auth `show_black_list_exception=false` silently disables the blacklist check itself (not just the message): kept `true`.
- PostgreSQL session timezone was the server's local offset while the app is UTC: naive timestamps were stored 3 h off. `config/database.php` pins `timezone = UTC`.
- React StrictMode ran the session bootstrap twice, presenting the same refresh token twice, which the API (correctly) treated as reuse and revoked every session. Bootstrap and the session's refresh are now single-flight (test added first).

## Verification log (S1)

| Date | Command | Result |
|---|---|---|
| 2026-11-27 | `composer test` (apps/api) | 220/220 (S1 suites red first, then green) |
| 2026-11-27 | `composer lint -- --test`, `composer analyse` | Pint ok; Larastan level 6: 0 errors |
| 2026-11-27 | Bite checks | Seeder map mutation → 2 red; route test with a missing `permission:` / `throttle:` → red; web role-gate mutation → red |
| 2026-11-27 | curl smoke vs `php -S` (test DB) | register 201/409/422, login 401/200, `/me` 200, admin 403/200, rotation, reuse → family revoked, logout → access token 401, lockout 429 `Retry-After: 899` |
| 2026-11-27 | `pnpm schema:drift`, `pnpm openapi:lint`, `pnpm api-types:check`, `pnpm traceability` | No drift; valid (18 known warnings); current; S1 IDs covered |
| 2026-11-27 | `pnpm lint`, `pnpm typecheck`, `pnpm test` | Clean; api-client 27, i18n 7, web-ui 54, web-ops 14, web-admin 14, mobile 5+5, root 40 |
| 2026-11-27 | Web builds, `pnpm audit --audit-level high` | Both build; audit unchanged (2 moderate, 1 ignored high) |
| 2026-11-27 | Browser vs real API (web-ops on :5183, web-admin on :5174) | Wrong password → localized 401, no refresh; Citizen in web-ops / Dispatcher in web-admin → rejected and `logout` 204; login → name in header; reload → exactly one refresh; profile 409 on field; password change → new pair; sign out → old refresh token 401; ar/RTL + en/LTR, Light + Dark; storage: `istigaba-theme`/`istigaba-lang` in localStorage, only `istigaba-refresh` in sessionStorage |
| 2026-11-27 | GitHub Actions run 46019755161 (`0c44255`) | All 4 jobs green |
| 2026-11-27 | GitHub Actions run 46025221169 (`31a8248`) | All 4 jobs green |
