-- Migration: 005_passport.sql
-- Description: Tables for the Property Condition Passport

CREATE TABLE IF NOT EXISTS condition_passports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL UNIQUE REFERENCES rental_workspaces(id),
    tenant_acknowledged_at timestamptz,
    owner_acknowledged_at timestamptz,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE condition_passports ENABLE ROW LEVEL SECURITY;

-- Trigger to prevent un-setting acknowledgement timestamps
CREATE OR REPLACE FUNCTION prevent_unset_passport_ack()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.tenant_acknowledged_at IS NOT NULL AND NEW.tenant_acknowledged_at IS NULL THEN
        RAISE EXCEPTION 'Cannot unset tenant_acknowledged_at';
    END IF;
    IF OLD.owner_acknowledged_at IS NOT NULL AND NEW.owner_acknowledged_at IS NULL THEN
        RAISE EXCEPTION 'Cannot unset owner_acknowledged_at';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_unset_passport_ack_trigger ON condition_passports;
CREATE TRIGGER prevent_unset_passport_ack_trigger
BEFORE UPDATE ON condition_passports
FOR EACH ROW EXECUTE FUNCTION prevent_unset_passport_ack();

CREATE POLICY "condition_passports_select" ON condition_passports
    FOR SELECT TO authenticated
    USING (is_workspace_member(workspace_id));

CREATE POLICY "condition_passports_update" ON condition_passports
    FOR UPDATE TO authenticated
    USING (is_workspace_member(workspace_id))
    WITH CHECK (is_workspace_member(workspace_id));


CREATE TABLE IF NOT EXISTS passport_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    passport_id uuid NOT NULL REFERENCES condition_passports(id) ON DELETE CASCADE,
    name text NOT NULL,
    notes text,
    review_required boolean DEFAULT false,
    sort_order smallint DEFAULT 0
);

CREATE INDEX IF NOT EXISTS passport_rooms_passport_id_idx ON passport_rooms(passport_id);
ALTER TABLE passport_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passport_rooms_select" ON passport_rooms
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM condition_passports cp
            WHERE cp.id = passport_rooms.passport_id
            AND is_workspace_member(cp.workspace_id)
        )
    );

CREATE POLICY "passport_rooms_insert" ON passport_rooms
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM condition_passports cp
            WHERE cp.id = passport_rooms.passport_id
            AND is_workspace_member(cp.workspace_id)
            AND (cp.tenant_acknowledged_at IS NULL OR cp.owner_acknowledged_at IS NULL)
        )
    );

CREATE POLICY "passport_rooms_update" ON passport_rooms
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM condition_passports cp
            WHERE cp.id = passport_rooms.passport_id
            AND is_workspace_member(cp.workspace_id)
            AND (cp.tenant_acknowledged_at IS NULL OR cp.owner_acknowledged_at IS NULL)
        )
    );

CREATE POLICY "passport_rooms_delete" ON passport_rooms
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM condition_passports cp
            WHERE cp.id = passport_rooms.passport_id
            AND is_workspace_member(cp.workspace_id)
            AND (cp.tenant_acknowledged_at IS NULL OR cp.owner_acknowledged_at IS NULL)
        )
    );


CREATE TABLE IF NOT EXISTS passport_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES passport_rooms(id) ON DELETE CASCADE,
    label text NOT NULL,
    storage_path text NOT NULL,
    taken_at timestamptz NOT NULL,
    uploaded_by uuid REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS passport_photos_room_id_idx ON passport_photos(room_id);
ALTER TABLE passport_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passport_photos_select" ON passport_photos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM passport_rooms pr
            JOIN condition_passports cp ON cp.id = pr.passport_id
            WHERE pr.id = passport_photos.room_id
            AND is_workspace_member(cp.workspace_id)
        )
    );

CREATE POLICY "passport_photos_insert" ON passport_photos
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM passport_rooms pr
            JOIN condition_passports cp ON cp.id = pr.passport_id
            WHERE pr.id = passport_photos.room_id
            AND is_workspace_member(cp.workspace_id)
            AND (cp.tenant_acknowledged_at IS NULL OR cp.owner_acknowledged_at IS NULL)
        )
    );

CREATE POLICY "passport_photos_delete" ON passport_photos
    FOR DELETE TO authenticated
    USING (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM passport_rooms pr
            JOIN condition_passports cp ON cp.id = pr.passport_id
            WHERE pr.id = passport_photos.room_id
            AND (cp.tenant_acknowledged_at IS NULL OR cp.owner_acknowledged_at IS NULL)
        )
    );
