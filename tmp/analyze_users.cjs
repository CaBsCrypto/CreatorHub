const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyzeUsers() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  if (userError) {
    console.error("User fetch error:", userError.message);
    return;
  }

  const { data: content, error: contentError } = await supabase.from('content').select('creator_id');
  if (contentError) {
    console.error("Content fetch error:", contentError.message);
    return;
  }

  console.log("Analyzing users and content counts:");
  users.forEach(u => {
    const userContent = content.filter(c => c.creator_id === u.id);
    console.log(`User: ${u.email} (ID: ${u.id}) - Content Count: ${userContent.length}`);
  });
}

analyzeUsers();
