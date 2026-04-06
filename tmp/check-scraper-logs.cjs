const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogs() {
  console.log("Checking Scraper Logs in DB...");
  const { data, error } = await supabase
    .from('scraper_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }

  console.log("Recent Instagram Scraper Logs:");
  data.forEach(log => {
    console.log(`[${log.created_at}] Status: ${log.status} | Provider: ${log.metadata?.provider || 'N/A'} | Error: ${log.error_message || 'None'} | URL: ${log.url}`);
  });
}

checkLogs();
