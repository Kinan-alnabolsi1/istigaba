# Real-time Events (v1.0)

WebSocket events are **separate from the REST contract**. REST remains the source of truth; events only tell connected clients that something changed so they can update the map, lists and notification badges (NFR-002, NFR-004). Every event payload can be rebuilt from a REST read, so a client that missed events resynchronises with REST (`after_id`, pagination, `GET /me/notifications`).

Labels: **[C]** required by the SRS/ERD explanation, **[R]** design recommendation; all former open points were approved on 2026-11-14 (see `API_DESIGN_DECISIONS.md`).

## 1. Transport and channel model [R]

| Item | Design |
|---|---|
| Protocol | WebSocket over TLS (`wss`), NFR-008. Specific library/server is a design-document decision. |
| Authentication | Same access token as REST, presented when the connection/subscription is opened. An expired or revoked token closes the connection. |
| Authorisation | **Every channel subscription is authorised by the backend** with the same RBAC, ownership and `is_active` rules as REST. The client cannot choose arbitrary channels. |
| Delivery | Events are broadcast **only after the database transaction commits** (after-commit hook). A rolled-back change never produces an event. |
| Ordering / duplicates | At-least-once. Each event carries `event_id` (UUID) and `occurred_at`; consumers de-duplicate by `event_id` and may use the entity id plus REST to reconcile. |
| Envelope | `{ "event": "<name>", "event_id": "<uuid>", "occurred_at": "<RFC3339 UTC>", "data": { ... } }` |
| Payload policy | Minimal: identifiers, status, and the **audience-specific projection** of the entity. Never a field the audience could not obtain from the corresponding REST schema. |

### Private channels

| Channel | Who may subscribe | Purpose |
|---|---|---|
| `private-user.{userId}` | that user only | personal notifications, geographic alerts, report updates for the reporter, chat for the reporter |
| `private-operations` | Dispatcher (and only when active) | live report map/list, assignments, unit changes, alerts history |
| `private-field-unit.{fieldUnitId}` | Field Unit Representatives whose `users.field_unit_id` equals the id | new/cancelled assignments, report changes affecting the unit |
| `private-report-chat.{reportId}` | Dispatcher; the reporter of that report | chat messages of one report |

There is no public channel. Administrators subscribe to no operational channel (they have no operational data access, D-21b).

## 2. Privacy rules for all events [C]

1. **Identity-free by construction.** Events sent to `private-operations`, `private-field-unit.*` and `private-report-chat.*` use the same projections as `OperationsReportSummary`, `FieldAssignmentSummary` and `ChatMessageOperations`. For an anonymous report the reporter appears only as `{"is_anonymous": true, "display_name": "Anonymous Reporter"}`.
2. Never included in any event: `reporter_id`, `sender_id`, `user_id`, name, email, phone, `last_known_location` of any user, `file_url`, audio references, password/token data, revealed identities (the identity-reveal result is **never** pushed through real time).
3. The reporter's own events use `private-user.{userId}` and are limited to that reporter's data. An event is never copied to another user's channel with different content.
4. Event names and bodies must not embed free text that could reveal an anonymous reporter to operators beyond what the REST schema already contains (D-22).
5. A user who is deactivated or whose role changes has their subscriptions terminated.

## 3. Events

### 3.1 `report.created`
| | |
|---|---|
| Trigger | A report row is committed: `createManualReport`, `createSosReport` or `confirmAiDraft` |
| Recipients | `private-operations` |
| Payload | `data: OperationsReportSummary` (id, source, report_type, reporter object, severity, priority_score, status=`received`, administrative_area, location, location_text, waiting_seconds, created_at) |
| Privacy | Anonymous reports carry `ReporterAnonymous` only |
| Related REST | `getOperationsReport`, `listOperationsReports`, `getOperationsMapReports` |
| FR/NFR | FR-019, FR-023, NFR-002, NFR-004 |

### 3.2 `report.status_changed`
| | |
|---|---|
| Trigger | Any report status change: `startReportReview`, `assignReport`, `reassignReport`, mission transitions, `closeReport`; also report data edits that change map-visible fields (`updateOperationsReport`) |
| Recipients | `private-operations`; `private-field-unit.{id}` of the unit with the active assignment; `private-user.{reporterId}` (reporter, own projection) |
| Payload (operations / field) | `{ report_id, status, previous_status, changed_at, changed_by_role }` plus map-relevant fields (`severity`, `location`) for operations |
| Payload (reporter) | `{ report_id, status, changed_at }` only (no staff identity, no notes) |
| Privacy | `changed_by` staff identity is sent only to operations; not to the reporter; no reporter fields at all |
| Related REST | `getOperationsReport`, `getMyReport`, `getFieldAssignment` |
| FR/NFR | FR-010, FR-019, FR-032, NFR-002 |

### 3.3 `assignment.created`
| | |
|---|---|
| Trigger | Commit of `assignReport` or of the new assignment in `reassignReport` |
| Recipients | `private-operations`; `private-field-unit.{newUnitId}`; `private-user.{reporterId}` (as a generic update) |
| Payload (operations) | `data: Assignment` |
| Payload (field unit) | `data: FieldAssignmentSummary` (report type, severity, status, location, reporter object per `FieldReporter`) |
| Payload (reporter) | `{ report_id, status: "assigned" }` |
| Privacy | Field payload applies the anonymisation rules; no chat or AI text |
| Related REST | `listFieldAssignments`, `getFieldAssignment`, `getActiveAssignment` |
| FR | FR-026, FR-031, FR-038 |

### 3.4 `assignment.reassigned`
| | |
|---|---|
| Trigger | Commit of `reassignReport` |
| Recipients | `private-operations`; `private-field-unit.{oldUnitId}` (cancellation); `private-field-unit.{newUnitId}`; `private-user.{reporterId}` |
| Payload | operations: `{ report_id, cancelled_assignment: Assignment, assignment: Assignment, report_status }`; old unit: `{ assignment_id, report_id, mission_status: "cancelled", cancelled_at }`; new unit: same as `assignment.created`; reporter: `{ report_id, status: "assigned" }` |
| Privacy | As 3.3. The old unit receives no information beyond what it already had |
| Related REST | `listReportAssignments`, `getActiveAssignment` |
| FR | FR-026 (and ERD reassignment, D-02) |

### 3.5 `assignment.status_changed` (field unit status update)
| | |
|---|---|
| Trigger | Commit of `markEnRoute`, `markOnSite`, `markMissionCompleted` |
| Recipients | `private-operations`; `private-field-unit.{unitId}` (other representatives of the same unit) |
| Payload | `{ assignment_id, report_id, mission_status, stage_at, report_status }` |
| Privacy | No personal data |
| Related REST | `getActiveAssignment`, `getFieldAssignment` |
| FR/NFR | FR-032, NFR-002 |

### 3.6 `field_unit.updated`
| | |
|---|---|
| Trigger | `updateMyFieldUnit` (availability or location) or administrator `updateFieldUnit` / `createFieldUnit` |
| Recipients | `private-operations` |
| Payload | `data: FieldUnit` (id, name, unit_type, availability, location, location_updated_at) |
| Privacy | Field-unit location only; citizen locations are never broadcast |
| Related REST | `listFieldUnits` |
| FR | FR-021 |

### 3.7 `geographic_alert.received`
| | |
|---|---|
| Trigger | Background job of `createGeographicAlert` creates one `notifications` row per eligible recipient (consent = true, last known location inside the circle) |
| Recipients | `private-user.{userId}` of **each eligible user only** |
| Payload | `data: AreaAlert` plus `notification_id` |
| Privacy | Recipients are not revealed to each other or to the sender; the dispatcher gets only `recipient_count` over REST. Users without `location_consent` are never recipients |
| Related REST | `listMyAreaAlerts`, `listMyNotifications` |
| FR | FR-012, FR-027 |

### 3.7b `alert.created`
| | |
|---|---|
| Trigger | Commit of the `geographic_alerts` row |
| Recipients | `private-operations` |
| Payload | `data: GeographicAlert` and `recipient_count` once known |
| Related REST | `listGeographicAlerts` |

### 3.8 `chat.message.created`
| | |
|---|---|
| Trigger | Commit of `sendMyReportChatMessage` or `sendOperatorChatMessage` |
| Recipients | `private-report-chat.{reportId}`: delivered to the Dispatcher side with `ChatMessageOperations`, to the reporter side with `ChatMessageCitizen` (two projections of one message) |
| Payload (operations) | `{ id, report_id, sender: { role, display_name }, message, sent_at }` |
| Payload (reporter) | `{ id, report_id, sender_role: "citizen" \| "operations_room", is_mine, message, sent_at }` |
| Privacy | Anonymous reporter always `display_name = "Anonymous Reporter"`; no `sender_id`; the dispatcher's personal identity is not sent to the citizen (D-20). Chat messages are not persisted as notifications (the ERD has no chat notification type, D-22b) |
| Related REST | `listReportChatMessages`, `listMyReportChatMessages` |
| FR | FR-025 |

### 3.9 `notification.created`
| | |
|---|---|
| Trigger | A `notifications` row is committed (status update, assignment, closure, geographic alert) |
| Recipients | `private-user.{notification.user_id}` only |
| Payload | `data: Notification` (id, type, report_id, alert_id, title, body, is_read=false, created_at) |
| Privacy | Reporter notifications reach only the reporter, also for anonymous reports (FR-038); bodies contain no identity and no staff names |
| Related REST | `listMyNotifications`, `markNotificationRead` |
| FR | FR-011, FR-038 |

## 4. Event matrix

| Event | operations | field unit | reporter | other users |
|---|:-:|:-:|:-:|:-:|
| `report.created` | x | | | |
| `report.status_changed` | x | x (assigned unit) | x | |
| `assignment.created` | x | x (new unit) | x | |
| `assignment.reassigned` | x | x (old and new) | x | |
| `assignment.status_changed` | x | x (same unit) | | |
| `field_unit.updated` | x | | | |
| `geographic_alert.received` | | | | x (eligible only) |
| `alert.created` | x | | | |
| `chat.message.created` | x | | x | |
| `notification.created` | | | x | x (own only) |

## 5. REST operations that are not events [C]

Event-like requirements that are intentionally **not** modelled as REST endpoints: pushing map updates (FR-019), pushing alerts (FR-027), live chat delivery (FR-025), live notification delivery (FR-011/038). The REST operations only create or read the underlying data.

## 6. Open point: mobile push

SRS section 2.1 names a notification service, but the ERD (DBML confirmed) has no device-token entity, so operating-system push notifications (for a closed app) cannot be addressed to a device. This contract covers in-app notifications plus WebSocket delivery only. Push delivery needs an approved ERD addition (see D-32).
