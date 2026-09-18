-- 001_profiles.sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('tenant', 'owner')),
  city text,
  phone text,
  listed_since timestamptz DEFAULT now(),
  response_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Apply updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Trigger to prevent role updates
CREATE OR REPLACE FUNCTION prevent_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Role cannot be changed after creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_role_update_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE prevent_role_update();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can read their own full profile.
-- Other users can read for display. (Note: RLS controls row access, not column access. 
-- For column restriction, views or column-level privileges would be needed. 
-- Here we allow reading all rows to satisfy the "read for display" requirement).
CREATE POLICY "Profiles are readable by everyone" 
  ON profiles FOR SELECT USING (true);

-- INSERT policy
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE policy
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
