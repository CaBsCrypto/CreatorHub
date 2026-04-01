-- Migration: 20260401_discord_schema.sql
-- Description: Add discord-specific columns to content and history tables, and create discord_session_events

-- 1. Add columns to content table
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS avg_duration_minutes BIGINT DEFAULT 0;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS shares_count BIGINT DEFAULT 0;

-- 2. Add columns to history table
ALTER TABLE public.content_metrics_history ADD COLUMN IF NOT EXISTS avg_duration_minutes BIGINT DEFAULT 0;
ALTER TABLE public.content_metrics_history ADD COLUMN IF NOT EXISTS shares_count BIGINT DEFAULT 0;

-- 3. Create discord_session_events table
CREATE TABLE IF NOT EXISTS public.discord_session_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('join', 'leave', 'stream_start', 'stream_end')),
    user_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_minutes BIGINT DEFAULT 0
);

-- 4. Enable RLS
ALTER TABLE public.discord_session_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Admins have full access to discord events"
ON public.discord_session_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
      AND public.users.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Creators can view their own content's discord events"
ON public.discord_session_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content 
    WHERE public.content.id = discord_session_events.content_id 
      AND public.content.creator_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their campaigns' content discord events"
ON public.discord_session_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content 
    JOIN public.campaigns ON public.content.campaign_id = public.campaigns.id
    WHERE public.content.id = discord_session_events.content_id 
      AND public.campaigns.client_id = auth.uid()
  )
);

-- 6. Update Snapshot Trigger to include new discord fields
CREATE OR REPLACE FUNCTION snapshot_content_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Record history when a new content is inserted or when metrics change
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (
      NEW.views IS DISTINCT FROM OLD.views OR 
      NEW.likes IS DISTINCT FROM OLD.likes OR 
      NEW.comments IS DISTINCT FROM OLD.comments OR
      NEW.average_viewers IS DISTINCT FROM OLD.average_viewers OR
      NEW.peek_viewers IS DISTINCT FROM OLD.peek_viewers OR
      NEW.unique_chatters IS DISTINCT FROM OLD.unique_chatters OR
      NEW.avg_duration_minutes IS DISTINCT FROM OLD.avg_duration_minutes OR
      NEW.shares_count IS DISTINCT FROM OLD.shares_count
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
      duration_minutes,
      avg_duration_minutes,
      shares_count
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
      COALESCE(NEW.duration_minutes, 0),
      COALESCE(NEW.avg_duration_minutes, 0),
      COALESCE(NEW.shares_count, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
