-- =====================================================
-- UMBRA CREATOR HUB — Creator Groups Migration
-- Date: 2026-09-10
-- Adds: creator_groups, creator_group_members, campaigns.group_id
-- Seeds: Umbra (existing data) + Tellus Cooperative
-- =====================================================

BEGIN;

-- =====================================================
-- 1. GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.creator_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'indigo',
  logo_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creator_groups_slug ON public.creator_groups(slug);

-- =====================================================
-- 2. GROUP MEMBERS TABLE (creator <-> group, N:M)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.creator_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.creator_groups(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.creator_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_creator ON public.creator_group_members(creator_id);

-- =====================================================
-- 3. CAMPAIGNS BELONG TO A GROUP
-- =====================================================
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.creator_groups(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_group ON public.campaigns(group_id);

-- =====================================================
-- 4. SEED DATA
-- =====================================================
INSERT INTO public.creator_groups (name, slug, color, logo_emoji)
VALUES ('Umbra', 'umbra', 'indigo', '🌑')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.creator_groups (name, slug, color, logo_emoji)
VALUES ('Tellus Cooperative', 'tellus', 'emerald', '🌱')
ON CONFLICT (slug) DO NOTHING;

-- Existing campaigns -> Umbra
UPDATE public.campaigns
SET group_id = (SELECT id FROM public.creator_groups WHERE slug = 'umbra')
WHERE group_id IS NULL;

-- Existing creators -> Umbra
INSERT INTO public.creator_group_members (group_id, creator_id)
SELECT (SELECT id FROM public.creator_groups WHERE slug = 'umbra'), u.id
FROM public.users u
WHERE u.role = 'creator' AND u.deleted_at IS NULL
ON CONFLICT (group_id, creator_id) DO NOTHING;

-- =====================================================
-- 5. RLS
-- =====================================================
ALTER TABLE public.creator_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_group_members ENABLE ROW LEVEL SECURITY;

-- Groups: any authenticated user can read (needed for badges/filters), only admins write
CREATE POLICY "creator_groups_select"
  ON public.creator_groups FOR SELECT
  USING (deleted_at IS NULL AND auth.role() = 'authenticated');

CREATE POLICY "creator_groups_admin_write"
  ON public.creator_groups FOR ALL
  USING (public.is_admin());

-- Members: any authenticated user can read, only admins write
CREATE POLICY "creator_group_members_select"
  ON public.creator_group_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "creator_group_members_admin_write"
  ON public.creator_group_members FOR ALL
  USING (public.is_admin());

COMMIT;
