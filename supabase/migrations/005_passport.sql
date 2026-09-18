-- =============================================================
-- NESTORA — Migration 005: Condition Passport
-- =============================================================
-- Tracks baseline move-in condition, room-by-room photographic
-- records, and mutual tenant/owner cryptographic/audit acknowledgements.
-- =============================================================

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

-- Policies for condition_passports
create policy "Anyone can view condition passports"
  on public.condition_passports for select
  using (true);

create policy "Authenticated users can create condition passports"
  on public.condition_passports for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update condition passports"
  on public.condition_passports for update
  using (auth.role() = 'authenticated');

-- Policies for passport_rooms
create policy "Anyone can view passport rooms"
  on public.passport_rooms for select
  using (true);

create policy "Authenticated users can create passport rooms"
  on public.passport_rooms for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update passport rooms"
  on public.passport_rooms for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete passport rooms"
  on public.passport_rooms for delete
  using (auth.role() = 'authenticated');

-- Triggers
create trigger condition_passports_updated_at
  before update on public.condition_passports
  for each row execute function public.update_updated_at();

-- Indexes
create index if not exists idx_passports_rental on public.condition_passports (rental_id);
create index if not exists idx_rooms_passport on public.passport_rooms (passport_id);
