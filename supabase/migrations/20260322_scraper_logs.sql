-- =====================================================
-- UMBRA CREATOR HUB — Scraper Logs Migration
-- Date: 2026-03-22
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success' or 'error'
  error_message TEXT,
  response_time_ms INTEGER,
  metadata JSONB, -- For additional context like status codes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view or manage logs
DROP POLICY IF EXISTS "Admins can manage scraper logs" ON public.scraper_logs;
CREATE POLICY "Admins can manage scraper logs"
  ON public.scraper_logs FOR ALL
  USING (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
    )
  );

COMMIT;
