# NESTORA — Backend Architecture & Database Documentation

## 1. Architecture Overview

NESTORA uses Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, and Supabase Storage) as its unified backend.

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                │
│   (App Router, React 19, Tailwind v4, Three.js, GSAP)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                 Typed Service Layer
         (services/auth, properties, workspace)
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌─────────────────────────┐         ┌────────────────────┐
│      Supabase Auth      │         │  Supabase Storage  │
│ (JWTs, Role Management) │         │ (Images, Docs, PP) │
└────────────┬────────────┘         └─────────┬──────────┘
             │                                │
             ▼                                ▼
┌────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                  │
│       (Profiles, Properties, Expenses, Workspaces)     │
│             Enforced with Row Level Security           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Table Catalog

| Table | Migration | Purpose | Ownership / Access |
|---|---|---|---|
| `profiles` | `001_profiles.sql` | User profiles extending `auth.users` | Owned by user; public display fields |
| `properties` | `002_properties.sql` | Rental listings & metadata | Owned by property owner; published listings public |
| `property_expenses` | `002_properties.sql` | RentTruth expense line items | Belongs to property; editable by property owner only |
| `saved_properties` | `003_interactions.sql` | User property bookmarks | Private to owning user |
| `property_enquiries` | `003_interactions.sql` | Enquiries sent by prospective tenants | Visible to sender and property owner |
| `tenant_requirements` | `003_interactions.sql` | Tenant search preferences | Private to tenant |
| `rental_workspaces` | `004_workspaces.sql` | Active tenancy agreements | Accessible by verified workspace members |
| `rental_members` | `004_workspaces.sql` | Membership link between user & workspace | System managed; visible to workspace members |
| `rental_documents` | `004_workspaces.sql` | Tenancy agreements, receipts, IDs | Scoped to workspace members & `visible_to` roles |
| `rent_payments` | `004_workspaces.sql` | Monthly rent & utility payment ledger | Scoped to workspace members |
| `maintenance_requests` | `004_workspaces.sql` | Issue tracking & maintenance logs | Scoped to workspace members |
| `activity_events` | `004_workspaces.sql` | Audit timeline for rental workspace | Read-only for workspace members |
| `condition_passports` | `005_passport.sql` | Move-in & move-out condition passport | Scoped to workspace members |
| `passport_rooms` | `005_passport.sql` | Room items within a passport | Scoped to workspace members |
| `passport_photos` | `005_passport.sql` | Photos attached to room observations | Scoped to workspace members |
| `roommate_profiles` | `006_roommates.sql` | Privacy-first roommate finder profiles | Visible if not hidden or blocked |
| `roommate_connections` | `006_roommates.sql` | Connected & blocked roommate relationships | Private to owning user |

---

## 3. Security & Row Level Security (RLS) Matrix

All tables enforce Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

- **Verification Protection**: The `verification` status on listings is protected by a database trigger preventing owner tampering.
- **Source Protection**: Expense line `source = 'verified'` cannot be set by users directly via client API.
- **Condition Passport Integrity**: Acknowledgement timestamps (`tenant_acknowledged_at`, `owner_acknowledged_at`) cannot be cleared or rolled back once set.
- **Storage Isolation**: Storage buckets use RLS policies matching database workspace membership.

---

## 4. Supabase Storage Buckets

1. **`property-images`** (Public)
   - Read: Public
   - Write/Delete: Owner of the listing only
   - Path format: `{owner_id}/{property_id}/{filename}`

2. **`rental-documents`** (Private)
   - Read/Write: Verified members of the rental workspace
   - Path format: `{workspace_id}/{document_id}/{filename}`

3. **`passport-photos`** (Private)
   - Read/Write: Verified members of the rental workspace
   - Path format: `{workspace_id}/{room_id}/{filename}`
