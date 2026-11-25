# API Requirements Traceability (DRAFT)

Source: SRS v1.1, ERD v1.1 (PDF) and ERD explanation v1.1. Operation list is generated from the same table that produced `openapi.yaml`, so the two cannot drift. **Status: draft awaiting approval.**

Roles: `Citizen`, `Dispatcher`, `Field Unit Representative`, `System Administrator`. Permission codes are in the OpenAPI file (`x-required-permissions`). Decision D-34 (approved) promoted every previously pending code to a required code; `x-pending-permissions` no longer exists.

## 1. Functional requirements FR-001 to FR-039

| FR ID | Requirement | API Operation(s) | Roles | Related Entities | Coverage |
|-------|-------------|------------------|-------|------------------|----------|
| FR-001 | Create user account | `registerCitizen` (POST `/auth/register`) | Public | roles, users | Dedicated endpoint(s) |
| FR-002 | Log in | `login` (POST `/auth/login`)<br>`refreshToken` (POST `/auth/refresh`)<br>`getCurrentUser` (GET `/me`) | Public, Citizen, Dispatcher, Field Unit Representative, System Administrator | field_units, permissions, refresh_tokens, role_permissions, roles, users | Dedicated endpoint(s) |
| FR-003 | Log out | `logout` (POST `/auth/logout`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | refresh_tokens | Dedicated endpoint(s) |
| FR-004 | Roles and permissions (RBAC) | `getCurrentUser` (GET `/me`)<br>`createUser` (POST `/admin/users`)<br>`listRoles` (GET `/admin/roles`)<br>`listPermissions` (GET `/admin/permissions`)<br>`replaceRolePermissions` (PUT `/admin/roles/{roleId}/permissions`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | audit_logs, field_units, permissions, role_permissions, roles, users | Dedicated endpoint(s) |
| FR-005 | Citizen home page | — | — | — | Client only (no endpoint) |
| FR-006 | SOS report | `getPublicSettings` (GET `/settings/public`)<br>`createSosReport` (POST `/me/reports/sos`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | report_timeline, report_types, reports, system_settings | Dedicated endpoint(s) |
| FR-007 | Manual report | `createManualReport` (POST `/me/reports`) | Citizen | report_attachments, report_timeline, report_types, reports | Dedicated endpoint(s) |
| FR-008 | Report categories | `listReportTypes` (GET `/report-types`)<br>`createReportType` (POST `/admin/report-types`)<br>`updateReportType` (PATCH `/admin/report-types/{reportTypeId}`)<br>`createManualReport` (POST `/me/reports`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | audit_logs, report_attachments, report_timeline, report_types, reports | Endpoints + seeded data |
| FR-009 | Anonymous report | `createManualReport` (POST `/me/reports`)<br>`getMyReport` (GET `/me/reports/{reportId}`)<br>`updateAiDraft` (PATCH `/me/ai-drafts/{draftId}`)<br>`confirmAiDraft` (POST `/me/ai-drafts/{draftId}/confirm`)<br>`getOperationsReport` (GET `/operations/reports/{reportId}`)<br>`revealAnonymousReporterIdentity` (POST `/admin/reports/{reportId}/reporter-identity/reveal`) | Citizen, Dispatcher, System Administrator | ai_extractions, assignments, audit_logs, report_attachments, report_timeline, report_types, reports, users | Shared endpoints + role-specific schemas |
| FR-010 | Track report status | `listMyReports` (GET `/me/reports`)<br>`getMyReport` (GET `/me/reports/{reportId}`) | Citizen | report_attachments, report_timeline, report_types, reports | Dedicated endpoint(s) |
| FR-011 | Receive report notifications | `listMyNotifications` (GET `/me/notifications`)<br>`markNotificationRead` (POST `/me/notifications/{notificationId}/read`)<br>`markAllNotificationsRead` (POST `/me/notifications/read-all`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | notifications | Endpoints + WebSocket + backend logic |
| FR-012 | View area alerts | `updateMyLocation` (PUT `/me/location`)<br>`listMyNotifications` (GET `/me/notifications`)<br>`listMyAreaAlerts` (GET `/me/area-alerts`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | geographic_alerts, notifications, users | Dedicated endpoint(s) |
| FR-013 | AI: text description | `createAiDraftFromText` (POST `/me/ai-drafts/text`) | Citizen | ai_extractions, report_types | Dedicated endpoint(s) |
| FR-014 | AI: voice description | `createAiDraftFromAudio` (POST `/me/ai-drafts/audio`) | Citizen | ai_extractions | Dedicated endpoint(s) |
| FR-015 | AI: extract report data | `createAiDraftFromText` (POST `/me/ai-drafts/text`)<br>`createAiDraftFromAudio` (POST `/me/ai-drafts/audio`) | Citizen | ai_extractions, report_types | Internal service (inside draft creation) |
| FR-016 | AI: review draft | `getAiDraft` (GET `/me/ai-drafts/{draftId}`)<br>`updateAiDraft` (PATCH `/me/ai-drafts/{draftId}`)<br>`cancelAiDraft` (POST `/me/ai-drafts/{draftId}/cancel`) | Citizen | ai_extractions | Dedicated endpoints |
| FR-017 | AI: confirm submission | `confirmAiDraft` (POST `/me/ai-drafts/{draftId}/confirm`) | Citizen | ai_extractions, report_timeline, report_types, reports | Dedicated endpoint(s) |
| FR-018 | AI: voice data protection | `createAiDraftFromAudio` (POST `/me/ai-drafts/audio`) | Citizen | ai_extractions | Backend behaviour (no endpoint) |
| FR-019 | Reports on map | `listOperationsReports` (GET `/operations/reports`)<br>`getOperationsMapReports` (GET `/operations/reports/map`) | Dispatcher | report_types, reports | Endpoint + WebSocket |
| FR-020 | Filter reports | `listOperationsReports` (GET `/operations/reports`) | Dispatcher | report_types, reports | Dedicated endpoint(s) |
| FR-021 | View field units | `listFieldUnits` (GET `/field-units`)<br>`updateMyFieldUnit` (PATCH `/field/unit`) | Dispatcher, Field Unit Representative, System Administrator | field_units | Dedicated endpoint(s) |
| FR-022 | Priority ordering | `listOperationsReports` (GET `/operations/reports`) | Dispatcher | report_types, reports | Query parameter of an existing endpoint |
| FR-023 | Report details and review | `getOperationsReport` (GET `/operations/reports/{reportId}`)<br>`startReportReview` (POST `/operations/reports/{reportId}/review`) | Dispatcher | ai_extractions, assignments, notifications, report_attachments, report_timeline, reports, users | Dedicated endpoint(s) |
| FR-024 | Edit report data | `updateOperationsReport` (PATCH `/operations/reports/{reportId}`)<br>`listAuditLogs` (GET `/admin/audit-logs`) | Dispatcher, System Administrator | audit_logs, reports, users | Dedicated endpoint(s) |
| FR-025 | Live chat with reporter | `listMyReportChatMessages` (GET `/me/reports/{reportId}/chat-messages`)<br>`sendMyReportChatMessage` (POST `/me/reports/{reportId}/chat-messages`)<br>`listReportChatMessages` (GET `/operations/reports/{reportId}/chat-messages`)<br>`sendOperatorChatMessage` (POST `/operations/reports/{reportId}/chat-messages`) | Citizen, Dispatcher | chat_messages, reports | Endpoints + WebSocket |
| FR-026 | Assign report to unit | `listFieldUnits` (GET `/field-units`)<br>`assignReport` (POST `/operations/reports/{reportId}/assignments`)<br>`reassignReport` (POST `/operations/reports/{reportId}/assignments/active/reassign`)<br>`listReportAssignments` (GET `/operations/reports/{reportId}/assignments`)<br>`getActiveAssignment` (GET `/operations/reports/{reportId}/assignments/active`) | Dispatcher, System Administrator | assignments, audit_logs, field_units, notifications, report_timeline, reports, simulated_integration_logs | Dedicated endpoint(s) |
| FR-027 | Geographic alert | `updateMyLocation` (PUT `/me/location`)<br>`updateMyLocationConsent` (PUT `/me/location-consent`)<br>`createGeographicAlert` (POST `/operations/alerts`)<br>`listGeographicAlerts` (GET `/operations/alerts`)<br>`getGeographicAlert` (GET `/operations/alerts/{alertId}`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | audit_logs, geographic_alerts, notifications, users | Endpoint + background job + WebSocket |
| FR-028 | Close report | `closeReport` (POST `/operations/reports/{reportId}/close`) | Dispatcher | assignments, audit_logs, notifications, report_timeline, reports | Dedicated endpoint(s) |
| FR-029 | Statistics and reports | `getStatisticsOverview` (GET `/operations/statistics/overview`)<br>`getStatisticsHeatmap` (GET `/operations/statistics/heatmap`) | Dispatcher | assignments, report_types, reports | Dedicated endpoint(s) |
| FR-030 | Export reports | `exportReports` (GET `/operations/exports`) | Dispatcher | assignments, audit_logs, reports | Dedicated endpoint(s) |
| FR-031 | View assigned reports | `listFieldAssignments` (GET `/field/assignments`)<br>`getFieldAssignment` (GET `/field/assignments/{assignmentId}`) | Field Unit Representative | assignments, report_attachments, reports | Dedicated endpoint(s) |
| FR-032 | Update mission status | `markEnRoute` (POST `/field/assignments/{assignmentId}/en-route`)<br>`markOnSite` (POST `/field/assignments/{assignmentId}/on-site`)<br>`markMissionCompleted` (POST `/field/assignments/{assignmentId}/complete`) | Field Unit Representative | assignments, notifications, report_timeline, reports | Dedicated endpoints (explicit transitions) |
| FR-033 | Field action report | `listReportFieldActions` (GET `/operations/reports/{reportId}/field-actions`)<br>`submitFieldAction` (POST `/field/assignments/{assignmentId}/actions`)<br>`listFieldActions` (GET `/field/assignments/{assignmentId}/actions`) | Dispatcher, Field Unit Representative | assignments, field_actions | Dedicated endpoint(s) |
| FR-034 | User management | `listUsers` (GET `/admin/users`)<br>`createUser` (POST `/admin/users`)<br>`getUser` (GET `/admin/users/{userId}`)<br>`updateUser` (PATCH `/admin/users/{userId}`)<br>`deactivateUser` (POST `/admin/users/{userId}/deactivate`)<br>`reactivateUser` (POST `/admin/users/{userId}/reactivate`)<br>`listAuditLogs` (GET `/admin/audit-logs`) | System Administrator | audit_logs, field_units, refresh_tokens, roles, users | Dedicated endpoint(s) |
| FR-035 | Audit log view | `listAuditLogs` (GET `/admin/audit-logs`) | System Administrator | audit_logs, users | Dedicated endpoint(s) |
| FR-036 | System settings | `listSettings` (GET `/admin/settings`)<br>`updateSetting` (PUT `/admin/settings/{key}`)<br>`getPublicSettings` (GET `/settings/public`)<br>`createReportType` (POST `/admin/report-types`)<br>`updateReportType` (PATCH `/admin/report-types/{reportTypeId}`)<br>`listAuditLogs` (GET `/admin/audit-logs`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | audit_logs, report_types, system_settings, users | Dedicated endpoint(s) |
| FR-037 | Reveal anonymous identity | `listAuditLogs` (GET `/admin/audit-logs`)<br>`revealAnonymousReporterIdentity` (POST `/admin/reports/{reportId}/reporter-identity/reveal`) | System Administrator | audit_logs, reports, users | Dedicated endpoint(s) |
| FR-038 | Notify reporter | `listMyNotifications` (GET `/me/notifications`)<br>`closeReport` (POST `/operations/reports/{reportId}/close`)<br>`assignReport` (POST `/operations/reports/{reportId}/assignments`)<br>`markEnRoute` (POST `/field/assignments/{assignmentId}/en-route`)<br>`markOnSite` (POST `/field/assignments/{assignmentId}/on-site`)<br>`markMissionCompleted` (POST `/field/assignments/{assignmentId}/complete`) | Citizen, Dispatcher, Field Unit Representative, System Administrator | assignments, audit_logs, field_units, notifications, report_timeline, reports, simulated_integration_logs | Backend logic + notification endpoints |
| FR-039 | Simulated integration layer | `assignReport` (POST `/operations/reports/{reportId}/assignments`)<br>`listSimulatedIntegrationLogs` (GET `/admin/simulated-integration-logs`) | Dispatcher, System Administrator | assignments, audit_logs, field_units, notifications, report_timeline, reports, simulated_integration_logs | Internal service + optional read endpoint |

### 1.1 Requirements without a dedicated endpoint, and why

| FR ID | Mechanism | Explanation |
|---|---|---|
| FR-005 | Client (frontend) only | Pure UI requirement: three entry points. Data comes from existing operations (`getPublicSettings`, `listMyAreaAlerts`, `listMyNotifications`). No dedicated endpoint. |
| FR-008 | Endpoint + seeded data | Categories and the category-to-authority mapping live in `report_types` (read via `listReportTypes`, maintained via admin type operations). Selecting at least one type is validated in report creation (`report_type_id` required). |
| FR-009 | Shared operations + role-specific schemas | `is_anonymous` is accepted by manual creation and AI draft edit/confirm (never SOS). Enforcement is in the response schemas of `/operations` and `/field` (see API_DESIGN_DECISIONS section 5) and in `revealAnonymousReporterIdentity`. |
| FR-011 | Endpoints + WebSocket + backend logic | Notifications are rows created by backend business logic; read through `/me/notifications`; pushed in real time via `notification.created`. |
| FR-015 | Internal service | Extraction is executed inside draft creation; there is deliberately no separate extraction endpoint. |
| FR-016 | Endpoints | `getAiDraft`, `updateAiDraft`, `cancelAiDraft`. |
| FR-018 | Backend behaviour | No endpoint: audio is deleted after transcription and the AI component never receives user identity. Fulfilled inside the audio-draft operation; verified by tests, not by an API call. |
| FR-019 | Endpoint + WebSocket | Initial data through `getOperationsMapReports`; live updates via `report.created` / `report.status_changed` events. |
| FR-022 | Query parameter | Fulfilled by `sort=priority` on `listOperationsReports`; `priority_score` is advisory. |
| FR-025 | Endpoints + WebSocket | Four REST operations (citizen and dispatcher variants) plus `chat.message.created`. |
| FR-027 | Endpoint + background job + WebSocket | Creation endpoint; recipient fan-out is a background job; delivery via `geographic_alert.received`. |
| FR-032 | Endpoints (explicit transitions) | Three explicit transition operations. No generic status-update endpoint exists. |
| FR-038 | Backend logic + notification endpoints | No endpoint of its own: notifications are generated inside `assignReport`, `reassignReport`, mission transitions and `closeReport`, and read via `/me/notifications`. |
| FR-039 | Internal service (+ optional read endpoint) | Simulation runs inside assignment operations; `simulated_integration_logs` rows are written by the backend. The only API surface is the optional, proposed read endpoint. |

### 1.2 Coverage notes

- All 39 FRs are covered. 5 (FR-005 client-only; FR-015, FR-018, FR-038 internal; FR-039 internal with an optional read endpoint) have no endpoint that exists purely for them, by design.
- **Reassignment** has no FR in SRS v1.1; it exists because ERD v1.1 introduces `assignments.cancelled_at` and the explanation defines the workflow. It is traced to FR-026 and flagged (D-02).
- Operations not tied to a single FR but needed by one: `updateMyLocation`, `updateMyLocationConsent` (FR-012, FR-027 need `users.last_known_location` and `location_consent`); `refreshToken` (FR-002, NFR-006); `getPublicSettings` (FR-006, FR-036).
- Proposed operations (`x-proposed: true`) that are not SRS requirements: `listSimulatedIntegrationLogs` (supports FR-039), and the approved additions of D-37 and D-38: `createFieldUnit`, `updateFieldUnit` (`/admin/field-units`), `updateMyProfile` (`PATCH /me`), `changeMyPassword` (`POST /me/password`). They have no FR identifier.

## 2. Non-functional requirements

| NFR | Topic | How the contract addresses it | Type |
|---|---|---|---|
| NFR-001 | Manual report < 1 min | Single-request creation (`createManualReport`, `createSosReport`); no multi-step wizard on the server. | Performance |
| NFR-002 | Live map update < 2 s | `getOperationsMapReports` is a light projection; updates pushed by `report.created` / `report.status_changed` after commit; ERD indexes on status/created_at. | Performance / Real-time |
| NFR-003 | Voice report < 2 min | One request pipeline (`createAiDraftFromAudio`); 503 + manual fallback on failure. | Performance |
| NFR-004 | Lists update without reload | WebSocket events + `after_id`/pagination for catch-up. | Real-time |
| NFR-005 | AI accuracy >= 85 % | Not an API property; measured against a test set defined in the test plan. API exposes the draft review/edit step so errors are correctable (FR-016). | AI accuracy |
| NFR-006 | Time-limited tokens | Bearer JWT, refresh rotation, `refresh_tokens.revoked_at`. TTL values undefined (D-05). | Security |
| NFR-007 | Backend RBAC | Every operation carries `x-required-roles`; ownership and permission checks documented; 403/404 semantics defined. | Security |
| NFR-008 | Encryption in transit | `servers` restricted to `https`; WebSocket over `wss`. | Security |
| NFR-009 | Encryption at rest | Not visible in the API contract; physical design concern (D-30). | Security (out of API scope) |
| NFR-010 | Audit logging | Audit actions for edit, assign, reassign, close, user/role/settings changes, alerts, export, identity reveal; read via `listAuditLogs`. | Security |
| NFR-011 | Rate limiting | `x-rate-limited` operations return 429 + `Retry-After`; limits pending approval. | Security |
| NFR-012 | Minimal personal data | Schemas expose the smallest needed set; no email in operator views; user locations never returned. | Privacy |
| NFR-013 | Hide identity from operators | Role-specific schemas (`ReporterAnonymous`), anonymised chat, exports, notifications; reveal only via admin operation. | Privacy |
| NFR-014 | No identity to AI component | `user_id` never in AI payload; draft schema has no identity. | Privacy |
| NFR-015 | Delete audio after transcription | No audio storage/retrieval endpoint; deletion inside the audio-draft operation. | Privacy |
| NFR-016 | Identity data to authorised only | `identity.reveal` permission + admin role + mandatory reason + audit; 404 for foreign resources. | Privacy |
| NFR-017 | Retention policy | Undefined in sources; not an API operation (D-30). | Data retention (open) |
| NFR-018 | Simple UI | Client concern. | Usability |
| NFR-019 | Voice input | `createAiDraftFromAudio`. | Usability |
| NFR-020 | Fallback when AI is down | 503 `ai_component_unavailable` with `fallback: manual_report`; manual endpoint independent of AI. | Reliability |
| NFR-021 | Future scalability | Modular, audience-scoped paths; versioned base path `/api/v1`. | Scalability |
| NFR-022 | Browser/mobile compatibility | Plain JSON/HTTPS; multipart for files. | Compatibility |

## 3. Operation index

Total operations: **73**.

| Module (tag) | Operations |
|---|---|
| Authentication | 4 |
| Current User | 5 |
| Assignments and Field Units | 7 |
| User Management | 6 |
| Roles and Permissions | 3 |
| System Settings | 3 |
| Report Types | 3 |
| Citizen Reporting | 3 |
| SOS Reporting | 1 |
| AI-Assisted Reporting | 6 |
| Notifications | 3 |
| Geographic Alerts | 4 |
| Live Chat | 4 |
| Operations Room | 6 |
| Field Actions | 3 |
| Statistics and Export | 3 |
| Field Unit Module | 6 |
| Audit Logs | 1 |
| Anonymous Identity Disclosure | 1 |
| Simulated Integration | 1 |

| Operation ID | Method | Path | FR | Roles | Required permission codes | Proposed (`x-proposed`) |
|---|---|---|---|---|---|---|
| `registerCitizen` | POST | `/auth/register` | FR-001 | Public | — |  |
| `login` | POST | `/auth/login` | FR-002 | Public | — |  |
| `refreshToken` | POST | `/auth/refresh` | FR-002 | Public | — |  |
| `logout` | POST | `/auth/logout` | FR-003 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `getCurrentUser` | GET | `/me` | FR-002, FR-004 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `updateMyLocation` | PUT | `/me/location` | FR-012, FR-027 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `updateMyLocationConsent` | PUT | `/me/location-consent` | FR-027 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `updateMyProfile` | PATCH | `/me` | none (proposed) | Citizen, Dispatcher, Field Unit Representative, System Administrator | — | yes |
| `changeMyPassword` | POST | `/me/password` | none (proposed) | Citizen, Dispatcher, Field Unit Representative, System Administrator | — | yes |
| `createFieldUnit` | POST | `/admin/field-units` | none (proposed) | System Administrator | `field_unit.manage` | yes |
| `updateFieldUnit` | PATCH | `/admin/field-units/{fieldUnitId}` | none (proposed) | System Administrator | `field_unit.manage` | yes |
| `listUsers` | GET | `/admin/users` | FR-034 | System Administrator | `user.manage` |  |
| `createUser` | POST | `/admin/users` | FR-034, FR-004 | System Administrator | `user.manage` |  |
| `getUser` | GET | `/admin/users/{userId}` | FR-034 | System Administrator | `user.manage` |  |
| `updateUser` | PATCH | `/admin/users/{userId}` | FR-034 | System Administrator | `user.manage` |  |
| `deactivateUser` | POST | `/admin/users/{userId}/deactivate` | FR-034 | System Administrator | `user.manage` |  |
| `reactivateUser` | POST | `/admin/users/{userId}/reactivate` | FR-034 | System Administrator | `user.manage` |  |
| `listRoles` | GET | `/admin/roles` | FR-004 | System Administrator | `role.manage` |  |
| `listPermissions` | GET | `/admin/permissions` | FR-004 | System Administrator | `role.manage` |  |
| `replaceRolePermissions` | PUT | `/admin/roles/{roleId}/permissions` | FR-004 | System Administrator | `role.manage` |  |
| `listSettings` | GET | `/admin/settings` | FR-036 | System Administrator | `settings.manage` |  |
| `updateSetting` | PUT | `/admin/settings/{key}` | FR-036 | System Administrator | `settings.manage` |  |
| `getPublicSettings` | GET | `/settings/public` | FR-006, FR-036 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `listReportTypes` | GET | `/report-types` | FR-008 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `createReportType` | POST | `/admin/report-types` | FR-036, FR-008 | System Administrator | `settings.manage` |  |
| `updateReportType` | PATCH | `/admin/report-types/{reportTypeId}` | FR-036, FR-008 | System Administrator | `settings.manage` |  |
| `createManualReport` | POST | `/me/reports` | FR-007, FR-008, FR-009 | Citizen | — |  |
| `createSosReport` | POST | `/me/reports/sos` | FR-006 | Citizen | — |  |
| `listMyReports` | GET | `/me/reports` | FR-010 | Citizen | — |  |
| `getMyReport` | GET | `/me/reports/{reportId}` | FR-010, FR-009 | Citizen | — |  |
| `createAiDraftFromText` | POST | `/me/ai-drafts/text` | FR-013, FR-015 | Citizen | — |  |
| `createAiDraftFromAudio` | POST | `/me/ai-drafts/audio` | FR-014, FR-015, FR-018 | Citizen | — |  |
| `getAiDraft` | GET | `/me/ai-drafts/{draftId}` | FR-016 | Citizen | — |  |
| `updateAiDraft` | PATCH | `/me/ai-drafts/{draftId}` | FR-016, FR-009 | Citizen | — |  |
| `confirmAiDraft` | POST | `/me/ai-drafts/{draftId}/confirm` | FR-017, FR-009 | Citizen | — |  |
| `cancelAiDraft` | POST | `/me/ai-drafts/{draftId}/cancel` | FR-016 | Citizen | — |  |
| `listMyNotifications` | GET | `/me/notifications` | FR-011, FR-012, FR-038 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `markNotificationRead` | POST | `/me/notifications/{notificationId}/read` | FR-011 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `markAllNotificationsRead` | POST | `/me/notifications/read-all` | FR-011 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `listMyAreaAlerts` | GET | `/me/area-alerts` | FR-012 | Citizen, Dispatcher, Field Unit Representative, System Administrator | — |  |
| `listMyReportChatMessages` | GET | `/me/reports/{reportId}/chat-messages` | FR-025 | Citizen | — |  |
| `sendMyReportChatMessage` | POST | `/me/reports/{reportId}/chat-messages` | FR-025 | Citizen | — |  |
| `listReportChatMessages` | GET | `/operations/reports/{reportId}/chat-messages` | FR-025 | Dispatcher | `chat.use` |  |
| `sendOperatorChatMessage` | POST | `/operations/reports/{reportId}/chat-messages` | FR-025 | Dispatcher | `chat.use` |  |
| `listOperationsReports` | GET | `/operations/reports` | FR-020, FR-022, FR-019 | Dispatcher | `report.view` |  |
| `getOperationsMapReports` | GET | `/operations/reports/map` | FR-019 | Dispatcher | `report.view` |  |
| `getOperationsReport` | GET | `/operations/reports/{reportId}` | FR-023, FR-009 | Dispatcher | `report.view` |  |
| `startReportReview` | POST | `/operations/reports/{reportId}/review` | FR-023 | Dispatcher | `report.review` |  |
| `updateOperationsReport` | PATCH | `/operations/reports/{reportId}` | FR-024 | Dispatcher | `report.edit` |  |
| `closeReport` | POST | `/operations/reports/{reportId}/close` | FR-028, FR-038 | Dispatcher | `report.close` |  |
| `listFieldUnits` | GET | `/field-units` | FR-021, FR-026 | Dispatcher, System Administrator | `field_unit.view` |  |
| `assignReport` | POST | `/operations/reports/{reportId}/assignments` | FR-026, FR-038, FR-039 | Dispatcher | `report.assign` |  |
| `reassignReport` | POST | `/operations/reports/{reportId}/assignments/active/reassign` | FR-026 | Dispatcher | `report.assign` |  |
| `listReportAssignments` | GET | `/operations/reports/{reportId}/assignments` | FR-026 | Dispatcher | `report.view` |  |
| `getActiveAssignment` | GET | `/operations/reports/{reportId}/assignments/active` | FR-026 | Dispatcher | `report.view` |  |
| `listReportFieldActions` | GET | `/operations/reports/{reportId}/field-actions` | FR-033 | Dispatcher | `report.view` |  |
| `createGeographicAlert` | POST | `/operations/alerts` | FR-027 | Dispatcher | `alert.send` |  |
| `listGeographicAlerts` | GET | `/operations/alerts` | FR-027 | Dispatcher | `alert.view` |  |
| `getGeographicAlert` | GET | `/operations/alerts/{alertId}` | FR-027 | Dispatcher | `alert.view` |  |
| `getStatisticsOverview` | GET | `/operations/statistics/overview` | FR-029 | Dispatcher | `statistics.view` |  |
| `getStatisticsHeatmap` | GET | `/operations/statistics/heatmap` | FR-029 | Dispatcher | `statistics.view` |  |
| `exportReports` | GET | `/operations/exports` | FR-030 | Dispatcher | `report.export` |  |
| `listFieldAssignments` | GET | `/field/assignments` | FR-031 | Field Unit Representative | `assignment.view_own` |  |
| `getFieldAssignment` | GET | `/field/assignments/{assignmentId}` | FR-031 | Field Unit Representative | `assignment.view_own` |  |
| `markEnRoute` | POST | `/field/assignments/{assignmentId}/en-route` | FR-032, FR-038 | Field Unit Representative | `mission.update` |  |
| `markOnSite` | POST | `/field/assignments/{assignmentId}/on-site` | FR-032, FR-038 | Field Unit Representative | `mission.update` |  |
| `markMissionCompleted` | POST | `/field/assignments/{assignmentId}/complete` | FR-032, FR-038 | Field Unit Representative | `mission.update` |  |
| `submitFieldAction` | POST | `/field/assignments/{assignmentId}/actions` | FR-033 | Field Unit Representative | `mission.update` |  |
| `listFieldActions` | GET | `/field/assignments/{assignmentId}/actions` | FR-033 | Field Unit Representative | `assignment.view_own` |  |
| `updateMyFieldUnit` | PATCH | `/field/unit` | FR-021 | Field Unit Representative | `field_unit.update_own` |  |
| `listAuditLogs` | GET | `/admin/audit-logs` | FR-035, FR-024, FR-034, FR-036, FR-037 | System Administrator | `audit.view` |  |
| `revealAnonymousReporterIdentity` | POST | `/admin/reports/{reportId}/reporter-identity/reveal` | FR-037, FR-009 | System Administrator | `identity.reveal` |  |
| `listSimulatedIntegrationLogs` | GET | `/admin/simulated-integration-logs` | FR-039 | System Administrator | `audit.view` | yes |
