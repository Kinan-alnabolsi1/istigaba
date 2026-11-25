# Istigaba (استجابة)

Emergency reporting and response platform (graduation project). Citizens report emergencies by manual form, voice/text through an AI draft, or one-tap SOS. Dispatchers triage and assign, field units execute missions, and administrators manage the system. The UI is Arabic (RTL) first, with English available.

## Repository map

| Path | What |
|---|---|
| `apps/api` | Laravel 13 modular monolith (PHP 8.4, PostgreSQL 18 + PostGIS 3.7) |
| `apps/ai-service` | FastAPI service: speech-to-text and extraction (Python 3.13) |
| `apps/web-ops` | Dispatcher dashboard (React + Vite) |
| `apps/web-admin` | Administrator console (React + Vite) |
| `apps/mobile-citizen` | Citizen app (Expo SDK 57) |
| `apps/mobile-field` | Field unit app (Expo SDK 57) |
| `packages/api-types` | TypeScript types generated from `docs/api/openapi.yaml` |
| `packages/api-client` | Typed Axios client shared by all four frontends |
| `packages/i18n` | All Arabic and English UI strings |
| `packages/config` | Light/Dark design tokens and generated theme CSS |
| `packages/ui`, `packages/web-ui` | Shared mobile (NativeWind) and web (shadcn/ui) components |
| `docs/` | Requirements, ERD, API contract, plans, progress |

Rules for contributors (human or AI) are in [`CLAUDE.md`](CLAUDE.md) and each app's own `CLAUDE.md`.

## Prerequisites (native Windows, no Docker)

Exact pins: [`docs/engineering/VERSIONS.md`](docs/engineering/VERSIONS.md).

- Git for Windows (Git Bash is the default shell)
- PHP 8.4 with `pdo_pgsql`, `pgsql`, `intl`, `sodium`, `gd`, `exif` (Laravel Herd works) and Composer running on that PHP
- PostgreSQL 18 with PostGIS 3.7
- Node 26 (see `.nvmrc`) and pnpm 12 (see `packageManager` in `package.json`)
- Python 3.13 (`py -3.13`)

Check everything with:

```bash
pnpm doctor
```

## First-time setup

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env          # then fill DB_PASSWORD etc.
composer --working-dir=apps/api install
php apps/api/artisan key:generate
pnpm db:setup                                   # creates istigaba + istigaba_test with PostGIS (needs the postgres superuser)
php apps/api/artisan migrate
cd apps/ai-service && py -3.13 -m venv .venv && .venv/Scripts/pip install pip-tools && .venv/Scripts/pip-sync requirements-dev.lock
```

## Daily commands

| Command | What |
|---|---|
| `pnpm dev:web-ops` / `pnpm dev:web-admin` | Web apps on ports 5173 / 5174 |
| `pnpm dev:api` | Laravel on 127.0.0.1:8000 |
| `pnpm dev:ai` | AI service on 127.0.0.1:8001 |
| `pnpm mock:api` | Prism mock of the API contract on 127.0.0.1:4010 |
| `pnpm test` / `pnpm test:api` / `pnpm test:ai` / `pnpm test:all` | Tests |
| `pnpm lint` / `pnpm lint:api` / `pnpm lint:ai` | Linters and static analysis |
| `pnpm typecheck` | TypeScript in every workspace |
| `pnpm openapi:lint` / `pnpm api-types:check` | Contract lint and generated-types freshness |
| `pnpm schema:drift` | Compare the migrated test database with `docs/erd_v1.1.dbml` |
| `pnpm traceability` | FR/NFR → test matrix |

Mobile apps need EAS development builds (no Expo Go), see `apps/mobile-*/CLAUDE.md`.
