-- =====================================================
-- Update Campaigns table with Contact and Budget fields
-- =====================================================

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS contact_info TEXT,
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2) DEFAULT 0;

-- Optional: Add index for budget if needed, but likely not necessary for now.
-- Index for finding campaigns by client_id is already likely existing, but let's be sure
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);
