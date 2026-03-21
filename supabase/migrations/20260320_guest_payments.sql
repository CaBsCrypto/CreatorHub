-- =====================================================
-- Migration: Add Guest Payments Support
-- =====================================================

-- Make creator_id optional so we can register external/guest payments
ALTER TABLE public.payments
ALTER COLUMN creator_id DROP NOT NULL;

-- Add guest_name column to store the name of the external creator
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS guest_name TEXT;
