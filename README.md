# NIVASA

> **Rent with clarity. Live with confidence.**

NIVASA is a premium, modern rental lifecycle platform connecting tenants and property owners through transparent cost breakdowns, shared condition passports, AI-powered tools, and a unified workspace experience — all built on a **pistachio-and-cream** design system.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The Next.js app lives in `frontend/`. When Supabase credentials are configured in `.env.local`, the platform operates with full database, auth, storage, and real-time capabilities. Without credentials, it gracefully falls back to grounded India housing demo data.

---

## 🏛️ Architecture

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.3.5 (App Router, Turbopack) |
| **UI** | React 19.2.8, Tailwind CSS v4 (`@tailwindcss/postcss`) |
| **State** | Custom external store (`nivasa-store.tsx`) with Supabase SSR cookies |
| **Database** | Supabase (PostgreSQL), Row Level Security, 15 migrations |
| **Storage** | Supabase Storage — `property-images` (public), `rental-documents` (private, signed URLs), `passport-photos` (public) |
| **Auth** | Supabase Auth with role-based access (tenant/owner) |
| **Animation** | Framer Motion, Three.js / React Three Fiber |
| **Typography** | Outfit (body), Cormorant Garamond (editorial titles), IBM Plex Mono (data) |

### Dual Shell System

- **SiteShell** — Collapsible sidebar + header + footer + floating copilot. Used for public pages, property discovery, tenant/owner hubs.
- **DashboardShell** — Workspace sidebar + navbar. Used for tenant/owner dashboards, workspaces, expenses, property management.

---

## 🎨 Design System — Pistachio & Cream

NIVASA uses a carefully curated, nature-inspired color palette:

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| Cream Background | 🟫 | `#FAF7EF` | Primary canvas |
| Soft Ivory | ⬜ | `#FFFDF8` | Card surfaces |
| Warm Sand | 🟤 | `#F1EBDD` | Elevated surfaces |
| Pistachio | 🟢 | `#B7C99A` | Primary accent |
| Deep Pistachio | 🌿 | `#81966A` | Buttons, active states |
| Sage | 🌱 | `#A8B89A` | Secondary accents |
| Dark Forest Text | ⬛ | `#283126` | Primary text |
| Secondary Text | 🔘 | `#596254` | Muted text |
| Muted Border | 🔲 | `#DDE3D5` | Borders, dividers |
| Success | ✅ | `#668B5B` | Success states |
| Warning | ⚠️ | `#B88A4A` | Warning states |
| Error | 🔴 | `#B85C55` | Error states |

All colors are defined as CSS custom properties in `globals.css` and bound to Tailwind via `@theme inline`. Dark mode is handled automatically via `[data-theme="dark"]` variable overrides.

---

## 📂 Route Map

### Public & Discovery
| Route | Description |
|-------|-------------|
| `/` | Landing page — architectural hero, innovation showcase, featured properties |
| `/properties` | Property search with filters, city selector, layout tabs |
| `/property/[id]` | Property detail — gallery, RentTruth™, risk analysis, enquiry |
| `/cities` | City-based property discovery |
| `/how-it-works` | Verified rental lifecycle explainer |
| `/copilot` | AI-powered rental copilot |

### Authentication
| Route | Description |
|-------|-------------|
| `/login` | Member sign-in |
| `/login/tenant` | Tenant login |
| `/login/owner` | Owner login |
| `/register` | Account registration with role selection |
| `/profile` | User profile & settings |

### Tenant Experience
| Route | Description |
|-------|-------------|
| `/tenant` | Tenant hub — greeting, quick actions, saved homes |
| `/tenant/dashboard` | Active tenancy workspace — rent ledger, condition passport, maintenance |
| `/tenant/expenses` | Roommate expense engine — split bills, settle debts |
| `/tenant/roommates` | Roommate matching with compatibility scoring |
| `/tenant/requirements` | Tenant requirement builder |

### Owner Experience
| Route | Description |
|-------|-------------|
| `/owner` | Owner hub — portfolio stats, active listings, inquiries |
| `/owner/dashboard` | Portfolio management — property cards, applications |
| `/owner/properties/new` | Add property form with Supabase image upload |
| `/owner/properties/[id]` | Manage/edit listing with real-time status |

### Rental Workspace
| Route | Description |
|-------|-------------|
| `/rental/[id]` | Shared rental workspace |
| `/rental/[id]/documents` | Secure document management (signed URLs) |
| `/rental/[id]/passport` | Property condition passport with photo evidence |
| `/rental/[id]/payments` | Rent and bill tracking |
| `/renttruth/[propertyId]` | RentTruth™ itemized cost auditor |

### AI & Maintenance
| Route | Description |
|-------|-------------|
| `/maintenance/triage` | AI-powered maintenance triage |
| `/copilot` | Nivasa AI rental assistant |

---

## 🚀 Flagship AI & FinTech Suite

### 1. RentTruth™ Transparency Engine
Itemizes all rental costs — rent, maintenance, utilities, security deposit — so tenants see the real monthly expense before signing.

### 2. Rental Risk Analyzer
AI-powered risk scoring with location, market, legal, and financial analysis for properties.

### 3. Property Authenticity Scanner
Verifies listing authenticity through image analysis, document verification, and cross-referencing.

### 4. Property Reputation Graph
Aggregates owner history, maintenance responsiveness, tenant reviews, and neighborhood data into a trust score.

### 5. AI Maintenance Triage
Categorizes maintenance requests by urgency, suggests solutions, and routes to appropriate service providers.

### 6. Roommate Expense Engine
Fair split calculations with settlement tracking, group expense management, and payment history.

---

## 🗄️ Database Schema

Production schema across 15 Supabase migrations:

- `properties` — Property listings with images, amenities, pricing
- `property_enquiries` — Tenant-to-owner inquiry flow
- `rental_workspaces` — Shared tenant-owner workspace records
- `workspace_documents` — Secure document storage with signed URLs
- `condition_passports` — Move-in/move-out condition records
- `expenses` / `expense_participants` — Roommate expense splitting
- Financial tables for rent, deposits, and maintenance billing

All tables are protected with **Row Level Security (RLS)** policies.

---

## 🔧 Component Library

### UI Primitives
`Button` · `Field` · `TextArea` · `SelectField` · `Modal` · `StatusBadge` · `EmptyState` · `Skeleton` · `Toast` · `Timeline`

### Layout
`NivasaHeader` · `NivasaSidebar` · `SiteShell` · `Navbar` · `DashboardShell` · `Footer` · `ThemeProvider`

### Domain Components
`PropertyCard` · `FilterPanel` · `PropertyGallery` · `RentalRiskCard` · `AuthenticityCard` · `PropertyReputationGraph` · `MaintenanceTriageModal` · `HouseholdExpenseDashboard` · `FloatingCopilot`

All components use CSS custom properties from the design system — no hardcoded hex colors.

---

## 🔐 Security

- Supabase Auth with role-based access control (tenant/owner)
- Row Level Security (RLS) on all database tables
- Signed URLs for private document access
- Server-side session validation via `@supabase/ssr`
- Environment variables for all secrets (never committed)
- Input validation and file type/size restrictions
- CSRF protection via Supabase middleware

---

## 🧪 Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project (optional — app falls back to demo data)

### Environment Variables
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Commands
```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Production build
npx tsc --noEmit  # TypeScript type-check
```

### Verification
- **TypeScript**: 0 errors (`npx tsc --noEmit`)
- **Production Build**: 47 routes compiled, 0 errors
- **Responsiveness**: Tested at 375px, 768px, 1280px+

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make focused, meaningful commits
3. Test before opening a pull request
4. Never commit secrets or API keys
5. Ensure TypeScript passes (`npx tsc --noEmit`)
6. Ensure production build succeeds (`npm run build`)

---

## 📌 Philosophy

NIVASA is built around four principles:

1. **Transparency** — Make rental costs, documents, and property condition clear and auditable.
2. **Accountability** — Maintain shared, timestamped records of all rental activities.
3. **Privacy** — Give users control over sensitive information with role-based access.
4. **Craft** — Combine premium architectural design with practical, accessible workflows.

---

## 👤 Project

**Brand:** NIVASA
**Category:** Rental Technology / PropTech
**Core Focus:** Verified rental living & lifecycle management
**Repository:** [github.com/ronak18052008/F_Society](https://github.com/ronak18052008/F_Society)
