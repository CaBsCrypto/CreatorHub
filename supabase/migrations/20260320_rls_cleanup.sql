-- =====================================================
-- CLEANUP: Remove old/duplicate RLS policies
-- Run this in the Supabase SQL Editor
-- =====================================================
-- There are 20 old policies from a previous migration that
-- conflict with the new hardened policies. Some are dangerously
-- permissive (e.g. "readable by everyone" = no auth required).
-- =====================================================

BEGIN;

-- === CAMPAIGNS: Remove 5 old policies ===
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns are readable by everyone" ON public.campaigns;
DROP POLICY IF EXISTS "Only admins can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Only admins can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Only admins can update campaigns" ON public.campaigns;

-- === CONTENT: Remove 7 old policies ===
DROP POLICY IF EXISTS "Admins can delete any content" ON public.content;
DROP POLICY IF EXISTS "Admins can delete content" ON public.content;
DROP POLICY IF EXISTS "Admins can update any content" ON public.content;
DROP POLICY IF EXISTS "Content is readable by everyone" ON public.content;
DROP POLICY IF EXISTS "Creators can delete their own content" ON public.content;
DROP POLICY IF EXISTS "Creators can insert their own content" ON public.content;
DROP POLICY IF EXISTS "Creators can update their own content" ON public.content;

-- === USERS: Remove 8 old policies ===
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert new users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update roles" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Users are readable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;

COMMIT;

-- Verify: should show exactly 16 policies
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
