# apps/web-ops — Dispatcher dashboard

Read root `CLAUDE.md` first. React + TypeScript strict + Vite SPA, React Router, TanStack Query (server state)/Table, **Zustand (client/UI state)**, React Hook Form + Zod, shadcn/ui + Tailwind (RTL-safe logical properties: `ms-*`, `ps-*`, `text-start`; never `ml-*`/`left-*`), Leaflet (`react-leaflet`), `leaflet.heat`, Recharts, Vitest + Testing Library. Dev: `pnpm dev:web-ops` (own port, see `vite.config.ts`).

## Scope (audience `/operations`, role Dispatcher)
Live map, report queue, review/edit, dispatch & assignments (incl. reassign), chat, geographic alerts, statistics, heat map, exports.

## Rules
- Call the API only via `packages/api-client`; types from `packages/api-types`. Use `/operations/*` operations only — never `/admin/*`.
- **Anonymous reports: render nothing identity-related.** Do not build UI that expects reporter fields; if one appears in a response, treat it as a contract bug and stop.
- Zustand stores hold only client/UI state: auth session state, map filters, active selections, realtime connection status. Server data stays in TanStack Query (never mirrored into Zustand); no Redux. Never persist tokens or report data from a store to storage.
- Permission-gate UI from the `/me` permissions list (cosmetic only; backend enforces).
- Realtime via Echo on `private-operations` and `private-report-chat.{id}`; invalidate TanStack Query caches from events.
- Map tiles from `VITE_MAP_TILE_URL`; optional `VITE_MAP_TILE_URL_DARK` for Dark mode (falls back to the OSM dev default / light URL when unset). Heat map and chart colors come from semantic tokens and stay legible in both modes.
- Theme: `system | light | dark` (default `system`) with tokens from `packages/config`; persist only theme/language in `localStorage` (tokens, report data and identity never). Severity/status never color-only (color + localized label/icon).
- Tokens: access in memory, refresh in `sessionStorage`; no tokens in localStorage or URLs.
- Chat input disabled when the report is `closed` (D-18). Mutations of status handle 409 with a localized message.
- Arabic default (`dir="rtl"`), English switchable; strings from `packages/i18n`. Test both directions.
- Tests name FR/NFR IDs (e.g. `it('FR-021 assigns a field unit', ...)`).

## Structure
```
src/
├── app/{router,providers,layout}/
├── features/<feature>/{api,components,hooks,pages,schemas}/   # + index.ts = the feature's only public surface
├── stores/                  # Zustand: UI state only
├── components/              # app-specific; shared ones live in packages/web-ui
├── lib/                     # api-client wiring, echo, utils
└── styles/
```
Boundaries (ESLint, set up in S0): import another feature only through its `index.ts`; never import from another `apps/*`; shared code goes to `packages/*`. Translation strings live only in `packages/i18n` (this app holds i18n init only).

## Features
`reports`, `dispatch`, `map`, `chat`, `alerts`, `statistics`, `exports`, `auth`.

## Charts (Recharts — approved)
Recharts only (no Chart.js). Series colors from semantic chart tokens (`var(--chart-N)` from `packages/config`); every series also has a label/legend text or pattern, never color alone; verify in Light and Dark and RTL. Charts are used only here (statistics); heat map uses `leaflet.heat`.

## Do / Don't
- Do: PascalCase components/files, `useXxx` hooks, `xxx.schema.ts` for Zod; pages are thin and compose feature components.
- Do: normalize API errors in `api-client` to `{status, code, message, request_id}` and map `code` to localized messages from `packages/i18n`; handle 401 (refresh), 403, 409, 422 and 429 explicitly.
- Do: semantic tokens/classes only; logical properties (`ms-*`, `ps-*`, `text-start`).
- Don't: `any`, `@ts-ignore`, `fetch`, ad-hoc Axios instances, hard-coded colors or strings, `console.log` of API data.
- Don't: copy server data into Zustand; don't put business rules (state transitions, permission decisions) in components.
- Don't: use `dangerouslySetInnerHTML`; render user text as plain text only.

## Commands
`pnpm --filter web-ops dev|build|test|lint|typecheck`
