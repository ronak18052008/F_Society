-- Migration: 004_workspaces
-- Description: Create tables for the rental workspace system.

-- ============================================================================
-- Tables Creation
-- ============================================================================

-- rental_workspaces
CREATE TABLE IF NOT EXISTS rental_workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id),
    start_date date NOT NULL,
    rent integer NOT NULL CHECK (rent >= 0),
    deposit integer NOT NULL CHECK (deposit >= 0),
    agreement_summary text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- rental_members
CREATE TABLE IF NOT EXISTS rental_members (
    workspace_id uuid REFERENCES rental_workspaces(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id),
    role text NOT NULL CHECK (role IN ('tenant', 'owner')),
    joined_at timestamptz DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

-- rental_documents
CREATE TABLE IF NOT EXISTS rental_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES rental_workspaces(id),
    title text NOT NULL,
    category text NOT NULL CHECK (category IN ('agreement', 'identity', 'payment-proof', 'maintenance', 'other')),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'expired')),
    uploaded_by uuid NOT NULL REFERENCES profiles(id),
    uploaded_at timestamptz DEFAULT now(),
    visible_to text[] NOT NULL DEFAULT '{}'::text[],
    file_name text NOT NULL,
    storage_path text
);

-- rent_payments
CREATE TABLE IF NOT EXISTS rent_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES rental_workspaces(id),
    kind text NOT NULL CHECK (kind IN ('rent', 'maintenance', 'utility')),
    label text NOT NULL,
    amount integer NOT NULL CHECK (amount >= 0),
    due_on date NOT NULL,
    status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'proof-uploaded')),
    source text NOT NULL CHECK (source IN ('owner-provided', 'uploaded-bill', 'estimated', 'verified', 'demo')),
    proof_name text,
    proof_storage_path text,
    created_at timestamptz DEFAULT now()
);

-- maintenance_requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES rental_workspaces(id),
    reported_by uuid NOT NULL REFERENCES profiles(id),
    title text NOT NULL,
    area text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    opened_at timestamptz DEFAULT now(),
    note text,
    updated_at timestamptz DEFAULT now()
);

-- activity_events
CREATE TABLE IF NOT EXISTS activity_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES rental_workspaces(id),
    at timestamptz NOT NULL DEFAULT now(),
    title text NOT NULL,
    detail text,
    actor_id uuid REFERENCES profiles(id)
);


-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check if the current user is a member of the workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM rental_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE rental_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- rental_workspaces policies
CREATE POLICY "Workspace members can view workspace"
ON rental_workspaces FOR SELECT
TO authenticated
USING (is_workspace_member(id));

CREATE POLICY "Authenticated users can insert workspace"
ON rental_workspaces FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Workspace members can update workspace"
ON rental_workspaces FOR UPDATE
TO authenticated
USING (is_workspace_member(id));
-- No DELETE policy

-- rental_members policies
CREATE POLICY "Workspace members can view members"
ON rental_members FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id));
-- No INSERT/UPDATE/DELETE by regular users

-- rental_documents policies
CREATE POLICY "Visible documents for workspace members"
ON rental_documents FOR SELECT
TO authenticated
USING (
  is_workspace_member(workspace_id) AND (
    EXISTS (
      SELECT 1 FROM rental_members
      WHERE rental_members.workspace_id = rental_documents.workspace_id
        AND rental_members.user_id = auth.uid()
        AND rental_members.role = ANY(rental_documents.visible_to)
    )
  )
);

CREATE POLICY "Workspace members can insert documents"
ON rental_documents FOR INSERT
TO authenticated
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Uploader can update documents"
ON rental_documents FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY "Uploader can delete documents"
ON rental_documents FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- rent_payments policies
CREATE POLICY "Workspace members can view payments"
ON rent_payments FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert payments"
ON rent_payments FOR INSERT
TO authenticated
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update payments"
ON rent_payments FOR UPDATE
TO authenticated
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete payments"
ON rent_payments FOR DELETE
TO authenticated
USING (is_workspace_member(workspace_id));

-- maintenance_requests policies
CREATE POLICY "Workspace members can view requests"
ON maintenance_requests FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert requests"
ON maintenance_requests FOR INSERT
TO authenticated
WITH CHECK (is_workspace_member(workspace_id) AND reported_by = auth.uid());

CREATE POLICY "Workspace members can update requests"
ON maintenance_requests FOR UPDATE
TO authenticated
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete requests"
ON maintenance_requests FOR DELETE
TO authenticated
USING (is_workspace_member(workspace_id));

-- activity_events policies
CREATE POLICY "Workspace members can view events"
ON activity_events FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert events"
ON activity_events FOR INSERT
TO authenticated
WITH CHECK (is_workspace_member(workspace_id));
-- No UPDATE/DELETE policy


-- ============================================================================
-- Triggers
-- ============================================================================

-- Assuming update_updated_at_column() was defined in a previous migration
DROP TRIGGER IF EXISTS set_rental_workspaces_updated_at ON rental_workspaces;
CREATE TRIGGER set_rental_workspaces_updated_at
BEFORE UPDATE ON rental_workspaces
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_maintenance_requests_updated_at ON maintenance_requests;
CREATE TRIGGER set_maintenance_requests_updated_at
BEFORE UPDATE ON maintenance_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rental_workspaces_property_id ON rental_workspaces(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_members_user_id ON rental_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rental_documents_workspace_id ON rental_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_workspace_id ON rent_payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_workspace_id ON maintenance_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_workspace_id ON activity_events(workspace_id);
