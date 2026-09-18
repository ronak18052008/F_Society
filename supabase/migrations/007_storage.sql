-- Migration: 007_storage.sql
-- Description: Supabase Storage bucket policies

-- Storage bucket policies
-- Buckets must be created via Supabase Dashboard or CLI:
--   1. property-images (public)
--   2. rental-documents (private)
--   3. passport-photos (private)

-- Property Images: Public read, owner write
-- Path convention: property-images/{owner_id}/{property_id}/{filename}

-- INSERT policy: Owner can upload to their own folder
CREATE POLICY "property_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT policy: Anyone can view property images
CREATE POLICY "property_images_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property-images');

-- DELETE policy: Owner can delete their own images
CREATE POLICY "property_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Rental Documents: Private, workspace members only
-- Path convention: rental-documents/{workspace_id}/{document_id}/{filename}

CREATE POLICY "rental_docs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'rental-documents'
    AND is_workspace_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "rental_docs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'rental-documents'
    AND is_workspace_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "rental_docs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'rental-documents'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT workspace_id FROM rental_documents 
      WHERE uploaded_by = auth.uid()
    )
  );

-- Passport Photos: Private, workspace members only
-- Path convention: passport-photos/{workspace_id}/{room_id}/{filename}

CREATE POLICY "passport_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'passport-photos'
    AND is_workspace_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "passport_photos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'passport-photos'
    AND is_workspace_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "passport_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'passport-photos'
    AND is_workspace_member((storage.foldername(name))[1]::uuid)
  );
