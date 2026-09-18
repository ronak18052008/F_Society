-- 008_housing_dataset.sql
-- F_Society Complete Housing Dataset Integration & 2025-2026 Data Upgrade

ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS bhk integer,
  ADD COLUMN IF NOT EXISTS size_sqft integer,
  ADD COLUMN IF NOT EXISTS floor text,
  ADD COLUMN IF NOT EXISTS area_type text,
  ADD COLUMN IF NOT EXISTS area_locality text,
  ADD COLUMN IF NOT EXISTS furnishing_status text,
  ADD COLUMN IF NOT EXISTS tenant_preferred text,
  ADD COLUMN IF NOT EXISTS bathroom integer,
  ADD COLUMN IF NOT EXISTS point_of_contact text,
  ADD COLUMN IF NOT EXISTS original_posted_on date,
  ADD COLUMN IF NOT EXISTS display_posted_on date,
  ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'India Housing Rent Dataset',
  ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'DATASET',
  ADD COLUMN IF NOT EXISTS source_url text DEFAULT 'https://github.com/syednazrin/India-Housing-Data-Set-Analysis/blob/main/House_Rent_Dataset.csv',
  ADD COLUMN IF NOT EXISTS dataset_meta jsonb DEFAULT '{}'::jsonb;

-- Populate computed/normalized columns from existing fields if null
UPDATE public.properties
SET 
  bhk = COALESCE(bhk, bedrooms),
  size_sqft = COALESCE(size_sqft, area_sqft),
  bathroom = COALESCE(bathroom, bathrooms),
  area_locality = COALESCE(area_locality, locality),
  furnishing_status = COALESCE(furnishing_status, INITCAP(furnishing::text)),
  data_source = COALESCE(data_source, 'India Housing Rent Dataset'),
  source_type = COALESCE(source_type, CASE WHEN demo = true THEN 'DEMO' ELSE 'DATASET' END)
WHERE bhk IS NULL OR size_sqft IS NULL;

-- High-performance B-Tree indexes for multi-attribute filtering & sorting
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON public.properties(rent);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON public.properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_area_sqft ON public.properties(area_sqft);
CREATE INDEX IF NOT EXISTS idx_properties_furnishing ON public.properties(furnishing);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_source_type ON public.properties(source_type);
CREATE INDEX IF NOT EXISTS idx_properties_display_date ON public.properties(display_posted_on DESC);
