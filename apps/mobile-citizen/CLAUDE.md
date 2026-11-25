# apps/mobile-citizen — Citizen app (Expo)

Read root `CLAUDE.md` first. Expo managed workflow, TypeScript strict, Expo Router, TanStack Query, Zustand, React Hook Form + Zod, `expo-secure-store`, i18next + `expo-localization` + `I18nManager`, NativeWind (Tailwind CSS for RN) + `packages/ui`, `laravel-echo` + `pusher-js`, `@maplibre/maplibre-react-native` (OSM tiles), Jest + React Native Testing Library. Android 8+ (API 26), iOS 15+.

## Scope (audience `/me`, role Citizen)
Register/login/profile, manual report (≤5 attachments), voice/text AI draft with explicit confirmation, SOS, my reports + status, chat with dispatch, in-app notifications, location consent.

## Rules
- **Not Expo Go compatible** (MapLibre native module): use EAS **development builds** (cloud). iOS cannot be built locally on Windows. Don't suggest `expo start --go`.
- API via `packages/api-client` (Axios) only; types from `packages/api-types`. Tokens only in `expo-secure-store`.
- **SOS:** never anonymous (FR-009): never send `is_anonymous` (server returns 422 `anonymous_sos_not_allowed`). 5 s cancel countdown is client-side (D-09; value from `sos_cancel_timeout_seconds`); send with `Idempotency-Key`; offline → fail fast with a localized error, never queue silently.
- **AI draft:** user reviews/edits and explicitly confirms before it becomes a report (H5). Delete local audio file after upload (H2).
- Uploads: validate count/size/MIME/duration client-side to match D-24 (server remains authoritative).
- Location: foreground only; send every 60 s while app is open and on report/SOS screens; stop and call consent-revoke flow immediately when consent is withdrawn (D-15). No background location, no OS push (D-32).
- Realtime on `private-user.{id}` and `private-report-chat.{id}`; chat read-only when report is closed (D-18).
- Theme: `system | light | dark` via NativeWind color scheme + Zustand; persist only theme/language in `AsyncStorage` (tokens only in `expo-secure-store`; never tokens/report data/identity in AsyncStorage). Logical properties (`ms-*`, `ps-*`, `text-start`) alongside `I18nManager`. Severity/status never color-only; light/dark MapLibre style URLs.
- Arabic RTL default (call `I18nManager` and reload on language change), English switchable; strings from `packages/i18n`.
- Tests name FR/NFR IDs (FR-001..010, 006, 013..018, 025…).

## Structure
```
app/                        # Expo Router: route files are thin and only render a screen
├── (auth)/  (tabs)/
src/
├── features/<feature>/{api,components,hooks,screens,schemas}/   # + index.ts = only public surface
├── services/               # system/hardware: `location` (foreground), `secure-store`, `audio` (record + delete)
├── stores/                 # Zustand: UI state only (theme/language persisted in AsyncStorage)
├── components/             # app-specific; shared ones live in packages/ui
├── lib/                    # api-client wiring, echo, utils
└── i18n/                   # INIT ONLY: i18next + expo-localization + I18nManager
```
Features: `auth`, `reports`, `ai-draft`, `sos`, `my-reports`, `chat`, `notifications`, `profile`.
Boundaries (ESLint, set up in S0): import another feature only through its `index.ts`; never import from another `apps/*`; shared code goes to `packages/*`. **All translation strings live only in `packages/i18n`**; `src/i18n/` never contains strings.

## Do / Don't
- Do: PascalCase components, `useXxx` hooks, `xxx.schema.ts` for Zod; screens compose feature components; hardware/OS access only through `src/services/`.
- Do: normalize API errors in `api-client` to `{status, code, message, request_id}` and map `code` to localized messages; handle 401, 403, 409, 422, 429 and network failure explicitly.
- Do: semantic tokens/NativeWind classes only; logical properties (`ms-*`, `ps-*`, `text-start`).
- Don't: `any`, `@ts-ignore`, `fetch`, ad-hoc Axios instances, hard-coded colors or strings, `console.log` of API data or coordinates.
- Don't: store tokens/report data/identity in `AsyncStorage`; don't copy server data into Zustand.
- Don't: request background location or OS push permissions (D-32).
- Don't: keep a voice recording after upload/confirm or on failure/cancel (H2): `services/audio` owns recording and guaranteed deletion.

## Commands
`pnpm --filter mobile-citizen start|test|lint|typecheck` · `eas build --profile development --platform android`
