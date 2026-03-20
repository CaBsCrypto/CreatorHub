-- =====================================================
-- COMPLETE FIX: Eliminate ALL RLS recursion
-- =====================================================
-- Two sources of recursion were found:
-- 1. is_admin() queried public.users → users policy called is_admin() → loop
-- 2. campaigns policy subqueried content, content policy subqueried campaigns → cross-loop
--
-- Fix: Remove ALL cross-table subqueries from SELECT policies.
-- All authenticated users can SELECT campaigns and content.
-- Write operations (INSERT/UPDATE/DELETE) remain restricted per role.
-- =====================================================

-- =============================================
-- STEP 1: Drop ALL existing policies (clean slate)
-- =============================================

-- campaigns
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Clients can view their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Creators can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated can view campaigns" ON public.campaigns;

-- content
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
DROP POLICY IF EXISTS "Creators can view own content" ON public.content;
DROP POLICY IF EXISTS "Creators can insert own content" ON public.content;
DROP POLICY IF EXISTS "Creators can update own content" ON public.content;
DROP POLICY IF EXISTS "Creators can delete own content" ON public.content;
DROP POLICY IF EXISTS "Clients can view campaign content" ON public.content;
DROP POLICY IF EXISTS "Authenticated can view content" ON public.content;

-- users
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can claim profile by email" ON public.users;

-- =============================================
-- STEP 2: Recreate is_admin() — JWT-based, no table query
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- =============================================
-- STEP 3: USERS policies
-- =============================================

-- All authenticated users can view active profiles
CREATE POLICY "Authenticated can view profiles"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Admin: full write access
CREATE POLICY "Admins can manage users"
  ON public.users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Self: insert (auto-registration)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Self: update own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = id);

-- Pre-invited: claim profile by email
CREATE POLICY "Users can claim profile by email"
  ON public.users FOR UPDATE
  USING (email = auth.jwt() ->> 'email' AND deleted_at IS NULL)
  WITH CHECK (id = auth.uid());

-- =============================================
-- STEP 4: CAMPAIGNS policies
-- =============================================

-- All authenticated users can read campaigns
CREATE POLICY "Authenticated can view campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Admin: full write access
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- STEP 5: CONTENT policies
-- =============================================

-- All authenticated users can read active content
CREATE POLICY "Authenticated can view content"
  ON public.content FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Admin: full write access
CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Creator: insert own content
CREATE POLICY "Creators can insert own content"
  ON public.content FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Creator: update own content
CREATE POLICY "Creators can update own content"
  ON public.content FOR UPDATE
  USING (creator_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (creator_id = auth.uid());

-- Creator: delete (soft-delete) own content
CREATE POLICY "Creators can delete own content"
  ON public.content FOR DELETE
  USING (creator_id = auth.uid() AND deleted_at IS NULL);
