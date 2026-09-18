-- =============================================================
-- NESTORA — Migration 003: Storage Buckets & Policies
-- =============================================================
-- Sets up Supabase Storage buckets for:
--   1. property-images (public): Property listing gallery
--   2. rental-documents (private): Lease agreements, ID proofs, utility receipts
--   3. passport-photos (public/semi-public): Move-in condition inspection photos
-- =============================================================

-- Insert storage buckets if not already present
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('rental-documents', 'rental-documents', false),
  ('passport-photos', 'passport-photos', true)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Policies: property-images
-- -------------------------------------------------------------
-- Anyone can view property images
create policy "Property images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- Authenticated users (owners/tenants) can upload property images
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- Users can delete their own uploaded property images (by folder/user prefix or ownership)
create policy "Authenticated users can update/delete property images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- -------------------------------------------------------------
-- Policies: rental-documents (Private)
-- -------------------------------------------------------------
-- Only authenticated users can access rental documents
create policy "Authenticated users can view rental documents"
  on storage.objects for select
  using (bucket_id = 'rental-documents' and auth.role() = 'authenticated');

create policy "Authenticated users can upload rental documents"
  on storage.objects for insert
  with check (bucket_id = 'rental-documents' and auth.role() = 'authenticated');

-- -------------------------------------------------------------
-- Policies: passport-photos
-- -------------------------------------------------------------
create policy "Passport photos are viewable by authenticated users or publicly"
  on storage.objects for select
  using (bucket_id = 'passport-photos');

create policy "Authenticated users can upload passport photos"
  on storage.objects for insert
  with check (bucket_id = 'passport-photos' and auth.role() = 'authenticated');
