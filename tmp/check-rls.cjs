const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  console.log("Checking RLS for scraper_logs...");
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'scraper_logs' });
  
  if (error) {
    if (error.message.includes('function get_policies() does not exist')) {
      console.log("get_policies helper not available. Trying direct query...");
      const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'scraper_logs');
      if (polError) console.error("Could not fetch policies:", polError.message);
      else console.log("Policies:", policies);
    } else {
      console.error("Error:", error.message);
    }
  } else {
    console.log("Policies:", data);
  }
}

checkRLS();
