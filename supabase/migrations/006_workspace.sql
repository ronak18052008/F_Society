-- =============================================================
-- NESTORA — Migration 006: Rental Workspaces
-- =============================================================
-- Manages shared rental workspaces between tenants and property owners,
-- including repository documents, recurring payments ledger, maintenance
-- tickets, and chronological audit activity timelines.
-- =============================================================

create table if not exists public.rental_workspaces (
  id                 text primary key default uuid_generate_v4()::text,
  property_id        text not null,
  tenant_id          uuid references public.profiles(id) on delete set null,
  owner_id           uuid references public.profiles(id) on delete set null,
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

-- Enable RLS
alter table public.rental_workspaces enable row level security;
alter table public.workspace_documents enable row level security;
alter table public.workspace_payments enable row level security;
alter table public.workspace_maintenance enable row level security;
alter table public.workspace_activity enable row level security;

-- Policies
create policy "Workspaces viewable by participants or demo"
  on public.rental_workspaces for select
  using (true);

create policy "Workspaces insertable by authenticated users"
  on public.rental_workspaces for insert
  with check (auth.role() = 'authenticated');

create policy "Workspaces updateable by authenticated users"
  on public.rental_workspaces for update
  using (auth.role() = 'authenticated');

-- Documents policies
create policy "Documents viewable by participants"
  on public.workspace_documents for select
  using (true);

create policy "Documents insertable by participants"
  on public.workspace_documents for insert
  with check (auth.role() = 'authenticated');

create policy "Documents deleteable by participants"
  on public.workspace_documents for delete
  using (auth.role() = 'authenticated');

-- Payments policies
create policy "Payments viewable by participants"
  on public.workspace_payments for select
  using (true);

create policy "Payments insertable by participants"
  on public.workspace_payments for insert
  with check (auth.role() = 'authenticated');

create policy "Payments updateable by participants"
  on public.workspace_payments for update
  using (auth.role() = 'authenticated');

-- Maintenance policies
create policy "Maintenance viewable by participants"
  on public.workspace_maintenance for select
  using (true);

create policy "Maintenance insertable by participants"
  on public.workspace_maintenance for insert
  with check (auth.role() = 'authenticated');

create policy "Maintenance updateable by participants"
  on public.workspace_maintenance for update
  using (auth.role() = 'authenticated');

-- Activity policies
create policy "Activity viewable by participants"
  on public.workspace_activity for select
  using (true);

create policy "Activity insertable by participants"
  on public.workspace_activity for insert
  with check (auth.role() = 'authenticated');

-- Triggers
create trigger rental_workspaces_updated_at
  before update on public.rental_workspaces
  for each row execute function public.update_updated_at();

-- Indexes
create index if not exists idx_workspace_property on public.rental_workspaces (property_id);
create index if not exists idx_workspace_tenant on public.rental_workspaces (tenant_id);
create index if not exists idx_workspace_owner on public.rental_workspaces (owner_id);
create index if not exists idx_documents_workspace on public.workspace_documents (workspace_id);
create index if not exists idx_payments_workspace on public.workspace_payments (workspace_id);
create index if not exists idx_maintenance_workspace on public.workspace_maintenance (workspace_id);
create index if not exists idx_activity_workspace on public.workspace_activity (workspace_id);
