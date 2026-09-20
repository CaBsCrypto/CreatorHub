-- =====================================================
-- DEMO REQUESTS TABLE MIGRATION
-- Date: 2026-09-19
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  creators_volume TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON public.demo_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow public/anonymous inserts
CREATE POLICY "Allow public demo requests"
  ON public.demo_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read/manage demo requests
CREATE POLICY "Allow admins full access to demo requests"
  ON public.demo_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.id = auth.uid() 
        AND public.users.role IN ('admin', 'manager')
    )
  );

COMMIT;
