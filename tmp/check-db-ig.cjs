const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkIG() {
  console.log("Checking Instagram content in DB...");
  const { data, error } = await supabase
    .from('content')
    .select('id, url, views, likes, platform')
    .eq('platform', 'instagram')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }

  console.log("Instagram Posts (Recent):");
  data.forEach(item => {
    console.log(`- ID: ${item.id} | Views: ${item.views} | Likes: ${item.likes} | URL: ${item.url}`);
  });
}

checkIG();
