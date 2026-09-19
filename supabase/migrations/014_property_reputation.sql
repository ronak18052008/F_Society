-- 014_property_reputation.sql
-- NESTORA Feature 6: Property Reputation Graph Entities, Relationships & Signals

CREATE TABLE IF NOT EXISTS public.property_reputation_nodes (
  id text PRIMARY KEY,
  property_id text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN (
    'PROPERTY',
    'LANDLORD',
    'REVIEWS',
    'VERIFICATION',
    'MAINTENANCE',
    'LOCATION',
    'RESIDENT EXPERIENCE',
    'LISTING HISTORY'
  )),
  label text NOT NULL,
  sublabel text,
  description text NOT NULL,
  data_source text NOT NULL CHECK (data_source IN (
    'VERIFIED DATA',
    'USER-GENERATED DATA',
    'AI-DERIVED SIGNAL'
  )),
  confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence_score numeric(4, 2) NOT NULL DEFAULT 0.85,
  status text NOT NULL CHECK (status IN ('positive', 'neutral', 'warning', 'insufficient_data')),
  insufficient_data boolean NOT NULL DEFAULT false,
  score integer,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  pos_x numeric(8, 2),
  pos_y numeric(8, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_reputation_relationships (
  id text PRIMARY KEY,
  property_id text NOT NULL,
  source_id text NOT NULL,
  target_id text NOT NULL,
  relationship_type text NOT NULL,
  label text NOT NULL,
  description text NOT NULL,
  source_classification text NOT NULL CHECK (source_classification IN (
    'VERIFIED DATA',
    'USER-GENERATED DATA',
    'AI-DERIVED SIGNAL'
  )),
  confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence_score numeric(4, 2) NOT NULL DEFAULT 0.85,
  weight integer NOT NULL DEFAULT 5 CHECK (weight >= 1 AND weight <= 10),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_reputation_signals (
  id text PRIMARY KEY,
  property_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  entity_type text NOT NULL,
  classification text NOT NULL CHECK (classification IN (
    'VERIFIED DATA',
    'USER-GENERATED DATA',
    'AI-DERIVED SIGNAL'
  )),
  score_effect text NOT NULL CHECK (score_effect IN ('positive', 'neutral', 'negative', 'info')),
  description text NOT NULL,
  traceable_source text NOT NULL,
  confidence numeric(4, 2) NOT NULL DEFAULT 0.85,
  evidence text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for rapid graph querying
CREATE INDEX IF NOT EXISTS idx_rep_nodes_property_id ON public.property_reputation_nodes(property_id);
CREATE INDEX IF NOT EXISTS idx_rep_nodes_entity_type ON public.property_reputation_nodes(entity_type);
CREATE INDEX IF NOT EXISTS idx_rep_rel_property_id ON public.property_reputation_relationships(property_id);
CREATE INDEX IF NOT EXISTS idx_rep_rel_source_target ON public.property_reputation_relationships(source_id, target_id);
CREATE INDEX IF NOT EXISTS idx_rep_signals_property_id ON public.property_reputation_signals(property_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.property_reputation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reputation_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reputation_signals ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for transparent reputation exploration
CREATE POLICY "Public read for reputation nodes"
  ON public.property_reputation_nodes FOR SELECT
  USING (true);

CREATE POLICY "Public read for reputation relationships"
  ON public.property_reputation_relationships FOR SELECT
  USING (true);

CREATE POLICY "Public read for reputation signals"
  ON public.property_reputation_signals FOR SELECT
  USING (true);

-- Upsert Policies for authorized sync
CREATE POLICY "Allow create/update reputation nodes"
  ON public.property_reputation_nodes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow create/update reputation relationships"
  ON public.property_reputation_relationships FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow create/update reputation signals"
  ON public.property_reputation_signals FOR ALL
  USING (true)
  WITH CHECK (true);
