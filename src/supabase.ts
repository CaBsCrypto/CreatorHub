/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing. Check your .env file or Vercel environment variables.");
}

// Only create the client if we have a valid URL to avoid crashing the whole bundle
let supabaseClient: any = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.error("❌ ScraperLogService: Missing Supabase configuration (Backend context)");
    }
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (err: any) {
    console.error("❌ ScraperLogService: Failed to initialize Supabase client", err.message);
    return null;
  }
};

export const supabase = getSupabase();

// Helper types matching our database schema
export type UserRole = 'creator' | 'manager' | 'admin' | 'client';

export interface UserProfile {
  id: string; // UUID from Supabase Auth mapping
  role: UserRole;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  payment_method: 'binance' | 'wallet' | null;
  binance_id: string | null;
  wallet_address: string | null;
  wallet_network: string | null;
  wallet_note?: string | null;
  wallet_address_2?: string | null;
  wallet_network_2?: string | null;
  wallet_2_note?: string | null;
  admin_alias?: string | null; // Nickname visible only to admins
  audience_geo?: Record<string, number>; // Mapping of country codes to audience percentage/count
  deleted_at?: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
  target_posts?: number; // Target number of posts for gamification
  client_id?: string | null; // Associated client for restricted view
  twitter_url?: string | null;
  contact_info?: string | null;
  budget?: number;
  share_token?: string;
  slug?: string | null;
  notes?: string | null;
  created_by: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface Content {
  id: string;
  campaign_id: string;
  creator_id: string | null;
  guest_name?: string | null;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap' | 'twitch' | 'stream' | 'discord' | 'baseapp';
  url: string;
  title: string | null;
  description?: string | null;
  thumbnail: string | null;
  views: number;
  likes: number;
  comments: number;
  average_viewers?: number;
  peek_viewers?: number;
  unique_chatters?: number;
  unique_viewers?: number;
  followers?: number;
  new_subscriptions?: number;
  duration_minutes?: number; // Twitch/Discord total duration
  avg_duration_minutes?: number; // Discord specific: average stay
  shares_count?: number; // Discord specific: screen shares
  status: 'active' | 'archived' | 'pending';
  uploaded_at: string | null;
  deleted_at?: string | null;
  created_at: string;
}

export interface DiscordSessionEvent {
  id: string;
  content_id: string;
  event_type: 'join' | 'leave' | 'stream_start' | 'stream_end';
  user_name: string;
  timestamp: string;
  duration_minutes?: number;
}

export interface Payment {
  id: string;
  creator_id: string | null;
  guest_name?: string | null;
  amount: number;
  currency: string;
  concept: string | null;
  campaign_id: string | null;
  paid_at: string;
  created_at: string;
}

export interface ContentMetricsHistory {
  id: string;
  content_id: string;
  recorded_at: string;
  views: number;
  likes: number;
  comments: number;
  average_viewers?: number;
  peek_viewers?: number;
  unique_chatters?: number;
  unique_viewers?: number;
  followers?: number;
  new_subscriptions?: number;
  duration_minutes?: number;
}

export interface CampaignCreator {
  id: string;
  campaign_id: string;
  creator_id: string;
  created_at: string;
}
