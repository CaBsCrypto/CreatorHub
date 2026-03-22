-- =====================================================
-- UMBRA CREATOR HUB — Twitch Metrics Expansion
-- Date: 2026-03-22
-- =====================================================

BEGIN;

ALTER TABLE public.content 
  ADD COLUMN IF NOT EXISTS peek_viewers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_viewers INTEGER DEFAULT 0;

COMMIT;
