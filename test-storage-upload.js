import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log("Testing Supabase Storage...");
  try {
    // 1. List Buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("❌ List Buckets Error:", bucketError.message);
    } else {
      console.log("✅ Buckets Found:", buckets.map(b => b.name));
    }

    // 2. Try to list files in content-attachments
    const bucketName = 'content-attachments';
    const { data: files, error: listError } = await supabase.storage.from(bucketName).list();
    
    if (listError) {
        console.warn(`⚠️ Could not list files in ${bucketName} (it might not exist):`, listError.message);
        console.log(`Attempting to create bucket ${bucketName}...`);
        // Note: createBucket usually requires service_role key, but let's see.
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true
        });
        if (createError) {
            console.error(`❌ Create Bucket Error (expected if not using service_role):`, createError.message);
        } else {
            console.log(`✅ Bucket ${bucketName} created!`);
        }
    } else {
        console.log(`✅ Bucket ${bucketName} is accessible. ${files.length} files found.`);
    }

  } catch (err) {
    console.error("❌ Unexpected Error:", err.message);
  }
}

testStorage();
