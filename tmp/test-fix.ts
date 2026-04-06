import { fetchInstagramData } from '../src/services/scraperService';
import dotenv from 'dotenv';
dotenv.config();

const IG_URL = 'https://www.instagram.com/reel/C5To87vM-xS/'; 

async function test() {
  console.log("--- Testing Instagram Fix ---");
  try {
    const data = await fetchInstagramData(IG_URL);
    console.log("Final Result:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Final Error:", err.message);
  }
}

test();
