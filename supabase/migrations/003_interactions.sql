-- 003_interactions.sql

-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);

-- Enable RLS for saved_properties
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT/INSERT/DELETE: Only the owning user
CREATE POLICY "Saved properties select policy" 
  ON saved_properties FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Saved properties insert policy" 
  ON saved_properties FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Saved properties delete policy" 
  ON saved_properties FOR DELETE USING (user_id = auth.uid());

-- Create property_enquiries table
CREATE TABLE IF NOT EXISTS property_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  from_user_id uuid NOT NULL REFERENCES profiles(id),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'seen')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for property_enquiries
CREATE INDEX IF NOT EXISTS idx_property_enquiries_property_id ON property_enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_enquiries_from_user_id ON property_enquiries(from_user_id);

-- Enable RLS for property_enquiries
ALTER TABLE property_enquiries ENABLE ROW LEVEL SECURITY;

-- SELECT: sender OR property owner
CREATE POLICY "Property enquiries select policy" 
  ON property_enquiries FOR SELECT USING (
    from_user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_enquiries.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

-- INSERT: Authenticated users
CREATE POLICY "Property enquiries insert policy" 
  ON property_enquiries FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- UPDATE: Only property owner can update (specifically status)
CREATE POLICY "Property enquiries update policy" 
  ON property_enquiries FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_enquiries.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

-- Create tenant_requirements table
CREATE TABLE IF NOT EXISTS tenant_requirements (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  budget integer,
  cities text[],
  property_type text,
  notes text,
  updated_at timestamptz DEFAULT now()
);

-- Apply updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tenant_requirements
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable RLS for tenant_requirements
ALTER TABLE tenant_requirements ENABLE ROW LEVEL SECURITY;

-- RLS: All operations: user_id = auth.uid() only
CREATE POLICY "Tenant requirements select policy" 
  ON tenant_requirements FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tenant requirements insert policy" 
  ON tenant_requirements FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Tenant requirements update policy" 
  ON tenant_requirements FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Tenant requirements delete policy" 
  ON tenant_requirements FOR DELETE USING (user_id = auth.uid());
