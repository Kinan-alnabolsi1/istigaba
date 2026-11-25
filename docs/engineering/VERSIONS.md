# Toolchain versions — verified 2026-11-18 via web search

Owner decisions (2026-11-19): Python 3.13 for ai-service; Expo SDK 57; Node Active LTS and pnpm pinned at S0 start; `laravel-eloquent-spatial` verified against PG 18 + PostGIS 3.7 in S0.

Rule: major lines are policy; exact patches live in lockfiles. Do not bump a major without asking.

| Component | Choice | Evidence / caveat |
|---|---|---|
| Laravel | 13.x (PHP ≥8.3) | Laravel 14 expected Q1 2027 (needs PHP 8.4); stay on 13 |
| PHP | 8.3 minimum; prefer 8.4 | jwt-auth and spatial package accept 8.3–8.5. Exact patch not verified |
| `php-open-source-saver/jwt-auth` | ^2.9 | Requires Laravel ^12\|^13, PHP ^8.3 |
| `matanyadaev/laravel-eloquent-spatial` | ^4.7 | Lists Laravel 13 support (2026-03). Its README test matrix historically names PG 12–16 + PostGIS 3.4 — **verify against PG 18 + PostGIS 3.7 in S0** |
| PostgreSQL | 18.x | 18.7 installed locally (Nov 2026) |
| PostGIS | 3.7.x | 3.7.0 Windows bundle installed for PG 18 (Nov 2026) |
| Python (ai-service) | **3.13 (decided)** | 3.14 is latest stable (3.14.10 seen Oct 2026). **ML wheels (torch, faster-whisper/ctranslate2) may lag 3.14 — recommend 3.13 unless S8 spike shows 3.14 works** |
| Node.js | LTS ≥22.13 | Sources conflicted (v24 vs v26 LTS); Expo SDK 57 needs ≥22.13. Pin the Active LTS shown on nodejs.org when S0 starts |
| pnpm | 11.x or 12.x | Both lines were releasing in Oct 2026 (11.28.x, 12.10.x). Pin via `packageManager` in S0 |
| Vite | 8 | Needs Node 20.19+/22.12+ |
| Tailwind CSS | 4.x | 4.3.x seen |
| `nativewind` + Tailwind (mobile) | verify and pin at S0 start | Replaces React Native Paper. Must be the combination compatible with Expo SDK 57; Claude Code verifies before installing |
| Expo SDK | 57 (RN 0.86, React 19.2) | SDK 58 was in beta (RN 0.88). Stay on 57 until 58 is stable **and** MapLibre supports it |
| `@maplibre/maplibre-react-native` | 11.x | 11.3.7 (Aug 2026); needs EAS dev build, not Expo Go |
| FastAPI | latest 0.1xx | ~0.140 seen; pin via lock |
| faster-whisper | latest | Only older data (1.2.x) found — pin at S8 |
| Not verified | Reverb, Pest, Larastan, React web, TanStack, Axios | Take latest compatible with Laravel 13 / React 19 at install time and commit lockfiles |
