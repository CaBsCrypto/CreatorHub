const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countLinks() {
  const { count, error } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching count:', error);
    return;
  }

  console.log(`Total links in system: ${count}`);
}

countLinks();
