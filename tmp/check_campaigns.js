import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCampaigns() {
  const { data: campaigns, error } = await supabase.from('campaigns').select('*');
  if (error) {
    console.error("Fetch error:", error.message);
    return;
  }

  console.log("Current Campaigns:");
  campaigns.forEach(c => {
    console.log(`- ${c.name} (ID: ${c.id}, Status: ${c.status})`);
  });
}

checkCampaigns();
