-- =====================================================
-- UMBRA CREATOR HUB — RLS Hardening and SQL Views Migration
-- Date: 2026-07-07
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DROP OLD PERMISSIVE POLICIES
-- =====================================================

-- campaigns
DROP POLICY IF EXISTS "Authenticated can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public campaign access via token" ON public.campaigns;

-- content
DROP POLICY IF EXISTS "Authenticated can view content" ON public.content;
DROP POLICY IF EXISTS "Public content access" ON public.content;

-- payments
DROP POLICY IF EXISTS "Public payment access" ON public.payments;

-- =====================================================
-- 2. CREATE NEW SECURE RLS POLICIES FOR CAMPAIGNS
-- =====================================================
CREATE POLICY "Campaigns SELECT access"
  ON public.campaigns FOR SELECT
  USING (
    deleted_at IS NULL AND (
      public.is_admin() OR
      client_id = auth.uid() OR
      show_to_all = true OR
      (auth.role() = 'anon' AND (share_token IS NOT NULL OR slug IS NOT NULL)) OR
      EXISTS (
        SELECT 1 FROM public.campaign_creators
        WHERE campaign_creators.campaign_id = campaigns.id
          AND campaign_creators.creator_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 3. CREATE NEW SECURE RLS POLICIES FOR CONTENT
-- =====================================================
CREATE POLICY "Content SELECT access"
  ON public.content FOR SELECT
  USING (
    deleted_at IS NULL AND (
      public.is_admin() OR
      creator_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.campaigns
        WHERE campaigns.id = content.campaign_id
          AND campaigns.deleted_at IS NULL
          AND (
            campaigns.client_id = auth.uid() OR
            campaigns.show_to_all = true OR
            (auth.role() = 'anon' AND (campaigns.share_token IS NOT NULL OR campaigns.slug IS NOT NULL)) OR
            EXISTS (
              SELECT 1 FROM public.campaign_creators
              WHERE campaign_creators.campaign_id = campaigns.id
                AND campaign_creators.creator_id = auth.uid()
            )
          )
      )
    )
  );

-- =====================================================
-- 4. CREATE NEW SECURE RLS POLICIES FOR PAYMENTS
-- =====================================================
CREATE POLICY "Creators can view own payments"
  ON public.payments FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Clients can view campaign payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = payments.campaign_id
        AND campaigns.client_id = auth.uid()
        AND campaigns.deleted_at IS NULL
    )
  );

-- =====================================================
-- 5. CREATE SQL VIEW FOR PUBLIC STATS
-- =====================================================
DROP VIEW IF EXISTS public.public_stats_summary;

CREATE VIEW public.public_stats_summary AS
SELECT 
  coalesce(sum(views), 0) as total_views,
  (SELECT count(*) FROM public.campaigns WHERE deleted_at IS NULL) as total_campaigns,
  (SELECT count(*) FROM public.users WHERE role = 'creator' AND deleted_at IS NULL) as total_creators
FROM public.content 
WHERE deleted_at IS NULL AND status != 'archived';

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_stats_summary TO anon, authenticated;

COMMIT;
