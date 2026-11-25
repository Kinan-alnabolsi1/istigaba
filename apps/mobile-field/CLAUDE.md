# apps/mobile-field — Field Unit Representative app (Expo)

Read root `CLAUDE.md` first. Same stack as mobile-citizen (Expo managed, TS strict, Expo Router, TanStack Query, Zustand, RHF + Zod, `expo-secure-store`, i18next, NativeWind + `packages/ui`, Echo/pusher-js, MapLibre, Jest + RNTL). Android 8+, iOS 15+. EAS development builds only (no Expo Go).

## Scope (audience `/field`, role Field Unit Representative)
View assigned missions (`assignment.view_own`), update mission status assigned → en_route → on_site → mission_completed (`mission.update`), update own unit availability (`field_unit.update_own`), in-app notifications. **No chat**: live chat is Citizen ↔ Dispatcher only (FR-025); `FieldAssignment` has no chat.

## Rules
- Use `/field/*` operations only. Ownership enforced by the server (`x-ownership`); never assume a report is visible just because it is in cache.
- **Anonymous reports: no reporter identity anywhere in UI, notifications or cached state** (H1). A response containing identity fields is a contract bug: stop and report.
- Mission status changes go through the API and handle 409 (e.g. mission cancelled by reassignment D-01 or early close D-03): refresh and show a localized message.
- Location: foreground only, every 30–60 s while **on duty** (availability ≠ offline) and on each status update. No background tracking.
- Realtime on `private-field-unit.{id}` only. Do not subscribe to `private-report-chat.{id}` and do not build chat UI.
- Theme: `system | light | dark` via NativeWind color scheme + Zustand; persist only theme/language in `AsyncStorage` (tokens only in `expo-secure-store`; never tokens/report data/identity in AsyncStorage). Logical properties (`ms-*`, `ps-*`, `text-start`) alongside `I18nManager`. Severity/status never color-only; light/dark MapLibre style URLs.
- Tokens in `expo-secure-store`. Arabic RTL default + English; strings from `packages/i18n`.
- Tests name FR/NFR IDs (FR-026, 031..033, 039, …).

## Structure
```
app/                        # Expo Router: route files are thin and only render a screen
├── (auth)/  (tabs)/
src/
├── features/<feature>/{api,components,hooks,screens,schemas}/   # + index.ts = only public surface
├── services/               # system/hardware: `location` (foreground, on-duty), `secure-store`
├── stores/                 # Zustand: UI state only (theme/language persisted in AsyncStorage)
├── components/             # app-specific; shared ones live in packages/ui
├── lib/                    # api-client wiring, echo, utils
└── i18n/                   # INIT ONLY: i18next + expo-localization + I18nManager
```
Features: `auth`, `missions`, `unit`, `notifications`, `profile` (no chat).
Boundaries (ESLint, set up in S0): import another feature only through its `index.ts`; never import from another `apps/*`; shared code goes to `packages/*`. **All translation strings live only in `packages/i18n`**; `src/i18n/` never contains strings.

## Do / Don't
- Do: PascalCase components, `useXxx` hooks, `xxx.schema.ts` for Zod; screens compose feature components; hardware/OS access only through `src/services/`.
- Do: normalize API errors in `api-client` to `{status, code, message, request_id}` and map `code` to localized messages; handle 401, 403, 409, 422, 429 and network failure explicitly.
- Do: semantic tokens/NativeWind classes only; logical properties (`ms-*`, `ps-*`, `text-start`).
- Don't: `any`, `@ts-ignore`, `fetch`, ad-hoc Axios instances, hard-coded colors or strings, `console.log` of API data or coordinates.
- Don't: store tokens/report data/identity in `AsyncStorage`; don't copy server data into Zustand.
- Don't: request background location or OS push permissions (D-32).
- Don't: add chat or subscribe to `private-report-chat.{id}`.

## Commands
`pnpm --filter mobile-field start|test|lint|typecheck` · `eas build --profile development --platform android`
