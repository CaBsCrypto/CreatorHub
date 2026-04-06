const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
  console.log("--- Instagram Metrics ---");
  const { data: igData, error: igError } = await supabase
    .from('content')
    .select('id, url, views, likes, platform, title')
    .eq('platform', 'instagram')
    .order('created_at', { ascending: false })
    .limit(5);

  if (igError) console.error("IG Error:", igError.message);
  else igData.forEach(item => console.log(`- ID: ${item.id} | Views: ${item.views} | Likes: ${item.likes} | Title: ${item.title?.substring(0, 30)}...`));

  console.log("\n--- YouTube Metrics ---");
  const { data: ytData, error: ytError } = await supabase
    .from('content')
    .select('id, url, views, likes, platform, title')
    .eq('platform', 'youtube')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ytError) console.error("YT Error:", ytError.message);
  else ytData.forEach(item => console.log(`- ID: ${item.id} | Views: ${item.views} | Likes: ${item.likes} | Title: ${item.title?.substring(0, 30)}...`));

  console.log("\n--- Recent Scraper Logs (Errors) ---");
  const { data: logs, error: logsError } = await supabase
    .from('scraper_logs')
    .select('*')
    .eq('status', 'error')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsError) console.error("Logs Error:", logsError.message);
  else logs.forEach(log => console.log(`- [${log.created_at}] ${log.platform}: ${log.error_message?.substring(0, 100)}`));
}

checkStatus();
