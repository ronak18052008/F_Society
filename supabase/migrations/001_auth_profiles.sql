-- =============================================================
-- NESTORA — Migration 001: Auth Profiles
-- =============================================================
-- Creates a public.profiles table that mirrors auth.users and
-- stores role + preferences. A trigger auto-creates a profile
-- row whenever a new user signs up via Supabase Auth.
-- =============================================================

-- Enable UUID extension (usually already enabled in Supabase)
create extension if not exists "uuid-ossp";

-- Profiles table
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

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS policies
-- 1. Anyone can read profiles (for owner info display, roommate matching)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- 2. Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Users can insert their own profile (for the trigger below)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
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
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant')
  );
  return new;
end;
$$;

-- Drop the trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Saved properties table
create table if not exists public.saved_properties (
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id text not null,
  saved_at    timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.saved_properties enable row level security;

create policy "Users can manage own saved properties"
  on public.saved_properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enquiries table
create table if not exists public.enquiries (
  id          uuid primary key default uuid_generate_v4(),
  property_id text not null,
  from_user   uuid not null references auth.users(id) on delete cascade,
  from_name   text not null default '',
  message     text not null default '',
  status      text not null default 'sent' check (status in ('sent', 'seen', 'replied')),
  created_at  timestamptz not null default now()
);

alter table public.enquiries enable row level security;

-- Enquiry sender can read their own enquiries
create policy "Users can read own enquiries"
  on public.enquiries for select
  using (auth.uid() = from_user);

-- Anyone can create enquiries (logged in)
create policy "Authenticated users can create enquiries"
  on public.enquiries for insert
  with check (auth.uid() = from_user);

-- Index for property-based enquiry lookups
create index if not exists idx_enquiries_property
  on public.enquiries (property_id);
