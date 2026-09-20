-- Ensure creator_groups is readable by anon for public review pages and client dashboards
DROP POLICY IF EXISTS "creator_groups_select" ON public.creator_groups;
CREATE POLICY "creator_groups_select"
  ON public.creator_groups FOR SELECT
  USING (deleted_at IS NULL);
