-- Migration: Add followers and subscriptions to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_subscriptions INTEGER DEFAULT 0;
