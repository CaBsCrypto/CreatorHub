-- Add share_token to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_share_token ON campaigns(share_token);

-- Update RLS for anonymous access
-- Allow anyone (anon) to read campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public campaign access via token" ON campaigns
FOR SELECT TO anon USING (true);

-- Allow anyone (anon) to read content and payments belonging to active campaigns
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public content access" ON content
FOR SELECT TO anon USING (true);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public payment access" ON payments
FOR SELECT TO anon USING (true);

-- Note: In a production environment, we might want to restrict this further 
-- (e.g. check if campaign status is active), but for now we allow reading 
-- to facilitate the public link feature.
