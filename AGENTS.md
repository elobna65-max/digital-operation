# AGENTS.md — Digital Operation

Guidance for AI coding agents (and humans) working in this repository.

## Project status — read first

- **This is a greenfield project. There is no source code yet.** As of 2026-11-02 the repository contains only this file.
- The single source of truth for behaviour is the **Business Requirements Document (BRD) v1.0, "Digital Operation", dated 21/10/2026, prepared by True Ventures (truevs.sa)**. It is written in Arabic. The file is not in the repo; ask the project owner for `Digital Operation-221.BRD.docx.pdf`.
- **No tech stack, framework, hosting, map provider, or tooling has been chosen.** Do not invent one silently. When a stack is decided, fill in the [Tech stack & commands](#tech-stack--commands-tbd) section and keep this file current.
- Requirement IDs that exist in the BRD: **FR-01..FR-05** and **N-FR-01..N-FR-05**. Everything else in the BRD is unnumbered "Feature | Description" tables; refer to those by section name (e.g. "BRD › Admin Dashboard › Daily Updates Management").

## What the product is

A single-company digital system for managing and tracking **engineering and field projects** spread across geographic locations. Admins register projects with a location and schedule, assign employees and project managers, and everyone follows progress through **daily updates** with attachments, a **map**, a **calendar**, a **file library**, **reports**, **notifications** and an **audit log**.

## Architecture (as required by the BRD)

```
                ┌───────────────────────────┐
                │  Backend API + database   │  single tenant (one company)
                │  RBAC, status engine,     │  file storage, push, audit log
                │  notifications, reports   │
                └────────────┬──────────────┘
         ┌───────────────────┼────────────────────┐
         │                   │                    │
 Web admin dashboard   Employee mobile app   Project Manager ("Client") mobile app
 (لوحة التحكم)         (واجهة الموظف)         (واجهة العميل) — read-only
```

| Client | Users | Nature |
|---|---|---|
| **Web admin dashboard** | Dashboard admins (incl. built-in **Super Admin**) | Full management, gated by role permissions |
| **Employee app** (mobile) | Field employees | View assigned projects; add today's daily updates with attachments |
| **Project Manager app** (mobile) | Project managers — the BRD calls this the **client** interface | **Strictly read-only** view of assigned projects |

External dependencies named in the BRD:
- **Maps API** (provider not specified): show pins, set location by search or dropped pin, open device maps app for directions.
- **Push notifications** (employee app explicitly; PM app in-app at minimum).
- **Excel export** (admin reports and audit log).
- File storage capable of images, video, PDF, and engineering files (**DWG, KMZ, 3D**).

Explicitly **not** required: SMS, email, multi-tenancy, offline mode, chat, finance, inventory, external PM/accounting integrations, in-app 3D/CAD viewers, self-registration, forgot-password flow.

## Domain model (derived from the BRD)

| Entity | Key points |
|---|---|
| **Project** | Auto-generated unique **code** (immutable). Name, description, classification, location (lat/lng + address), start date, end date, status, archived flag. Never hard-deleted. |
| **Classification** | Name only. Deletable only if no project uses it. Examples: restoration, heritage/archaeological, building construction, surveying. |
| **User** | Name, email (unique), mobile, password, **account type** (`ADMIN` / `EMPLOYEE` / `PROJECT_MANAGER`, immutable after creation), job title (descriptive only, no permission effect), exactly **one role**, active/inactive. Never hard-deleted. |
| **Role** | Name, description, linked account type, permission set. A role can only be assigned to users of its account type. Built-in **Super Admin** cannot be edited or deleted. Roles in use cannot be deleted. |
| **Assignment** | Many-to-many between projects and employees, and between projects and project managers. |
| **DailyUpdate** | Project, author, **update date** (chosen), **actual created-at timestamp** (system), description (required), attachments, **visibility** (`VISIBLE` / `HIDDEN`, hide requires a reason). |
| **File** | Belongs to exactly one project. Name, type, size, uploader, uploaded-at, **source** (`DIRECT_UPLOAD` / `DAILY_UPDATE_ATTACHMENT`). Current version only — no version history. |
| **SuspensionRecord** | Suspend timestamp + admin + mandatory reason; resume timestamp + admin + resulting status. Shown in project details. |
| **Notification** | Recipient, type, title, body, link target, read/unread. |
| **AuditLogEntry** | Actor, action type, module, related project/user, timestamp, before/after data. **Append-only — nobody can edit or delete, not even Super Admin.** |
| **Settings** | Admin-configurable "end date approaching" alert period. |

## Core business rules

These are invariants. Enforce them **on the server**, not only in the UI.

### Project status

Statuses: `NOT_STARTED` (لم يبدأ), `IN_PROGRESS` (جارٍ التنفيذ), `ENDED` (انتهت المدة), `ON_HOLD` (معلق مؤقتًا). **Archived is a separate flag, not a status.**

- `NOT_STARTED` / `IN_PROGRESS` / `ENDED` are **computed from dates** (today < start, start ≤ today ≤ end, today > end) and cannot be set manually.
- `ON_HOLD` is **manual**, allowed **only from `IN_PROGRESS`**, and requires a **reason**. It overrides the computed status until resumed, even if the end date passes.
- Resume needs no reason; status is **recalculated from dates** (may become `ENDED`).
- Editing dates recalculates status unless the project is `ON_HOLD`. Extending the end date of an `ENDED` project returns it to `IN_PROGRESS` if today is within the new period.
- End date must be ≥ start date. Projects may be created with past or future dates.
- Status changes must show immediately on the dashboard, the map and both apps. Plan for a daily date-rollover job (or compute on read) so time-based transitions and "ended" / "approaching end" notifications fire.

### Daily updates

- **Employee**: only on assigned, non-archived projects in `IN_PROGRESS` and within the project period; date is **today only** (not editable); description required; attachments optional and multiple. **Cannot edit or delete** after saving.
- **Admin** (with permission): may choose today or a **past date within the project period**, including for `ENDED` projects. Never a future date.
- **Nobody** can add updates to `ON_HOLD` or archived projects.
- Unlimited updates per project per day; no approval workflow — updates are visible immediately.
- Always store the real author and real created-at timestamp, even for back-dated admin entries.
- Admin edits are audited with before/after values. Admin **hide** = soft delete with a mandatory reason; hidden updates and their attachments disappear for employees and PMs everywhere: lists, calendars, per-day counts, file library, reports, activity log. Restoring brings everything back.

### Access control

- **RBAC (N-FR-02).** Every action requires the role permission; hide UI the user can't use, *and* reject it on the API.
- Admin permissions are per dashboard section and action across 11 sections: Projects, Map, Users, Roles, Daily Updates, Calendar, File Library, Project Status, Reports, Notifications, Audit Log.
- No admin can grant permissions beyond their own.
- Employee role permissions apply to **all** their assigned projects; there are no per-project permissions.
- Employees and PMs see **only assigned, non-archived projects**. Unassignment revokes access **immediately**, but the user's past updates and files stay in the project, attributed to them.
- **Project managers are read-only**, and this cannot be widened by role configuration.
- Deactivated users cannot log in. Their assignments and data are kept.
- **No hard deletes** of projects or users (archive / deactivate instead).
- Passwords: admin reset only (no forgot-password flow); never log or display passwords, including in the audit log. Self-service password change requires the current password plus a matching confirmation. Email change requires uniqueness only (no OTP).
- Employee and PM apps show colleagues' names and roles **without contact details**.

### Files

- Admins upload directly to a project library; employees attach files **only via daily updates**; PMs view and download only.
- Daily-update attachments cannot be replaced or deleted from the library — only by editing the update.
- In-app preview for images, video and PDF; engineering files (DWG, KMZ, 3D) are **download-only**.
- Files of archived projects: admin-only, read-only.

### Notifications

Generated automatically from events, never sent manually.

| Recipient | Events |
|---|---|
| Admin (in dashboard) | New daily update · end date approaching · project ended |
| Employee (in-app + push) | Assigned to project · removed from project · project suspended · project resumed |
| Project Manager (in-app) | New daily update · status change (with suspend reason) · end date approaching · project ended without extension |

All lists are newest-first, with read/unread state, an unread badge, "mark all as read", and a deep link to the project or update — only if the user still has access.

### Reports & logs

- Admin reports cover projects by status and classification, overdue projects, updates per period and project, days without updates, and employee activity. They are filterable and **exportable to Excel**.
- PM reports cover assigned projects only and exclude hidden updates. Employee activity is shown as **counts only, not performance scores**.
- The admin **audit log** is filterable and exportable to Excel, and immutable.
- The PM **activity log** is per assigned project. It excludes internal admin operations (users, roles), is view-only and cannot be exported.
- Every mutating admin action listed in the BRD must write an audit entry. Examples include project CRUD and archive, classifications, assignments, user CRUD and activation, password resets, roles, update edit/hide/restore, file upload/replace/delete, and suspend/resume.

## UX conventions from the BRD

- The source document and all UI labels are **Arabic**. Expect an Arabic, right-to-left (RTL) UI unless told otherwise; confirm whether English is also needed (see open questions).
- Status pins on maps are colour-coded by the four statuses. The colours are not specified yet.
- Exact strings quoted in the BRD:
  - لا توجد مشاريع مسندة إليك حاليًا ("You currently have no assigned projects")
  - مخفي ("Hidden" badge)
  - عرض تفاصيل المشروع ("View project details")
- Lists and searches always have an explanatory empty state.
- Defaults:
  - Project lists in the apps are sorted by latest update first.
  - Project detail pages show the latest 5 updates.
  - The employee app has a "My updates only" filter.
- Only the PM app's logout asks for confirmation.

## Tech stack & commands (TBD)

Nothing has been chosen. When decided, document here:

- Backend language/framework, database, ORM/migrations
- Web dashboard framework; mobile approach (native vs cross-platform; iOS/Android targets)
- Map provider, push provider, file storage
- Install / run / build / lint / test commands for each app
- Repository layout (e.g. `backend/`, `admin-web/`, `mobile/` — or separate employee and PM apps)
- Environment variables and secrets handling

Until then, agents should **ask before introducing frameworks or scaffolding** and should not assume commands exist.

## How agents should work here

1. **Trace to the BRD.** Reference the requirement ID or BRD section in commit messages, PR descriptions and tests for business rules.
2. **Server-side enforcement first.** Status rules, date rules, assignment scoping, read-only PMs, hide visibility and audit logging belong in the backend and must have tests.
3. **Use a single status function.** Compute project status from (start, end, today, onHold) in one place and reuse it everywhere: list, map, filters, reports, notifications.
4. **Soft-delete by design.** Use archive/deactivate/hide flags; never cascade-delete updates or files when a user is unassigned or deactivated.
5. **Never log secrets.** No passwords or tokens in logs or the audit trail.
6. **Don't build out-of-scope features** (see list above) without explicit approval.
7. **Resolve ambiguities by asking,** not guessing — see the next section — and record the decision here.

## Open questions / known BRD ambiguities

Raise these with the project owner before implementing the affected areas.

1. **N-FR-03..N-FR-05 look copied from an e-learning template.** They mention "live sessions" and "students". There are no real performance targets; only 99.9% uptime is stated.
2. **Localization**: Arabic only, or Arabic + English? RTL is not stated explicitly.
3. **Mobile platforms**: iOS, Android or both? One app with two roles, or two separate apps?
4. **Account-type naming**: one place says "Company Manager" (مدير شركة) instead of Project Manager. Probably a typo.
5. **Admin scope**: the file-library section says admins manage files of projects "assigned to them". Are admins project-scoped or global?
6. **File deletion**: is deleting directly uploaded files a hard or soft delete?
7. **Mandatory project fields** are not itemised. Assumed: name, description, classification, location, start date, end date.
8. **Supported engineering formats** beyond DWG/KMZ/"3D", and upload size limits.
9. **Push notifications for the PM app** — not stated explicitly.
10. **PM report export** — not mentioned.
11. **Password policy** (length, complexity, lockout) and session/token lifetime are not specified.
12. **Map provider** and whether its usage costs are acceptable.
