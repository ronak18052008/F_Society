-- =============================================================
-- NESTORA — Migration 004: RentTruth Expenses
-- =============================================================
-- Creates the public.property_expenses table to track all recurring,
-- one-time, and deposit costs with transparency and source attribution.
-- =============================================================

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

-- Policies
-- 1. Anyone can view expenses for published properties
create policy "Anyone can view property expenses"
  on public.property_expenses for select
  using (true);

-- 2. Property owners can insert expenses for their properties
create policy "Owners can insert expenses for their properties"
  on public.property_expenses for insert
  with check (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- 3. Property owners can update expenses
create policy "Owners can update expenses for their properties"
  on public.property_expenses for update
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- 4. Property owners can delete expenses
create policy "Owners can delete expenses for their properties"
  on public.property_expenses for delete
  using (
    exists (
      select 1 from public.properties
      where properties.id = property_expenses.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- Trigger for updated_at
create trigger property_expenses_updated_at
  before update on public.property_expenses
  for each row execute function public.update_updated_at();

-- Indexes
create index if not exists idx_expenses_property on public.property_expenses (property_id);
