-- =============================================================
-- NESTORA — Migration 002: Properties & Discovery
-- =============================================================
-- Creates the public.properties table matching the Property schema,
-- with Row Level Security, full-text search indexes, and automatic
-- updated_at timestamp triggers.
-- =============================================================

create table if not exists public.properties (
  id             text primary key default uuid_generate_v4()::text,
  slug           text unique not null,
  title          text not null,
  locality       text not null,
  city           text not null,
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
  owner_id       uuid references public.profiles(id) on delete cascade,
  verification   text not null default 'listing-unverified' check (verification in ('identity-checked', 'listing-unverified', 'documents-pending')),
  description    text not null default '',
  coordinates    jsonb not null default '{"lat": 0, "lng": 0}'::jsonb,
  demo           boolean not null default false,
  status         text not null default 'active' check (status in ('draft', 'active', 'rented', 'archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.properties enable row level security;

-- Policies for public.properties
-- 1. Anyone can browse active properties
create policy "Anyone can view active properties"
  on public.properties for select
  using (status = 'active' or auth.uid() = owner_id);

-- 2. Authenticated owners can insert their own properties
create policy "Owners can create properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

-- 3. Owners can update their own properties
create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- 4. Owners can delete their own properties
create policy "Owners can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id);

-- Auto-update updated_at timestamp
create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.update_updated_at();

-- Search and filter indexes
create index if not exists idx_properties_city_locality on public.properties (city, locality);
create index if not exists idx_properties_rent on public.properties (rent);
create index if not exists idx_properties_type on public.properties (type);
create index if not exists idx_properties_owner on public.properties (owner_id);
create index if not exists idx_properties_status on public.properties (status);

-- Full-text search index
create index if not exists idx_properties_fts on public.properties using gin (
  to_tsvector('english', title || ' ' || locality || ' ' || city || ' ' || coalesce(description, ''))
);

-- Additional enquiry policy: Property owners can view incoming enquiries for their properties
create policy "Owners can view enquiries for their properties"
  on public.enquiries for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = enquiries.property_id
        and properties.owner_id = auth.uid()
    )
  );
