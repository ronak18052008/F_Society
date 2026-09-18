-- ==============================================================================
-- NESTORA — Consolidated Production Database Schema & RLS Migrations
-- Version: 1.0.0 (Consolidated & Fully Idempotent)
-- Target: Supabase Postgres (Executed via Supabase Dashboard SQL Editor)
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> Go to SQL Editor -> New query
-- 3. Paste this entire script and click "Run" (or press Ctrl/Cmd + Enter).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. Extensions & Core Utilities
-- ------------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- Shared trigger function for updated_at timestamps
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------------------
-- 1. User Profiles (Mirrors auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  email        text not null default '',
  role         text not null default 'tenant' check (role in ('tenant', 'owner')),
  city         text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Idempotent RLS Policies for profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Profile auto-creation trigger on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant')
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Property Listings & Discovery
-- ------------------------------------------------------------------------------
create table if not exists public.properties (
  id             text primary key default uuid_generate_v4()::text,
  slug           text unique not null,
  title          text not null,
  locality       text not null,
  city           text not null,
  address        text not null default '',
  architectural_style text not null default 'Modern Contemporary',
  type           text not null check (type in ('apartment', 'studio', 'villa', 'independent-floor')),
  furnishing     text not null check (furnishing in ('furnished', 'semi-furnished', 'unfurnished')),
  suitability    text[] not null default '{}',
  bedrooms       integer not null default 1,
  bathrooms      integer not null default 1,
  area_sqft      integer not null default 500,
  rent           numeric not null,
  deposit        numeric not null,
  available_from text not null default 'Immediately',
  amenities      text[] not null default '{}',
  images         text[] not null default '{}',
  owner_id       uuid references auth.users(id) on delete cascade,
  verification   text not null default 'listing-unverified' check (verification in ('identity-checked', 'listing-unverified', 'documents-pending')),
  description    text not null default '',
  coordinates    jsonb not null default '{"lat": 0, "lng": 0}'::jsonb,
  demo           boolean not null default false,
  status         text not null default 'active' check (status in ('draft', 'active', 'rented', 'archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.properties enable row level security;

-- Idempotent RLS Policies for properties
drop policy if exists "Anyone can view active properties" on public.properties;
create policy "Anyone can view active properties"
  on public.properties for select
  using (status = 'active' or auth.uid() = owner_id);

drop policy if exists "Owners can create properties" on public.properties;
create policy "Owners can create properties"
  on public.properties for insert
  with check (auth.uid() = owner_id or auth.role() = 'authenticated');

drop policy if exists "Owners can update own properties" on public.properties;
create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own properties" on public.properties;
create policy "Owners can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.update_updated_at();

create index if not exists idx_properties_city_locality on public.properties (city, locality);
create index if not exists idx_properties_rent on public.properties (rent);
create index if not exists idx_properties_type on public.properties (type);
create index if not exists idx_properties_owner on public.properties (owner_id);
create index if not exists idx_properties_status on public.properties (status);

create index if not exists idx_properties_fts on public.properties using gin (
  to_tsvector('english', title || ' ' || locality || ' ' || city || ' ' || coalesce(description, ''))
);

-- ------------------------------------------------------------------------------
-- 3. Saved Properties Bookmarks
-- ------------------------------------------------------------------------------
create table if not exists public.saved_properties (
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id text not null,
  saved_at    timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.saved_properties enable row level security;

drop policy if exists "Users can manage own saved properties" on public.saved_properties;
create policy "Users can manage own saved properties"
  on public.saved_properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Enquiries (Tenant to Owner Communication)
-- ------------------------------------------------------------------------------
create table if not exists public.enquiries (
  id          uuid primary key default uuid_generate_v4(),
  property_id text not null,
  from_user   uuid references auth.users(id) on delete set null,
  from_name   text not null default '',
  from_email  text not null default '',
  message     text not null default '',
  status      text not null default 'sent' check (status in ('sent', 'seen', 'replied')),
  created_at  timestamptz not null default now()
);

alter table public.enquiries enable row level security;

drop policy if exists "Users can read own enquiries" on public.enquiries;
create policy "Users can read own enquiries"
  on public.enquiries for select
  using (auth.uid() = from_user);

drop policy if exists "Anyone can create enquiries" on public.enquiries;
create policy "Anyone can create enquiries"
  on public.enquiries for insert
  with check (true);

drop policy if exists "Owners can view enquiries for their properties" on public.enquiries;
create policy "Owners can view enquiries for their properties"
  on public.enquiries for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = enquiries.property_id
        and properties.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update enquiries for their properties" on public.enquiries;
create policy "Owners can update enquiries for their properties"
  on public.enquiries for update
  using (
    exists (
      select 1 from public.properties
      where properties.id = enquiries.property_id
        and properties.owner_id = auth.uid()
    )
  );

create index if not exists idx_enquiries_property on public.enquiries (property_id);
create index if not exists idx_enquiries_from_user on public.enquiries (from_user);

-- ------------------------------------------------------------------------------
-- 5. RentTruth™ Property Expenses
-- ------------------------------------------------------------------------------
create table if not exists public.property_expenses (
  id           text primary key default uuid_generate_v4()::text,
  property_id  text not null references public.properties(id) on delete cascade,
  label        text not null,
  amount       numeric not null,
  cadence      text not null check (cadence in ('monthly', 'one-time', 'deposit')),
  source       text not null check (source in ('owner-provided', 'uploaded-bill', 'estimated', 'verified', 'demo')),
  note         text,
  document_url text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.property_expenses enable row level security;

drop policy if exists "Anyone can view property expenses" on public.property_expenses;
create policy "Anyone can view property expenses"
  on public.property_expenses for select
  using (true);

drop policy if exists "Owners can insert expenses for their properties" on public.property_expenses;
create policy "Owners can insert expenses for their properties"
  on public.property_expenses for insert
  with check (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    ) or auth.role() = 'authenticated'
  );

drop policy if exists "Owners can update expenses for their properties" on public.property_expenses;
create policy "Owners can update expenses for their properties"
  on public.property_expenses for update
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete expenses for their properties" on public.property_expenses;
create policy "Owners can delete expenses for their properties"
  on public.property_expenses for delete
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    )
  );

drop trigger if exists property_expenses_updated_at on public.property_expenses;
create trigger property_expenses_updated_at
  before update on public.property_expenses
  for each row execute function public.update_updated_at();

create index if not exists idx_expenses_property on public.property_expenses (property_id);

-- ------------------------------------------------------------------------------
-- 6. Condition Passports & Inspection Rooms
-- ------------------------------------------------------------------------------
create table if not exists public.condition_passports (
  id                      text primary key default uuid_generate_v4()::text,
  rental_id               text not null unique,
  tenant_acknowledged_at  timestamptz,
  owner_acknowledged_at   timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.passport_rooms (
  id              text primary key default uuid_generate_v4()::text,
  passport_id     text not null references public.condition_passports(id) on delete cascade,
  name            text not null,
  notes           text not null default '',
  review_required boolean not null default false,
  photos          jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.condition_passports enable row level security;
alter table public.passport_rooms enable row level security;

drop policy if exists "Anyone can view condition passports" on public.condition_passports;
create policy "Anyone can view condition passports"
  on public.condition_passports for select
  using (true);

drop policy if exists "Authenticated users can create condition passports" on public.condition_passports;
create policy "Authenticated users can create condition passports"
  on public.condition_passports for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update condition passports" on public.condition_passports;
create policy "Authenticated users can update condition passports"
  on public.condition_passports for update
  using (auth.role() = 'authenticated');

drop policy if exists "Anyone can view passport rooms" on public.passport_rooms;
create policy "Anyone can view passport rooms"
  on public.passport_rooms for select
  using (true);

drop policy if exists "Authenticated users can create passport rooms" on public.passport_rooms;
create policy "Authenticated users can create passport rooms"
  on public.passport_rooms for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update passport rooms" on public.passport_rooms;
create policy "Authenticated users can update passport rooms"
  on public.passport_rooms for update
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete passport rooms" on public.passport_rooms;
create policy "Authenticated users can delete passport rooms"
  on public.passport_rooms for delete
  using (auth.role() = 'authenticated');

drop trigger if exists condition_passports_updated_at on public.condition_passports;
create trigger condition_passports_updated_at
  before update on public.condition_passports
  for each row execute function public.update_updated_at();

create index if not exists idx_passports_rental on public.condition_passports (rental_id);
create index if not exists idx_rooms_passport on public.passport_rooms (passport_id);

-- ------------------------------------------------------------------------------
-- 7. Rental Tenancy Workspaces & Sub-resources
-- ------------------------------------------------------------------------------
create table if not exists public.rental_workspaces (
  id                 text primary key default uuid_generate_v4()::text,
  property_id        text not null,
  tenant_id          uuid references auth.users(id) on delete set null,
  owner_id           uuid references auth.users(id) on delete set null,
  tenant_name        text not null default 'Tenant',
  owner_name         text not null default 'Owner',
  start_date         text not null default '2026-08-01',
  rent               numeric not null default 0,
  deposit            numeric not null default 0,
  agreement_summary  text not null default '',
  status             text not null default 'active' check (status in ('active', 'draft', 'closed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.workspace_documents (
  id            text primary key default uuid_generate_v4()::text,
  workspace_id  text not null references public.rental_workspaces(id) on delete cascade,
  title         text not null,
  category      text not null check (category in ('agreement', 'identity', 'payment-proof', 'maintenance', 'other')),
  status        text not null default 'shared' check (status in ('draft', 'shared', 'expired')),
  uploaded_at   timestamptz not null default now(),
  visible_to    text[] not null default '{"tenant", "owner"}',
  file_name     text not null,
  file_url      text,
  storage_path  text,
  created_at    timestamptz not null default now()
);

create table if not exists public.workspace_payments (
  id                  text primary key default uuid_generate_v4()::text,
  workspace_id        text not null references public.rental_workspaces(id) on delete cascade,
  kind                text not null check (kind in ('rent', 'maintenance', 'utility')),
  label               text not null,
  amount              numeric not null,
  due_on              text not null,
  status              text not null default 'unpaid' check (status in ('paid', 'unpaid', 'proof-uploaded')),
  source              text not null default 'uploaded-bill',
  proof_name          text,
  proof_url           text,
  proof_storage_path  text,
  created_at          timestamptz not null default now()
);

create table if not exists public.workspace_maintenance (
  id            text primary key default uuid_generate_v4()::text,
  workspace_id  text not null references public.rental_workspaces(id) on delete cascade,
  title         text not null,
  area          text not null,
  status        text not null default 'open' check (status in ('open', 'in-progress', 'resolved')),
  opened_at     timestamptz not null default now(),
  note          text not null default '',
  photos        text[] not null default '{}',
  assigned_to   text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists public.workspace_activity (
  id            text primary key default uuid_generate_v4()::text,
  workspace_id  text not null references public.rental_workspaces(id) on delete cascade,
  at            timestamptz not null default now(),
  title         text not null,
  detail        text not null
);

alter table public.rental_workspaces enable row level security;
alter table public.workspace_documents enable row level security;
alter table public.workspace_payments enable row level security;
alter table public.workspace_maintenance enable row level security;
alter table public.workspace_activity enable row level security;

-- Policies for Workspaces
drop policy if exists "Workspaces viewable by participants or demo" on public.rental_workspaces;
create policy "Workspaces viewable by participants or demo"
  on public.rental_workspaces for select
  using (true);

drop policy if exists "Workspaces insertable by authenticated users" on public.rental_workspaces;
create policy "Workspaces insertable by authenticated users"
  on public.rental_workspaces for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Workspaces updateable by authenticated users" on public.rental_workspaces;
create policy "Workspaces updateable by authenticated users"
  on public.rental_workspaces for update
  using (auth.role() = 'authenticated');

-- Policies for Documents
drop policy if exists "Documents viewable by participants" on public.workspace_documents;
create policy "Documents viewable by participants"
  on public.workspace_documents for select
  using (true);

drop policy if exists "Documents insertable by participants" on public.workspace_documents;
create policy "Documents insertable by participants"
  on public.workspace_documents for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Documents deleteable by participants" on public.workspace_documents;
create policy "Documents deleteable by participants"
  on public.workspace_documents for delete
  using (auth.role() = 'authenticated');

-- Policies for Payments
drop policy if exists "Payments viewable by participants" on public.workspace_payments;
create policy "Payments viewable by participants"
  on public.workspace_payments for select
  using (true);

drop policy if exists "Payments insertable by participants" on public.workspace_payments;
create policy "Payments insertable by participants"
  on public.workspace_payments for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Payments updateable by participants" on public.workspace_payments;
create policy "Payments updateable by participants"
  on public.workspace_payments for update
  using (auth.role() = 'authenticated');

-- Policies for Maintenance
drop policy if exists "Maintenance viewable by participants" on public.workspace_maintenance;
create policy "Maintenance viewable by participants"
  on public.workspace_maintenance for select
  using (true);

drop policy if exists "Maintenance insertable by participants" on public.workspace_maintenance;
create policy "Maintenance insertable by participants"
  on public.workspace_maintenance for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Maintenance updateable by participants" on public.workspace_maintenance;
create policy "Maintenance updateable by participants"
  on public.workspace_maintenance for update
  using (auth.role() = 'authenticated');

-- Policies for Activity
drop policy if exists "Activity viewable by participants" on public.workspace_activity;
create policy "Activity viewable by participants"
  on public.workspace_activity for select
  using (true);

drop policy if exists "Activity insertable by participants" on public.workspace_activity;
create policy "Activity insertable by participants"
  on public.workspace_activity for insert
  with check (auth.role() = 'authenticated');

drop trigger if exists rental_workspaces_updated_at on public.rental_workspaces;
create trigger rental_workspaces_updated_at
  before update on public.rental_workspaces
  for each row execute function public.update_updated_at();

create index if not exists idx_workspace_property on public.rental_workspaces (property_id);
create index if not exists idx_workspace_tenant on public.rental_workspaces (tenant_id);
create index if not exists idx_workspace_owner on public.rental_workspaces (owner_id);
create index if not exists idx_documents_workspace on public.workspace_documents (workspace_id);
create index if not exists idx_payments_workspace on public.workspace_payments (workspace_id);
create index if not exists idx_maintenance_workspace on public.workspace_maintenance (workspace_id);
create index if not exists idx_activity_workspace on public.workspace_activity (workspace_id);

-- ------------------------------------------------------------------------------
-- 8. Storage Buckets & Storage Policies
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('rental-documents', 'rental-documents', false),
  ('passport-photos', 'passport-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Property images are publicly accessible" on storage.objects;
create policy "Property images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update/delete property images" on storage.objects;
create policy "Authenticated users can update/delete property images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can view rental documents" on storage.objects;
create policy "Authenticated users can view rental documents"
  on storage.objects for select
  using (bucket_id = 'rental-documents' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can upload rental documents" on storage.objects;
create policy "Authenticated users can upload rental documents"
  on storage.objects for insert
  with check (bucket_id = 'rental-documents' and auth.role() = 'authenticated');

drop policy if exists "Passport photos are viewable by authenticated users or publicly" on storage.objects;
create policy "Passport photos are viewable by authenticated users or publicly"
  on storage.objects for select
  using (bucket_id = 'passport-photos');

drop policy if exists "Authenticated users can upload passport photos" on storage.objects;
create policy "Authenticated users can upload passport photos"
  on storage.objects for insert
  with check (bucket_id = 'passport-photos' and auth.role() = 'authenticated');
