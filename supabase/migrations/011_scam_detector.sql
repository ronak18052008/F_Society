-- 011_scam_detector.sql
-- NESTORA Feature 3: AI Scam / Fake Listing Detector Authenticity Analysis & Signals

CREATE TABLE IF NOT EXISTS public.authenticity_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  authenticity_score integer NOT NULL CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
  status text NOT NULL CHECK (status IN ('LIKELY_AUTHENTIC', 'NEEDS_REVIEW', 'SUSPICIOUS', 'HIGH_RISK')),
  confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence_score numeric(4, 2) NOT NULL DEFAULT 0.90,
  explanation text NOT NULL,
  verification_status text NOT NULL,
  price_anomaly boolean NOT NULL DEFAULT false,
  duplicate_warning boolean NOT NULL DEFAULT false,
  suspicious_description_flags text[] DEFAULT ARRAY[]::text[],
  missing_information text[] DEFAULT ARRAY[]::text[],
  why_this_result jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.authenticity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.authenticity_analyses(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  score_deduction integer NOT NULL,
  explanation text NOT NULL,
  evidence text NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for rapid authenticity analysis retrieval
CREATE INDEX IF NOT EXISTS idx_auth_analyses_property_id ON public.authenticity_analyses(property_id);
CREATE INDEX IF NOT EXISTS idx_auth_analyses_status ON public.authenticity_analyses(status);
CREATE INDEX IF NOT EXISTS idx_auth_analyses_created_at ON public.authenticity_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_signals_analysis_id ON public.authenticity_signals(analysis_id);
CREATE INDEX IF NOT EXISTS idx_auth_signals_property_id ON public.authenticity_signals(property_id);

-- Row Level Security (RLS)
ALTER TABLE public.authenticity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authenticity_signals ENABLE ROW LEVEL SECURITY;

-- Public read for transparency
CREATE POLICY "Public read for authenticity analyses"
  ON public.authenticity_analyses FOR SELECT
  USING (true);

CREATE POLICY "Public read for authenticity signals"
  ON public.authenticity_signals FOR SELECT
  USING (true);

-- Authenticated users or service role can insert/update analyses
CREATE POLICY "Allow create authenticity analyses"
  ON public.authenticity_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow create authenticity signals"
  ON public.authenticity_signals FOR INSERT
  WITH CHECK (true);
