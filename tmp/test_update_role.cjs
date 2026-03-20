const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: users } = await supabase.from('users').select('*').limit(1);
  const user = users[0];
  console.log(`Setting role='admin' for user ${user.id} and selecting...`);
  
  const { data, error } = await supabase.from('users').update({ role: 'admin' }).eq('id', user.id).select();
  console.log("Returned data length:", data ? data.length : 0);
  console.log("Raw Data:", data);
  console.log("Error:", error);
}
run();
