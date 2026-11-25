# API Design Decisions (v1.0 - decisions approved)

Companion to `openapi.yaml`. **Approval record:** on 2026-11-14 the owner approved every default in section 9 (D-01 to D-36) with the adjustments in section 9.1, approved D-37 and D-38 as proposed additions, and supplied the DBML (D-35). Statements keep their original tags for traceability:

| Tag | Meaning |
|---|---|
| **[C] Confirmed** | Stated in SRS v1.1, ERD v1.1 or the ERD explanation; applied as written |
| **[R] Recommendation** | My design choice where the sources are silent; implemented in the contract, changeable |
| **[U] Unresolved** | The sources are ambiguous, contradictory or silent and the choice changes behaviour; **needs your decision** (listed in section 9) |

## 1. Source availability

| Document | Status |
|---|---|
| SRS v1.1 (`srs.md`) | Read in full |
| ERD explanation v1.1 | Read in full |
| `erd_v1.1.dbml` | **Received and verified (D-35 closed).** Initial draft used the ERD PDF; the contract was then reconciled with the DBML |
| ERD PDF | Read earlier; superseded by the DBML |

DBML verification results: all table, column, enum and relation names in the contract match. Differences found and fixed in `openapi.yaml`:

| DBML fact | Fix |
|---|---|
| `simulated_integration_logs.assignment_id` not null | `SimulatedIntegrationLog.assignment_id` non-nullable and required |
| `field_actions.submitted_by` not null | `FieldAction.submitted_by` required |
| `geographic_alerts.created_by` not null | `GeographicAlert.created_by` required |
| `users.phone` unique but nullable | `phone` is `string or null` in `CurrentUser`, `UserAdmin`, `RevealedIdentity`, `ReporterIdentified`; still required in `RegisterRequest`; optional in `CreateUserRequest` and nullable in update requests |
| `users.updated_at`, `report_attachments.mime_type`, `size_bytes` nullable | made nullable / not required in `UserAdmin` and `AttachmentOut` |
| `report_attachments.file_type` note `image | video | audio` | enum confirmed (D-24 partly closed; limits still configuration) |
| `reports.severity` nullable | kept nullable, but SOS now sets `critical` (D-11) |

Confirmed by the DBML with no change: `reports.reporter_id`, `report_type_id`, `source`, `is_anonymous`, `current_status` not null; `reports.location`, `description` nullable; `ai_extractions.report_id` unique one-to-one and nullable, `extracted_type_id` nullable; `(category, name)` unique; indexes as assumed. The partial unique index for active assignments is still only in the DBML note and must be created in the physical schema.

## 2. Architecture summary

- [C] RESTful JSON API for a Laravel modular monolith; React Native clients; JWT bearer authentication; PostgreSQL/PostGIS representation in the ERD.
- [R] Base path `/api/v1`, 73 operations in 62 paths, grouped by **audience**: `/me`, `/operations`, `/field`, `/admin`, plus a few shared reads (`/report-types`, `/settings/public`, `/field-units`).
- [R] **Operations follow business actions, not tables.** There are no endpoints for `role_permissions`, `report_timeline`, `report_attachments`, `refresh_tokens`, `audit_logs` writes, `notifications` creation or `simulated_integration_logs` writes: those are produced as side effects. Timeline and attachments are embedded in report reads.
- [R] **Audience-specific schemas** (`CitizenReport`, `OperationsReport`, `FieldAssignment`) so anonymity is a property of the contract, not of frontend logic.
- [R] **Explicit transition operations** (`startReportReview`, `assignReport`, `reassignReport`, `markEnRoute`, `markOnSite`, `markMissionCompleted`, `closeReport`); no generic status update.
- [R] Authentication = who you are (token, active account). Authorisation = what you may do (role, permission, ownership, state), checked in the backend on every operation. Ownership failures return **404** rather than 403 to avoid revealing that another user's resource exists.
- [R] Error body `{code, message, request_id}`; validation `422` with per-field `errors`; state conflicts `409` with a stable `code`.
- [R] Lists use `page`/`per_page` for uniformity and simple Laravel pagination; chat adds `after_id` for reconnect catch-up.

### 2.1 Endpoint count by module

| Module | Ops | Module | Ops |
|---|---|---|---|
| Authentication | 4 | Live Chat | 4 |
| Current User | 5 | Operations Room | 6 |
| User Management | 6 | Assignments and Field Units | 7 |
| Roles and Permissions | 3 | Field Actions | 3 |
| System Settings | 3 | Field Unit Module | 6 |
| Report Types | 3 | Statistics and Export | 3 |
| Citizen Reporting | 3 | Audit Logs | 1 |
| SOS Reporting | 1 | Anonymous Identity Disclosure | 1 |
| AI-Assisted Reporting | 6 | Simulated Integration | 1 (optional) |
| Notifications | 3 | Geographic Alerts | 4 |
| **Total** | **73** | | |

## 3. Confirmed requirements applied [C]

1. Seven report statuses and the transitions of SRS section 7; five mission statuses with `cancelled` belonging to the assignment only.
2. Status/mission synchronisation in one transaction (ERD explanation section 6).
3. At most one non-cancelled assignment per report; previous assignments kept as history; reassignment cancels A and creates B.
4. AI draft is not a report; explicit confirmation creates the report and links `ai_extractions.report_id`; audio is deleted after transcription; the AI component never receives identity.
5. `reporter_id` is always stored; anonymity is enforced by the API; anonymous SOS is not allowed.
6. Mandatory `close_reason`; mandatory reason for identity reveal stored in `audit_logs.reason`; every reveal audited (who, which report, when, why).
7. Geographic alerts go only to users with `location_consent = true` and a last known location inside the circle.
8. SOS cancellation window comes from `system_settings` (default 5 s), not hard-coded.
9. Simulated authority integration only; no real government API.
10. `field_unit_id` required for Field Unit Representative and null for the other roles (validated in the application).

## 4. Role and permission strategy

[C] Four roles with exact SRS names. [C] RBAC is data-driven through `roles`, `permissions`, `role_permissions`; the administrator edits the mapping (FR-004); roles themselves are fixed (the SRS defines exactly four).

**Permission codes defined by the sources:**

| Code | Source | Used by |
|---|---|---|
| `report.assign` | ERD explanation, `permissions` section | `assignReport`, `reassignReport` |
| `report.close` | ERD explanation | `closeReport` |
| `identity.reveal` | ERD explanation | `revealAnonymousReporterIdentity` |

`report.edit` and `user.disable` appear in the ERD explanation only as **audit action names**, not as permission codes, so they are not treated as permission codes (I-08, now closed by D-34).

**Approved codes (D-34).** The owner approved all previously proposed codes. They are now ordinary `x-required-permissions`; `x-pending-permissions` was removed from the contract. They must be **seeded** in `permissions` and mapped in `role_permissions`:

| Code | Operations | Role |
|---|---|---|
| `user.manage` | `listUsers`, `createUser`, `getUser`, `updateUser`, `deactivateUser`, `reactivateUser` | System Administrator |
| `role.manage` | `listRoles`, `listPermissions`, `replaceRolePermissions` | System Administrator |
| `settings.manage` | `listSettings`, `updateSetting`, `createReportType`, `updateReportType` | System Administrator |
| `audit.view` | `listAuditLogs`, `listSimulatedIntegrationLogs` | System Administrator |
| `field_unit.view` | `listFieldUnits` | Dispatcher, System Administrator |
| `field_unit.manage` (**new, from D-37**) | `createFieldUnit`, `updateFieldUnit` | System Administrator |
| `report.view` | operations list/map/details, assignment reads, field-action list | Dispatcher |
| `report.review` | `startReportReview` | Dispatcher |
| `report.edit` | `updateOperationsReport` | Dispatcher |
| `report.export` | `exportReports` | Dispatcher |
| `statistics.view` | statistics overview, heat-map | Dispatcher |
| `alert.send`, `alert.view` | create / read geographic alerts | Dispatcher |
| `chat.use` | operator chat read/write | Dispatcher |
| `assignment.view_own` | field assignment reads, field action list | Field Unit Representative |
| `mission.update` | `markEnRoute`, `markOnSite`, `markMissionCompleted`, `submitFieldAction` | Field Unit Representative |
| `field_unit.update_own` | `updateMyFieldUnit` | Field Unit Representative |

`field_unit.manage` was introduced by me for the D-37 endpoints; please confirm it is covered by your blanket approval. Own-account operations (`/me`, notifications, citizen reporting, AI drafts) need role plus ownership and no permission code.

Citizen operations are authorised by role plus ownership and need no permission codes. [R] Because the SRS fixes the capabilities per role, a simpler alternative is **role-only checks for everything except the three confirmed codes** (D-34).

## 5. Anonymous report privacy design

[C] Database keeps the real `reporter_id`. [R] The API enforces anonymity by **projection**, never by trusting clients. Rule: a Dispatcher or Field Unit Representative can never receive `reporter_id`, `full_name`, `email`, `phone`, a user relationship, or an indirect link, for an anonymous report, on any surface.

| Surface | Citizen (own) | Dispatcher | Field Unit Rep | System Admin |
|---|---|---|---|---|
| Report list/details | full own report (`CitizenReport`) | `ReporterAnonymous` (fixed object) | `ReporterAnonymous` | no report read API; only `reveal` (D-21b) |
| Nested timeline | status + time only | staff identity only; reporter never appears (the first row is `system`) | not exposed | n/a |
| Chat | sees `operations_room`, own messages `is_mine` | citizen sender = "Anonymous Reporter", no `sender_id` | no chat access | none |
| Notifications | own only (reach the reporter even when anonymous, FR-038) | dispatchers have none | unit notifications contain no reporter data | none |
| Attachments | own | metadata only: no uploader, no storage path, signed URL | same | none |
| Field actions | n/a | staff identity only | staff identity only | none |
| AI extraction data | own draft incl. text | extracted fields only, **no** `input_text`, no audio (D-22) | not exposed | none |
| Exports | n/a | statistics and lists contain no reporter personal data at all (D-19b) | n/a | none |
| Simulated integration payload | n/a | n/a | n/a | log shows the operator projection, so no identity |
| Error bodies | generic | generic: no echo of reporter data; 404 hides foreign resources | same | same |
| Real-time events | own channel | identity-free projections | identity-free projections | none |
| Reveal | no | no | no | **only** `revealAnonymousReporterIdentity` |

Rules of the dedicated operation `POST /admin/reports/{reportId}/reporter-identity/reveal`:
System Administrator role **and** `identity.reveal`; mandatory non-blank `reason`; one transaction writing `audit_logs` (`identity.reveal`, actor, report, timestamp, reason, IP) before returning identity; `Cache-Control: no-store`; excluded from application logs and real-time; rate limited; 409 for non-anonymous reports. Audit rows never store the revealed identity.

**Residual risk [U D-22]:** free text (description, chat, field action, AI input text) can contain self-identification ("I am Ahmed, my number is...") that no schema can remove. The contract therefore does not expose raw AI input text to operators, but cannot sanitise descriptions. Recommend an in-app notice and an optional text scan.

## 6. Key design decisions [R]

| Topic | Decision | Reason |
|---|---|---|
| AI workflow | Separate operations: text draft, audio draft, get, edit, confirm, cancel. Transcription and extraction are internal steps of the two creation operations | Distinct business steps for the citizen are review, edit, confirm, cancel; transcription/extraction are not citizen-visible steps and exposing them would create audio-handling endpoints that the privacy rules forbid |
| AI failure | 503 `ai_component_unavailable` + `fallback: manual_report`; no draft stored | FR-014, NFR-020 |
| Confirm idempotency | Natural: draft row lock + one-to-one `report_id`; replay = 200 with same report | No new storage needed |
| SOS idempotency | Required `Idempotency-Key` header (UUID); replay = 200 same report | Network retries on mobile; a duplicate emergency is operationally harmful. Key store is an application cache, because the ERD has no column for it (D-10) |
| Review start | Explicit `POST .../review` instead of a status change as a side effect of `GET` | GET must be safe; FR-023 says the status moves when review starts |
| Map | Separate lightweight `.../reports/map` projection | NFR-002 (2 s) |
| Attachments | Uploaded with report creation (multipart) | Atomic: operators never see a half-built report; no extra endpoint |
| Notifications | Created only by backend logic; read/mark-read endpoints; unread count in `meta` | FR-011/038 |
| Alerts fan-out | Alert row committed synchronously; recipient notifications in a background job | Large radius; keeps request fast |
| Export | Synchronous download in PDF or XLSX | Simple; async job would need storage not in ERD |
| Admin identity | Admin has no operational report API | Least privilege (D-21b) |
| Simulation | Internal; optional read-only log endpoint flagged `x-proposed` | FR-039; no unnecessary endpoints |
| Locations | Users' locations are write-only through `/me/location`; never returned to anyone else | NFR-012, NFR-016 |

## 7. Assumptions

1. Login identifier is email + password (the SRS says "approved credentials"); phone is unique but not a login identifier (D-33).
2. Registration needs `full_name`, `email`, `phone`, `password` (the fields that exist in `users`); no email verification (not in the SRS).
3. `file_type` values `image|video|audio` (varchar(20) in ERD).
4. Pagination default 25, max 100; chat message max 4000 characters; password min length 8 (all proposals, D-27, D-06).
5. Seeded `system_settings` row for the SOS countdown exists; its key name is not defined by the sources (proposed `sos_cancel_timeout_seconds`, D-12).
6. The seeded report type "SOS عام" exists (ERD explanation).
7. Category names are free text in the ERD, so they are not an enum in the API.
8. All timestamps UTC; the client localises.

## 8. SRS / ERD inconsistencies and gaps (not silently resolved)

| ID | Issue | Impact on the API | Handling in the draft |
|---|---|---|---|
| I-01 | `erd_v1.1.dbml` was missing | **Resolved**: DBML received and reconciled | Closed (D-35) |
| I-02 | SRS section 7 says states advance in order and the unit moves only 3 to 6, but ERD introduces reassignment (`cancelled`, `cancelled_at`), which implies the report returns to `assigned` after `en_route`/`on_site` | A backward report transition exists | Implemented as allowed from `assigned`/`en_route`/`on_site`, clearly flagged (D-01) |
| I-03 | Reassignment is not an FR and not a use case in SRS v1.1; it exists only in the ERD explanation | No FR to trace | Traced to FR-026 with a note (D-02) |
| I-04 | SOS "cancellation window" has no server entity: the report is created only after the countdown (FR-006 wording: "if not cancelled it is sent") and the ERD has no pending-SOS table | "SOS cancellation operation" cannot exist server-side without inventing a column/table | Client-side countdown; setting exposed via `getPublicSettings` (D-09) |
| I-05 | FR-006: "if location cannot be determined the user is informed" does not say whether the SOS is still sent | Location required or optional | Optional (ERD `reports.location` nullable assumed) (D-09) |
| I-06 | `ai_extractions` stores only `extracted_location_text`, no point, yet `reports.location` is geographic | AI reports would have no map point | Optional `location` in `confirmAiDraft` body (D-36) |
| I-07 | FR-003: protected pages must be inaccessible after logout, but `refresh_tokens` revokes only refresh tokens; a stateless access JWT stays valid until expiry | Short window after logout | Short TTL + optional denylist (D-05) |
| I-08 | Only three permission codes were defined in the sources | Most operations had no code | **Resolved**: all proposed codes approved (D-34) |
| I-09 | `users.field_unit_id` requires `field_units` rows but no FR creates or edits field units | No management operation | **Resolved**: admin create/update added as proposed (D-37) |
| I-10 | `priority_score` algorithm undefined | Ordering | Read-only advisory field; SOS severity fixed to `critical` (D-11) |
| I-11 | FR-012 "alerts for the user's area" vs per-user notification rows | Which alerts a user sees | Alerts the user was notified about (D-16) |
| I-12 | `notification_type` has no chat or cancellation type | Chat/cancel notifications | Chat only via WebSocket; unit cancellation as `assignment` notification (D-22b) |
| I-13 | FR-030 "export reports" is ambiguous (statistics vs incident list) | Export datasets | `dataset=statistics|reports` (D-14b) |
| I-14 | FR-037 lets the admin reveal "a report's" reporter, but no admin report-read capability exists | Admin cannot locate a report | Reveal takes the report id (from complaint/audit); no admin report API (D-21b) |
| I-15 | State 6 text ("unit finished and attached its report") vs separate FR-033 | Whether a field action is required before `mission_completed` | Not required; allowed from `on_site` (D-04) |
| I-16 | Statistics "confirmation rate" and "response time" are undefined; `close_reason` is free text | Metric accuracy | Proposed definitions (D-14) |
| I-17 | SRS FR-009 allows anonymity for manual and AI reports only; "no anonymous SOS" is explicit only in the ERD explanation | none (consistent) | Enforced with 422 `anonymous_sos_not_allowed` |
| I-18 | ERD explanation notification rule for "assignment" does not name unit recipients | Who is notified | Unit representatives and reporter (D-21) |

## 9. Decision log

### 9.1 Owner adjustments applied (approved 2026-11-14)

| ID | Adjustment | Where implemented |
|---|---|---|
| D-11 | SOS reports are created with `severity = critical` automatically | `createSosReport`; SOS flow in `STATE_TRANSITIONS.md` |
| D-25 | The "SOS عام" type is excluded programmatically (no schema change) from the `GET /report-types` response used for manual reporting. Implemented as `purpose=manual_report` (default; excludes by seeded name) and `purpose=all` (Dispatcher/Admin only). Manual creation and AI draft edits reject the SOS type (422). The seeded type cannot be renamed (409), because it is identified by name | `listReportTypes`, `createManualReport`, `updateAiDraft`, `updateReportType` |
| D-34 | All proposed permission codes promoted to `x-required-permissions` | whole contract, section 4 |
| D-37 | Admin endpoints `POST /admin/field-units`, `PATCH /admin/field-units/{fieldUnitId}`, tagged `x-proposed: true`; no delete | `createFieldUnit`, `updateFieldUnit` |
| D-38 | `PATCH /me` (profile) and `POST /me/password` (change password; revokes all refresh tokens and returns a new token pair), tagged `x-proposed: true` | `updateMyProfile`, `changeMyPassword` |

Other defaults below are approved as written. Default = what the OpenAPI implements.

### 9.2 Full log

Default = what the OpenAPI currently implements.

| ID | Question | Current default (recommendation) | Alternative |
|---|---|---|---|
| D-01 | Allow reassignment from `en_route`/`on_site` with the report regressing to `assigned`? | Yes, from `assigned`, `en_route`, `on_site`; timeline records it | Only from `assigned` |
| D-02 | Accept reassignment without an SRS FR (ERD-driven)? | Yes, traced to FR-026; recommend adding an SRS FR | Remove endpoint |
| D-03 | Closing before `mission_completed` also cancels the active assignment? | Yes | Leave the assignment untouched (unit keeps seeing a closed report) |
| D-04 | Must a field action exist before `mission_completed`? When can actions be submitted? | Not required; allowed in `on_site` or `mission_completed` | Make it mandatory for completion |
| D-05 | Access and refresh token TTLs; deny access tokens on logout? | TTLs left to configuration; short access TTL; optional `jti` denylist | No denylist |
| D-06 | Password policy | min length 8 proposal | Stronger policy |
| D-07 | Who sets staff passwords? | Admin sets an initial password | Invitation/reset flow (needs email service, not in SRS) |
| D-08 | Protect `identity.reveal`/`role.manage` from being removed by a role edit? | Allowed but audited | Block removing the last holder |
| D-09 | Server-side SOS cancel and SOS without location | Client-side countdown; location optional | Add a pending-SOS entity; require location |
| D-10 | Where idempotency keys live and for how long | Application cache, TTL set in configuration | Add a DB column |
| D-11 | `priority_score` algorithm; severity of SOS | Algorithm left to design; **SOS severity = `critical` (approved)** | n/a |
| D-12 | Names and whitelist for public settings | `sos_cancel_timeout_seconds` only | Other keys |
| D-13 | Alert radius bounds, location freshness, recipient roles | `radius_m >= 1`; freshness unspecified; all roles with consent | Citizens only; max radius; freshness window |
| D-14 / D-14b | Statistics definitions; export dataset | response time = `created_at` to first `en_route_at`; confirmation rate needs a structured closure reason; `statistics` and `reports` datasets | Define precisely in test plan |
| D-15 | Clear `last_known_location` when consent is revoked | Yes (recommended) | Keep but ignore |
| D-16 | FR-012 semantics | Alerts the user received a notification for | Compute by current location |
| D-17 | AI failure behaviour and draft expiry | 503 + no draft; abandoned drafts handled by retention (D-30) | Store a failed draft |
| D-18 | Chat on closed reports | Read-only | Allow |
| D-19 / D-19b | Reporter data for field units and exports (non-anonymous) | Field units: display name only; exports: no reporter personal data | Show phone to units |
| D-20 | Dispatcher identity shown to citizens in chat | Role only (`operations_room`) | Show first name |
| D-21 / D-21b | Unit availability auto-update; admin access to reports | No automatic availability change; admin has no operational read API | Auto `busy` on assignment; admin read-only reports |
| D-22 / D-22b | Free-text identity leakage; chat notifications | Warn users; no raw AI input exposed; chat only via WebSocket | Persist chat notifications (needs ERD type) |
| D-23 | Strip EXIF/GPS from uploads of anonymous reports | Yes (recommended) | Keep |
| D-24 | Attachment limits and allowed MIME types | Unspecified; `image|video|audio`; limits in configuration | Fixed limits |
| D-25 | Hide "SOS عام" from manual type selection | **Hidden programmatically by seeded name (approved)** | Add a flag |
| D-26 | Show `close_reason` to the citizen | Yes | Hide |
| D-27 | Pagination, message-size limits | 25/100, 4000 chars | Others |
| D-28 | Editing closed reports | Not allowed | Allowed with audit |
| D-29 | Log failed identity-reveal attempts | Yes (recommended) | Success only |
| D-30 | Retention and encryption at rest | Out of API scope; needs policy | n/a |
| D-31 | Report type deletion | No delete (FK; no soft-delete flag) | Add `is_active` |
| D-32 | Device tokens for OS push | Not covered; WebSocket and in-app only | Add an entity |
| D-33 | Login by phone too | Email only | Both |
| D-34 | Permission model | Approved: all codes in section 4 are required codes | n/a |
| D-35 | Send `erd_v1.1.dbml` for re-verification | **Done** | n/a |
| D-36 | Location for AI reports | Optional `location` in confirm | Add a column to `ai_extractions` |
| D-37 | Field unit management API | **Added (create, update) as `x-proposed`** | Add delete |
| D-38 | Profile edit / password change | **Added as `x-proposed`** | n/a |

## 10. Recommended changes to source documents (not applied)

Also now implied by approved decisions: seed the new permission codes; add FRs for reassignment, field-unit management, profile and password management so the proposed operations gain requirement IDs.

SRS: add an FR for reassignment; define permissions per role; state whether SOS may be sent without location; define statistics metrics; define FR-012 semantics; clarify FR-030; list token lifetimes; add profile/password management if wanted.
ERD: add device-token table (if OS push is wanted); add structured `close_reason_code`; add `report_types.is_active`; consider a column for pending SOS or keep client-side countdown; add geographic point to `ai_extractions`; document nullability for every column in the explanation.

## 11. Validation results

| Check | Result |
|---|---|
| YAML syntax | Passes (`yaml.safe_load`); re-run after the v1.0 changes |
| OpenAPI 3.1 structure | Checked with a custom script: version 3.1.0, every `$ref` resolves, no unused components, 73 unique `operationId`, path parameters declared, every operation has FR traceability, security and 401 |
| JSON Schema validity | Every component schema validates against the JSON Schema 2020-12 meta-schema |
| **Limitation** | The official OpenAPI 3.1 meta-schema and validators (`openapi-spec-validator`, Redocly, Swagger CLI) are not installed and the network allowlist blocked fetching the schema, so full OpenAPI-specific validation **was not performed**. Please run a standard validator in CI. |
| FR coverage | FR-001 to FR-039 all mapped (see traceability) |
| Privacy review | Scripted scan of every schema reachable from Dispatcher and Field Unit responses: identity properties appear only in `StaffRef` (staff), `ReporterIdentified` (non-anonymous branch of a `oneOf`) and `CurrentUser` (own profile). `ReporterAnonymous` is a closed object (`additionalProperties: false`) |
| Workflow review | Report transitions, mission transitions, cancel-then-create reassignment, atomic synchronisation, AI confirm idempotency, SOS anonymity prohibition, location consent rule verified against the documents |
| ERD consistency | Reconciled with the DBML (section 1). No new columns were invented. Items needing data not in the ERD are listed as I-04, I-06, I-07, D-10, D-32 |
