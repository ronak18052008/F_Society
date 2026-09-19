-- 012_maintenance_triage.sql
-- NESTORA Feature 4: AI Maintenance Triage Records & Telemetry

CREATE TABLE IF NOT EXISTS public.maintenance_triage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text,
  user_id text,
  category text NOT NULL CHECK (category IN ('ELECTRICAL', 'PLUMBING', 'HVAC', 'APPLIANCE', 'STRUCTURAL', 'INTERNET', 'SECURITY', 'OTHER')),
  severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
  urgency text NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence_score numeric(4, 2) NOT NULL DEFAULT 0.85,
  summary text NOT NULL,
  suggested_actions text[] NOT NULL DEFAULT ARRAY[]::text[],
  recommended_next_step text NOT NULL,
  requires_immediate_attention boolean NOT NULL DEFAULT false,
  room text,
  issue_duration text,
  has_image boolean NOT NULL DEFAULT false,
  disclaimer text NOT NULL,
  provider text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for rapid retrieval
CREATE INDEX IF NOT EXISTS idx_maint_triage_property_id ON public.maintenance_triage_records(property_id);
CREATE INDEX IF NOT EXISTS idx_maint_triage_severity ON public.maintenance_triage_records(severity);
CREATE INDEX IF NOT EXISTS idx_maint_triage_category ON public.maintenance_triage_records(category);
CREATE INDEX IF NOT EXISTS idx_maint_triage_created_at ON public.maintenance_triage_records(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.maintenance_triage_records ENABLE ROW LEVEL SECURITY;

-- Read policy: public/authenticated read for tenancy workspaces
CREATE POLICY "Public read for maintenance triage records"
  ON public.maintenance_triage_records FOR SELECT
  USING (true);

-- Insert policy: allow authenticated users and tenants to log triage records
CREATE POLICY "Allow create maintenance triage records"
  ON public.maintenance_triage_records FOR INSERT
  WITH CHECK (true);
