# Seed data (Approved; aligned to FR-008 and erd_v1.1.dbml)

Still required before coding the seeder: diff this file against `docs/srs.md` (FR-008 table), `docs/erd_v1.1.dbml` (`report_types`, `field_units`, `system_settings`) and, for permissions, D-34 + all `x-required-permissions`.

## Production seeders (idempotent, `updateOrCreate`)
- **Roles/permissions:** 4 roles; permission codes per D-34 (incl. `field_unit.manage`); role→permission map per `openapi.yaml` `x-required-*`.
- **`report_types`** — columns `category`, `name`, `responsible_authority` (unique `(category, name)`). 12 manual types + the SOS type. Arabic strings are exactly as in FR-008:

| category | name | responsible_authority |
|---|---|---|
| الطوارئ المدنية | حريق | الدفاع المدني |
| الطوارئ المدنية | تسرب غاز | الدفاع المدني |
| الطوارئ المدنية | انهيار | الدفاع المدني |
| الطوارئ المدنية | فيضان | الدفاع المدني |
| الحوادث المرورية | حادث مروري | المرور والإسعاف |
| البلاغات الأمنية | سرقة | الشرطة |
| البلاغات الأمنية | نشاط مشبوه | الشرطة |
| البلاغات الأمنية | تحرش | الشرطة |
| البلاغات الأمنية | ابتزاز | الشرطة |
| البلاغات الأمنية | مفقود | الشرطة |
| المخاطر الصحية | حالة صحية طارئة | الإسعاف / الصحة |
| المخاطر الصحية | خطر صحي | الإسعاف / الصحة |
| *(SOS only, hidden from manual selection by seeded name, D-25; cannot be renamed)* | SOS عام | غرفة العمليات / الطوارئ العامة |

  **Open point:** `category` is `NOT NULL` in the DBML and FR-008 defines no category for "SOS عام". Claude Code must ask the owner which `category` value to use before seeding it (it must not invent one silently).
- **`field_units.unit_type`** values: شرطة, دفاع مدني, إسعاف, مرور.
- **`system_settings`** (key/value): `sos_cancel_timeout_seconds = 5`; `location_freshness_minutes = 15`; `alert_max_radius_m = 50000`.
- **Administrative areas** (value list for `reports.administrative_area` / statistics; there is no separate table in the DBML): the 14 Syrian governorates with Arabic + English names — Damascus (دمشق), Rif Dimashq (ريف دمشق), Aleppo (حلب), Homs (حمص), Hama (حماة), Latakia (اللاذقية), Tartus (طرطوس), Idlib (إدلب), Deir ez-Zor (دير الزور), Raqqa (الرقة), Al-Hasakah (الحسكة), Daraa (درعا), As-Suwayda (السويداء), Quneitra (القنيطرة).
- **First admin:** from env (`ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`); the seeder refuses the default password when `APP_ENV=production`.

## AI label mapping (Laravel-side config)
fire→حريق, accident→حادث مروري, medical→حالة صحية طارئة; security, infrastructure, natural_disaster → `null`.

## Dev-only demo seeder (never runs in production)
Sample citizens, a dispatcher, units per type, reports in each of the 7 states, one anonymous manual report, one cancelled+reassigned assignment. SOS demo reports are never anonymous.
