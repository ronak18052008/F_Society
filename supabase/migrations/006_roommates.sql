-- Migration: 006_roommates.sql
-- Description: Tables for the roommate matching system

CREATE TABLE IF NOT EXISTS roommate_profiles (
    user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    age_range text,
    city text,
    budget integer CHECK (budget >= 0),
    locations text[],
    occupation text CHECK (occupation IN ('student', 'professional')),
    food text CHECK (food IN ('veg', 'non-veg', 'flexible')),
    sleep_schedule text CHECK (sleep_schedule IN ('early', 'late', 'flexible')),
    cleanliness text CHECK (cleanliness IN ('high', 'moderate')),
    smoking text CHECK (smoking IN ('no', 'outside-only')),
    pets text CHECK (pets IN ('no', 'ok')),
    sharing text CHECK (sharing IN ('1bhk', '2bhk', 'either')),
    visibility text DEFAULT 'limited' CHECK (visibility IN ('limited', 'hidden')),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roommate_profiles_city_vis_idx ON roommate_profiles(city, visibility);

-- Updated_at trigger for roommate_profiles
CREATE OR REPLACE FUNCTION update_roommate_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roommate_profiles_updated_at_trigger ON roommate_profiles;
CREATE TRIGGER update_roommate_profiles_updated_at_trigger
BEFORE UPDATE ON roommate_profiles
FOR EACH ROW EXECUTE FUNCTION update_roommate_profiles_updated_at();


CREATE TABLE IF NOT EXISTS roommate_connections (
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    target_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('connected', 'blocked')),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, target_id),
    CHECK (user_id != target_id)
);

ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommate_connections ENABLE ROW LEVEL SECURITY;

-- Roommate Connections RLS Policies
CREATE POLICY "roommate_connections_select" ON roommate_connections
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "roommate_connections_insert" ON roommate_connections
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "roommate_connections_update" ON roommate_connections
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "roommate_connections_delete" ON roommate_connections
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Roommate Profiles RLS Policies
CREATE POLICY "roommate_profiles_select" ON roommate_profiles
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        (
            visibility = 'limited' AND
            NOT EXISTS (
                SELECT 1 FROM roommate_connections rc
                WHERE rc.user_id = roommate_profiles.user_id
                AND rc.target_id = auth.uid()
                AND rc.status = 'blocked'
            )
        )
    );

CREATE POLICY "roommate_profiles_insert" ON roommate_profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "roommate_profiles_update" ON roommate_profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "roommate_profiles_delete" ON roommate_profiles
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());
