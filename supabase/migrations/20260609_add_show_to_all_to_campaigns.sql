-- Add show_to_all column to campaigns table to allow making personal campaigns public to other admins
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS show_to_all BOOLEAN DEFAULT FALSE;
