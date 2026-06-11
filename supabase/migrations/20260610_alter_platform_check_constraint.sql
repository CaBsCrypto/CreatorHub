-- Migration: 20260610_alter_platform_check_constraint.sql
-- Description: Alter the content_platform_check constraint to include instagram_story

ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_platform_check;

ALTER TABLE public.content ADD CONSTRAINT content_platform_check 
  CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'x', 'coinmarketcap', 'twitch', 'stream', 'discord', 'baseapp', 'instagram_story'));
