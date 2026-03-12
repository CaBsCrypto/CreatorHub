/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper types matching our database schema
export type UserRole = 'creator' | 'manager' | 'admin';

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
  audience_geo?: Record<string, number>; // Mapping of country codes to audience percentage/count
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
  target_posts?: number; // Target number of posts for gamification
  created_by: string;
  created_at: string;
}

export interface Content {
  id: string;
  campaign_id: string;
  creator_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap';
  url: string;
  title: string | null;
  thumbnail: string | null;
  views: number;
  likes: number;
  comments: number;
  uploaded_at: string | null;
  created_at: string;
}
