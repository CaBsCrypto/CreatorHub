import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function attemptDelete() {
  const emailToDelete = 'ivaj.rya@gmail.com'; // Identified as test user with 0 content
  
  const { data: user } = await supabase.from('users').select('id').eq('email', emailToDelete).single();
  
  if (!user) {
    console.log(`User ${emailToDelete} not found.`);
    return;
  }

  console.log(`Attempting to delete user ${emailToDelete} (ID: ${user.id})...`);
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', user.id);

  if (error) {
    console.error("DELETE ERROR:", error.message, error.details, error.hint);
  } else {
    console.log("SUCCESS: User deleted.");
  }
}

attemptDelete();
