# apps/web-admin — System Administrator console

Read root `CLAUDE.md` first. Same stack as web-ops (React + TS strict + Vite SPA, React Router, TanStack Query (server state)/Table, **Zustand (client/UI state)**, RHF + Zod, shadcn/ui + Tailwind with RTL-safe logical properties, Vitest) **without** maps/charts libraries unless a slice needs them. Dev: `pnpm dev:web-admin` (own port, distinct from web-ops).

## Scope (audience `/admin`, role System Administrator)
Users, roles & permissions (RBAC), field units, report types, system settings, **audited identity reveal**, audit logs.

## Rules
- Only `packages/api-client` + `packages/api-types`; `/admin/*` operations.
- **Identity reveal** (`POST /admin/reports/{reportId}/reporter-identity/reveal`): requires `identity.reveal`; the UI must force a non-empty reason before sending; show the result transiently, never cache it in TanStack Query beyond the view (`gcTime: 0`), never persist to storage, never log it. Each reveal is audited by the backend.
- Zustand holds only client/UI state (auth session state, active selections, realtime connection status). Server data stays in TanStack Query; no Redux. Revealed identity must never enter a Zustand store.
- Role/permission editor only offers the D-34 permission codes returned by the API; no free-text codes.
- Destructive actions (disable user, delete type) use a confirm dialog; surface 409/422 messages localized.
- Audit log view is read-only.
- Theme: `system | light | dark` (default `system`) with tokens from `packages/config`; persist only theme/language in `localStorage` (tokens, report data and revealed identity never). Status/severity never color-only.
- Tokens: access in memory, refresh in `sessionStorage`; strict CSP.
- Arabic default (RTL) + English; strings from `packages/i18n`; test both.
- Tests name FR/NFR IDs (FR-034..037, NFR-…).

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
`users`, `roles`, `field-units`, `report-types`, `settings`, `identity-reveal`, `audit-logs`, `auth`.

## Do / Don't
- Do: PascalCase components/files, `useXxx` hooks, `xxx.schema.ts` for Zod; pages are thin and compose feature components.
- Do: normalize API errors in `api-client` to `{status, code, message, request_id}` and map `code` to localized messages from `packages/i18n`; handle 401 (refresh), 403, 409, 422 and 429 explicitly.
- Do: semantic tokens/classes only; logical properties (`ms-*`, `ps-*`, `text-start`).
- Don't: `any`, `@ts-ignore`, `fetch`, ad-hoc Axios instances, hard-coded colors or strings, `console.log` of API data.
- Don't: copy server data into Zustand; don't put business rules (state transitions, permission decisions) in components.
- Don't: use `dangerouslySetInnerHTML`; render user text as plain text only.
- Don't: cache or store a revealed identity anywhere (query cache `gcTime: 0`, no stores, no storage, no logs).

## Commands
`pnpm --filter web-admin dev|build|test|lint|typecheck`
