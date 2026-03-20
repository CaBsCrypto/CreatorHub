import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyzeDependencies() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: content } = await supabase.from('content').select('creator_id');
  const { data: campaigns } = await supabase.from('campaigns').select('created_by');

  console.log("Analyzing dependencies:");
  users.forEach(u => {
    const userContent = content?.filter(c => c.creator_id === u.id) || [];
    const userCampaigns = campaigns?.filter(c => c.created_by === u.id) || [];
    console.log(`User: ${u.email} - Content: ${userContent.length}, Campaigns Created: ${userCampaigns.length}`);
  });
}

analyzeDependencies();
