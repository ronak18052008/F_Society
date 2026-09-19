-- 010_rental_risk.sql
-- NESTORA Feature 2: Rental Risk Engine Analysis and Signal Persistence

CREATE TABLE IF NOT EXISTS public.risk_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'INSUFFICIENT_DATA')),
  confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence_score numeric(4, 2) NOT NULL DEFAULT 0.90,
  explanation text NOT NULL,
  verification_status text NOT NULL,
  engine_version text NOT NULL DEFAULT 'v2.4.0-deterministic',
  insufficient_data boolean NOT NULL DEFAULT false,
  missing_fields text[] DEFAULT ARRAY[]::text[],
  why_this_score jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risk_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.risk_analyses(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  impact_points integer NOT NULL,
  explanation text NOT NULL,
  evidence text NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for rapid property risk retrieval
CREATE INDEX IF NOT EXISTS idx_risk_analyses_property_id ON public.risk_analyses(property_id);
CREATE INDEX IF NOT EXISTS idx_risk_analyses_created_at ON public.risk_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_signals_analysis_id ON public.risk_signals(analysis_id);
CREATE INDEX IF NOT EXISTS idx_risk_signals_property_id ON public.risk_signals(property_id);

-- Row Level Security (RLS)
ALTER TABLE public.risk_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_signals ENABLE ROW LEVEL SECURITY;

-- Public read for transparency
CREATE POLICY "Public read for rental risk analyses"
  ON public.risk_analyses FOR SELECT
  USING (true);

CREATE POLICY "Public read for rental risk signals"
  ON public.risk_signals FOR SELECT
  USING (true);

-- Authenticated users or service role can insert/update analyses
CREATE POLICY "Authenticated users can create risk analyses"
  ON public.risk_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can create risk signals"
  ON public.risk_signals FOR INSERT
  WITH CHECK (true);
