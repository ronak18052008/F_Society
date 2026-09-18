# NESTORA — Backend Architecture & Deployment Guide

This document details the backend architecture, database schemas, Row Level Security (RLS) policies, storage buckets, API routes, real-time listeners, and setup instructions for NESTORA.

---

## Architecture Overview

NESTORA uses a hybrid cloud architecture designed for high security, offline resilience, and zero disruption to the bespoke architectural frontend:

```
┌────────────────────────────────────────────────────────┐
│             NESTORA Frontend (Next.js 16)             │
│   React 19 • App Router • Tailwind v4 • R3F / GSAP    │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Supabase Auth │   │  Postgres DB  │   │  Storage & RT │
│ SSR Cookies   │   │  6 Migrations │   │  3 Buckets    │
│ RLS Protected │   │  Full RLS     │   │  WebSockets   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │ Next.js Route APIs  │
                 ├─────────────────────┤
                 │ • /api/ai/recommend │ (Google Gemini 1.5 Flash)
                 │ • /api/ai/agreement │ (Multimodal Gemini PDF parser)
                 │ • /api/notify/login │ (Resend Email Notifications)
                 │ • /auth/callback    │ (PKCE OAuth & Email exchange)
                 └─────────────────────┘
```

---

## 1. Environment Configuration

Create a `.env.local` file inside the `frontend/` directory based on `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI & Notifications
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_...
SITE_URL=http://localhost:3000
```

> **Offline / Demo Fallback**: If these keys are not set, NESTORA gracefully falls back to local storage and curated architectural mock records (`src/data/demo.ts`), ensuring offline development and preview builds never crash.

---

## 2. Database Migrations

All migrations are located in `supabase/migrations/` and should be applied sequentially in your Supabase project SQL Editor or via Supabase CLI:

### `001_auth_profiles.sql`
- **`profiles`**: Maps to `auth.users` on `id`. Stores `role` (`tenant`, `owner`, `agent`), `full_name`, `phone`, `city`, and preferences.
- **Trigger**: `on_auth_user_created` automatically provisions a profile row upon registration.
- **`saved_properties`**: Tracks user bookmarked properties.
- **`enquiries`**: Tenant property inquiries with RLS restricting viewing to the sender and property owner.

### `002_properties.sql`
- **`properties`**: Real estate property listings with architectural specifications, financial parameters, media arrays, and geo-coordinates.
- **Search**: Full-text search vector index on `title`, `city`, `locality`, and `architectural_style`.
- **RLS**: Public read for active listings; owner-only edit/delete permissions.

### `003_storage.sql`
- **Buckets**:
  - `property-images`: Public bucket for listing galleries and floor plans.
  - `rental-documents`: Private bucket for lease agreements, KYC, and receipts.
  - `passport-photos`: Authenticated bucket for move-in/move-out condition check photos.
- **Storage Policies**: Scoped by user ID and owner tenancy relation.

### `004_expenses.sql`
- **`property_expenses`**: Granular recurring and one-off property expenses (maintenance, society dues, municipal tax, utilities) powering the **RentTruth** engine.
- **RLS**: Public read for prospective tenants to review transparent costs; owner management access.

### `005_passport.sql`
- **`condition_passports`**: Digital Property Condition Passports locking condition state at key handovers.
- **`passport_rooms`**: Room-by-room inspection records (fixtures, walls, flooring) with signed photos and tenant/owner dual-acknowledgment.

### `006_workspace.sql`
- **`rental_workspaces`**: Active rental tenancy workspaces bridging owners and tenants.
- **`workspace_documents`**: Uploaded lease agreements, receipts, and condition reports with signed download URLs.
- **`workspace_payments`**: Rent and utility payment ledgers with verification status.
- **`workspace_maintenance`**: Maintenance tickets with priority and resolution tracking.
- **`workspace_activity`**: Audit trail and real-time event log.

---

## 3. API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/callback` | GET | Handles Supabase Auth PKCE code exchange for email confirmations and OAuth logins. |
| `/api/notify/login` | POST | Dispatches login alert emails via Resend with timestamp, IP, and device user-agent details. |
| `/api/ai/recommend` | POST | Extracts structured search criteria using Google Gemini API and performs matching against the active property catalog. |
| `/api/ai/agreement` | POST | Accepts rental agreement text or base64 PDF and extracts security deposit terms, notice periods, lock-ins, and red-flag clauses. |

---

## 4. Real-time Subscriptions

Real-time capabilities are orchestrated via `src/lib/supabase/realtime.ts`:
- **Owner Enquiries**: Subscribes to `public:enquiries` table insertions, instantly pushing new prospective tenant leads to the Owner Dashboard.
- **Workspace Activity**: Subscribes to `workspace_activity` for the active tenancy, pushing instant notifications when receipts or maintenance updates occur.

---

## 5. Running the Application

```bash
# Install dependencies
cd frontend
npm install

# Run static type checks
npx tsc --noEmit

# Run ESLint
npm run lint

# Build for production
npm run build

# Start local server
npm run dev
```
