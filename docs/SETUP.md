# NESTORA — Supabase & Backend Setup Guide

Follow these steps to set up and run the Nestora backend with Supabase.

---

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/) and click **New Project**.
2. Set your Project Name (e.g., `nestora-dev`) and database password.
3. Choose a region close to your target audience.

---

## 2. Configure Environment Variables

1. In Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy the **Project URL** and **anon public key**.
3. Create a `.env.local` file in your repository root or under `frontend/`:

```env
# Frontend environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_DATA_MODE=live
```

---

## 3. Run Database Migrations

You can run the migrations either using the Supabase CLI or via the Supabase SQL Editor:

### Option A: Via Supabase SQL Editor (Recommended for quick start)
Execute the files in `supabase/migrations/` in sequential order:
1. `001_profiles.sql`
2. `002_properties.sql`
3. `003_interactions.sql`
4. `004_workspaces.sql`
5. `005_passport.sql`
6. `006_roommates.sql`
7. `007_storage.sql`

### Option B: Via Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

---

## 4. Run Seed Data (Optional for Demo Testing)

To populate initial properties, owners, workspace, payments, and condition passport records:
- Execute `supabase/seed.sql` in the Supabase SQL Editor.

---

## 5. Set Up Storage Buckets

1. In Supabase Dashboard, navigate to **Storage**.
2. Create three buckets:
   - **`property-images`**: Set to **Public**
   - **`rental-documents`**: Set to **Private**
   - **`passport-photos`**: Set to **Private**
3. Ensure storage policies from `007_storage.sql` are active.

---

## 6. Run the Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`. The frontend will automatically detect the Supabase configuration and transition from demo mode to live data.
