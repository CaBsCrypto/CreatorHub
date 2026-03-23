-- Migration: Add unique_viewers to content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;
