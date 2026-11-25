# apps/api — Laravel 13 modular monolith

Read root `CLAUDE.md` first. Stack: Laravel 13 (PHP ≥8.3), PostgreSQL + PostGIS, Pest, Larastan lvl 6, Pint, Reverb, `php-open-source-saver/jwt-auth`, `matanyadaev/laravel-eloquent-spatial`, `intervention/image`.

## Structure
```
app/Modules/<Module>/            # Identity Reporting AiDrafts Operations Assignments Chat Notifications Audit Settings Integration
├── Actions/                     # one class per use case: <Verb><Noun>Action (ConfirmAiDraftAction)
├── DTOs/                        # readonly, <Noun>Data
├── Enums/
├── Events/  Listeners/  Jobs/   # events past tense (ReportAssigned)
├── Http/{Controllers,Requests,Resources}/   # <Verb><Noun>Request; Resources per audience: <Audience><Noun>Resource
├── Models/  Policies/  Queries/ # <Model>Policy, <Noun>Query (PostGIS lives here)
├── routes.php                   # loaded by the provider; grouped by /me /operations /field /admin
└── <Module>ServiceProvider.php
app/Support/                     # request_id, redaction, idempotency, rate limits, domain exceptions base
database/{migrations,seeders,factories}   # migrations stay CENTRAL, hand-written from the DBML (never per-module)
tests/{Feature/<Module>,Unit,Architecture,Privacy,Contract}
```
Pest architecture tests (S0, mandatory): controllers never touch models/queries directly; modules talk only via Actions, DTOs or events (no cross-module model/Eloquent use); Resources are audience-specific; Actions never return HTTP responses.
Flow: route → `permission:` middleware → FormRequest → Action (inside `DB::transaction`, `lockForUpdate` on state changes) → Eloquent → Resource.

## Rules
- Auth: access TTL 15 min, refresh 30 d, rotation in `refresh_tokens`, logout `jti` denylist in cache. Argon2id.
- RBAC: seeders define roles/permissions (D-34 codes, incl. `field_unit.manage`; diff against D-34 and all `x-required-permissions` before seeding). Per-request permission cache with invalidation on role change. Route-authorization test enumerates all routes.
- Broadcasts: events implement `ShouldDispatchAfterCommit`; queues `default`, `broadcasts`, `notifications`, `alerts`. Payloads built by identity-free DTOs (REALTIME_EVENTS.md).
- Spatial: value objects `{latitude, longitude}`; `ST_DWithin`/`ST_Distance` live in query classes only.
- Idempotency: `Idempotency-Key` stored in cache 24 h (D-10).
- Uploads: local private disk, short-lived signed URLs, EXIF strip (D-23), limits per D-24.
- AI client: HTTP JSON to `127.0.0.1`, header `X-Internal-Key`; `/transcribe` timeout 90 s, 0 retries; `/extract` timeout 30 s, 1 retry; stream audio; delete temp files in `finally` (H2). Map AI slugs fire→حريق, accident→حادث مروري, medical→حالة صحية طارئة; security/infrastructure/natural_disaster → null. Confidence thresholds: type 0.60, severity 0.50.
- Scheduler: purge expired refresh tokens (30 d), unconfirmed AI drafts (7 d), read notifications (90 d), temp upload leftovers.
- Tests: separate PG+PostGIS test DB; `RefreshDatabase` per test; groups `FR-xxx`/`NFR-xxx`; `tests/Privacy` suite; contract-validation helper on every response test.

## Do / Don't
- Do: one Action per use case; throw typed domain exceptions (e.g. `InvalidStateTransition` → 409, validation → 422) that one handler maps to `{code,message,request_id}`; localize messages via lang files (`ar` default, `en`).
- Do: name tests `FR-006 creates SOS report` + `->group('FR-006')`; use factories; one assertion theme per test; every route covered by the route-authorization test.
- Do: build every API payload from an audience-specific Resource; add new fields only after a privacy review (H1).
- Don't: business logic in controllers, models, Resources or FormRequests; no `DB::`/Eloquent in controllers.
- Don't: update `status`/`mission_status` outside the transition Actions; no raw `DB::statement` outside Queries and migrations.
- Don't: `dd()`/`dump()`/`Log::info` of request bodies, tokens, phone numbers, coordinates of anonymous reporters.
- Don't: edit merged migrations; add columns/enums not in the DBML; add permission codes outside D-34.
- Don't: `Model::unguarded()`, `$guarded = []`, or `env()` outside `config/`.

## Commands (Git Bash)
`composer test` · `composer lint` (Pint) · `composer analyse` (Larastan) · `php artisan migrate` · `php artisan db:seed` · `php artisan reverb:start` · `php artisan queue:work --queue=broadcasts,notifications,alerts,default` · `php artisan schedule:work`

## Rate limits (APPROVED — NFR-011)
Keyed per user when authenticated, per IP otherwise. Exceeding → HTTP 429 with `{code:"rate_limited",...}` + `Retry-After`. 429 is already documented in `openapi.yaml` for all `x-rate-limited: true` endpoints (login, register, refresh, SOS, manual reports, AI drafts, chat, identity reveal, geographic alerts, exports, profile/password). `/me/location`, `/field/unit` and other non-flagged endpoints list no 429 — the 10/min location limit still applies server-side, but **pause and ask for approval before adding 429 to those operations in `openapi.yaml`**.

| Endpoint group | Limit | Key |
|---|---|---|
| Login | 10 / min; lockout after 5 failures / 15 min (account + IP) | IP (+ account) |
| Registration | 5 / hour | IP |
| Token refresh | 30 / min | IP |
| SOS create | 3 / min, 10 / hour | user |
| Manual report create | 10 / hour, 30 / day | user |
| AI draft (transcribe + extract) | 10 / hour | user |
| Location updates | 10 / min | user |
| Chat send | 30 / min | user + report |
| Identity reveal | 10 / hour | admin user |
| Export | 5 / hour | user |
| Other authenticated | 120 / min | user |
| Other unauthenticated | 60 / min | IP |

Idempotent SOS replays do not consume quota. Limits are configurable via `config/rate-limits.php` (env-overridable).
