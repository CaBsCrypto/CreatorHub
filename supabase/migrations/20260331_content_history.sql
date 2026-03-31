-- Migration: 20260331_content_history.sql
-- Description: Create history table for tracking content metrics chronologically

CREATE TABLE IF NOT EXISTS public.content_metrics_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    comments BIGINT DEFAULT 0,
    average_viewers BIGINT DEFAULT 0,
    peek_viewers BIGINT DEFAULT 0,
    unique_viewers BIGINT DEFAULT 0,
    unique_chatters BIGINT DEFAULT 0,
    followers BIGINT DEFAULT 0,
    new_subscriptions BIGINT DEFAULT 0,
    duration_minutes BIGINT DEFAULT 0
);

-- Index for efficient chronological querying
CREATE INDEX IF NOT EXISTS idx_content_metrics_history_content_id ON public.content_metrics_history(content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_history_recorded_at ON public.content_metrics_history(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.content_metrics_history ENABLE ROW LEVEL SECURITY;

-- Policy: Superadmin/Admin full access
CREATE POLICY "Admins have full access to content history"
ON public.content_metrics_history
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
      AND public.users.role IN ('admin', 'manager')
  )
);

-- Policy: Creators can access their own content's history
CREATE POLICY "Creators can view their own content history"
ON public.content_metrics_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content 
    WHERE public.content.id = content_metrics_history.content_id 
      AND public.content.creator_id = auth.uid()
  )
);

-- Policy: Clients can access their own campaigns' content history
CREATE POLICY "Clients can view their campaigns' content history"
ON public.content_metrics_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content 
    JOIN public.campaigns ON public.content.campaign_id = public.campaigns.id
    WHERE public.content.id = content_metrics_history.content_id 
      AND public.campaigns.client_id = auth.uid()
  )
);

-- Trigger function to snapshot metrics whenever they change significantly
CREATE OR REPLACE FUNCTION snapshot_content_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Record history when a new content is inserted or when metrics change
  -- We don't want to insert a new row if metrics didn't change at all
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (
      NEW.views IS DISTINCT FROM OLD.views OR 
      NEW.likes IS DISTINCT FROM OLD.likes OR 
      NEW.comments IS DISTINCT FROM OLD.comments OR
      NEW.average_viewers IS DISTINCT FROM OLD.average_viewers OR
      NEW.peek_viewers IS DISTINCT FROM OLD.peek_viewers OR
      NEW.unique_chatters IS DISTINCT FROM OLD.unique_chatters
     )) 
  THEN
    INSERT INTO public.content_metrics_history (
      content_id, 
      views, 
      likes, 
      comments,
      average_viewers,
      peek_viewers,
      unique_viewers,
      unique_chatters,
      followers,
      new_subscriptions,
      duration_minutes
    ) VALUES (
      NEW.id,
      COALESCE(NEW.views, 0),
      COALESCE(NEW.likes, 0),
      COALESCE(NEW.comments, 0),
      COALESCE(NEW.average_viewers, 0),
      COALESCE(NEW.peek_viewers, 0),
      COALESCE(NEW.unique_viewers, 0),
      COALESCE(NEW.unique_chatters, 0),
      COALESCE(NEW.followers, 0),
      COALESCE(NEW.new_subscriptions, 0),
      COALESCE(NEW.duration_minutes, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map the trigger to content table
DROP TRIGGER IF EXISTS trigger_snapshot_content_metrics ON public.content;
CREATE TRIGGER trigger_snapshot_content_metrics
AFTER INSERT OR UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION snapshot_content_metrics();
