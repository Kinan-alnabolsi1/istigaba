# Toolchain versions (pinned and verified in S0, 2026-11-26)

Owner decisions: Python 3.13 for ai-service; Expo SDK 57; Node Active LTS and pnpm pinned at S0; PHP `^8.4` (B3); NativeWind 4.2.7 + Tailwind 3.4.19 on mobile (B4).
Rule: major lines are policy; exact patches live in lockfiles (`pnpm-lock.yaml`, `apps/api/composer.lock`, `apps/ai-service/requirements*.lock`). Do not bump a major without asking.
Evidence (2026-11-25/26): npm registry, Packagist `p2` metadata, `nodejs/Release` schedule, PyPI, GitHub releases, Expo 57 `bundledNativeModules.json`. Full reasoning: `docs/plans/S0.md` §2.

## Runtimes and package managers

| Component | Pin | Evidence / note |
|---|---|---|
| Node | **26.13.1** (`.nvmrc`, `.node-version`, `.tool-versions`; `engines.node >=26.13.0 <27`) | v26 "Lithium" is Active LTS since 2026-10-28; RN 0.86 and `@expo/cli` 57 accept Node 26 |
| pnpm | **12.23.0** (`packageManager`) | npm `latest` = `latest-12`. Non-auth settings live in `pnpm-workspace.yaml` (pnpm ≥ 11 ignores them in `.npmrc`) |
| PHP | **^8.4** (`config.platform.php` 8.4.22) | Pest 5 requires 8.4. Local: Laravel Herd 8.4.22 (Git Bash PATH must list Herd first) |
| Python | **3.13** (`.python-version`, `requires-python >=3.13,<3.14`) | Local `py -3.13` = 3.13.17 |
| PostgreSQL / PostGIS | 18.x / 3.7.x; CI image `postgis/postgis:18-3.7` | Local 18.7 + 3.7.0 |
| Expo SDK | **57** (`expo ~57.0.34`, RN 0.86.3, React 19.2.3) | SDK 58 is now stable (`latest` 58.0.26); stay on 57 per owner rule |

## PHP (apps/api)

| Package | Constraint | Resolved |
|---|---|---|
| laravel/framework | ^13.44 | 13.44.1 |
| pestphp/pest (+ plugin-laravel, plugin-arch) | ^5.3 / ^5.0 | 5.3.7 / 5.0.1 / 5.0.0 (PHPUnit 13.4.7) |
| larastan/larastan | ^3.15 (level 6) | 3.15.0 (PHPStan 2.3.7) |
| laravel/pint | ^1.32 | 1.32.3 |
| matanyadaev/laravel-eloquent-spatial | ^4.8 | 4.8.0, **verified on PG 18.7 + PostGIS 3.7.0** (see below) |
| laravel/telescope | ^5.29 (dev, local only) | 5.29.0 |
| osteel/openapi-httpfoundation-testing | ^0.15 (dev) | 0.15 (league/openapi-psr7-validator 0.24), **loads the OpenAPI 3.1 contract** |
| laravel/reverb | ^1.14 | recorded; installed in S6 |
| php-open-source-saver/jwt-auth | ^2.10 | recorded; installed in S1 |
| intervention/image | ^4.4 | recorded; installed in S3 |

**laravel-eloquent-spatial verification (risk R2, closed):** upstream tests PostGIS 3.4–3.6 only. `apps/api/tests/Database/SpatialPackageTest.php` passes locally on PostgreSQL 18.7 + PostGIS 3.7.0 and runs in CI on `postgis/postgis:18-3.7`. It covers Point cast write/read on `geography(Point,4326)`, SRID 4326 round-trip, `whereDistanceSphere`, and raw `ST_DWithin`/`ST_Distance` in metres.

## JavaScript (pnpm catalogs in `pnpm-workspace.yaml`)

| Package | Pin | Note |
|---|---|---|
| react / react-dom (mobile) | 19.2.3 | Expo 57 bundled version |
| react / react-dom (web, `catalog:web`) | 19.2.9 | react-router 8.5 requires ≥ 19.2.7 |
| typescript | 5.9.3 | npm `latest` is 7.0.2, but typescript-eslint 8.74 supports < 6.1 and openapi-typescript 7.13 peers ^5 |
| vite / @vitejs/plugin-react | 8.3.8 / 6.3.0 | |
| tailwindcss (web) / @tailwindcss/vite | 4.3.5 | |
| nativewind / react-native-css-interop / tailwindcss (mobile) | 4.2.7 / 0.2.7 / 3.4.19 | 4.2.7 release notes: "Support the Expo SDK 57 toolchain". css-interop is a direct dependency so Metro resolves NativeWind's JSX runtime under pnpm |
| axios | 1.21.1 | only inside `@istigaba/api-client` |
| @tanstack/react-query | 5.108.4 | |
| zustand | 5.1.0 | |
| react-router | 8.5.3 | web |
| i18next / react-i18next | 27.2.9 / 18.0.3 | |
| react-hook-form / zod | 7.92.0 / 4.6.7 | catalogued; installed with the first forms (S1) |
| recharts | 3.11.1 | web-ops only |
| openapi-typescript | 7.13.0 | |
| @stoplight/prism-cli | 5.16.0 | serves paths at the root (no `/api/v1` prefix) |
| @redocly/cli | 2.83.0 | |
| eslint / typescript-eslint / eslint-plugin-boundaries | 10.15.0 / 8.74.0 / 7.4.5 | boundaries v7: `boundaries/dependencies` policies |
| vitest | 5.1.2 | |
| jest / jest-expo / @testing-library/react-native / test-renderer | 29.7.0 / ~57.0.6 / 14.1.0 / 1.2.0 | test-renderer 1.2.0 = reconciler 0.33 (React 19.2) |
| shadcn (registry) / cn / class-variance-authority / radix-ui | new-york-v4 / 0.5.2 / 0.7.1 / 1.8.1 | |

Security overrides (owner decision 2026-11-26): `lodash` 4.18.1 and `decode-uri-component` 0.5.1. `@react-native/metro-config` is pinned to 0.86.3, the RN 0.86 peer. Ignored audit advisory: GHSA-qxc2-j82w-r537 (@faker-js/faker 5 inside Prism, dev-only; its fix is a breaking major).

Recorded for later slices: `@maplibre/maplibre-react-native` 11.5.1 (S3), `leaflet` 1.9.4 / `react-leaflet` 5.0.0 (S3), `laravel-echo` 2.6.3 / `pusher-js` 8.6.0 (S6).

## Python (apps/ai-service, S0 skeleton)

fastapi 0.165.0, uvicorn 0.54.0, pydantic-settings 2.16.3; dev: pytest 9.2.0, httpx 0.28.1, ruff 0.17.6, mypy 2.4.1, pip-tools 7.7.0, pip-audit 2.10.1. Locks are hashed (`pip-compile --generate-hashes`). faster-whisper and AraBERT are pinned in S8.

## CI tools

gitleaks 8.30.1 (release binary, checksum verified), `pnpm audit --audit-level high`, `composer audit`, `pip-audit`.
