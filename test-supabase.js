import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testing connection to:", supabaseUrl);
  try {
    const { data: userData, error: userError } = await supabase.from('users').select('*').limit(5);
    
    if (userError) {
      console.error("❌ Users Table Error:", userError.message);
    } else {
      console.log("✅ Users table accessed. Sample:", userData);
    }

    const { data: campaignData, error: campaignError } = await supabase.from('campaigns').select('*').limit(5);
    if (campaignError) {
      console.error("❌ Campaigns Table Error:", campaignError.message);
    } else {
      console.log("✅ Campaigns table accessed. Sample:", campaignData);
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", err.message);
  }
}

testSupabase();
