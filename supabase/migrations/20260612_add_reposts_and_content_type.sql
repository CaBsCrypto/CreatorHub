-- Migration to add content_type, is_repost, and parent_id columns to content table

-- 1. Add columns to content table
ALTER TABLE content
ADD COLUMN IF NOT EXISTS content_type text,
ADD COLUMN IF NOT EXISTS is_repost boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES content(id) ON DELETE SET NULL;

-- 2. Add constraint for content_type values
ALTER TABLE content
DROP CONSTRAINT IF EXISTS content_type_check;

ALTER TABLE content
ADD CONSTRAINT content_type_check 
CHECK (content_type IN ('video_largo', 'video_corto') OR content_type IS NULL);

-- 3. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_content_is_repost ON content(is_repost) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_parent_id ON content(parent_id) WHERE deleted_at IS NULL;
