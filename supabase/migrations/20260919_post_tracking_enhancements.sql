-- =====================================================
-- POST TRACKING ENHANCEMENTS MIGRATION
-- Date: 2026-09-19
-- Adds: content.last_refreshed_at, indexes for fast group & campaign queries
-- =====================================================

BEGIN;

-- 1. Add last_refreshed_at column to content table if it doesn't exist
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS last_refreshed_at TIMESTAMPTZ;

-- 2. Helpful indexes for post tracking & campaign performance
CREATE INDEX IF NOT EXISTS idx_content_campaign_id ON public.content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_last_refreshed ON public.content(last_refreshed_at);

-- 3. Update existing content with a default timestamp if null
UPDATE public.content
SET last_refreshed_at = now()
WHERE last_refreshed_at IS NULL AND status = 'active';

COMMIT;
