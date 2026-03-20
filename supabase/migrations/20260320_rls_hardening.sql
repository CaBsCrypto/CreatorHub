-- =====================================================
-- UMBRA CREATOR HUB — RLS Hardening Migration
-- Date: 2026-03-20
-- =====================================================
-- IMPORTANT: Test this in a dev/staging environment FIRST.
-- Run "SELECT * FROM pg_policies" after executing to verify.
-- =====================================================

BEGIN;

-- =====================================================
-- 1. SOFT DELETE COLUMNS
-- =====================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- =====================================================
-- 2. SOFT DELETE TRIGGERS (one function per table)
-- =====================================================

-- USERS
CREATE OR REPLACE FUNCTION public.soft_delete_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET deleted_at = now() WHERE id = OLD.id;
  RETURN NULL; -- Cancel the physical DELETE
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_soft_delete_users ON public.users;
CREATE TRIGGER tr_soft_delete_users
  BEFORE DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_users();

-- CAMPAIGNS
CREATE OR REPLACE FUNCTION public.soft_delete_campaigns()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaigns SET deleted_at = now() WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_soft_delete_campaigns ON public.campaigns;
CREATE TRIGGER tr_soft_delete_campaigns
  BEFORE DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_campaigns();

-- CONTENT
CREATE OR REPLACE FUNCTION public.soft_delete_content()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.content SET deleted_at = now() WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_soft_delete_content ON public.content;
CREATE TRIGGER tr_soft_delete_content
  BEFORE DELETE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.soft_delete_content();

-- =====================================================
-- 3. HELPER: is_admin() (SECURITY DEFINER = bypasses RLS)
--    This avoids infinite recursion when checking role
--    inside RLS policies on the users table.
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- 4. ENABLE RLS
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (safety net)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE public.content FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES — public.users
-- =====================================================

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.users;
DROP POLICY IF EXISTS "Users can claim profile by email" ON public.users;

-- Admin: full access to all user records
CREATE POLICY "Admins can manage users"
  ON public.users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Self: can view own profile (even if not admin)
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);

-- Self: can insert own profile (auto-registration in AuthContext)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Self: can update own profile (payment info, display name, etc.)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can view basic info of other active users
-- (needed by ClientDashboard to show creator names in reports,
--  and by CreatorDashboard/useDashboardData for leaderboard)
CREATE POLICY "Authenticated users can view active profiles"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Pre-invited users: can claim their profile by email match
-- (AuthContext.tsx links pre-created rows to the new Auth ID)
CREATE POLICY "Users can claim profile by email"
  ON public.users FOR UPDATE
  USING (email = auth.jwt() ->> 'email' AND deleted_at IS NULL)
  WITH CHECK (id = auth.uid());

-- =====================================================
-- 6. RLS POLICIES — public.campaigns
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Clients can view their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Creators can view campaigns" ON public.campaigns;

-- Admin: full access
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Client: can view only their assigned campaigns
CREATE POLICY "Clients can view their campaigns"
  ON public.campaigns FOR SELECT
  USING (client_id = auth.uid() AND deleted_at IS NULL);

-- Creator: can view campaigns they have content in
CREATE POLICY "Creators can view campaigns"
  ON public.campaigns FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM public.content
      WHERE content.campaign_id = campaigns.id
        AND content.creator_id = auth.uid()
    )
  );

-- =====================================================
-- 7. RLS POLICIES — public.content
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
DROP POLICY IF EXISTS "Creators can manage own content" ON public.content;
DROP POLICY IF EXISTS "Creators can insert own content" ON public.content;
DROP POLICY IF EXISTS "Creators can view own content" ON public.content;
DROP POLICY IF EXISTS "Creators can update own content" ON public.content;
DROP POLICY IF EXISTS "Creators can delete own content" ON public.content;
DROP POLICY IF EXISTS "Clients can view campaign content" ON public.content;

-- Admin: full access
CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Creator: can view their own content
CREATE POLICY "Creators can view own content"
  ON public.content FOR SELECT
  USING (creator_id = auth.uid() AND deleted_at IS NULL);

-- Creator: can insert content as themselves
CREATE POLICY "Creators can insert own content"
  ON public.content FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Creator: can update their own content
CREATE POLICY "Creators can update own content"
  ON public.content FOR UPDATE
  USING (creator_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (creator_id = auth.uid());

-- Creator: can delete (soft-delete) their own content
CREATE POLICY "Creators can delete own content"
  ON public.content FOR DELETE
  USING (creator_id = auth.uid() AND deleted_at IS NULL);

-- Client: can view content from their campaigns
CREATE POLICY "Clients can view campaign content"
  ON public.content FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = content.campaign_id
        AND campaigns.client_id = auth.uid()
        AND campaigns.deleted_at IS NULL
    )
  );

-- =====================================================
-- 8. GRANT EXECUTE on helper functions to authenticated users
-- =====================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_campaigns() TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_content() TO authenticated;

COMMIT;

-- =====================================================
-- POST-DEPLOY: Verify with these queries:
-- =====================================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname = 'public';
--
-- SELECT tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables WHERE schemaname = 'public';
