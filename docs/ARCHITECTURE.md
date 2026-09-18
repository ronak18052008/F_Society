# NESTORA frontend architecture

The product README lives at the repository root. This frontend is a
Next.js App Router prototype under `frontend/`.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4
- React Three Fiber + Drei for the architectural hero
- GSAP + `@gsap/react` for scroll reveals
- Framer Motion for UI transitions

## Data

All listings, roommates, bills, and the shared rental workspace are demo
records in `src/data/demo.ts`. Client state (session, saved homes,
enquiries, drafts) lives in `localStorage` via `src/store/nestora-store.tsx`.

Nothing is persisted to Supabase yet. Auth screens validate locally and
state clearly that no server session exists.

## Routes

Public: `/`, `/homes`, `/homes/[id]`, `/how-it-works`, `/renttruth/[propertyId]`,
`/ai/recommend`, `/ai/agreement`

Auth: `/login`, `/register`, `/onboarding/*`

App: `/tenant/*`, `/owner/*`, `/rental/rent-navrang/*`

## 3D

The hero is a procedural pavilion (no external GLB). Mobile and
`prefers-reduced-motion` fall back to a line drawing.
