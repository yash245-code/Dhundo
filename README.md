# Dhundo 🐛

> Internal bug tracking system — available on **iOS, Android, and Windows Desktop**.

---

## Overview

Dhundo is a cross-platform internal bug tracking application restricted to company employees authenticated via their **Office ID**. Employees can report bugs, developers triage and resolve them, and admins manage users and projects.

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile (iOS + Android) | React Native (Expo) |
| Windows Desktop | React Native for Windows _(Phase 2)_ |
| Shared packages | `@dhundo/shared` (API client, types, Zustand stores), `@dhundo/ui` (component library) |
| Backend | Node.js + Express |
| Database | MySQL + Prisma ORM |
| Auth | JWT (access + refresh) + bcrypt |
| File storage | AWS S3 / Cloudflare R2 |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
/apps
  /backend     → Express API server (port 4000)
  /mobile      → Expo React Native app (iOS + Android)
/packages
  /shared      → Types, API client, Zustand stores, constants
  /ui          → Shared React Native component library (Clean Slate theme)
/Project-docs  → Product documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (installed globally)
- MySQL database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the backend

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets
```

### 3. Run database migrations

```bash
cd apps/backend
pnpm prisma:migrate
pnpm prisma:seed
```

### 4. Start the backend

```bash
pnpm dev --filter=@dhundo/backend
```

### 5. Start the mobile app

```bash
pnpm dev --filter=@dhundo/mobile
# Then scan QR code with Expo Go app
```

## Test Credentials (after seeding)

| Role | Office ID | Password |
|---|---|---|
| Admin | ADM001 | Admin@1234 |
| Developer | DEV001 | Dev@1234 |
| Employee | EMP001 | Emp@1234 |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register with office ID |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/projects` | List all projects |
| POST | `/api/v1/projects` | Create project (Admin) |
| GET | `/api/v1/bugs` | List bugs (filterable) |
| POST | `/api/v1/bugs` | Report a bug |
| GET | `/api/v1/bugs/:id` | Get bug detail |
| PUT | `/api/v1/bugs/:id` | Update bug |
| POST | `/api/v1/bugs/:id/comments` | Add comment |
| POST | `/api/v1/bugs/:id/attachments` | Upload screenshot/attachment |
| GET | `/api/v1/users` | List users (Admin) |
| PATCH | `/api/v1/users/:id/role` | Update user role (Admin) |
| GET | `/api/v1/notifications` | Get notifications |

## Color Theme — "Clean Slate"

| Purpose | Hex |
|---|---|
| Primary | `#3A5BA0` |
| Success | `#3FA66B` |
| Warning | `#E1A63A` |
| Danger | `#D14D4D` |
| Info | `#3AA0A0` |
