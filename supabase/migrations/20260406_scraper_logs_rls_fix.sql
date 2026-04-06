-- Allow anyone to insert logs (scrapers running on backend/frontend)
-- but only admins can read them.

BEGIN;

DROP POLICY IF EXISTS "Anyone can insert logs" ON public.scraper_logs;
CREATE POLICY "Anyone can insert logs"
  ON public.scraper_logs FOR INSERT
  WITH CHECK (true);

-- Ensure only admins can SELECT or DELETE
DROP POLICY IF EXISTS "Admins can manage scraper logs" ON public.scraper_logs;
CREATE POLICY "Admins can view and delete scraper logs"
  ON public.scraper_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
    )
  );

COMMIT;
