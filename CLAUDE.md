# Istigaba (استجابة) — Emergency Reporting & Response Platform

Graduation project. Citizens report emergencies (manual form, voice/text via AI draft, or one-tap SOS); Dispatchers triage and assign; Field Units execute missions; Admins manage the system. Arabic (RTL) primary UI, English switchable.
Code, comments, logs, commits and technical docs are in English. `docs/srs.md` stays Arabic.

## 1. Authoritative references (read before coding; never contradict)

| Source | Role |
|---|---|
| `docs/srs.md` | Requirements. FR-001..FR-039, NFR-001..NFR-022. Wins over everything else on *what* to build. |
| `docs/erd_v1.1.dbml` | Database truth. Wins on tables, columns, enums, constraints. |
| `docs/erd-explanation.md` | Rationale for the ERD. |
| `docs/api/openapi.yaml` (v1.0) | API contract (73 operations). Wins on paths, schemas, status codes, roles/permissions (`x-required-*`). |
| `docs/design/DESIGN_TOKENS.md` | Light/Dark semantic design tokens extracted from the finalized UI/UX mockups. Source for `packages/config`. |
| `docs/api/STATE_TRANSITIONS.md`, `REALTIME_EVENTS.md` | Lifecycles and WebSocket events/channels. |
| `docs/api/API_REQUIREMENTS_TRACEABILITY.md` | FR → operation matrix. |
| `docs/api/API_DESIGN_DECISIONS.md` | Decision log D-01..D-38. **Load only when a D-xx is referenced.** |
| `docs/progress.md`, `docs/plans/<slice>.md` | Session state and approved plans. |

Conflict between sources, or a gap/ambiguity: **stop and ask**. Never invent fields, endpoints, states or permissions.
Never edit `srs.md`, `erd_v1.1.dbml` or `openapi.yaml` without explicit approval. An approved `openapi.yaml` change requires regenerating `packages/api-types` in the same commit.

## 2. Monorepo structure

```
apps/api              Laravel 13 (PHP 8.3+) modular monolith        → apps/api/CLAUDE.md
apps/ai-service       Python FastAPI: faster-whisper STT + AraBERT  → apps/ai-service/CLAUDE.md
apps/web-ops          Dispatcher dashboard (React + Vite SPA)       → apps/web-ops/CLAUDE.md
apps/web-admin        Admin console (React + Vite SPA)              → apps/web-admin/CLAUDE.md
apps/mobile-citizen   Expo app for citizens                         → apps/mobile-citizen/CLAUDE.md
apps/mobile-field     Expo app for field unit representatives       → apps/mobile-field/CLAUDE.md
packages/api-types    openapi-typescript output (committed)
packages/api-client   Typed Axios factory (all 4 frontends)
packages/i18n  config (design tokens)  ui (mobile, NativeWind)  web-ui (web)
docs/                 srs, erd, api, plans, progress
```
- Tooling: pnpm workspaces (JS), Composer (PHP), Python venv + `pyproject.toml` + pip-tools lock. Root scripts: `pnpm dev:web-ops`, `pnpm dev:web-admin`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.
- Python for `ai-service` is pinned to 3.13. Node Active LTS and pnpm are pinned at the start of S0; `laravel-eloquent-spatial` is verified against PostgreSQL 18 + PostGIS 3.7 in S0. Expo stays on SDK 57.
- Toolchain versions are pinned in `.tool-versions`/`.nvmrc`, `composer.json`, `pyproject.toml` and lockfiles (not in this file). Do not bump majors without asking.
- Work happens across all folders; no per-person ownership. Read the nested CLAUDE.md of the app you touch.
- Local dev: native Windows, **no Docker**. Shell is Git Bash (PowerShell only for one-time setup scripts). LF line endings (`.gitattributes`, `.editorconfig`).
  Native PostgreSQL + PostGIS, `database` queue/cache driver, local disk, `log` mail, `php artisan reverb:start`, uvicorn from venv.
- Production target: Linux VPS, HTTPS/wss only, Nginx or Caddy, process manager for `queue:work`/`reverb:start`/scheduler/uvicorn, Redis for queue/cache. Local `database` driver is dev-only. Two environments only: local and production.

## 3. Mandatory architectural conventions

1. **FR/NFR traceability.** Every implemented FR/NFR has ≥1 test whose name or group contains its ID (Pest `->group('FR-006','NFR-013')` plus ID in the test name; Vitest/pytest IDs in names or markers). CI runs the traceability script. No numeric coverage threshold. Every commit subject carries IDs: `feat(reports): create SOS report [FR-006]`.
2. **Backend-enforced RBAC.** Roles → role_permissions → permissions, seeded (seeders are the source of truth). Enforce with `permission:` middleware + Policies on the server. UI hiding is cosmetic only. An automated route-authorization test must fail if any route lacks middleware matching `x-required-roles`/`x-required-permissions`. Permission codes are exactly those in D-34 (incl. `field_unit.manage`); never add codes ad hoc. Before writing the permission seeder, diff the full list against D-34 (`API_DESIGN_DECISIONS.md`) and every `x-required-permissions` in `openapi.yaml`.
3. **Explicit state transitions.** Report (7 states) and assignment/mission (5 states) change only through single-purpose Actions that validate against the transition table in `STATE_TRANSITIONS.md`. Invalid transition → HTTP 409. No direct `status` updates elsewhere. One active (non-cancelled) assignment per report (partial unique index).
4. **Strict DBML compliance.** Migrations are hand-written from `erd_v1.1.dbml` (native PG ENUMs, `gen_random_uuid()`, raw SQL for partial unique index). CI schema-drift check against the DBML. No table/column/enum not in the DBML. Merged migrations are never edited.
5. **Contract compliance.** Audience-scoped paths (`/me`, `/operations`, `/field`, `/admin`), audience-specific Resources/schemas, `page`/`per_page`, error body `{code,message,request_id}`, 422 validation, 409 state conflict. Laravel feature tests validate responses against the OpenAPI schema.
6. **Layering and boundaries (api).** Thin controller → FormRequest → single-purpose Action → Eloquent; readonly DTOs; modules under `app/Modules/<Module>` guarded by Pest architecture tests (module boundaries); migrations stay central in `database/migrations`.
7. **Dual-surface rule.** Any behaviour exposed over REST that also appears on WebSocket (events, chat, notifications) must be checked on both surfaces.
8. **i18n.** No hard-coded user-facing strings. Arabic + English for UI; API messages localized by `Accept-Language` (`ar` default, `en`). RTL-safe layout (logical properties) on web; `I18nManager` on mobile.

## 4. Non-negotiable privacy & security hard rules

**H1 — Zero identity leakage for anonymous reports.** For `is_anonymous` reports, no Dispatcher/Field/Citizen-other REST response, chat message, export, notification or WebSocket payload may contain reporter id, name, phone, email, location-of-reporter, device info, or any derived/joined identity field. `reporter_id` is always stored; anonymity is enforced by audience-specific projection (never by nulling DB data). The only path to identity is `POST /admin/reports/{reportId}/reporter-identity/reveal` (permission `identity.reveal`, mandatory reason, audited, `Cache-Control: no-store`).
   `tests/Privacy` asserts zero identity fields across all of those surfaces and must stay green. Adding a field to any non-admin resource requires an explicit privacy review before committing.
**H2 — Audio is deleted immediately after transcription**, in `finally`, on success *and* failure. Tests in both api and ai-service prove zero audio files remain. Audio is never persisted by the AI service.
**H3 — No user identity to the AI component.** Only audio/text and `request_id` cross the boundary. No user id, name, phone, location-of-user, report id. AI service never logs bodies, transcripts or audio (only request_id, duration, model_version, status).
**H4 — Mandatory audit logging** for: identity reveal, user/role/permission/settings/report-type/field-unit management, report close and reassignment, export, login lockouts, and any other action tagged audited in the contract. Audit logs are append-only and permanent. No audit entry → action is not done.
**H5 — AI drafts are not reports** until the citizen explicitly confirms (`ai_extractions` → report). Low confidence returns null; Laravel owns label→`report_types.id` mapping.
**H6 — Secrets/PII.** Central log redaction; never log tokens, passwords, phone numbers, coordinates of anonymous reporters, or bodies of AI calls. Secrets only via `.env` (never committed; secret scan in CI). Argon2id, min 8 chars (D-06). Lockout: 5 failed logins → 15 min, per account and per IP. Security headers + CORS from env origins; HTTPS only in production.

### Approved decisions restated as hard rules
- **D-03** Closing early auto-cancels the active assignment and frees the unit.
- **D-10** `Idempotency-Key` required on SOS and other critical creations (cache, 24 h TTL); a replay returns the original result and never creates a duplicate.
- **D-15** Revoking location consent immediately clears `users.last_known_location`.
- **D-18** Chat is read-only once the report is `closed`.
- **D-23** Strip EXIF/GPS from every uploaded image (`intervention/image`).
- **D-24** Strict attachment limits: ≤5 per manual report; image 10 MB (jpeg/png/webp); video 50 MB (mp4); voice note 5 MB (m4a/mp3/wav) and ≤60 s. No virus scanning.
- Also in force: D-01 reassignment from assigned/en_route/on_site (report regresses to `assigned`), D-09 SOS countdown is client-side, D-11 SOS severity = critical; **no anonymous SOS (FR-009)** — `POST /me/reports/sos` always stores `is_anonymous = false` and rejects an `is_anonymous` body field with 422 `anonymous_sos_not_allowed`, D-25 SOS type excluded from manual types, D-32 no OS push (in-app + WebSocket only).
- Location: alert eligibility needs a fix ≤15 min old (configurable); `radius_m ≤ 50000`; recipients = active users with location consent. Foreground-only tracking: citizen every 60 s while app open; field unit every 30–60 s while on duty plus on status updates. SOS offline fails fast with a localized error, never silently queued.
- Retention: unconfirmed/cancelled AI drafts 7 d; expired/revoked refresh tokens 30 d; read notifications 90 d; reports, attachments, audit logs permanent; confirmed drafts permanent.

## 5. Build order — Structured Vertical Slices

Backend-first per slice (migrations → actions → endpoints → FR/NFR tests → contract + privacy checks). Web/mobile screens are built in parallel against a Prism mock of `openapi.yaml`, then wired to real endpoints.

| Slice | Scope | FRs |
|---|---|---|
| S0 | Foundation: monorepo, CI, tooling, base schema, test DB, Prism, health | — |
| S1 | Identity: register/login/refresh/logout, `/me`, profile, password | FR-001..004 |
| S2 | Administration: users/roles, field units, report types, settings | FR-034..036 |
| S3 | Citizen manual reporting + operations read side | FR-007..010, FR-019..023 (read) |
| S4 | Identity reveal + complete privacy suite for reports | FR-037 |
| S5 | SOS | FR-006 |
| S6 | Operations workflow, notifications, realtime foundation | FR-011, 024, 028, 038 |
| S7 | Assignments & field module | FR-021, 026, 031..033, 039 |
| S8 | AI service + AI drafts | FR-013..018 |
| S9 | Chat | FR-025 |
| S10 | Geographic & area alerts | FR-012, 027 |
| S11 | Statistics & export | FR-029, 030 |

Detailed per-slice plan: `docs/plans/SLICES.md`. Do not start slice N+1 work in slice N.

## 6. Session workflow (strict)

1. Start from **one named slice/sub-task**. If scope grows, stop and ask.
2. Write a plan to `docs/plans/<slice>.md`; **get it approved before coding**.
3. **Tests first** (red → green), tagged with FR/NFR IDs. Follow plan → TDD → verification-before-completion using the locally installed agent skills (don't name a specific plugin in code or docs).
4. Implement the minimum to pass; run the gates for every app touched.
5. At session end update `docs/progress.md`: done, next, blockers, open decisions.
6. **Ask first** before: modifying `srs.md`/`erd_v1.1.dbml`/`openapi.yaml`, adding dependencies, editing merged migrations, destructive git or DB commands (`reset --hard`, `push --force`, `migrate:fresh` outside the test DB, `clean -fd`), changing permission codes.

## 7. Definition of done (per app touched)

- [ ] FR/NFR IDs named; tests green; `tests/Privacy` green.
- [ ] Gates pass: Pint + Larastan lvl 6 + Pest (api); ruff + mypy strict + pytest (ai); ESLint + Prettier + `tsc --noEmit` + Vitest (JS); OpenAPI lint (Spectral/Redocly).
- [ ] Contract check and schema-drift check pass; `packages/api-types` regenerated if the contract changed.
- [ ] No new identity field in any non-admin response.
- [ ] Audit entries written for audited actions.
- [ ] Arabic + English strings present; RTL verified for UI.
- [ ] UI changes: verified in both Light and Dark modes (contrast OK, no color-only indicators).
- [ ] `docs/progress.md` updated.

CI additionally runs: secret scan, dependency audit, traceability script, AI OpenAPI snapshot drift (`docs/ai-service/openapi.json`).

## 8. Git rules
- Direct commits to `main` (no feature branches or PRs required); GitHub Actions runs CI on every push. Private repo, no licence file.
- Conventional Commits with mandatory FR/NFR IDs: `type(scope): summary [FR-xxx,NFR-yyy]`. English only.
- Pre-push checklist = Definition of done above. Never commit `.env`, model weights, audio, or generated caches.
- Commit trailer (from the harness) is appended automatically; do not remove it.

## 9. Shared frontend rules (all four frontend apps)

- HTTP: **Axios everywhere**, only through `packages/api-client` (Bearer JWT, refresh-rotation with queued retry on 401, `Accept-Language`, `Idempotency-Key`, upload progress). No `fetch`/ad-hoc Axios instances in app code.
- Types come only from `packages/api-types` (generated, committed, never hand-edited).
- **Theme:** all four frontends support `system | light | dark` (default `system`) using shared semantic tokens from `packages/config` (source: `docs/design/DESIGN_TOKENS.md`). Web = Tailwind 4 + shadcn/ui CSS variables; mobile = NativeWind (Tailwind for RN, optionally React Native Reusables primitives in `packages/ui`) CSS variables/color scheme. No hard-coded colors in components; use semantic tokens only. Severity/status indicators never rely on color alone (pair color with a localized label and/or icon) and keep accessible contrast in both modes. Maps follow the theme (web `VITE_MAP_TILE_URL_DARK`, mobile light/dark MapLibre style URLs).
- **Client persistence:** only non-sensitive UI preferences (theme, language) may be persisted — `localStorage` on web, `AsyncStorage` on mobile. Tokens stay in memory/`sessionStorage` (web) or `expo-secure-store` (mobile). Tokens, report data and revealed identity are **forbidden** in `localStorage`/`AsyncStorage`.
- TypeScript strict; TanStack Query for **server** state; **Zustand for client/UI state** (auth session state, map filters, active selections, realtime connection status) on web and mobile alike — no Redux, and never copy server data into Zustand; React Hook Form + Zod for forms.
- **Structure & boundaries:** each app follows the internal structure in its nested CLAUDE.md. Features import each other only through `index.ts`; no imports between `apps/*`; shared code in `packages/*`. Enforced by ESLint boundary rules (frontends, set up in S0) and Pest Architecture tests (api modules). All translation strings live only in `packages/i18n`; app-level `i18n/` folders hold initialization only.
- **Charts:** Recharts only, in `apps/web-ops` (no Chart.js). Series colors come from semantic chart tokens and always carry a label/pattern, never color alone.
- **Naming:** PascalCase React components, `useXxx` hooks; Laravel `<Verb><Noun>Action`, `<Noun>Data`, `<Audience><Noun>Resource`, `<Verb><Noun>Request`; Python snake_case. Each nested CLAUDE.md has a short Do/Don't list that is binding.
- Realtime: `laravel-echo` + `pusher-js` against Reverb, private channels only; payloads are identity-free by contract.
- Web tokens: access in memory, refresh in `sessionStorage`, strict CSP. Mobile tokens: `expo-secure-store`.

## 10. Rate limits & seeds (approved)

Rate-limit table: `apps/api/CLAUDE.md` §Rate limits. Seed data: `docs/seed-proposal.md` (diff Arabic names/columns against `docs/srs.md` and `docs/erd_v1.1.dbml` before coding the seeder). 429 (`rate_limited` + `Retry-After`) is already documented for all `x-rate-limited: true` endpoints. `/me/location`, `/field/unit` and other non-flagged endpoints list no 429: pause and ask before adding it to `openapi.yaml`.

## 11. Observability

Laravel JSON daily logs with `request_id` (also returned in error bodies); central redaction; no Sentry; `GET /health` returns status only; Telescope in local only.
