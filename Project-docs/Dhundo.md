# Internal Bug Tracking System — Project Plan

## 1. Overview
An internal company application that lets any employee, verified via their **office ID**, report and track bugs found in projects and applications built by the company. Available on **Windows, iOS, and Android**.

---

## 2. User Roles

| Role | Permissions |
|---|---|
| **Employee** | Submit bugs, view/comment on their own reports, track status |
| **Developer / QA** | View bugs assigned to their project(s), triage, update status, comment |
| **Admin** | Manage office ID whitelist, projects list, user roles; full visibility across all bugs |

---

## 3. Authentication

- Login restricted to employees with a valid **office ID**
- Two supported approaches:
  1. **Pre-seeded office ID table** — Admin uploads/enters valid office IDs; employee registers with office ID + password, validated against the table
  2. **SSO / domain-restricted OAuth** — if the company already uses Google Workspace or Microsoft 365, restrict login to the company domain (no password management needed)
- Session handling: JWT access + refresh tokens
- Passwords (if not using SSO): hashed with bcrypt
- Secure token storage per platform: Keychain (iOS), Keystore (Android), Credential Locker (Windows)

---

## 4. Core Features

- **Project/App registry** — list of all company-built projects bugs can be filed against
- **Bug submission** — title, description, steps to reproduce, severity (Low / Medium / High / Critical), screenshots/attachments, environment (OS/device/browser)
- **Status workflow** — Open → In Progress → In Review → Resolved → Closed (+ Reopened)
- **Assignment** — assign bugs to specific developers or teams
- **Comments & activity log** per bug
- **Notifications** — in-app + push (mobile) / toast (Windows) on assignment, comments, or status change
- **Dashboard** — filter by project, severity, status, assignee; basic analytics (open vs resolved, avg. resolution time)
- **Search** — full-text search across bug titles/descriptions

---

## 5. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile (iOS + Android) | **React Native** | Single codebase for both platforms |
| Windows Desktop | **React Native for Windows** | Microsoft's official extension; reuses ~80–90% of the RN codebase |
| Shared logic | Common `shared` package (API client, types, state) | Monorepo via Turborepo or Nx |
| Backend | **Node.js + Express** | REST API |
| Database | **MySQL** | Relational data — users, projects, bugs, comments |
| ORM | Prisma or Sequelize (both support MySQL) |
| File storage | AWS S3 / Cloudflare R2 | Screenshots & attachments |
| State management | Redux Toolkit or Zustand | Shared across platforms |
| Navigation | React Navigation | Mobile + supported on RN-Windows |
| Push/Toast notifications | Firebase Cloud Messaging (Android), APNs (iOS), Windows toast notifications, or OneSignal as a unified wrapper |
| Auth | JWT + bcrypt, or OAuth2 (Google Workspace) |
| Hosting | Backend: Render / Railway / EC2 · DB: managed MySQL (PlanetScale / RDS / Aiven) |

### Suggested Repo Structure
```
/apps
  /mobile        → React Native (iOS + Android)
  /windows       → React Native for Windows
  /backend       → Node.js + Express API
/packages
  /shared        → API client, types, business logic, state
  /ui            → Shared component library
```

---

## 6. Database Schema (High Level — MySQL)

**users**
`id, name, office_id, email, role, password_hash, created_at`

**projects**
`id, name, description, repo_url, created_at`

**bugs**
`id, project_id (FK), reporter_id (FK), assignee_id (FK), title, description, severity, status, created_at, updated_at`

**bug_comments**
`id, bug_id (FK), user_id (FK), comment, created_at`

**bug_attachments**
`id, bug_id (FK), file_url, uploaded_at`

---

## 7. Color Theme — "Clean Slate"

A minimal, professional palette that keeps the interface calm and readable across all severity/status indicators, while staying neutral enough for both light and dark mode.

| Purpose | Color | Hex |
|---|---|---|
| Primary (brand/actions) | Slate Blue | `#3A5BA0` |
| Primary Hover/Active | Deep Slate Blue | `#2C4478` |
| Background (light) | Off White | `#F7F8FA` |
| Surface / Cards | White | `#FFFFFF` |
| Border / Divider | Cool Gray | `#E2E5EA` |
| Text Primary | Charcoal | `#1F2430` |
| Text Secondary | Slate Gray | `#6B7280` |
| Success (Resolved) | Muted Green | `#3FA66B` |
| Warning (Medium) | Amber | `#E1A63A` |
| Danger (Critical) | Muted Red | `#D14D4D` |
| Info (In Progress) | Soft Teal | `#3AA0A0` |

**Dark mode variant**
| Purpose | Hex |
|---|---|
| Background | `#14161C` |
| Surface / Cards | `#1E212B` |
| Border / Divider | `#2A2E38` |
| Text Primary | `#F2F3F5` |
| Text Secondary | `#9AA0AC` |
| Primary stays | `#5C7FCB` (lightened for contrast) |

This palette avoids harsh saturated colors, keeps severity/status colors distinguishable but muted (good for daily internal use without visual fatigue), and translates cleanly to both React Native and RN-Windows theming.

---

## 8. Next Steps
- [ ] Finalize office ID validation flow (whitelist vs SSO)
- [ ] Scaffold monorepo (Turborepo/Nx) with `/apps` and `/packages`
- [ ] Set up MySQL schema + ORM models
- [ ] Build backend API (auth, projects, bugs, comments)
- [ ] Build shared UI component library with the theme above
- [ ] Implement mobile app screens
- [ ] Implement Windows app via RN-Windows
- [ ] Set up CI/CD per platform
