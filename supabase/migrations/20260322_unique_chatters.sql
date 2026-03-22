-- Migration: Add unique_chatters to content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS unique_chatters INTEGER DEFAULT 0;
