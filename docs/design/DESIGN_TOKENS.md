# Istigaba (استجابة) — Design Tokens

> Version 1.1.0 · Source of truth for `apps/mobile-citizen`, `apps/mobile-field` (Expo + NativeWind), `apps/web-ops`, `apps/web-admin` (Tailwind CSS 4 + shadcn/ui).
> Code source: `packages/config/src/tokens.ts` (§9.2); both apps' CSS is generated from it (§9.3).
> Light values are the exact values used on the four designed apps (Citizen, Field Unit, Operations Room, System Administrator), except the few corrections listed in §3. Dark values are new and were contrast-checked against the same rules.
> Theme modes: `system | light | dark`, default `system`.

---

## Contents

1. [Brand and copy cleanup](#1-brand-and-copy-cleanup)
2. [Rules](#2-rules)
3. [Corrections to the light screens](#3-corrections-to-the-light-screens)
4. [Colour primitives](#4-colour-primitives)
5. [Semantic colour tokens](#5-semantic-colour-tokens)
6. [Typography](#6-typography)
7. [Spacing, sizing, radii, shadows, motion](#7-spacing-sizing-radii-shadows-motion)
8. [Web: Tailwind CSS 4 + shadcn/ui](#8-web-tailwind-css-4--shadcnui)
9. [Shared tokens and mobile (NativeWind)](#9-shared-tokens-and-mobile-nativewind)
10. [Maps: Leaflet / MapLibre](#10-maps-leaflet--maplibre)
11. [Charts: Recharts](#11-charts-recharts)
12. [Contrast audit](#12-contrast-audit)

---

## 1. Brand and copy cleanup

| Item | Old | New |
|---|---|---|
| English product name | Estijaba | **Istigaba** |
| Arabic product name | استجابة | استجابة (unchanged) |
| Demo email domain | `@estijaba.example` | `@istigaba.example` |
| SOS report-type authority (EN, admin System Settings) | `[AUTHORITY FOR SOS]` | `Operations Room / General Emergency` |
| SOS report-type authority (AR, admin System Settings) | `[الجهة المرتبطة بنداء SOS]` | `غرفة العمليات / الطوارئ العامة` |

Demo accounts after the rename:

| Name (AR / EN) | Role | Email |
|---|---|---|
| نادر قاسم / Nader Qasem | System Administrator | `nader.qasem@istigaba.example` |
| ليلى حداد / Layla Haddad | Dispatcher | `layla.haddad@istigaba.example` |
| سامر ديب / Samer Deeb | Dispatcher | `samer.deeb@istigaba.example` |
| خالد العلي / Khaled Al-Ali | Field Unit Representative | `khaled.ali@istigaba.example` |
| ريم الحسن / Reem Al-Hasan | Field Unit Representative | `reem.hasan@istigaba.example` |
| باسل عمران / Basel Omran | Field Unit Representative | `basel.omran@istigaba.example` |
| فادي نصر / Fadi Nasr | Field Unit Representative (deactivated) | `fadi.nasr@istigaba.example` |
| يزن معروف / Yazan Maarouf | Field Unit Representative (create-user example) | `yazan.maarouf@istigaba.example` |
| سارة الأحمد / Sara Ahmad | Citizen | `sara@example.com` (citizens keep public domains) |

> Outside this file: `openapi.yaml` still says `Estijaba` in `info.title` and `api.estijaba.example` in `servers[0].variables.host.default`.

---

## 2. Rules

1. **Never colour alone.** Severity and availability always pair colour with a **text label** and an **icon** (pills), or with **shape, size and an `aria-label`** (map markers). Charts carry value labels.
2. **WCAG 2.2 AA in both modes.** Text ≥ 4.5:1. Large text, icons, input borders and chart/map marks ≥ 3:1. Disabled controls are exempt. Every pair in §12 was computed.
3. **High-severity orange and busy-unit orange are the same colour by spec.** Shape keeps them apart: reports are circles, units are rounded squares with a vehicle icon.
4. **Same token names everywhere.** CSS custom property `--sev-critical-bg` = TS `color.light['sev-critical-bg']` = Tailwind class `bg-sev-critical-bg`, on web and mobile.
5. **Dark mode is not inverted light mode.**
   - **Shape:** navy-tinted surfaces, lightness steps instead of shadows for elevation, and tinted pills with a 1 px border instead of saturated solid fills.
   - **Why:** this keeps glare low on long operations-room shifts and on night field use.
   - **Fixed in both modes:** the SOS screen and the identity-reveal header stay saturated red.
6. **Numbers, IDs, coordinates, times and emails** render in Inter with `tabular-nums`, wrapped in `dir="ltr"` with bidi isolation, in both languages.

---

## 3. Corrections to the light screens

These are the only places where the shipped light values change. Everything else is identical.

| Where | Shipped | Problem | Token value now |
|---|---|---|---|
| Medium severity chart bar (Ops Statistics) | `#D9A106` | 2.32:1 on card (needs 3:1) | `--sev-medium-solid` `#A97A00` (3.84:1) |
| Medium severity map marker | `#FCD34D` fill | 1.13:1 against the map | `--marker-medium-fill` `#A97A00` (3.02:1), white icon (3.84:1) |
| Low severity map marker | `#D8E2EE` fill | 1.03:1 against the map, nearly invisible | `--marker-low-fill` `#3E6596` (4.71:1), white icon (5.99:1) |
| Low severity chart bar | `#6E8FB8` | Passed (3.34:1); changed only to match the marker | `--sev-low-solid` `#3E6596` (5.99:1) |
| Heat-map cell labels | Alpha ramp; label turned white at α ≥ 0.5 | White labels at α 0.50–0.62 measured 3.20–4.09:1 | Five fixed steps with a checked label colour (§5.13) |
| Severity pills | Text label only | Rule 1 | Add the severity icon (§5.9) |
| Input placeholder | Not specified | — | `--text-placeholder` `#5D6C80` (5.35:1) |

Pill colours (`#9B1C1C`, `#C2410C`, `#FCD34D`, `#D8E2EE` with their text colours) are **unchanged**. Only the **solid** graphics tokens (markers, bars) changed.

---

## 4. Colour primitives

Raw palette. Components never use these directly; they use the semantic tokens in §5.

| Group | Values |
|---|---|
| Ink (light text) | `#0E1B2C` · `#3D4D63` · `#566579` · `#5D6C80` · `#6B7A8D` · `#8493A6` · `#AEBBCB` · `#C3CEDA` |
| Mist (light surfaces) | `#FFFFFF` · `#F3F5F8` · `#EEF1F5` · `#EEF4FB` · `#E3E8EE` · `#E1EAF6` · `#D5DDE6` · `#D8E2EE` |
| Navy (brand) | `#0F2A47` · `#183A60` · `#0A1E34` · `#1F3A5C` · `#C9D8EC` · `#B9CCE6` · `#D5DFEC` · `#E4EBF4` |
| Near-black (admin) | `#0B1420` · `#04070C` · `#1F2937` |
| Blue (link, focus) | `#0B57B0` · `#083F80` · `#3E6596` · `#7FA6D6` · `#8AB4F8` · `#A3C4FA` · `#7AA6EE` |
| Red (danger, critical, SOS) | `#B3261E` · `#9E211A` · `#9B1C1C` · `#8E1B1B` · `#7A1515` · `#6E1414` · `#5A0F0F` · `#C9463D` · `#B83A31` · `#A3322A` · `#F0625D` · `#FF9C94` · `#FFB4AB` · `#FFD2CE` · `#FFD7D4` · `#FBE3E1` · `#FFF7F6` |
| Orange (high, busy) | `#C2410C` · `#F08A4B` · `#5A2508` · `#FFD9BF` |
| Amber (medium, warning) | `#FCD34D` · `#E9B949` · `#B7791F` · `#A97A00` · `#8A4B00` · `#F5B35C` · `#3F2A06` · `#4D3A06` · `#3A2C08` · `#FDE68A` · `#FDE7A6` · `#FFF4D6` |
| Green (available, success) | `#17703F` · `#145C34` · `#34C77B` · `#6EE7A8` · `#A6F0C6` · `#CDEBD9` · `#DFF2E7` · `#0F3D27` · `#123824` · `#10301F` |
| Slate (offline) | `#5B6878` · `#7D8CA1` · `#CBD4E0` · `#273244` |
| Night (dark surfaces) | `#0B1220` · `#0C1D31` · `#131C2B` · `#1A2537` · `#1C2738` · `#1C3354` · `#142742` · `#253247` · `#2C3A4F` · `#3A4A62` · `#5B6C84` · `#6E7F97` · `#8796AB` · `#97A5B8` · `#B9C5D4` · `#EEF2F7` · `#E5E9F0` |
| Purple (chart only) | `#7E3AA8` · `#C9A0F0` |

---

## 5. Semantic colour tokens

Names are CSS custom property names. Drop the leading `--` for the TS key in `packages/config` (§9.2); Tailwind utilities use the same name (`bg-surface-raised`, `text-danger-text`).

### 5.1 Surfaces and borders

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#F3F5F8` | `#0B1220` | App / page ground |
| `--card` | `#FFFFFF` | `#131C2B` | Cards, tables, mobile tab bar, web top bar |
| `--surface-raised` | `#FFFFFF` | `#1A2537` | Dialogs, popovers, tooltips, map popups, unread notification rows |
| `--muted` | `#EEF1F5` | `#1C2738` | Table header, icon tiles, bar-chart tracks, segmented-control track |
| `--surface-tint` | `#E1EAF6` | `#1C3354` | Accent / selected background, icon tile on brand rows |
| `--surface-selected` | `#EEF4FB` | `#1C3354` | Selected table row (pair with `--selected-border` inset 2 px) |
| `--border` | `#D5DDE6` | `#2C3A4F` | Card and divider lines |
| `--border-subtle` | `#C3CEDA` | `#3A4A62` | Timeline connectors, code-pill borders |
| `--input` | `#8493A6` | `#6E7F97` | Input, select, checkbox, secondary-button borders (≥ 3:1) |

### 5.2 Text

| Token | Light | Dark | Use |
|---|---|---|---|
| `--foreground` | `#0E1B2C` | `#EEF2F7` | Primary text, headings |
| `--text-secondary` | `#3D4D63` | `#B9C5D4` | Form labels, body copy in cards, secondary metadata |
| `--muted-foreground` (`text-tertiary`) | `#566579` | `#97A5B8` | Captions, timestamps, helper text, axis labels |
| `--text-placeholder` | `#5D6C80` | `#8796AB` | Input placeholder |
| `--text-disabled` | `#8493A6` | `#5B6C84` | Disabled labels (contrast-exempt) |
| `--link` | `#0B57B0` | `#8AB4F8` | Links, unread dot, "Mark all read" |
| `--link-hover` | `#083F80` | `#A3C4FA` | Link hover |
| `--text-on-chrome` | `#FFFFFF` | `#FFFFFF` | Text on navy / near-black chrome |
| `--text-on-chrome-muted` | `#D5DFEC` | `#B9C5D4` | Subtitles on chrome (role, unit type) |
| `--danger-text` | `#B3261E` | `#FF9C94` | Inline errors, "Discard draft", destructive outline buttons |
| `--warning-text` | `#8A4B00` | `#F5B35C` | Inline warning text (for example "No representative") |

### 5.3 Brand and interactive states

| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `#0F2A47` | `#8AB4F8` | Primary buttons, active tab, checked controls, segmented active |
| `--primary-foreground` | `#FFFFFF` | `#0B1A2E` | Text and icons on primary |
| `--primary-hover` | `#183A60` | `#A3C4FA` | Primary hover |
| `--primary-pressed` | `#0A1E34` | `#7AA6EE` | Primary pressed |
| `--secondary` | `#EEF1F5` | `#1C2738` | Filled subtle button (shadcn `secondary`) |
| `--secondary-foreground` | `#0F2A47` | `#EEF2F7` | Text on secondary |
| `--accent` | `#E1EAF6` | `#1C3354` | shadcn accent (menu hover, selected chip background) |
| `--accent-foreground` | `#0F2A47` | `#D4E3F6` | Text on accent |
| `--destructive` | `#B3261E` | `#B83A31` | Destructive button background |
| `--destructive-foreground` | `#FFFFFF` | `#FFFFFF` | Text on destructive |
| `--destructive-hover` | `#9E211A` | `#A3322A` | Destructive hover |
| `--ring` | `#0B57B0` | `#8AB4F8` | Focus ring, 2 px solid, 2 px offset |
| `--state-hover` | `rgba(15,42,71,0.06)` | `rgba(238,242,247,0.08)` | Ghost / list-row hover overlay |
| `--state-pressed` | `rgba(15,42,71,0.12)` | `rgba(238,242,247,0.14)` | Pressed overlay |
| `--selected-border` | `#0F2A47` | `#8AB4F8` | 2 px border on the selected card, radio tile or queue item |
| `--disabled-bg` | `#EEF1F5` | `#1C2738` | Disabled fills (for example an offline unit row in the assign dialog) |
| `--toggle-on` | `#17703F` | `#34C77B` | Switch track on; thumb `#FFFFFF` |
| `--toggle-off` | `#6B7A8D` | `#7D8CA1` | Switch track off; thumb `#FFFFFF` |

Secondary (outline) button: background `--card`, text `--primary` in light and `--foreground` in dark, border `--input`. On mobile the light border is 1.5 px `--primary`.

### 5.4 App chrome: sidebars, headers, tab bar

| Token | Light | Dark | Use |
|---|---|---|---|
| `--sidebar` (Ops) | `#0F2A47` | `#0C1D31` | Operations Room sidebar, Ops and Admin login brand panel |
| `--sidebar` (Admin) | **`#0B1420`** | **`#04070C`** | System Administrator sidebar and login panel (near-black) |
| `--sidebar-foreground` | `#E4EBF4` | `#E4EBF4` | Inactive nav text |
| `--sidebar-muted-foreground` | `#D5DFEC` | `#B9C5D4` | Sidebar subtitle, user role line |
| `--sidebar-accent` | `#FFFFFF` | `#E4EBF4` | **Active** nav item background |
| `--sidebar-accent-foreground` | `#0F2A47` (Ops) / `#0B1420` (Admin) | `#0C1D31` (Ops) / `#04070C` (Admin) | Active nav item text |
| `--sidebar-hover` | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.08)` | Nav hover |
| `--sidebar-badge` | `rgba(255,255,255,0.16)` | `rgba(255,255,255,0.14)` | Count chip on inactive item |
| `--sidebar-border` | `rgba(255,255,255,0.22)` | `rgba(255,255,255,0.12)` | Divider above the user block; dark mode also draws it on the inline-end edge |
| `--sidebar-restricted` | `#FFB4AB` | `#FFB4AB` | "Restricted area" heading and lock icon (Admin only) |
| `--sidebar-restricted-active` | `#9B1C1C` | `#9B1C1C` | Lock icon on the active "Identity disclosure" item |
| `--topbar` | `#FFFFFF` | `#131C2B` | Web top bar (60 px, bottom border `--border`) |
| `--field-header` | `#0F2A47` | `#0C1D31` | Field app app-bar (dark adds a 1 px `--border` bottom edge) |
| `--field-header-foreground` | `#FFFFFF` | `#FFFFFF` | |
| `--field-header-muted` | `#D5DFEC` | `#B9C5D4` | |
| `--tabbar` | `#FFFFFF` | `#131C2B` | Mobile bottom tab bar (top border `--border`) |
| `--tabbar-active` | `#0F2A47` | `#8AB4F8` | Active icon, label and 3 px indicator |
| `--tabbar-inactive` | `#566579` | `#97A5B8` | |

> **Admin vs Ops distinction.** Ops chrome is navy-tinted. Admin chrome is neutral near-black with red "restricted" accents. Both apps keep this in dark mode: `#0C1D31` (blue-tinted) against `#04070C` (neutral), plus the admin-only restricted group.

### 5.5 Report and mission status chips

26 px pill, 7 px dot in the foreground colour, 12/700 label.

| Token group | Applies to | Light bg / fg | Dark bg / fg |
|---|---|---|---|
| `--status-progress-*` | `received`, `under_review`, `assigned`, `en_route`, `on_site`; mission `assigned`, `en_route`, `on_site` | `#E1EAF6` / `#0F2A47` | `#1C3354` / `#D4E3F6` |
| `--status-done-*` | `mission_completed`; user "Active" | `#DFF2E7` / `#145C34` | `#123824` / `#A6F0C6` |
| `--status-closed-*` | `closed`; mission `cancelled`; user "Deactivated" | `#E3E8EE` / `#3D4D63` | `#273244` / `#CBD4E0` |

Timeline (citizen tracking, field stepper, ops timeline):

| Token | Light | Dark |
|---|---|---|
| `--timeline-done` | `#0F2A47` | `#8AB4F8` |
| `--timeline-current-ring` | `#C9D8EC` | `rgba(138,180,248,0.30)` |
| `--timeline-pending` | `#8493A6` | `#6E7F97` |
| `--timeline-line` | `#C3CEDA` | `#3A4A62` |

### 5.6 Anonymous reporter

| Token | Light | Dark | Use |
|---|---|---|---|
| `--anon-bg` | `#1F2937` | `#E5E9F0` | "مبلّغ مجهول / Anonymous Reporter" and "هوية مخفية / Identity hidden" pill |
| `--anon-fg` | `#FFFFFF` | `#0E1B2C` | Pill text and `eye-off` icon |
| `--anon-banner-bg` | `#1F2937` | `#273244` | Full-width banner on the citizen chat for an anonymous report |
| `--anon-banner-fg` | `#FFFFFF` | `#EEF2F7` | |

The pill inverts in dark mode so it stays the highest-contrast element on a report. The banner does not invert, so a full-width bright bar never appears at night. The anonymous pill never sits next to phone or email rows, labels or placeholders.

### 5.7 Role pills (Admin)

| Role | Light bg / fg / border | Dark bg / fg / border |
|---|---|---|
| System Administrator | `#0B1420` / `#FFFFFF` / `#0B1420` | `#E5E9F0` / `#04070C` / `#E5E9F0` |
| Dispatcher | `#E1EAF6` / `#0F2A47` / `#B9CCE6` | `#1C3354` / `#D4E3F6` / `#3A5F8F` |
| Field Unit Representative | `#EEF1F5` / `#0E1B2C` / `#AEBBCB` | `#1C2738` / `#EEF2F7` / `#3A4A62` |
| Citizen | `#FFFFFF` / `#3D4D63` / `#AEBBCB` | `transparent` / `#B9C5D4` / `#3A4A62` |

### 5.8 Callouts (info, warning / audit, danger, success)

10 px radius, 1 px border, 18 px leading icon, 13/400 text.

| Token group | Light bg / border / fg | Dark bg / border / fg | Icon (Lucide) | Use |
|---|---|---|---|---|
| `--callout-info-*` | `#E1EAF6` / `#B9CCE6` / `#0F2A47` | `#142742` / `#3A5F8F` / `#D4E3F6` | `info` | Assignment effects, AI draft notice, privacy notes |
| `--callout-warning-*` | `#FFF4D6` / `#B7791F` / `#3F2A06` | `#3A2C08` / `#B7791F` / `#FDE7A6` | `triangle-alert` | Location failed, AI unavailable, close-report effects, deactivate warning, simulation banner |
| `--callout-danger-*` | `#FBE3E1` / `#C9463D` / `#6E1414` | `#3D1213` / `#E0564C` / `#FFD2CE` | `lock` / `octagon-alert` | **Audit warning** in the reveal modal, audit-log identity note, `identity.reveal` permission group |
| `--callout-success-*` | `#DFF2E7` / `#DFF2E7` / `#145C34` | `#10301F` / `#1E5A3A` / `#A6F0C6` | `circle-check` | Location sharing on, alert-sent count |

Live indicator (web top bar):

| Token | Light | Dark |
|---|---|---|
| `--live-dot` | `#17703F` | `#34C77B` |
| `--live-halo` | `#CDEBD9` (3 px ring) | `rgba(52,199,123,0.25)` |
| `--live-fg` | `#145C34` | `#6EE7A8` |

### 5.9 Severity

Each severity has a **pill** (bg, fg, border), a **solid** colour for charts and legends, a **marker** spec (§10), a **label** and an **icon**.

| Level | Label AR / EN | Icon (Lucide) | Light pill bg / fg | Dark pill bg / fg / border | Solid light | Solid dark |
|---|---|---|---|---|---|---|
| `critical` | حرجة / Critical | `octagon-alert` | `#9B1C1C` / `#FFFFFF` | `#5C1517` / `#FFD7D4` / `#F0625D` | `#9B1C1C` | `#F0625D` |
| `high` | عالية / High | `triangle-alert` | `#C2410C` / `#FFFFFF` | `#5A2508` / `#FFD9BF` / `#F08A4B` | `#C2410C` | `#F08A4B` |
| `medium` | متوسطة / Medium | `circle-alert` | `#FCD34D` / `#3F2A06` | `#4D3A06` / `#FDE68A` / `#E9B949` | `#A97A00` | `#E9B949` |
| `low` | منخفضة / Low | `info` | `#D8E2EE` / `#1F3A5C` | `#1E3350` / `#D4E3F6` / `#7FA6D6` | `#3E6596` | `#7FA6D6` |

Token names: `--sev-{level}-bg`, `--sev-{level}-fg`, `--sev-{level}-border` (light: `transparent`), `--sev-{level}-solid`.

- **Pill:** 26 px high, 10 px inline padding, 13 px radius, icon 14 px + 6 px gap, label 12/700.
- **Label prefix:** "الخطورة: / Severity:" on mobile cards; omitted in dense web tables, where the column header carries it.
- **Redundant encoding without colour:**
  - Icon shape differs per level (octagon, triangle, circle, info).
  - Light pills differ in lightness: critical (darkest), low, high, medium (lightest).
  - Map markers also differ in size: critical 34 px with a halo, others 30 px.
- **Map interaction rule:** clicking a marker always opens a popup that states severity in text.

### 5.10 Unit availability

| Level | Label AR / EN | Icon (Lucide) | Light pill bg / fg | Dark pill bg / fg / border | Solid light | Solid dark |
|---|---|---|---|---|---|---|
| `available` | متاحة / Available | `circle-check` | `#17703F` / `#FFFFFF` | `#0F3D27` / `#A6F0C6` / `#34C77B` | `#17703F` | `#34C77B` |
| `busy` | مشغولة / Busy | `clock` | `#C2410C` / `#FFFFFF` | `#5A2508` / `#FFD9BF` / `#F08A4B` | `#C2410C` | `#F08A4B` |
| `offline` | غير متصلة / Offline | `circle-off` | `#5B6878` / `#FFFFFF` | `#273244` / `#CBD4E0` / `#7D8CA1` | `#5B6878` | `#7D8CA1` |

Token names: `--avail-{level}-bg`, `-fg`, `-border`, `-solid`.

- **Shipped pills:** a white 7 px dot. Keep the dot on the big field-app selector and use the icon in pills.
- **Distinction from critical red:** available green (`#17703F`) and critical red (`#9B1C1C`) have similar lightness in light mode. They never share a shape (squares vs circles), and both always carry text or an `aria-label`.

### 5.11 SOS, recording and sensitive (identity reveal)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--sos-surface` | `#9B1C1C` | `#7A1515` | SOS countdown screen, home "Emergency now" card |
| `--sos-foreground` | `#FFFFFF` | `#FFFFFF` | |
| `--sos-panel` | `rgba(0,0,0,0.25)` | `rgba(0,0,0,0.25)` | Location panel on the SOS screen |
| `--sos-ring-track` | `rgba(255,255,255,0.30)` | `rgba(255,255,255,0.30)` | Countdown ring track (progress arc `#FFFFFF`) |
| `--sos-button-bg` | `#FFFFFF` | `#FFFFFF` | 112 px SOS button / cancel button |
| `--sos-button-fg` | `#9B1C1C` | `#7A1515` | |
| `--sos-button-ring` | `rgba(255,255,255,0.22)` | `rgba(255,255,255,0.18)` | 8 px halo |
| `--recording-fg` | `#9B1C1C` | `#FF9C94` | "Recording" label and dot |
| `--record-button` | `#9B1C1C` | `#D9534D` | 96 px stop button (white icon) |
| `--record-button-ring` | `rgba(155,28,28,0.14)` | `rgba(240,98,93,0.20)` | 10 px halo |
| `--waveform-active` / `--waveform-idle` | `#0F2A47` / `#AEBBCB` | `#8AB4F8` / `#3A4A62` | Voice waveform bars |
| `--sensitive-header` | `#9B1C1C` | `#8E1B1B` | Reveal modal header band, "Reporter identity · Confidential" header |
| `--sensitive-header-fg` | `#FFFFFF` | `#FFFFFF` | |
| `--sensitive-border` | `#9B1C1C` | `#F0625D` | 2 px modal border, 2 px justification textarea border |
| `--sensitive-strip` | `#6E1414` | `#4A1012` | "Restricted area" strip at the top of the disclosure pages |
| `--sensitive-row` | `#FFF7F6` | `#2A1415` | Selected `identity.reveal` audit row (inset 2 px `--sensitive-border`) |
| `--scrim-sensitive` | `rgba(11,20,32,0.82)` | `rgba(0,0,0,0.85)` | Reveal modal backdrop |

### 5.12 Code and technical text (Admin)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--code-bg` / `--code-fg` / `--code-border` | `#EEF1F5` / `#0E1B2C` / `#C3CEDA` | `#1C2738` / `#EEF2F7` / `#3A4A62` | Permission codes, audit action pills, setting keys |
| `--code-danger-bg` / `-fg` / `-border` | `#FBE3E1` / `#6E1414` / `#C9463D` | `#3D1213` / `#FFD2CE` / `#E0564C` | `identity.reveal` code pill |
| `--codeblock-bg` / `--codeblock-fg` | `#0B1420` / `#E4EBF4` | `#04070C` / `#E4EBF4` (+ 1 px `--border`) | JSON payloads in the simulation log |

### 5.13 Scrims and map / chart surfaces

| Token | Light | Dark |
|---|---|---|
| `--scrim` (Ops dialogs) | `rgba(14,27,44,0.60)` | `rgba(0,0,0,0.70)` |
| `--scrim-admin` (Admin dialogs) | `rgba(11,20,32,0.62)` | `rgba(0,0,0,0.72)` |

Map, marker, heat-map and chart tokens are in §10 and §11.

---

## 6. Typography

### 6.1 Families

| Token | Value | Use |
|---|---|---|
| `--font-arabic` | `'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif` | All Arabic UI (`lang="ar"`) |
| `--font-latin` | `Inter, system-ui, -apple-system, 'Segoe UI', sans-serif` | All English UI; numbers, IDs, times, coordinates and emails in both languages; the "SOS" label |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Permission codes, UUIDs, JSON |

Weights loaded: 400, 500, 600, 700, for both families.

- **Web loading:** self-host with `@fontsource/ibm-plex-sans-arabic` and `@fontsource-variable/inter`, or use the Google Fonts `css2` link.
- **Mobile loading:** use `@expo-google-fonts/ibm-plex-sans-arabic` and `@expo-google-fonts/inter`.

### 6.2 Line height

| Context | Arabic | English |
|---|---|---|
| Body, form text, chat | **1.6** | **1.5** |
| Titles and headings | 1.35 | 1.35 |
| Display numbers (SOS countdown, timer) | 1.0–1.1 | 1.0–1.1 |
| Pills, chips, single-line buttons | 1.0 (fixed height) | 1.0 |

### 6.3 Type scale

| Token | Size / weight | Platform | Use |
|---|---|---|---|
| `display-sos` | 104 / 700 (Inter, tabular) | mobile | SOS countdown digit |
| `display-timer` | 64 / 700 (Inter, tabular) | mobile | Voice recording timer |
| `display-hero` | 40 / 700 | web | Login hero ("Operations Room", "System Administration") |
| `brand-wordmark` | 30 / 700 | mobile | "استجابة / Istigaba" on login |
| `kpi` | 30 / 700 (Inter, tabular) | web | Statistics KPI numbers |
| `sos-label` | 32 / 700 (Inter, letter-spacing 1 px) | mobile | "SOS" on the home button |
| `headline-lg` | 26 / 700 | web | Login form heading |
| `headline` | 22 / 700 | mobile | Screen headlines (login, SOS sent) |
| `headline-sm` | 24 / 700 | both | SOS countdown heading, unit stat numbers |
| `title-lg` | 20 / 700 | both | Mission title (field), report detail title (ops) |
| `title-md` | 18 / 700 | both | App bar / top bar title, dialog title |
| `title-sm` | 16–17 / 700 | both | Card titles, list item titles |
| `body-lg` | 15 / 400 | mobile | Mobile body, inputs, chat bubbles |
| `body` | 14 / 400 | both | Web body and table cells, mobile descriptions |
| `label` | 13 / 600 | mobile | Form labels (mobile), small buttons, secondary lines |
| `label-web` | 12 / 700 | web | Form labels (web), table headers |
| `caption` | 12 / 500 | both | Timestamps, helper text, chip labels (12/700) |
| `micro` | 11 / 600–700 | both | Attachment thumbnails, notification count badge, "Restricted area" kicker |
| `button-mobile` | 16 / 600 (CTA 17 / 700) | mobile | Primary / secondary buttons |
| `button-web` | 14 / 700 | web | All web buttons |

Minimum: 12 px for any readable text, except the 11 px micro labels, which only appear next to an icon.

---

## 7. Spacing, sizing, radii, shadows, motion

### 7.1 Spacing scale (px)

`2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 48`

Tailwind's default 4 px scale covers these (`0.5`=2, `1`=4, `1.5`=6, `2`=8, `2.5`=10, `3`=12, `3.5`=14, `4`=16, `5`=20, `6`=24, `7`=28, `8`=32, `12`=48).

| Layout | Value |
|---|---|
| Mobile screen padding | 16 (forms and login 24) |
| Mobile card padding | 14 |
| Mobile list / stack gap | 10–12 |
| Web page padding | 16 block × 20 inline |
| Web card padding | 16 (filter bars 12 × 16) |
| Web column gap | 16 |
| Web sidebar | 228 wide, padding 16 × 12, item gap 4 |
| Dialog | header 16 × 20, body 16 × 20 with 14 gap, footer 14 × 20 |

### 7.2 Component sizing (px)

| Element | Mobile | Web |
|---|---|---|
| Minimum touch / click target | 44 × 44 | 40 high (36 for compact table actions) |
| Button | 52 (primary CTA 60, SOS cancel 64, compact 44–48) | 40 (compact 36, large 44) |
| Input / select | 48 | 40 |
| Textarea | 84–92 (manual / review), 232 (field action) | 84–112 |
| App bar / top bar | 56 | 60 |
| Bottom tab bar | 64 | — |
| Status / severity pill | 26 | 26 |
| Filter chip | 44 | 32 |
| Icons | 14 · 16 · 18 · 20 · 22 (stroke 2) | 14 · 16 · 18 · 20 |
| Avatar | 36 · 40 · 52 | 36 · 40 · 48 |
| SOS button / record button | 112 / 96 | — |
| Report marker / unit marker | — | 30 (critical 34) / 28 |
| Design frame | 390 × 844 | 1440 × 900, fluid |

### 7.3 Radii

| Token | px | Use |
|---|---|---|
| `--radius-xs` | 4 | Bar-chart bars, progress |
| `--radius-sm` | 6 | Code pills, small tags |
| `--radius-unit` | 7 | Unit map marker, segmented inner item |
| `--radius-md` | 9 | Web buttons, inputs, selects, thumbnails |
| `--radius-input-m` | 10 | Mobile inputs, callouts, icon tiles |
| `--radius-lg` | 12 | Mobile buttons, web cards, segmented track |
| `--radius-xl` | 14 | Mobile cards, dialogs |
| `--radius-2xl` | 16 | SOS hero card |
| `--radius-full` | 9999 | Pills, chips, avatars, round buttons |

shadcn `--radius` = `0.75rem` (12 px). The explicit scale above replaces the computed `sm/md/lg/xl` (§8).

### 7.4 Shadows and rings

| Token | Light | Dark |
|---|---|---|
| `--shadow-marker` | `0 2px 6px rgba(14,27,44,0.35)` | `0 2px 6px rgba(0,0,0,0.60)` |
| `--shadow-popover` | `0 8px 24px rgba(14,27,44,0.22)` | `0 8px 24px rgba(0,0,0,0.50)` |
| `--shadow-dialog` | `0 24px 64px rgba(14,27,44,0.40)` | `0 24px 64px rgba(0,0,0,0.60)` |
| `--shadow-dialog-admin` | `0 24px 64px rgba(11,20,32,0.45)` | `0 24px 64px rgba(0,0,0,0.65)` |
| `--shadow-sensitive` | `0 24px 72px rgba(0,0,0,0.60)` | `0 24px 72px rgba(0,0,0,0.70)` |
| Focus ring | 2 px `--ring`, offset 2 px | same |

Cards use **no shadow**: a 1 px `--border` in light, and the surface step in dark.

### 7.5 Motion

The designs are static. For implementation:

- **Colour transitions:** 150 ms `ease-out` on hover and press.
- **Dialogs:** 200 ms fade and 8 px rise.
- **Live dot:** 2 s pulse.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables the pulse and the dialog motion.
- **SOS countdown:** the arc animates linearly per second. Under reduced motion it steps once per second.

---

## 8. Web: Tailwind CSS 4 + shadcn/ui

The `:root`, `.dark`, `[data-app="admin"]` and `@theme inline` blocks below are what `packages/config` generates into `css/theme.web.css` (§9.3). Each web app's `globals.css` keeps the `@import "tailwindcss"`, `tw-animate-css`, `@custom-variant`, `@layer` and reduced-motion parts, and imports `@istigaba/config/css/theme.web.css` in place of the hand-written token blocks. Set `<html lang="ar|en" dir="rtl|ltr" data-app="ops|admin">`. Dark mode is the `.dark` class on `<html>`.

```css
/* tokens.css — Istigaba design tokens for Tailwind CSS 4 + shadcn/ui */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ------------------------------------------------------------------ LIGHT */
:root {
  color-scheme: light;
  --radius: 0.75rem;

  /* fonts */
  --font-arabic: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif;
  --font-latin: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-active: var(--font-latin);
  --leading-body: 1.5;

  /* shadcn core */
  --background: #F3F5F8;
  --foreground: #0E1B2C;
  --card: #FFFFFF;
  --card-foreground: #0E1B2C;
  --popover: #FFFFFF;
  --popover-foreground: #0E1B2C;
  --primary: #0F2A47;
  --primary-foreground: #FFFFFF;
  --secondary: #EEF1F5;
  --secondary-foreground: #0F2A47;
  --muted: #EEF1F5;
  --muted-foreground: #566579;
  --accent: #E1EAF6;
  --accent-foreground: #0F2A47;
  --destructive: #B3261E;
  --destructive-foreground: #FFFFFF;
  --border: #D5DDE6;
  --input: #8493A6;
  --ring: #0B57B0;
  --chart-1: #0F2A47;
  --chart-2: #0B57B0;
  --chart-3: #C2410C;
  --chart-4: #17703F;
  --chart-5: #7E3AA8;

  /* shadcn sidebar — Operations Room (navy) */
  --sidebar: #0F2A47;
  --sidebar-foreground: #E4EBF4;
  --sidebar-primary: #FFFFFF;
  --sidebar-primary-foreground: #0F2A47;
  --sidebar-accent: #FFFFFF;
  --sidebar-accent-foreground: #0F2A47;
  --sidebar-border: rgba(255, 255, 255, 0.22);
  --sidebar-ring: #FFFFFF;
  --sidebar-hover: rgba(255, 255, 255, 0.10);
  --sidebar-badge: rgba(255, 255, 255, 0.16);
  --sidebar-muted-foreground: #D5DFEC;
  --sidebar-restricted: #FFB4AB;
  --sidebar-restricted-active: #9B1C1C;

  /* surfaces & text */
  --surface-raised: #FFFFFF;
  --surface-tint: #E1EAF6;
  --surface-selected: #EEF4FB;
  --border-subtle: #C3CEDA;
  --text-secondary: #3D4D63;
  --text-placeholder: #5D6C80;
  --text-disabled: #8493A6;
  --text-on-chrome: #FFFFFF;
  --text-on-chrome-muted: #D5DFEC;
  --link: #0B57B0;
  --link-hover: #083F80;
  --danger-text: #B3261E;
  --warning-text: #8A4B00;
  --topbar: #FFFFFF;

  /* interactive states */
  --primary-hover: #183A60;
  --primary-pressed: #0A1E34;
  --destructive-hover: #9E211A;
  --state-hover: rgba(15, 42, 71, 0.06);
  --state-pressed: rgba(15, 42, 71, 0.12);
  --selected-border: #0F2A47;
  --disabled-bg: #EEF1F5;
  --toggle-on: #17703F;
  --toggle-off: #6B7A8D;

  /* status chips */
  --status-progress-bg: #E1EAF6;  --status-progress-fg: #0F2A47;
  --status-done-bg: #DFF2E7;      --status-done-fg: #145C34;
  --status-closed-bg: #E3E8EE;    --status-closed-fg: #3D4D63;
  --timeline-done: #0F2A47;
  --timeline-current-ring: #C9D8EC;
  --timeline-pending: #8493A6;
  --timeline-line: #C3CEDA;

  /* anonymous reporter */
  --anon-bg: #1F2937;         --anon-fg: #FFFFFF;
  --anon-banner-bg: #1F2937;  --anon-banner-fg: #FFFFFF;

  /* role pills */
  --role-admin-bg: #0B1420;      --role-admin-fg: #FFFFFF;  --role-admin-border: #0B1420;
  --role-dispatcher-bg: #E1EAF6; --role-dispatcher-fg: #0F2A47; --role-dispatcher-border: #B9CCE6;
  --role-field-bg: #EEF1F5;      --role-field-fg: #0E1B2C;  --role-field-border: #AEBBCB;
  --role-citizen-bg: #FFFFFF;    --role-citizen-fg: #3D4D63; --role-citizen-border: #AEBBCB;

  /* callouts */
  --callout-info-bg: #E1EAF6;    --callout-info-border: #B9CCE6;    --callout-info-fg: #0F2A47;
  --callout-warning-bg: #FFF4D6; --callout-warning-border: #B7791F; --callout-warning-fg: #3F2A06;
  --callout-danger-bg: #FBE3E1;  --callout-danger-border: #C9463D;  --callout-danger-fg: #6E1414;
  --callout-success-bg: #DFF2E7; --callout-success-border: #DFF2E7; --callout-success-fg: #145C34;
  --live-dot: #17703F; --live-halo: #CDEBD9; --live-fg: #145C34;

  /* severity */
  --sev-critical-bg: #9B1C1C; --sev-critical-fg: #FFFFFF; --sev-critical-border: transparent; --sev-critical-solid: #9B1C1C;
  --sev-high-bg: #C2410C;     --sev-high-fg: #FFFFFF;     --sev-high-border: transparent;     --sev-high-solid: #C2410C;
  --sev-medium-bg: #FCD34D;   --sev-medium-fg: #3F2A06;   --sev-medium-border: transparent;   --sev-medium-solid: #A97A00;
  --sev-low-bg: #D8E2EE;      --sev-low-fg: #1F3A5C;      --sev-low-border: transparent;      --sev-low-solid: #3E6596;

  /* unit availability */
  --avail-available-bg: #17703F; --avail-available-fg: #FFFFFF; --avail-available-border: transparent; --avail-available-solid: #17703F;
  --avail-busy-bg: #C2410C;      --avail-busy-fg: #FFFFFF;      --avail-busy-border: transparent;      --avail-busy-solid: #C2410C;
  --avail-offline-bg: #5B6878;   --avail-offline-fg: #FFFFFF;   --avail-offline-border: transparent;   --avail-offline-solid: #5B6878;

  /* SOS, recording, sensitive */
  --sos-surface: #9B1C1C; --sos-foreground: #FFFFFF; --sos-panel: rgba(0, 0, 0, 0.25);
  --sos-ring-track: rgba(255, 255, 255, 0.30);
  --sos-button-bg: #FFFFFF; --sos-button-fg: #9B1C1C; --sos-button-ring: rgba(255, 255, 255, 0.22);
  --recording-fg: #9B1C1C; --record-button: #9B1C1C; --record-button-ring: rgba(155, 28, 28, 0.14);
  --waveform-active: #0F2A47; --waveform-idle: #AEBBCB;
  --sensitive-header: #9B1C1C; --sensitive-header-fg: #FFFFFF; --sensitive-border: #9B1C1C;
  --sensitive-strip: #6E1414; --sensitive-row: #FFF7F6;

  /* code */
  --code-bg: #EEF1F5; --code-fg: #0E1B2C; --code-border: #C3CEDA;
  --code-danger-bg: #FBE3E1; --code-danger-fg: #6E1414; --code-danger-border: #C9463D;
  --codeblock-bg: #0B1420; --codeblock-fg: #E4EBF4;

  /* overlays */
  --scrim: rgba(14, 27, 44, 0.60);
  --scrim-admin: rgba(11, 20, 32, 0.62);
  --scrim-sensitive: rgba(11, 20, 32, 0.82);

  /* map */
  --map-ground: #DDE5EE; --map-building: #CFD9E4; --map-park: #C5DBC5; --map-water: #B5D0EA;
  --map-road-major: #FFFFFF; --map-road-minor: #F1F4F8; --map-label: #4A5A70; --map-label-halo: #DDE5EE;
  --marker-stroke: #FFFFFF; --marker-selected: #0F2A47; --marker-critical-halo: rgba(155, 28, 28, 0.25);
  --marker-critical-fill: #9B1C1C; --marker-critical-icon: #FFFFFF;
  --marker-high-fill: #C2410C;     --marker-high-icon: #FFFFFF;
  --marker-medium-fill: #A97A00;   --marker-medium-icon: #FFFFFF;
  --marker-low-fill: #3E6596;      --marker-low-icon: #FFFFFF;
  --unit-marker-stroke: #FFFFFF;
  --unit-available-fill: #17703F; --unit-available-icon: #FFFFFF;
  --unit-busy-fill: #C2410C;      --unit-busy-icon: #FFFFFF;
  --unit-offline-fill: #5B6878;   --unit-offline-icon: #FFFFFF;
  --alert-circle-fill: rgba(155, 28, 28, 0.16); --alert-circle-stroke: #9B1C1C;
  --heat-1: #D0BDC4; --heat-1-fg: #5A0F0F;
  --heat-2: #C69FA5; --heat-2-fg: #5A0F0F;
  --heat-3: #BF8B90; --heat-3-fg: #5A0F0F;
  --heat-4: #AF585B; --heat-4-fg: #FFFFFF;
  --heat-5: #A23031; --heat-5-fg: #FFFFFF;

  /* charts (beyond shadcn --chart-1..5) */
  --chart-6: #5B6878;
  --chart-grid: #E3E8EE; --chart-axis: #566579; --chart-track: #EEF1F5;
  --chart-tooltip-bg: #FFFFFF; --chart-tooltip-border: #D5DDE6;

  /* shadows */
  --shadow-marker: 0 2px 6px rgba(14, 27, 44, 0.35);
  --shadow-popover: 0 8px 24px rgba(14, 27, 44, 0.22);
  --shadow-dialog: 0 24px 64px rgba(14, 27, 44, 0.40);
  --shadow-dialog-admin: 0 24px 64px rgba(11, 20, 32, 0.45);
  --shadow-sensitive: 0 24px 72px rgba(0, 0, 0, 0.60);
}

/* ------------------------------------------------------------------- DARK */
.dark {
  color-scheme: dark;

  --background: #0B1220;
  --foreground: #EEF2F7;
  --card: #131C2B;
  --card-foreground: #EEF2F7;
  --popover: #1A2537;
  --popover-foreground: #EEF2F7;
  --primary: #8AB4F8;
  --primary-foreground: #0B1A2E;
  --secondary: #1C2738;
  --secondary-foreground: #EEF2F7;
  --muted: #1C2738;
  --muted-foreground: #97A5B8;
  --accent: #1C3354;
  --accent-foreground: #D4E3F6;
  --destructive: #B83A31;
  --destructive-foreground: #FFFFFF;
  --border: #2C3A4F;
  --input: #6E7F97;
  --ring: #8AB4F8;
  --chart-1: #7FB2F0;
  --chart-2: #F08A4B;
  --chart-3: #34C77B;
  --chart-4: #C9A0F0;
  --chart-5: #E9B949;

  --sidebar: #0C1D31;
  --sidebar-foreground: #E4EBF4;
  --sidebar-primary: #E4EBF4;
  --sidebar-primary-foreground: #0C1D31;
  --sidebar-accent: #E4EBF4;
  --sidebar-accent-foreground: #0C1D31;
  --sidebar-border: rgba(255, 255, 255, 0.12);
  --sidebar-ring: #8AB4F8;
  --sidebar-hover: rgba(255, 255, 255, 0.08);
  --sidebar-badge: rgba(255, 255, 255, 0.14);
  --sidebar-muted-foreground: #B9C5D4;

  --surface-raised: #1A2537;
  --surface-tint: #1C3354;
  --surface-selected: #1C3354;
  --border-subtle: #3A4A62;
  --text-secondary: #B9C5D4;
  --text-placeholder: #8796AB;
  --text-disabled: #5B6C84;
  --text-on-chrome-muted: #B9C5D4;
  --link: #8AB4F8;
  --link-hover: #A3C4FA;
  --danger-text: #FF9C94;
  --warning-text: #F5B35C;
  --topbar: #131C2B;

  --primary-hover: #A3C4FA;
  --primary-pressed: #7AA6EE;
  --destructive-hover: #A3322A;
  --state-hover: rgba(238, 242, 247, 0.08);
  --state-pressed: rgba(238, 242, 247, 0.14);
  --selected-border: #8AB4F8;
  --disabled-bg: #1C2738;
  --toggle-on: #34C77B;
  --toggle-off: #7D8CA1;

  --status-progress-bg: #1C3354;  --status-progress-fg: #D4E3F6;
  --status-done-bg: #123824;      --status-done-fg: #A6F0C6;
  --status-closed-bg: #273244;    --status-closed-fg: #CBD4E0;
  --timeline-done: #8AB4F8;
  --timeline-current-ring: rgba(138, 180, 248, 0.30);
  --timeline-pending: #6E7F97;
  --timeline-line: #3A4A62;

  --anon-bg: #E5E9F0;         --anon-fg: #0E1B2C;
  --anon-banner-bg: #273244;  --anon-banner-fg: #EEF2F7;

  --role-admin-bg: #E5E9F0;      --role-admin-fg: #04070C;  --role-admin-border: #E5E9F0;
  --role-dispatcher-bg: #1C3354; --role-dispatcher-fg: #D4E3F6; --role-dispatcher-border: #3A5F8F;
  --role-field-bg: #1C2738;      --role-field-fg: #EEF2F7;  --role-field-border: #3A4A62;
  --role-citizen-bg: transparent; --role-citizen-fg: #B9C5D4; --role-citizen-border: #3A4A62;

  --callout-info-bg: #142742;    --callout-info-border: #3A5F8F;    --callout-info-fg: #D4E3F6;
  --callout-warning-bg: #3A2C08; --callout-warning-border: #B7791F; --callout-warning-fg: #FDE7A6;
  --callout-danger-bg: #3D1213;  --callout-danger-border: #E0564C;  --callout-danger-fg: #FFD2CE;
  --callout-success-bg: #10301F; --callout-success-border: #1E5A3A; --callout-success-fg: #A6F0C6;
  --live-dot: #34C77B; --live-halo: rgba(52, 199, 123, 0.25); --live-fg: #6EE7A8;

  --sev-critical-bg: #5C1517; --sev-critical-fg: #FFD7D4; --sev-critical-border: #F0625D; --sev-critical-solid: #F0625D;
  --sev-high-bg: #5A2508;     --sev-high-fg: #FFD9BF;     --sev-high-border: #F08A4B;     --sev-high-solid: #F08A4B;
  --sev-medium-bg: #4D3A06;   --sev-medium-fg: #FDE68A;   --sev-medium-border: #E9B949;   --sev-medium-solid: #E9B949;
  --sev-low-bg: #1E3350;      --sev-low-fg: #D4E3F6;      --sev-low-border: #7FA6D6;      --sev-low-solid: #7FA6D6;

  --avail-available-bg: #0F3D27; --avail-available-fg: #A6F0C6; --avail-available-border: #34C77B; --avail-available-solid: #34C77B;
  --avail-busy-bg: #5A2508;      --avail-busy-fg: #FFD9BF;      --avail-busy-border: #F08A4B;      --avail-busy-solid: #F08A4B;
  --avail-offline-bg: #273244;   --avail-offline-fg: #CBD4E0;   --avail-offline-border: #7D8CA1;   --avail-offline-solid: #7D8CA1;

  --sos-surface: #7A1515;
  --sos-button-fg: #7A1515; --sos-button-ring: rgba(255, 255, 255, 0.18);
  --recording-fg: #FF9C94; --record-button: #D9534D; --record-button-ring: rgba(240, 98, 93, 0.20);
  --waveform-active: #8AB4F8; --waveform-idle: #3A4A62;
  --sensitive-header: #8E1B1B; --sensitive-border: #F0625D;
  --sensitive-strip: #4A1012; --sensitive-row: #2A1415;

  --code-bg: #1C2738; --code-fg: #EEF2F7; --code-border: #3A4A62;
  --code-danger-bg: #3D1213; --code-danger-fg: #FFD2CE; --code-danger-border: #E0564C;
  --codeblock-bg: #04070C; --codeblock-fg: #E4EBF4;

  --scrim: rgba(0, 0, 0, 0.70);
  --scrim-admin: rgba(0, 0, 0, 0.72);
  --scrim-sensitive: rgba(0, 0, 0, 0.85);

  --map-ground: #141D2B; --map-building: #1C2738; --map-park: #17302A; --map-water: #1A3550;
  --map-road-major: #2C3A4F; --map-road-minor: #222E40; --map-label: #A3B1C4; --map-label-halo: #0B1220;
  --marker-stroke: #0B1220; --marker-selected: #EEF2F7; --marker-critical-halo: rgba(240, 98, 93, 0.35);
  --marker-critical-fill: #F0625D; --marker-critical-icon: #1A0505;
  --marker-high-fill: #F08A4B;     --marker-high-icon: #1A0B02;
  --marker-medium-fill: #E9B949;   --marker-medium-icon: #1A1302;
  --marker-low-fill: #7FA6D6;      --marker-low-icon: #07121F;
  --unit-marker-stroke: #0B1220;
  --unit-available-fill: #34C77B; --unit-available-icon: #05140C;
  --unit-busy-fill: #F08A4B;      --unit-busy-icon: #1A0B02;
  --unit-offline-fill: #7D8CA1;   --unit-offline-icon: #0B1220;
  --alert-circle-fill: rgba(240, 98, 93, 0.18); --alert-circle-stroke: #F0625D;
  --heat-1: #3A1E28; --heat-1-fg: #FFFFFF;
  --heat-2: #6A2530; --heat-2-fg: #FFFFFF;
  --heat-3: #A1323A; --heat-3-fg: #FFFFFF;
  --heat-4: #D9534D; --heat-4-fg: #1A0505;
  --heat-5: #FF8A7A; --heat-5-fg: #1A0505;

  --chart-6: #A3B1C4;
  --chart-grid: #253247; --chart-axis: #97A5B8; --chart-track: #1C2738;
  --chart-tooltip-bg: #1A2537; --chart-tooltip-border: #2C3A4F;

  --shadow-marker: 0 2px 6px rgba(0, 0, 0, 0.60);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.50);
  --shadow-dialog: 0 24px 64px rgba(0, 0, 0, 0.60);
  --shadow-dialog-admin: 0 24px 64px rgba(0, 0, 0, 0.65);
  --shadow-sensitive: 0 24px 72px rgba(0, 0, 0, 0.70);
}

/* ------------------------------------- SYSTEM ADMINISTRATOR (near-black) */
[data-app="admin"] {
  --sidebar: #0B1420;
  --sidebar-primary-foreground: #0B1420;
  --sidebar-accent-foreground: #0B1420;
}
.dark[data-app="admin"] {
  --sidebar: #04070C;
  --sidebar-primary-foreground: #04070C;
  --sidebar-accent-foreground: #04070C;
}

/* ---------------------------------------------------------- LANGUAGE */
:root:lang(ar) {
  --font-active: var(--font-arabic);
  --leading-body: 1.6;
}

/* ------------------------------------------- TAILWIND THEME MAPPING */
@theme inline {
  --font-sans: var(--font-active);
  --font-latin: var(--font-latin);
  --font-arabic: var(--font-arabic);
  --font-mono: var(--font-mono);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-unit: 7px;
  --radius-md: 9px;
  --radius-lg: 12px;
  --radius-xl: 14px;
  --radius-2xl: 16px;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-primary-pressed: var(--primary-pressed);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-hover: var(--destructive-hover);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-hover: var(--sidebar-hover);
  --color-sidebar-badge: var(--sidebar-badge);
  --color-sidebar-muted-foreground: var(--sidebar-muted-foreground);
  --color-sidebar-restricted: var(--sidebar-restricted);
  --color-sidebar-restricted-active: var(--sidebar-restricted-active);

  --color-surface-raised: var(--surface-raised);
  --color-surface-tint: var(--surface-tint);
  --color-surface-selected: var(--surface-selected);
  --color-text-secondary: var(--text-secondary);
  --color-text-placeholder: var(--text-placeholder);
  --color-text-disabled: var(--text-disabled);
  --color-text-on-chrome: var(--text-on-chrome);
  --color-text-on-chrome-muted: var(--text-on-chrome-muted);
  --color-link: var(--link);
  --color-link-hover: var(--link-hover);
  --color-danger-text: var(--danger-text);
  --color-warning-text: var(--warning-text);
  --color-topbar: var(--topbar);
  --color-state-hover: var(--state-hover);
  --color-state-pressed: var(--state-pressed);
  --color-selected-border: var(--selected-border);
  --color-disabled-bg: var(--disabled-bg);
  --color-toggle-on: var(--toggle-on);
  --color-toggle-off: var(--toggle-off);

  --color-status-progress-bg: var(--status-progress-bg);
  --color-status-progress-fg: var(--status-progress-fg);
  --color-status-done-bg: var(--status-done-bg);
  --color-status-done-fg: var(--status-done-fg);
  --color-status-closed-bg: var(--status-closed-bg);
  --color-status-closed-fg: var(--status-closed-fg);
  --color-timeline-done: var(--timeline-done);
  --color-timeline-current-ring: var(--timeline-current-ring);
  --color-timeline-pending: var(--timeline-pending);
  --color-timeline-line: var(--timeline-line);

  --color-anon-bg: var(--anon-bg);
  --color-anon-fg: var(--anon-fg);
  --color-anon-banner-bg: var(--anon-banner-bg);
  --color-anon-banner-fg: var(--anon-banner-fg);

  --color-role-admin-bg: var(--role-admin-bg);
  --color-role-admin-fg: var(--role-admin-fg);
  --color-role-admin-border: var(--role-admin-border);
  --color-role-dispatcher-bg: var(--role-dispatcher-bg);
  --color-role-dispatcher-fg: var(--role-dispatcher-fg);
  --color-role-dispatcher-border: var(--role-dispatcher-border);
  --color-role-field-bg: var(--role-field-bg);
  --color-role-field-fg: var(--role-field-fg);
  --color-role-field-border: var(--role-field-border);
  --color-role-citizen-bg: var(--role-citizen-bg);
  --color-role-citizen-fg: var(--role-citizen-fg);
  --color-role-citizen-border: var(--role-citizen-border);

  --color-callout-info-bg: var(--callout-info-bg);
  --color-callout-info-border: var(--callout-info-border);
  --color-callout-info-fg: var(--callout-info-fg);
  --color-callout-warning-bg: var(--callout-warning-bg);
  --color-callout-warning-border: var(--callout-warning-border);
  --color-callout-warning-fg: var(--callout-warning-fg);
  --color-callout-danger-bg: var(--callout-danger-bg);
  --color-callout-danger-border: var(--callout-danger-border);
  --color-callout-danger-fg: var(--callout-danger-fg);
  --color-callout-success-bg: var(--callout-success-bg);
  --color-callout-success-border: var(--callout-success-border);
  --color-callout-success-fg: var(--callout-success-fg);
  --color-live-dot: var(--live-dot);
  --color-live-halo: var(--live-halo);
  --color-live-fg: var(--live-fg);

  --color-sev-critical-bg: var(--sev-critical-bg);
  --color-sev-critical-fg: var(--sev-critical-fg);
  --color-sev-critical-border: var(--sev-critical-border);
  --color-sev-critical-solid: var(--sev-critical-solid);
  --color-sev-high-bg: var(--sev-high-bg);
  --color-sev-high-fg: var(--sev-high-fg);
  --color-sev-high-border: var(--sev-high-border);
  --color-sev-high-solid: var(--sev-high-solid);
  --color-sev-medium-bg: var(--sev-medium-bg);
  --color-sev-medium-fg: var(--sev-medium-fg);
  --color-sev-medium-border: var(--sev-medium-border);
  --color-sev-medium-solid: var(--sev-medium-solid);
  --color-sev-low-bg: var(--sev-low-bg);
  --color-sev-low-fg: var(--sev-low-fg);
  --color-sev-low-border: var(--sev-low-border);
  --color-sev-low-solid: var(--sev-low-solid);

  --color-avail-available-bg: var(--avail-available-bg);
  --color-avail-available-fg: var(--avail-available-fg);
  --color-avail-available-border: var(--avail-available-border);
  --color-avail-available-solid: var(--avail-available-solid);
  --color-avail-busy-bg: var(--avail-busy-bg);
  --color-avail-busy-fg: var(--avail-busy-fg);
  --color-avail-busy-border: var(--avail-busy-border);
  --color-avail-busy-solid: var(--avail-busy-solid);
  --color-avail-offline-bg: var(--avail-offline-bg);
  --color-avail-offline-fg: var(--avail-offline-fg);
  --color-avail-offline-border: var(--avail-offline-border);
  --color-avail-offline-solid: var(--avail-offline-solid);

  --color-sos-surface: var(--sos-surface);
  --color-sos-foreground: var(--sos-foreground);
  --color-sensitive-header: var(--sensitive-header);
  --color-sensitive-header-fg: var(--sensitive-header-fg);
  --color-sensitive-border: var(--sensitive-border);
  --color-sensitive-strip: var(--sensitive-strip);
  --color-sensitive-row: var(--sensitive-row);

  --color-code-bg: var(--code-bg);
  --color-code-fg: var(--code-fg);
  --color-code-border: var(--code-border);
  --color-code-danger-bg: var(--code-danger-bg);
  --color-code-danger-fg: var(--code-danger-fg);
  --color-code-danger-border: var(--code-danger-border);
  --color-codeblock-bg: var(--codeblock-bg);
  --color-codeblock-fg: var(--codeblock-fg);

  --color-scrim: var(--scrim);
  --color-scrim-admin: var(--scrim-admin);
  --color-scrim-sensitive: var(--scrim-sensitive);

  --color-heat-1: var(--heat-1);
  --color-heat-2: var(--heat-2);
  --color-heat-3: var(--heat-3);
  --color-heat-4: var(--heat-4);
  --color-heat-5: var(--heat-5);

  --shadow-marker: var(--shadow-marker);
  --shadow-popover: var(--shadow-popover);
  --shadow-dialog: var(--shadow-dialog);
  --shadow-dialog-admin: var(--shadow-dialog-admin);
  --shadow-sensitive: var(--shadow-sensitive);
}

/* ------------------------------------------------------------ BASE */
@layer base {
  * { @apply border-border; }
  html { font-family: var(--font-active); }
  body {
    @apply bg-background text-foreground;
    font-size: 14px;
    line-height: var(--leading-body);
  }
  :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
  ::placeholder { color: var(--text-placeholder); opacity: 1; }
}

@layer components {
  /* numbers, IDs, coordinates, times, emails: LTR + tabular in both languages */
  .num { font-family: var(--font-latin); font-variant-numeric: tabular-nums; direction: ltr; unicode-bidi: isolate; }
  .code { font-family: var(--font-mono); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

### 8.1 Using the tokens

```tsx
// Severity pill (web)
const SEV = { critical: OctagonAlert, high: TriangleAlert, medium: CircleAlert, low: Info } as const;
export function SeverityPill({ level, label }: { level: keyof typeof SEV; label: string }) {
  const Icon = SEV[level];
  return (
    <span className={`inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold
      bg-sev-${level}-bg text-sev-${level}-fg border-sev-${level}-border`}>
      <Icon className="size-3.5" aria-hidden /> {label}
    </span>
  );
}
```

> Tailwind 4 cannot see classes built by string interpolation. Keep a literal map (`{ critical: "bg-sev-critical-bg text-sev-critical-fg border-sev-critical-border", … }`) or use `@source inline(...)` to safelist them.

shadcn overrides that match the designs:

| Component | Class change |
|---|---|
| `Button` default | `h-10 rounded-md font-bold hover:bg-primary-hover active:bg-primary-pressed` |
| `Button` destructive | `bg-destructive text-destructive-foreground hover:bg-destructive-hover` |
| `Button` outline | `border-[1.5px] border-input bg-card text-primary dark:text-foreground` |
| `Input`, `Select`, `Textarea` | `h-10 rounded-md border-input placeholder:text-text-placeholder` |
| `Card` | `rounded-lg border bg-card shadow-none` |
| `Dialog` content | `rounded-xl bg-popover shadow-dialog`; overlay `bg-scrim` (Admin: `bg-scrim-admin`) |
| Identity-reveal `AlertDialog` | Overlay `bg-scrim-sensitive`; content `border-2 border-sensitive-border shadow-sensitive`; header band `bg-sensitive-header text-sensitive-header-fg` |
| `SidebarMenuButton` | `hover:bg-sidebar-hover data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground` (shadcn otherwise uses `sidebar-accent` for hover too, which would look like the active state) |
| `Table` header | `bg-muted text-xs font-bold text-text-secondary` |

### 8.2 Theme switching (`system | light | dark`)

Store the preference under `localStorage["istigaba-theme"]`. Put this inline in `<head>`, before CSS, so the page never flashes the wrong theme:

```html
<script>
(function () {
  try {
    var p = localStorage.getItem("istigaba-theme") || "system";
    var dark = p === "dark" || (p === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    var el = document.documentElement;
    el.classList.toggle("dark", dark);
    el.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
</script>
```

With Next.js, `next-themes` does the same thing: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="istigaba-theme" disableTransitionOnChange>`. In `system` mode, also listen to `matchMedia('(prefers-color-scheme: dark)')` changes.

---

## 9. Shared tokens and mobile (NativeWind)

`apps/mobile-citizen` and `apps/mobile-field` are Expo apps styled with **NativeWind**. They use shared primitives from `packages/ui`, and all four apps read their tokens from `packages/config`.

### 9.0 Which NativeWind

| | NativeWind **v5** | NativeWind **v4** |
|---|---|---|
| Tailwind | **CSS 4**, the same engine and `@theme` syntax as `web-ops` / `web-admin` | CSS 3 (`tailwind.config.js`) |
| Status (Nov 2026) | Release candidate (`5.0.0-rc.0`, Expo 57); docs still say "pre-release, not for production" | Stable, npm `latest` |
| Runtime theming | CSS variables; on native `:root.dark` is rejected, so dark uses `@media (prefers-color-scheme: dark)` + `Appearance.setColorScheme` | `vars()` on the root view + `colorScheme.set()` |
| Setup here | §9.4 (target) | §9.5 (fallback until 5.0 is final) |

Both setups expose the **same utility class names** (`bg-card`, `text-muted-foreground`, `bg-sev-critical-bg`, `rounded-lg` …). Components in `packages/ui` are therefore identical, and moving from v4 to v5 only changes configuration files.

### 9.1 Package layout

```
packages/config/
  src/tokens.ts            ← single source of truth (§9.2)
  src/index.ts             ← export * from './tokens'
  scripts/build-css.ts     ← generates the two CSS files (§9.3)
  css/theme.web.css        ← GENERATED: :root / .dark / [data-app="admin"] / @theme inline (web, Tailwind 4)
  css/theme.native.css     ← GENERATED: :root / @media (prefers-color-scheme: dark) / @theme (NativeWind v5)
  tailwind-preset.js       ← NativeWind v4 only (§9.5)
packages/ui/
  src/theme/ThemeProvider.tsx        ← preference (system|light|dark) → resolved scheme
  src/theme/useTokens.ts             ← JS colour values for non-className props
  src/primitives/Text.tsx, Num.tsx, SeverityPill.tsx, AvailabilityPill.tsx, StatusChip.tsx, AnonymousPill.tsx …
apps/web-ops, apps/web-admin       → import css/theme.web.css (§8)
apps/mobile-citizen, apps/mobile-field → import css/theme.native.css (§9.4)
```

### 9.2 Platform-agnostic tokens (`packages/config/src/tokens.ts`)

Colour values are the ones in §5 and §8, and dark values were checked in §12. The two new mobile-chrome groups (`field-header-*`, `tabbar-*`) come from §5.4.

```ts
// packages/config/src/tokens.ts — Istigaba design tokens (single source of truth)
// Platform-agnostic: no imports from react-native, nativewind or tailwind.

export type Scheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';
export type Lang = 'ar' | 'en';
export type AppId = 'citizen' | 'field' | 'ops' | 'admin';
export const THEME_STORAGE_KEY = 'istigaba-theme';

/* ------------------------------------------------------------------ colours */
// Keys are the CSS custom-property names without "--". Same key on every platform.
export const color = {
  light: {
    // shadcn core
    'background': '#F3F5F8', 'foreground': '#0E1B2C', 'card': '#FFFFFF', 'card-foreground': '#0E1B2C',
    'popover': '#FFFFFF', 'popover-foreground': '#0E1B2C', 'primary': '#0F2A47', 'primary-foreground': '#FFFFFF',
    'secondary': '#EEF1F5', 'secondary-foreground': '#0F2A47', 'muted': '#EEF1F5', 'muted-foreground': '#566579',
    'accent': '#E1EAF6', 'accent-foreground': '#0F2A47', 'destructive': '#B3261E',
    'destructive-foreground': '#FFFFFF', 'border': '#D5DDE6', 'input': '#8493A6', 'ring': '#0B57B0',
    // sidebar (Ops default; Admin via appOverrides)
    'sidebar': '#0F2A47', 'sidebar-foreground': '#E4EBF4', 'sidebar-primary': '#FFFFFF',
    'sidebar-primary-foreground': '#0F2A47', 'sidebar-accent': '#FFFFFF', 'sidebar-accent-foreground': '#0F2A47',
    'sidebar-border': 'rgba(255, 255, 255, 0.22)', 'sidebar-ring': '#FFFFFF',
    'sidebar-hover': 'rgba(255, 255, 255, 0.10)', 'sidebar-badge': 'rgba(255, 255, 255, 0.16)',
    'sidebar-muted-foreground': '#D5DFEC', 'sidebar-restricted': '#FFB4AB', 'sidebar-restricted-active': '#9B1C1C',
    // surfaces & text
    'surface-raised': '#FFFFFF', 'surface-tint': '#E1EAF6', 'surface-selected': '#EEF4FB',
    'border-subtle': '#C3CEDA', 'text-secondary': '#3D4D63', 'text-placeholder': '#5D6C80',
    'text-disabled': '#8493A6', 'text-on-chrome': '#FFFFFF', 'text-on-chrome-muted': '#D5DFEC', 'link': '#0B57B0',
    'link-hover': '#083F80', 'danger-text': '#B3261E', 'warning-text': '#8A4B00', 'topbar': '#FFFFFF',
    // mobile chrome
    'field-header': '#0F2A47', 'field-header-foreground': '#FFFFFF', 'field-header-muted': '#D5DFEC',
    'field-header-border': 'transparent', 'tabbar': '#FFFFFF', 'tabbar-active': '#0F2A47',
    'tabbar-inactive': '#566579',
    // interactive states
    'primary-hover': '#183A60', 'primary-pressed': '#0A1E34', 'destructive-hover': '#9E211A',
    'state-hover': 'rgba(15, 42, 71, 0.06)', 'state-pressed': 'rgba(15, 42, 71, 0.12)', 'selected-border': '#0F2A47',
    'disabled-bg': '#EEF1F5', 'toggle-on': '#17703F', 'toggle-off': '#6B7A8D',
    // status & timeline
    'status-progress-bg': '#E1EAF6', 'status-progress-fg': '#0F2A47', 'status-done-bg': '#DFF2E7',
    'status-done-fg': '#145C34', 'status-closed-bg': '#E3E8EE', 'status-closed-fg': '#3D4D63',
    'timeline-done': '#0F2A47', 'timeline-current-ring': '#C9D8EC', 'timeline-pending': '#8493A6',
    'timeline-line': '#C3CEDA',
    // anonymous reporter
    'anon-bg': '#1F2937', 'anon-fg': '#FFFFFF', 'anon-banner-bg': '#1F2937', 'anon-banner-fg': '#FFFFFF',
    // role pills
    'role-admin-bg': '#0B1420', 'role-admin-fg': '#FFFFFF', 'role-admin-border': '#0B1420',
    'role-dispatcher-bg': '#E1EAF6', 'role-dispatcher-fg': '#0F2A47', 'role-dispatcher-border': '#B9CCE6',
    'role-field-bg': '#EEF1F5', 'role-field-fg': '#0E1B2C', 'role-field-border': '#AEBBCB',
    'role-citizen-bg': '#FFFFFF', 'role-citizen-fg': '#3D4D63', 'role-citizen-border': '#AEBBCB',
    // callouts & live
    'callout-info-bg': '#E1EAF6', 'callout-info-border': '#B9CCE6', 'callout-info-fg': '#0F2A47',
    'callout-warning-bg': '#FFF4D6', 'callout-warning-border': '#B7791F', 'callout-warning-fg': '#3F2A06',
    'callout-danger-bg': '#FBE3E1', 'callout-danger-border': '#C9463D', 'callout-danger-fg': '#6E1414',
    'callout-success-bg': '#DFF2E7', 'callout-success-border': '#DFF2E7', 'callout-success-fg': '#145C34',
    'live-dot': '#17703F', 'live-halo': '#CDEBD9', 'live-fg': '#145C34',
    // severity
    'sev-critical-bg': '#9B1C1C', 'sev-critical-fg': '#FFFFFF', 'sev-critical-border': 'transparent',
    'sev-critical-solid': '#9B1C1C', 'sev-high-bg': '#C2410C', 'sev-high-fg': '#FFFFFF',
    'sev-high-border': 'transparent', 'sev-high-solid': '#C2410C', 'sev-medium-bg': '#FCD34D',
    'sev-medium-fg': '#3F2A06', 'sev-medium-border': 'transparent', 'sev-medium-solid': '#A97A00',
    'sev-low-bg': '#D8E2EE', 'sev-low-fg': '#1F3A5C', 'sev-low-border': 'transparent', 'sev-low-solid': '#3E6596',
    // unit availability
    'avail-available-bg': '#17703F', 'avail-available-fg': '#FFFFFF', 'avail-available-border': 'transparent',
    'avail-available-solid': '#17703F', 'avail-busy-bg': '#C2410C', 'avail-busy-fg': '#FFFFFF',
    'avail-busy-border': 'transparent', 'avail-busy-solid': '#C2410C', 'avail-offline-bg': '#5B6878',
    'avail-offline-fg': '#FFFFFF', 'avail-offline-border': 'transparent', 'avail-offline-solid': '#5B6878',
    // SOS, recording, sensitive
    'sos-surface': '#9B1C1C', 'sos-foreground': '#FFFFFF', 'sos-panel': 'rgba(0, 0, 0, 0.25)',
    'sos-ring-track': 'rgba(255, 255, 255, 0.30)', 'sos-button-bg': '#FFFFFF', 'sos-button-fg': '#9B1C1C',
    'sos-button-ring': 'rgba(255, 255, 255, 0.22)', 'recording-fg': '#9B1C1C', 'record-button': '#9B1C1C',
    'record-button-ring': 'rgba(155, 28, 28, 0.14)', 'waveform-active': '#0F2A47', 'waveform-idle': '#AEBBCB',
    'sensitive-header': '#9B1C1C', 'sensitive-header-fg': '#FFFFFF', 'sensitive-border': '#9B1C1C',
    'sensitive-strip': '#6E1414', 'sensitive-row': '#FFF7F6',
    // code
    'code-bg': '#EEF1F5', 'code-fg': '#0E1B2C', 'code-border': '#C3CEDA', 'code-danger-bg': '#FBE3E1',
    'code-danger-fg': '#6E1414', 'code-danger-border': '#C9463D', 'codeblock-bg': '#0B1420',
    'codeblock-fg': '#E4EBF4',
    // overlays
    'scrim': 'rgba(14, 27, 44, 0.60)', 'scrim-admin': 'rgba(11, 20, 32, 0.62)',
    'scrim-sensitive': 'rgba(11, 20, 32, 0.82)',
    // map, markers, heat
    'map-ground': '#DDE5EE', 'map-building': '#CFD9E4', 'map-park': '#C5DBC5', 'map-water': '#B5D0EA',
    'map-road-major': '#FFFFFF', 'map-road-minor': '#F1F4F8', 'map-label': '#4A5A70', 'map-label-halo': '#DDE5EE',
    'marker-stroke': '#FFFFFF', 'marker-selected': '#0F2A47', 'marker-critical-halo': 'rgba(155, 28, 28, 0.25)',
    'marker-critical-fill': '#9B1C1C', 'marker-critical-icon': '#FFFFFF', 'marker-high-fill': '#C2410C',
    'marker-high-icon': '#FFFFFF', 'marker-medium-fill': '#A97A00', 'marker-medium-icon': '#FFFFFF',
    'marker-low-fill': '#3E6596', 'marker-low-icon': '#FFFFFF', 'unit-marker-stroke': '#FFFFFF',
    'unit-available-fill': '#17703F', 'unit-available-icon': '#FFFFFF', 'unit-busy-fill': '#C2410C',
    'unit-busy-icon': '#FFFFFF', 'unit-offline-fill': '#5B6878', 'unit-offline-icon': '#FFFFFF',
    'alert-circle-fill': 'rgba(155, 28, 28, 0.16)', 'alert-circle-stroke': '#9B1C1C', 'heat-1': '#D0BDC4',
    'heat-1-fg': '#5A0F0F', 'heat-2': '#C69FA5', 'heat-2-fg': '#5A0F0F', 'heat-3': '#BF8B90', 'heat-3-fg': '#5A0F0F',
    'heat-4': '#AF585B', 'heat-4-fg': '#FFFFFF', 'heat-5': '#A23031', 'heat-5-fg': '#FFFFFF',
    // charts
    'chart-1': '#0F2A47', 'chart-2': '#0B57B0', 'chart-3': '#C2410C', 'chart-4': '#17703F', 'chart-5': '#7E3AA8',
    'chart-6': '#5B6878', 'chart-grid': '#E3E8EE', 'chart-axis': '#566579', 'chart-track': '#EEF1F5',
    'chart-tooltip-bg': '#FFFFFF', 'chart-tooltip-border': '#D5DDE6',
  },
  dark: {
    // shadcn core
    'background': '#0B1220', 'foreground': '#EEF2F7', 'card': '#131C2B', 'card-foreground': '#EEF2F7',
    'popover': '#1A2537', 'popover-foreground': '#EEF2F7', 'primary': '#8AB4F8', 'primary-foreground': '#0B1A2E',
    'secondary': '#1C2738', 'secondary-foreground': '#EEF2F7', 'muted': '#1C2738', 'muted-foreground': '#97A5B8',
    'accent': '#1C3354', 'accent-foreground': '#D4E3F6', 'destructive': '#B83A31',
    'destructive-foreground': '#FFFFFF', 'border': '#2C3A4F', 'input': '#6E7F97', 'ring': '#8AB4F8',
    // sidebar (Ops default; Admin via appOverrides)
    'sidebar': '#0C1D31', 'sidebar-foreground': '#E4EBF4', 'sidebar-primary': '#E4EBF4',
    'sidebar-primary-foreground': '#0C1D31', 'sidebar-accent': '#E4EBF4', 'sidebar-accent-foreground': '#0C1D31',
    'sidebar-border': 'rgba(255, 255, 255, 0.12)', 'sidebar-ring': '#8AB4F8',
    'sidebar-hover': 'rgba(255, 255, 255, 0.08)', 'sidebar-badge': 'rgba(255, 255, 255, 0.14)',
    'sidebar-muted-foreground': '#B9C5D4', 'sidebar-restricted': '#FFB4AB', 'sidebar-restricted-active': '#9B1C1C',
    // surfaces & text
    'surface-raised': '#1A2537', 'surface-tint': '#1C3354', 'surface-selected': '#1C3354',
    'border-subtle': '#3A4A62', 'text-secondary': '#B9C5D4', 'text-placeholder': '#8796AB',
    'text-disabled': '#5B6C84', 'text-on-chrome': '#FFFFFF', 'text-on-chrome-muted': '#B9C5D4', 'link': '#8AB4F8',
    'link-hover': '#A3C4FA', 'danger-text': '#FF9C94', 'warning-text': '#F5B35C', 'topbar': '#131C2B',
    // mobile chrome
    'field-header': '#0C1D31', 'field-header-foreground': '#FFFFFF', 'field-header-muted': '#B9C5D4',
    'field-header-border': '#2C3A4F', 'tabbar': '#131C2B', 'tabbar-active': '#8AB4F8', 'tabbar-inactive': '#97A5B8',
    // interactive states
    'primary-hover': '#A3C4FA', 'primary-pressed': '#7AA6EE', 'destructive-hover': '#A3322A',
    'state-hover': 'rgba(238, 242, 247, 0.08)', 'state-pressed': 'rgba(238, 242, 247, 0.14)',
    'selected-border': '#8AB4F8', 'disabled-bg': '#1C2738', 'toggle-on': '#34C77B', 'toggle-off': '#7D8CA1',
    // status & timeline
    'status-progress-bg': '#1C3354', 'status-progress-fg': '#D4E3F6', 'status-done-bg': '#123824',
    'status-done-fg': '#A6F0C6', 'status-closed-bg': '#273244', 'status-closed-fg': '#CBD4E0',
    'timeline-done': '#8AB4F8', 'timeline-current-ring': 'rgba(138, 180, 248, 0.30)', 'timeline-pending': '#6E7F97',
    'timeline-line': '#3A4A62',
    // anonymous reporter
    'anon-bg': '#E5E9F0', 'anon-fg': '#0E1B2C', 'anon-banner-bg': '#273244', 'anon-banner-fg': '#EEF2F7',
    // role pills
    'role-admin-bg': '#E5E9F0', 'role-admin-fg': '#04070C', 'role-admin-border': '#E5E9F0',
    'role-dispatcher-bg': '#1C3354', 'role-dispatcher-fg': '#D4E3F6', 'role-dispatcher-border': '#3A5F8F',
    'role-field-bg': '#1C2738', 'role-field-fg': '#EEF2F7', 'role-field-border': '#3A4A62',
    'role-citizen-bg': 'transparent', 'role-citizen-fg': '#B9C5D4', 'role-citizen-border': '#3A4A62',
    // callouts & live
    'callout-info-bg': '#142742', 'callout-info-border': '#3A5F8F', 'callout-info-fg': '#D4E3F6',
    'callout-warning-bg': '#3A2C08', 'callout-warning-border': '#B7791F', 'callout-warning-fg': '#FDE7A6',
    'callout-danger-bg': '#3D1213', 'callout-danger-border': '#E0564C', 'callout-danger-fg': '#FFD2CE',
    'callout-success-bg': '#10301F', 'callout-success-border': '#1E5A3A', 'callout-success-fg': '#A6F0C6',
    'live-dot': '#34C77B', 'live-halo': 'rgba(52, 199, 123, 0.25)', 'live-fg': '#6EE7A8',
    // severity
    'sev-critical-bg': '#5C1517', 'sev-critical-fg': '#FFD7D4', 'sev-critical-border': '#F0625D',
    'sev-critical-solid': '#F0625D', 'sev-high-bg': '#5A2508', 'sev-high-fg': '#FFD9BF',
    'sev-high-border': '#F08A4B', 'sev-high-solid': '#F08A4B', 'sev-medium-bg': '#4D3A06',
    'sev-medium-fg': '#FDE68A', 'sev-medium-border': '#E9B949', 'sev-medium-solid': '#E9B949',
    'sev-low-bg': '#1E3350', 'sev-low-fg': '#D4E3F6', 'sev-low-border': '#7FA6D6', 'sev-low-solid': '#7FA6D6',
    // unit availability
    'avail-available-bg': '#0F3D27', 'avail-available-fg': '#A6F0C6', 'avail-available-border': '#34C77B',
    'avail-available-solid': '#34C77B', 'avail-busy-bg': '#5A2508', 'avail-busy-fg': '#FFD9BF',
    'avail-busy-border': '#F08A4B', 'avail-busy-solid': '#F08A4B', 'avail-offline-bg': '#273244',
    'avail-offline-fg': '#CBD4E0', 'avail-offline-border': '#7D8CA1', 'avail-offline-solid': '#7D8CA1',
    // SOS, recording, sensitive
    'sos-surface': '#7A1515', 'sos-foreground': '#FFFFFF', 'sos-panel': 'rgba(0, 0, 0, 0.25)',
    'sos-ring-track': 'rgba(255, 255, 255, 0.30)', 'sos-button-bg': '#FFFFFF', 'sos-button-fg': '#7A1515',
    'sos-button-ring': 'rgba(255, 255, 255, 0.18)', 'recording-fg': '#FF9C94', 'record-button': '#D9534D',
    'record-button-ring': 'rgba(240, 98, 93, 0.20)', 'waveform-active': '#8AB4F8', 'waveform-idle': '#3A4A62',
    'sensitive-header': '#8E1B1B', 'sensitive-header-fg': '#FFFFFF', 'sensitive-border': '#F0625D',
    'sensitive-strip': '#4A1012', 'sensitive-row': '#2A1415',
    // code
    'code-bg': '#1C2738', 'code-fg': '#EEF2F7', 'code-border': '#3A4A62', 'code-danger-bg': '#3D1213',
    'code-danger-fg': '#FFD2CE', 'code-danger-border': '#E0564C', 'codeblock-bg': '#04070C',
    'codeblock-fg': '#E4EBF4',
    // overlays
    'scrim': 'rgba(0, 0, 0, 0.70)', 'scrim-admin': 'rgba(0, 0, 0, 0.72)', 'scrim-sensitive': 'rgba(0, 0, 0, 0.85)',
    // map, markers, heat
    'map-ground': '#141D2B', 'map-building': '#1C2738', 'map-park': '#17302A', 'map-water': '#1A3550',
    'map-road-major': '#2C3A4F', 'map-road-minor': '#222E40', 'map-label': '#A3B1C4', 'map-label-halo': '#0B1220',
    'marker-stroke': '#0B1220', 'marker-selected': '#EEF2F7', 'marker-critical-halo': 'rgba(240, 98, 93, 0.35)',
    'marker-critical-fill': '#F0625D', 'marker-critical-icon': '#1A0505', 'marker-high-fill': '#F08A4B',
    'marker-high-icon': '#1A0B02', 'marker-medium-fill': '#E9B949', 'marker-medium-icon': '#1A1302',
    'marker-low-fill': '#7FA6D6', 'marker-low-icon': '#07121F', 'unit-marker-stroke': '#0B1220',
    'unit-available-fill': '#34C77B', 'unit-available-icon': '#05140C', 'unit-busy-fill': '#F08A4B',
    'unit-busy-icon': '#1A0B02', 'unit-offline-fill': '#7D8CA1', 'unit-offline-icon': '#0B1220',
    'alert-circle-fill': 'rgba(240, 98, 93, 0.18)', 'alert-circle-stroke': '#F0625D', 'heat-1': '#3A1E28',
    'heat-1-fg': '#FFFFFF', 'heat-2': '#6A2530', 'heat-2-fg': '#FFFFFF', 'heat-3': '#A1323A', 'heat-3-fg': '#FFFFFF',
    'heat-4': '#D9534D', 'heat-4-fg': '#1A0505', 'heat-5': '#FF8A7A', 'heat-5-fg': '#1A0505',
    // charts
    'chart-1': '#7FB2F0', 'chart-2': '#F08A4B', 'chart-3': '#34C77B', 'chart-4': '#C9A0F0', 'chart-5': '#E9B949',
    'chart-6': '#A3B1C4', 'chart-grid': '#253247', 'chart-axis': '#97A5B8', 'chart-track': '#1C2738',
    'chart-tooltip-bg': '#1A2537', 'chart-tooltip-border': '#2C3A4F',
  },
} as const satisfies Record<Scheme, Record<string, string>>;

export type ColorToken = keyof typeof color.light;

/** Per-app overrides. Only the System Administrator differs (near-black chrome). */
export const appOverrides: Partial<Record<AppId, Partial<Record<Scheme, Partial<Record<ColorToken, string>>>>>> = {
  admin: {
    light: { 'sidebar': '#0B1420', 'sidebar-primary-foreground': '#0B1420', 'sidebar-accent-foreground': '#0B1420' },
    dark: { 'sidebar': '#04070C', 'sidebar-primary-foreground': '#04070C', 'sidebar-accent-foreground': '#04070C' },
  },
};

export function colorsFor(scheme: Scheme, app: AppId = 'ops'): Record<ColorToken, string> {
  return { ...color[scheme], ...appOverrides[app]?.[scheme] } as Record<ColorToken, string>;
}

/** `{ '--background': '#F3F5F8', … }`, for CSS generation and runtime variable providers. */
export function cssVars(scheme: Scheme, app: AppId = 'ops'): Record<`--${string}`, string> {
  const c = colorsFor(scheme, app);
  const out: Record<`--${string}`, string> = {};
  for (const k in c) out[`--${k}`] = c[k as ColorToken];
  for (const k in shadow[scheme]) out[`--shadow-${k}`] = shadow[scheme][k as ShadowToken];
  return out;
}

/* ------------------------------------------------------- domain metadata */
export const severityLevels = ['critical', 'high', 'medium', 'low'] as const;
export type Severity = (typeof severityLevels)[number];
export const severityMeta: Record<Severity, { label: Record<Lang, string>; icon: string; markerSize: number; halo: boolean }> = {
  critical: { label: { ar: 'حرجة', en: 'Critical' }, icon: 'octagon-alert', markerSize: 34, halo: true },
  high: { label: { ar: 'عالية', en: 'High' }, icon: 'triangle-alert', markerSize: 30, halo: false },
  medium: { label: { ar: 'متوسطة', en: 'Medium' }, icon: 'circle-alert', markerSize: 30, halo: false },
  low: { label: { ar: 'منخفضة', en: 'Low' }, icon: 'info', markerSize: 30, halo: false },
};

export const availabilityLevels = ['available', 'busy', 'offline'] as const;
export type Availability = (typeof availabilityLevels)[number];
export const availabilityMeta: Record<Availability, { label: Record<Lang, string>; icon: string }> = {
  available: { label: { ar: 'متاحة', en: 'Available' }, icon: 'circle-check' },
  busy: { label: { ar: 'مشغولة', en: 'Busy' }, icon: 'clock' },
  offline: { label: { ar: 'غير متصلة', en: 'Offline' }, icon: 'circle-off' },
};

/** Report status (openapi `ReportStatus`) and mission status (`MissionStatus`) to chip tone. */
export const statusTone = {
  received: 'progress', under_review: 'progress', assigned: 'progress', en_route: 'progress', on_site: 'progress',
  mission_completed: 'done', closed: 'closed', cancelled: 'closed',
} as const;

/* ------------------------------------------------------------ typography */
export const font = {
  // Web: full CSS stacks (fallbacks allowed)
  web: {
    arabic: "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif",
    latin: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  // Native: one family per weight, no fallbacks (expo-google-fonts names)
  native: {
    ar: { 400: 'IBMPlexSansArabic_400Regular', 500: 'IBMPlexSansArabic_500Medium', 600: 'IBMPlexSansArabic_600SemiBold', 700: 'IBMPlexSansArabic_700Bold' },
    en: { 400: 'Inter_400Regular', 500: 'Inter_500Medium', 600: 'Inter_600SemiBold', 700: 'Inter_700Bold' },
    mono: { ios: 'Menlo', android: 'monospace' },
  },
} as const;
export type Weight = 400 | 500 | 600 | 700;

export const leading = { body: { ar: 1.6, en: 1.5 }, heading: 1.35, display: 1.1, single: 1.0 } as const;

type TypeStyle = { size: number; weight: Weight; leading: 'body' | 'heading' | 'display' | 'single'; latin?: true; tracking?: number };
export const typeScale = {
  'display-sos': { size: 104, weight: 700, leading: 'single', latin: true },
  'display-timer': { size: 64, weight: 700, leading: 'display', latin: true },
  'display-hero': { size: 40, weight: 700, leading: 'heading' },
  'sos-label': { size: 32, weight: 700, leading: 'single', latin: true, tracking: 1 },
  'brand-wordmark': { size: 30, weight: 700, leading: 'heading' },
  kpi: { size: 30, weight: 700, leading: 'single', latin: true },
  'headline-lg': { size: 26, weight: 700, leading: 'heading' },
  'headline-sm': { size: 24, weight: 700, leading: 'heading' },
  headline: { size: 22, weight: 700, leading: 'heading' },
  'title-lg': { size: 20, weight: 700, leading: 'heading' },
  'title-md': { size: 18, weight: 700, leading: 'heading' },
  'title-sm': { size: 16, weight: 700, leading: 'heading' },
  'body-lg': { size: 15, weight: 400, leading: 'body' },
  body: { size: 14, weight: 400, leading: 'body' },
  label: { size: 13, weight: 600, leading: 'heading' },
  'label-web': { size: 12, weight: 700, leading: 'heading' },
  caption: { size: 12, weight: 500, leading: 'heading' },
  micro: { size: 11, weight: 600, leading: 'heading' },
  'button-mobile': { size: 16, weight: 600, leading: 'single' },
  'button-web': { size: 14, weight: 700, leading: 'single' },
} as const satisfies Record<string, TypeStyle>;
export type TypeVariant = keyof typeof typeScale;

/** Absolute line height in px (React Native needs px). */
export function lineHeightPx(v: TypeVariant, lang: Lang): number {
  const s: TypeStyle = typeScale[v];
  const r = s.leading === 'body' ? leading.body[lang] : leading[s.leading];
  return Math.round(s.size * r);
}

/* ------------------------------------------------ spacing, size, radius */
export const space = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 48] as const;

export const size = {
  touchMin: 44,
  mobile: { button: 52, buttonCta: 60, buttonSos: 64, buttonCompact: 48, input: 48, appBar: 56, tabBar: 64, pill: 26, filterChip: 44, sosButton: 112, recordButton: 96 },
  web: { button: 40, buttonCompact: 36, buttonLarge: 44, input: 40, topBar: 60, sidebar: 228, pill: 26, filterChip: 32 },
  marker: { report: 30, reportCritical: 34, unit: 28 },
  icon: { xs: 14, sm: 16, md: 18, lg: 20, xl: 22 },
} as const;

export const radius = { xs: 4, sm: 6, unit: 7, md: 9, 'input-m': 10, lg: 12, xl: 14, '2xl': 16, full: 9999 } as const;

/* --------------------------------------------------------------- shadows */
export const shadow = {
  light: { 'marker': '0 2px 6px rgba(14, 27, 44, 0.35)', 'popover': '0 8px 24px rgba(14, 27, 44, 0.22)', 'dialog': '0 24px 64px rgba(14, 27, 44, 0.40)', 'dialog-admin': '0 24px 64px rgba(11, 20, 32, 0.45)', 'sensitive': '0 24px 72px rgba(0, 0, 0, 0.60)' },
  dark: { 'marker': '0 2px 6px rgba(0, 0, 0, 0.60)', 'popover': '0 8px 24px rgba(0, 0, 0, 0.50)', 'dialog': '0 24px 64px rgba(0, 0, 0, 0.60)', 'dialog-admin': '0 24px 64px rgba(0, 0, 0, 0.65)', 'sensitive': '0 24px 72px rgba(0, 0, 0, 0.70)' },
} as const;
export type ShadowToken = keyof typeof shadow.light;

/** For renderers without CSS box-shadow (NativeWind v4, react-native-svg overlays). */
export const shadowNative = {
  light: {
    marker: { shadowColor: '#0E1B2C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 3, elevation: 3 },
    popover: { shadowColor: '#0E1B2C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 8 },
    dialog: { shadowColor: '#0E1B2C', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.4, shadowRadius: 32, elevation: 24 },
  },
  dark: {
    marker: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 3, elevation: 3 },
    popover: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
    dialog: { shadowColor: '#000000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.6, shadowRadius: 32, elevation: 24 },
  },
} as const;

export const motion = { fast: 150, dialog: 200, dialogRise: 8, livePulse: 2000 } as const;

/* ------------------------------------------------------- maps & charts */
export const heat = { thresholds: [0.2, 0.4, 0.6, 0.8] as const, steps: ['heat-1', 'heat-2', 'heat-3', 'heat-4', 'heat-5'] as const };

/** Bucket a cell count (0..max) into heat step 1–5. */
export const heatStep = (count: number, max: number) =>
  (heat.thresholds.findIndex((t) => count / Math.max(max, 1) <= t) + 1 || 5) as 1 | 2 | 3 | 4 | 5;

function mapFor(s: Scheme) {
  const c = color[s];
  return {
    ground: c['map-ground'], building: c['map-building'], park: c['map-park'], water: c['map-water'],
    roadMajor: c['map-road-major'], roadMinor: c['map-road-minor'], label: c['map-label'], labelHalo: c['map-label-halo'],
    markerStroke: c['marker-stroke'], markerSelected: c['marker-selected'], criticalHalo: c['marker-critical-halo'],
    marker: {
      critical: { fill: c['marker-critical-fill'], icon: c['marker-critical-icon'] },
      high: { fill: c['marker-high-fill'], icon: c['marker-high-icon'] },
      medium: { fill: c['marker-medium-fill'], icon: c['marker-medium-icon'] },
      low: { fill: c['marker-low-fill'], icon: c['marker-low-icon'] },
    },
    unitStroke: c['unit-marker-stroke'],
    unit: {
      available: { fill: c['unit-available-fill'], icon: c['unit-available-icon'] },
      busy: { fill: c['unit-busy-fill'], icon: c['unit-busy-icon'] },
      offline: { fill: c['unit-offline-fill'], icon: c['unit-offline-icon'] },
    },
    alertCircle: { fill: c['alert-circle-fill'], stroke: c['alert-circle-stroke'], dash: [6, 4] as const, width: 2 },
    heat: heat.steps.map((k) => ({ fill: c[k], label: c[`${k}-fg` as ColorToken] })),
  };
}
export const mapTokens = { light: mapFor('light'), dark: mapFor('dark') };

function chartFor(s: Scheme) {
  const c = color[s];
  return {
    series: [c['chart-1'], c['chart-2'], c['chart-3'], c['chart-4'], c['chart-5'], c['chart-6']],
    severity: { critical: c['sev-critical-solid'], high: c['sev-high-solid'], medium: c['sev-medium-solid'], low: c['sev-low-solid'] },
    availability: { available: c['avail-available-solid'], busy: c['avail-busy-solid'], offline: c['avail-offline-solid'] },
    grid: c['chart-grid'], axis: c['chart-axis'], track: c['chart-track'], label: c.foreground,
    tooltip: { bg: c['chart-tooltip-bg'], border: c['chart-tooltip-border'] },
  };
}
export const chartTokens = { light: chartFor('light'), dark: chartFor('dark') };
```

Use the TS values wherever a `className` cannot reach:
- react-native-svg `fill` / `stroke`
- `ActivityIndicator` / `RefreshControl` `color`
- `StatusBar`
- MapLibre paint properties (§10)
- Recharts or Victory props on native (§11)
- `expo-system-ui` background colour

### 9.3 Generating the CSS

```ts
// packages/config/scripts/build-css.ts — run: pnpm --filter @istigaba/config build:css
import { writeFileSync, mkdirSync } from 'node:fs';
import { color, appOverrides, shadow, radius, font, type Scheme } from '../src/tokens';

const decl = (m: Record<string, string>, pad = '  ') =>
  Object.entries(m).map(([k, v]) => `${pad}--${k}: ${v};`).join('\n');
const shadows = (s: Scheme) => Object.fromEntries(Object.entries(shadow[s]).map(([k, v]) => [`shadow-${k}`, v]));
const vars = (s: Scheme) => ({ ...color[s], ...shadows(s) });

// Utility mapping shared by web and native: bg-sev-critical-bg, text-muted-foreground, shadow-dialog, rounded-lg …
const themeMap = `@theme inline {
${Object.keys(color.light).map((k) => `  --color-${k}: var(--${k});`).join('\n')}
${Object.keys(shadow.light).map((k) => `  --shadow-${k}: var(--shadow-${k});`).join('\n')}
${Object.entries(radius).filter(([k]) => k !== 'full').map(([k, v]) => `  --radius-${k}: ${v}px;`).join('\n')}
}`;

const admin = appOverrides.admin!;

// Web (Tailwind 4 + shadcn): light on :root, dark on .dark, admin via [data-app="admin"]
const web = `/* GENERATED from @istigaba/config/src/tokens.ts — do not edit */
:root {
  color-scheme: light;
  --radius: 0.75rem;
  --font-arabic: ${font.web.arabic};
  --font-latin: ${font.web.latin};
  --font-mono: ${font.web.mono};
  --font-active: var(--font-latin);
  --leading-body: 1.5;
${decl(vars('light'))}
}
.dark {
  color-scheme: dark;
${decl(vars('dark'))}
}
[data-app="admin"] {
${decl(admin.light as Record<string, string>)}
}
.dark[data-app="admin"] {
${decl(admin.dark as Record<string, string>)}
}
:root:lang(ar) { --font-active: var(--font-arabic); --leading-body: 1.6; }

${themeMap}
@theme inline {
  --font-sans: var(--font-active);
  --font-latin: var(--font-latin);
  --font-arabic: var(--font-arabic);
  --font-mono: var(--font-mono);
}
`;

// Native (NativeWind v5): light on :root, dark via prefers-color-scheme (driven by Appearance)
const nativeFonts = (['ar', 'en'] as const).flatMap((l) =>
  Object.entries(font.native[l]).map(([w, f]) => `  --font-${l}-${w}: "${f}";`));
const native = `/* GENERATED from @istigaba/config/src/tokens.ts — do not edit */
:root {
${decl(vars('light'))}
}
@media (prefers-color-scheme: dark) {
  :root {
${decl(vars('dark'), '    ')}
  }
}

${themeMap}
@theme {
${nativeFonts.join('\n')}
}
`;

mkdirSync('css', { recursive: true });
writeFileSync('css/theme.web.css', web);
writeFileSync('css/theme.native.css', native);
```

`packages/config/package.json` must export the CSS and the TS source:

```json
{
  "name": "@istigaba/config",
  "exports": {
    ".": "./src/index.ts",
    "./tokens": "./src/tokens.ts",
    "./css/*": "./css/*",
    "./tailwind-preset": "./tailwind-preset.js"
  },
  "scripts": { "build:css": "tsx scripts/build-css.ts" }
}
```

The generated web file is the `:root`, `.dark`, admin and `@theme inline` content shown in §8. The generated `@theme inline` additionally maps the map, marker, heat, chart and mobile-chrome variables and the `rounded-input-m` radius, so `fill-marker-critical-fill`, `bg-heat-3` and `bg-field-header` also exist. Commit the generated files, and add a CI check that fails when `build:css` produces a diff.

### 9.4 NativeWind v5 + Tailwind CSS 4 (target)

`apps/mobile-*/global.css`:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";
@import "@istigaba/config/css/theme.native.css";

/* scan shared components */
@source "../../packages/ui/src";
```

`metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

module.exports = withNativewind(getDefaultConfig(__dirname));
```

`postcss.config.mjs` (Expo 57 does not discover `.cjs`):

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

Other setup:
- **Pin lightningcss:** set `lightningcss` to `1.30.1` in package-manager overrides.
- **Babel:** remove `nativewind/babel` and the NativeWind `jsxImportSource`; keep `babel-preset-expo`.
- **app.json:** set `"userInterfaceStyle": "automatic"`, otherwise Expo ignores the system appearance.

Theme provider (shared, `packages/ui/src/theme/ThemeProvider.tsx`):

```tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { colorsFor, type AppId, type Scheme, type ThemePreference } from '@istigaba/config';

const Ctx = createContext<{ scheme: Scheme; app: AppId }>({ scheme: 'light', app: 'citizen' });

export function ThemeProvider({ preference, app, children }: { preference: ThemePreference; app: AppId; children: ReactNode }) {
  // Drives @media (prefers-color-scheme) in theme.native.css. 'unspecified' = follow the system (Expo 57).
  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return <Ctx.Provider value={{ scheme, app }}>{children}</Ctx.Provider>;
}

export const useScheme = () => useContext(Ctx).scheme;
/** JS values for props that cannot take className. */
export const useTokens = () => {
  const { scheme, app } = useContext(Ctx);
  return colorsFor(scheme, app);
};
```

Things to know on v5:
- **Dark switching:** themes switch through the media query, so no variable is overridden at runtime and nothing needs excluding from compiler inlining.
- **Runtime overrides:** if you later override variables with `VariableContextProvider` (for example a per-unit accent), list those variables in `inlineVariables.exclude` in `metro.config.js`.
- **Shadows:** these use React Native `boxShadow`, so the `shadow-*` utilities map directly; this needs the New Architecture, which is the Expo default.
- **Placeholders:** `placeholderClassName` is gone; use `className="placeholder:text-text-placeholder"` on `TextInput`.
- **Lengths:** any length in a CSS variable needs a unit (`"9px"`, not `"9"`). The generator already writes `px`.
- **Verify early:** on the first device build, check that toggling `Appearance` flips a `bg-background` view. The dark palette depends on media-query support for `:root` variables in the v5 release candidate.

### 9.5 NativeWind v4 + Tailwind CSS 3 (stable fallback)

Tailwind 3 cannot read `@theme`, so v4 uses a JS preset built from the same tokens, and runtime variables come from `vars()`.

`packages/config/tailwind-preset.js`:

```js
// CommonJS for tailwind.config.js. tsx/jiti loads the TS source.
const { color, radius, font } = require('./src/tokens');
const toVar = (keys) => Object.fromEntries(keys.map((k) => [k, `var(--${k})`]));

module.exports = {
  darkMode: 'class', // required by colorScheme.set()
  theme: {
    extend: {
      colors: toVar(Object.keys(color.light)), // bg-sev-critical-bg, text-muted-foreground …
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, `${v}px`])),
      fontFamily: Object.fromEntries(
        ['ar', 'en'].flatMap((l) => Object.entries(font.native[l]).map(([w, f]) => [`${l}-${w}`, [f]])),
      ),
    },
  },
};
```

`apps/mobile-*/tailwind.config.js`:

```js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), require('@istigaba/config/tailwind-preset')],
};
```

Theme provider for v4 (same API as §9.4, so screens don't change):

```tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { vars, useColorScheme, colorScheme } from 'nativewind';
import { colorsFor, cssVars, type AppId, type Scheme, type ThemePreference } from '@istigaba/config';

const Ctx = createContext<{ scheme: Scheme; app: AppId }>({ scheme: 'light', app: 'citizen' });
export const useScheme = () => useContext(Ctx).scheme;
export const useTokens = () => { const { scheme, app } = useContext(Ctx); return colorsFor(scheme, app); };

const themes = {
  light: vars(cssVars('light')),
  dark: vars(cssVars('dark')),
};

export function ThemeProvider({ preference, app, children }: { preference: ThemePreference; app: AppId; children: ReactNode }) {
  useEffect(() => colorScheme.set(preference), [preference]); // 'system' | 'light' | 'dark'
  const scheme = useColorScheme().colorScheme === 'dark' ? 'dark' : 'light';
  return (
    <Ctx.Provider value={{ scheme, app }}>
      <View style={themes[scheme]} className="flex-1 bg-background">{children}</View>
    </Ctx.Provider>
  );
}
```

Things to know on v4:
- **Opacity modifiers:** variables hold full colours (`#9B1C1C`, `rgba(…)`), so modifiers like `bg-primary/50` do not work on v4. Use the explicit state tokens (`bg-state-hover`, `bg-scrim`) instead. Tailwind 4 on web and v5 handle modifiers through `color-mix`.
- **Shadows:** v4 does not map CSS `box-shadow`; use `style={shadowNative[scheme].dialog}`.
- **Portals:** bottom sheets, toasts and `Modal` hosts mounted outside the themed `View` do not inherit `vars()`. Wrap their content in `<View style={themes[scheme]}>`.

### 9.6 Shared primitives (`packages/ui`)

Text picks the font family per language and weight, because React Native cannot select a weight inside a custom family, and it sets an absolute line height:

```tsx
import { Platform, Text as RNText, type TextProps } from 'react-native';
import { font, typeScale, lineHeightPx, type TypeVariant, type Weight } from '@istigaba/config';
import { useLang } from '../i18n';

export function Text({ variant = 'body-lg', weight, style, ...p }: TextProps & { variant?: TypeVariant; weight?: Weight }) {
  const lang = useLang();
  const t = typeScale[variant];
  const fam = font.native['latin' in t ? 'en' : lang][weight ?? t.weight];
  return (
    <RNText
      {...p}
      className={`text-foreground ${p.className ?? ''}`}
      style={[{ fontFamily: fam, fontSize: t.size, lineHeight: lineHeightPx(variant, lang), letterSpacing: 'tracking' in t ? t.tracking : 0 }, style]}
    />
  );
}

/** Numbers, IDs, coordinates, times: Inter, tabular, always LTR. */
export function Num({ style, ...p }: TextProps) {
  return <Text {...p} weight={600} style={[{ fontFamily: font.native.en[600], fontVariant: ['tabular-nums'], writingDirection: 'ltr' }, style]} />;
}
```

Severity pill. Class names must be literal strings, so Tailwind can find them:

```tsx
import { View } from 'react-native';
import { OctagonAlert, TriangleAlert, CircleAlert, Info } from 'lucide-react-native';
import { severityMeta, type ColorToken, type Severity } from '@istigaba/config';
import { Text } from './Text';
import { useTokens } from '../theme/ThemeProvider';
import { useLang } from '../i18n';

const CLS: Record<Severity, string> = {
  critical: 'bg-sev-critical-bg border-sev-critical-border',
  high: 'bg-sev-high-bg border-sev-high-border',
  medium: 'bg-sev-medium-bg border-sev-medium-border',
  low: 'bg-sev-low-bg border-sev-low-border',
};
const FG: Record<Severity, string> = {
  critical: 'text-sev-critical-fg', high: 'text-sev-high-fg', medium: 'text-sev-medium-fg', low: 'text-sev-low-fg',
};
const ICON = { critical: OctagonAlert, high: TriangleAlert, medium: CircleAlert, low: Info };

export function SeverityPill({ level, prefix = false }: { level: Severity; prefix?: boolean }) {
  const lang = useLang();
  const t = useTokens();
  const Icon = ICON[level];
  const label = severityMeta[level].label[lang];
  return (
    <View accessibilityRole="text" accessibilityLabel={label} className={`h-[26px] flex-row items-center gap-1.5 self-start rounded-full border px-2.5 ${CLS[level]}`}>
      <Icon size={14} color={t[`sev-${level}-fg` as ColorToken]} aria-hidden />
      <Text variant="caption" weight={700} className={FG[level]}>{prefix ? (lang === 'ar' ? 'الخطورة: ' : 'Severity: ') : ''}{label}</Text>
    </View>
  );
}
```

The same pattern covers `AvailabilityPill` (`avail-*`), `StatusChip` (`status-{progress|done|closed}-*` through `statusTone`), `AnonymousPill` (`anon-*`), `Callout` (`callout-*`) and `RolePill` (`role-*`).

### 9.7 Mobile notes

- **Fonts:** load all eight families at startup with `expo-font` (`@expo-google-fonts/ibm-plex-sans-arabic`, `@expo-google-fonts/inter`) and keep the splash screen up until they load.
- **RTL:** on language change, call `I18nManager.allowRTL(true)` and `I18nManager.forceRTL(lang === 'ar')`, then reload.
  - Use `ms-*` / `me-*` / `ps-*` / `pe-*` / `start-*` / `end-*` utilities, never `ml-*` / `mr-*`.
  - Back arrows and forward chevrons flip with `rtl:-scale-x-100`.
  - Maps, coordinates, numbers and waveforms never mirror.
- **Field app header:** always `bg-field-header`, so set the status bar to `light` on screens with that header, whatever the scheme.
- **Elsewhere:** the status bar follows `useScheme()`, and `expo-system-ui` `setBackgroundColorAsync(tokens.background)` avoids a white flash on Android.
- **Touch targets:** at least 44 × 44. Use `hitSlop` when a visible control (26 px pill, 24 px checkbox) is smaller.
- **Preference storage:** save `ThemePreference` under `THEME_STORAGE_KEY` (`istigaba-theme`) with MMKV or AsyncStorage, and pass it into `ThemeProvider`. The default is `'system'`.

---

## 10. Maps: Leaflet / MapLibre

### 10.1 Basemap colours

| Token | Light | Dark |
|---|---|---|
| `map.ground` | `#DDE5EE` | `#141D2B` |
| `map.building` | `#CFD9E4` | `#1C2738` |
| `map.park` | `#C5DBC5` | `#17302A` |
| `map.water` | `#B5D0EA` | `#1A3550` |
| `map.roadMajor` | `#FFFFFF` | `#2C3A4F` |
| `map.roadMinor` | `#F1F4F8` | `#222E40` |
| `map.label` / `map.labelHalo` | `#4A5A70` / `#DDE5EE` | `#A3B1C4` / `#0B1220` |

MapLibre (vector): apply these to your style's `background`, `water`, `landuse`/`park`, `building`, `road-*` and symbol layers (`text-color`, `text-halo-color`, `text-halo-width: 1.2`). Layer ids depend on the basemap schema.

```ts
import { mapTokens } from '@istigaba/config'; // §9.2
export function applyBasemap(map: maplibregl.Map, scheme: 'light' | 'dark') {
  const m = mapTokens[scheme];
  map.setPaintProperty('background', 'background-color', m.ground);
  map.setPaintProperty('water', 'fill-color', m.water);
  map.setPaintProperty('park', 'fill-color', m.park);
  map.setPaintProperty('building', 'fill-color', m.building);
  map.setPaintProperty('road-major', 'line-color', m.roadMajor);
  map.setPaintProperty('road-minor', 'line-color', m.roadMinor);
  map.setPaintProperty('place-label', 'text-color', m.label);
  map.setPaintProperty('place-label', 'text-halo-color', m.labelHalo);
}
```

Leaflet (raster): raster tiles cannot be recoloured. Configure one light and one dark tile source per deployment and swap the tile layer on theme change. Do not use CSS `filter: invert()`, which inverts the marker colours too.

### 10.2 Report markers (severity)

| Property | Value |
|---|---|
| Shape | Circle |
| Size | `critical` 34 px; `high`, `medium`, `low` 30 px |
| Fill / icon | `--marker-{level}-fill` / `--marker-{level}-icon` (icon 14 px, stroke 2.4, the report-category icon: `flame`, `car`, `shield`, `heart-pulse`, `siren` for SOS) |
| Stroke | 3 px `--marker-stroke` |
| Shadow | `--shadow-marker` |
| Critical halo | `0 0 0 6px var(--marker-critical-halo)` |
| Selected | `outline: 3px solid var(--marker-selected); outline-offset: 3px` |
| Accessibility | Real `<button>` with `aria-label="<type>, <area> · <severity label>"` |

### 10.3 Unit markers (availability)

| Property | Value |
|---|---|
| Shape | Rounded square, 28 px, radius 7 px |
| Fill / icon | `--unit-{level}-fill` / `--unit-{level}-icon` (icon `car`, 14 px) |
| Stroke | 3 px `--unit-marker-stroke` |
| Accessibility | `aria-label="<unit name> · <availability label>"` |

Shared CSS for Leaflet `divIcon` (set `iconSize` to 34/30/28 and `iconAnchor` to half):

```css
.ist-marker { display: grid; place-items: center; box-sizing: border-box; width: 30px; height: 30px;
  border-radius: 9999px; border: 3px solid var(--marker-stroke); box-shadow: var(--shadow-marker); cursor: pointer; padding: 0; }
.ist-marker--critical { width: 34px; height: 34px; background: var(--marker-critical-fill); color: var(--marker-critical-icon);
  box-shadow: 0 0 0 6px var(--marker-critical-halo), var(--shadow-marker); }
.ist-marker--high   { background: var(--marker-high-fill);   color: var(--marker-high-icon); }
.ist-marker--medium { background: var(--marker-medium-fill); color: var(--marker-medium-icon); }
.ist-marker--low    { background: var(--marker-low-fill);    color: var(--marker-low-icon); }
.ist-marker[aria-pressed="true"] { outline: 3px solid var(--marker-selected); outline-offset: 3px; }

.ist-unit { display: grid; place-items: center; box-sizing: border-box; width: 28px; height: 28px;
  border-radius: 7px; border: 3px solid var(--unit-marker-stroke); box-shadow: var(--shadow-marker); }
.ist-unit--available { background: var(--unit-available-fill); color: var(--unit-available-icon); }
.ist-unit--busy      { background: var(--unit-busy-fill);      color: var(--unit-busy-icon); }
.ist-unit--offline   { background: var(--unit-offline-fill);   color: var(--unit-offline-icon); }
```

MapLibre layer markers use the same tokens through data-driven expressions:

```ts
const m = mapTokens[scheme];
map.setPaintProperty('reports', 'circle-color',
  ['match', ['get', 'severity'], 'critical', m.marker.critical.fill, 'high', m.marker.high.fill, 'medium', m.marker.medium.fill, m.marker.low.fill]);
map.setPaintProperty('reports', 'circle-radius', ['match', ['get', 'severity'], 'critical', 17, 15]);
map.setPaintProperty('reports', 'circle-stroke-color', m.markerStroke);
map.setPaintProperty('reports', 'circle-stroke-width', 3);
```

### 10.4 Geographic alert circle

| Token | Light | Dark |
|---|---|---|
| `--alert-circle-fill` | `rgba(155,28,28,0.16)` | `rgba(240,98,93,0.18)` |
| `--alert-circle-stroke` | `#9B1C1C`, 2 px, dash `6 4` | `#F0625D`, 2 px, dash `6 4` |
| Centre dot | 14 px `--sev-critical-solid`, 3 px `--marker-stroke` | same |
| Radius label | `--surface-raised` card, 12/700, `.num` | same |

### 10.5 Heat map (statistics)

The map shows aggregated cells (server `cell_size_m`, default shown as 500 m). Each cell is filled with one of five steps by count relative to the maximum, and the cell label uses the matching `-fg`.

| Step | Count share | Light fill / label | Dark fill / label |
|---|---|---|---|
| `--heat-1` | ≤ 20 % | `#D0BDC4` / `#5A0F0F` (7.79:1) | `#3A1E28` / `#FFFFFF` (15.04:1) |
| `--heat-2` | ≤ 40 % | `#C69FA5` / `#5A0F0F` (5.90:1) | `#6A2530` / `#FFFFFF` (10.94:1) |
| `--heat-3` | ≤ 60 % | `#BF8B90` / `#5A0F0F` (4.84:1) | `#A1323A` / `#FFFFFF` (6.92:1) |
| `--heat-4` | ≤ 80 % | `#AF585B` / `#FFFFFF` (4.81:1) | `#D9534D` / `#1A0505` (4.96:1) |
| `--heat-5` | > 80 % | `#A23031` / `#FFFFFF` (6.99:1) | `#FF8A7A` / `#1A0505` (8.59:1) |

The legend shows the five swatches between the labels "أقل / Fewer" and "أكثر / More". Cells always show their number, so the scale never depends on colour alone. Light fills are the shipped `rgba(155,28,28,α)` ramp over `#DDE5EE` at α = 0.20, 0.35, 0.45, 0.70 and 0.90, as solid colours.

---

## 11. Charts: Recharts

On web, pass CSS variables straight into Recharts props (`fill="var(--sev-critical-solid)"`), as shadcn's chart component does. On native or canvas renderers, use `chartTokens[scheme]` from `@istigaba/config` (§9.2).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` … `--chart-6` | `#0F2A47` `#0B57B0` `#C2410C` `#17703F` `#7E3AA8` `#5B6878` | `#7FB2F0` `#F08A4B` `#34C77B` `#C9A0F0` `#E9B949` `#A3B1C4` | Categorical series in this order (category, source) |
| Severity series | `--sev-*-solid` | `--sev-*-solid` | Severity breakdowns: always the severity colours, never categorical |
| Availability series | `--avail-*-solid` | `--avail-*-solid` | Unit availability breakdowns |
| `--chart-grid` | `#E3E8EE` | `#253247` | `CartesianGrid` stroke, dash `3 3` |
| `--chart-axis` | `#566579` | `#97A5B8` | Tick text, 12 px, `.num` |
| `--chart-track` | `#EEF1F5` | `#1C2738` | Bar tracks / progress background |
| `--chart-tooltip-bg` / `-border` | `#FFFFFF` / `#D5DDE6` | `#1A2537` / `#2C3A4F` | Tooltip, `--shadow-popover`, radius 9 |

All series colours are at least 5.18:1 against the card in both modes (§12).

```tsx
<BarChart layout="vertical" data={bySeverity}>
  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" horizontal={false} />
  <XAxis type="number" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} reversed={dir === 'rtl'} />
  <YAxis type="category" dataKey="label" orientation={dir === 'rtl' ? 'right' : 'left'} tick={{ fill: 'var(--foreground)', fontSize: 13 }} width={120} />
  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 9, boxShadow: 'var(--shadow-popover)' }} />
  <Bar dataKey="value" radius={4} background={{ fill: 'var(--chart-track)', radius: 4 }} label={{ position: 'insideEnd', fill: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>
    {bySeverity.map((d) => <Cell key={d.level} fill={`var(--sev-${d.level}-solid)`} />)}
  </Bar>
</BarChart>
```

Chart rules:

- **Value labels:** every bar carries one.
- **Line series:** charts with more than one line series also differ by line style (solid, dashed, dotted).
- **Fallback data:** a data table follows each chart for screen readers.
- **RTL:** reverse the value axis and place category labels on the right.

---

## 12. Contrast audit

WCAG 2.x relative-luminance contrast, computed for every pair below. Text needs 4.5:1; UI, graphics and large text need 3:1.

### 12.1 Light (shipped values)

| Pair | Ratio |
|---|---|
| `#0E1B2C` on `#FFFFFF` / `#F3F5F8` | 17.33 / 15.87 |
| `#3D4D63` on `#FFFFFF` / `#F3F5F8` / `#EEF1F5` | 8.61 / 7.88 / 7.60 |
| `#566579` on `#FFFFFF` / `#F3F5F8` / `#EEF1F5` | 5.94 / 5.44 / 5.25 |
| `#5D6C80` placeholder on `#FFFFFF` | 5.35 |
| `#8493A6` input border on `#FFFFFF` | 3.13 |
| `#0B57B0` link / focus on `#FFFFFF` / `#F3F5F8` | 6.99 / 6.40 |
| `#FFFFFF` on `#0F2A47` primary | 14.56 |
| `#FFFFFF` on `#B3261E` destructive | 6.54 |
| Severity pills: critical / high / medium / low | 8.15 / 5.18 / 9.43 / 8.82 |
| Availability pills: available / busy / offline | 6.13 / 5.18 / 5.68 |
| Status chips: progress / done / closed | 11.99 / 6.89 / 6.98 |
| Anonymous pill `#FFFFFF` on `#1F2937` | 14.68 |
| Callouts: info / warning / danger / success | 11.99 / 12.40 / 9.69 / 6.89 |
| `#D5DFEC` on `#0F2A47` / `#0B1420` (sidebar subtitle) | 10.81 / 13.74 |
| `#FFB4AB` restricted on `#0B1420` | 10.90 |
| `#4A5A70` map label on `#DDE5EE` | 5.53 |
| Markers vs map: critical / high / medium* / low* | 6.41 / 4.07 / 3.02 / 4.71 |
| Units vs map: available / busy / offline | 4.82 / 4.07 / 4.47 |
| Chart severity solids on card: critical / high / medium* / low* | 8.15 / 5.18 / 3.84 / 5.99 |
| Chart categorical c1–c6 on card | 14.56 / 6.99 / 5.18 / 6.13 / 6.87 / 5.68 |

`*` = corrected value from §3. Shipped `#FCD34D` / `#D8E2EE` markers measured 1.13 / 1.03, and the `#D9A106` bar 2.32.

### 12.2 Dark (new)

| Pair | Ratio |
|---|---|
| `#EEF2F7` on `#0B1220` / `#131C2B` / `#1A2537` | 16.65 / 15.20 / 13.70 |
| `#B9C5D4` on `#131C2B` / `#1A2537` / `#1C2738` | 9.77 / 8.80 / 8.59 |
| `#97A5B8` on `#0B1220` / `#131C2B` / `#1A2537` / `#1C2738` | 7.48 / 6.83 / 6.15 / 6.01 |
| `#8796AB` placeholder on `#131C2B` | 5.68 |
| `#6E7F97` input border on `#131C2B` / `#1A2537` | 4.19 / 3.77 |
| `#8AB4F8` primary/link/focus on `#131C2B` / `#1A2537` / `#0B1220` | 8.11 / 7.31 / 8.88 |
| `#0B1A2E` on `#8AB4F8` / hover `#A3C4FA` / pressed `#7AA6EE` | 8.29 / 9.85 / 7.09 |
| `#FFFFFF` on `#B83A31` destructive / hover `#A3322A` | 5.69 / 6.89 |
| `#FF9C94` danger text on `#131C2B` / `#1A2537` | 8.49 / 7.65 |
| Severity pills: critical / high / medium / low | 10.11 / 9.35 / 8.77 / 9.80 |
| Severity pill borders on card: critical / high / medium / low | 5.38 / 6.87 / 9.36 / 6.78 |
| Availability pills: available / busy / offline | 9.26 / 9.35 / 8.63 |
| Status chips: progress / done / closed | 9.76 / 9.83 / 8.63 |
| Anonymous pill `#0E1B2C` on `#E5E9F0` / banner `#EEF2F7` on `#273244` | 14.23 / 11.49 |
| Callouts: info / warning / danger / success | 11.52 / 11.11 / 11.87 / 10.86 |
| Sidebar text `#E4EBF4` on `#04070C`; subtitle `#B9C5D4` on `#0C1D31` / `#04070C` | 16.80 / 9.71 / 11.53 |
| Active nav `#0C1D31` on `#E4EBF4` | 14.15 |
| SOS `#FFFFFF` on `#7A1515`; reveal header `#FFFFFF` on `#8E1B1B` | 10.79 / 9.04 |
| Map label `#A3B1C4` on `#141D2B` | 7.77 |
| Markers vs map: critical / high / medium / low | 5.33 / 6.81 / 9.27 / 6.71 |
| Marker icons on fill: critical / high / medium / low | 6.19 / 7.73 / 10.11 / 7.47 |
| Units vs map: available / busy / offline | 7.74 / 6.81 / 4.95 |
| Chart series on card: c1–c6 | 7.76 / 6.87 / 7.81 / 7.95 / 9.36 / 7.85 |

No dark pair falls below its threshold. Disabled text (`#8493A6` on `#EEF1F5` 2.76, `#5B6C84` on `#1C2738` 2.81) is exempt under WCAG 1.4.3. Callout borders and the success-callout border are decorative; the callout text carries the meaning.
