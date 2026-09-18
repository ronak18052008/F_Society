-- 002_properties.sql

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  locality text NOT NULL,
  city text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'studio', 'villa', 'independent-floor')),
  furnishing text NOT NULL CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
  suitability text[] NOT NULL DEFAULT '{}',
  bedrooms smallint NOT NULL CHECK (bedrooms >= 0),
  bathrooms smallint NOT NULL CHECK (bathrooms >= 0),
  area_sqft integer NOT NULL CHECK (area_sqft > 0),
  rent integer NOT NULL CHECK (rent >= 0),
  deposit integer NOT NULL CHECK (deposit >= 0),
  available_from date NOT NULL,
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  owner_id uuid NOT NULL REFERENCES profiles(id),
  verification text NOT NULL DEFAULT 'listing-unverified' CHECK (verification IN ('identity-checked', 'listing-unverified', 'documents-pending')),
  description text DEFAULT '',
  lat double precision,
  lng double precision,
  is_published boolean DEFAULT false,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_published ON properties(is_published);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Apply updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Trigger to prevent verification and is_demo updates by owner
CREATE OR REPLACE FUNCTION prevent_protected_property_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF (auth.uid() = OLD.owner_id) THEN
    IF NEW.verification IS DISTINCT FROM OLD.verification THEN
      RAISE EXCEPTION 'Verification status is platform-controlled and cannot be changed';
    END IF;
    IF NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
      RAISE EXCEPTION 'is_demo status cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_protected_property_updates_trigger
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE PROCEDURE prevent_protected_property_updates();

-- Enable RLS for properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Published properties OR is_demo = true are public. Unpublished only visible to owner.
CREATE POLICY "Properties select policy" 
  ON properties FOR SELECT USING (is_published = true OR is_demo = true OR auth.uid() = owner_id);

-- INSERT policy: Authenticated users with owner role can insert (owner_id must match auth.uid())
CREATE POLICY "Properties insert policy" 
  ON properties FOR INSERT WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- UPDATE policy: Only the owner (owner_id = auth.uid()) can update.
CREATE POLICY "Properties update policy" 
  ON properties FOR UPDATE USING (auth.uid() = owner_id);

-- DELETE policy: Owner can delete only unpublished, non-demo properties.
CREATE POLICY "Properties delete policy" 
  ON properties FOR DELETE USING (
    auth.uid() = owner_id 
    AND is_published = false 
    AND is_demo = false
  );

-- Create property_expenses table
CREATE TABLE IF NOT EXISTS property_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  cadence text NOT NULL CHECK (cadence IN ('monthly', 'one-time', 'deposit')),
  source text NOT NULL CHECK (source IN ('owner-provided', 'uploaded-bill', 'estimated', 'verified', 'demo')),
  note text,
  sort_order smallint DEFAULT 0
);

-- Index for property_expenses
CREATE INDEX IF NOT EXISTS idx_property_expenses_property_id ON property_expenses(property_id);

-- Trigger to prevent 'verified' source on insert/update from RLS users
CREATE OR REPLACE FUNCTION prevent_verified_expense_source()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source = 'verified' AND current_setting('role') <> 'postgres' THEN
    RAISE EXCEPTION 'source cannot be set to verified by users';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_verified_expense_source_trigger
  BEFORE INSERT OR UPDATE ON property_expenses
  FOR EACH ROW EXECUTE PROCEDURE prevent_verified_expense_source();

-- Enable RLS for property_expenses
ALTER TABLE property_expenses ENABLE ROW LEVEL SECURITY;

-- SELECT: Same as property (if property is visible, expenses are visible)
CREATE POLICY "Property expenses select policy" 
  ON property_expenses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_expenses.property_id 
      AND (properties.is_published = true OR properties.is_demo = true OR properties.owner_id = auth.uid())
    )
  );

-- INSERT/UPDATE/DELETE: Only the property owner
CREATE POLICY "Property expenses insert policy" 
  ON property_expenses FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_expenses.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Property expenses update policy" 
  ON property_expenses FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_expenses.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Property expenses delete policy" 
  ON property_expenses FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_expenses.property_id 
      AND properties.owner_id = auth.uid()
    )
  );
