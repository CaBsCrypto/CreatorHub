import dotenv from 'dotenv';
import { fetchYouTubeData, fetchInstagramData } from '../src/services/scraperService.js';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugScrapers() {
  console.log("--- Fetching recent 0-view items from DB ---");
  const { data, error } = await supabase
    .from('content')
    .select('url, platform, views')
    .or('platform.eq.youtube,platform.eq.instagram')
    .eq('views', 0)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error("DB Error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("No recent items with 0 views found.");
    return;
  }

  for (const item of data) {
    console.log(`\nTesting ${item.platform}: ${item.url}`);
    try {
      let result;
      if (item.platform === 'youtube') {
        result = await fetchYouTubeData(item.url);
      } else {
        result = await fetchInstagramData(item.url);
      }
      console.log('Scrape Result:', JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error('Scrape Failed:', err.message);
    }
  }
}

debugScrapers().catch(console.error);
