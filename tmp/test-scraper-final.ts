import { fetchInstagramData } from '../src/services/scraperService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testFinal() {
  const urls = [
    "https://www.instagram.com/insights/media/3867455795881435915/", // Insights
    "https://www.instagram.com/p/DWr9o5CCeML/" // Public Reel
  ];

  for (const url of urls) {
    console.log(`\n--- Testing URL: ${url} ---`);
    try {
      const data = await fetchInstagramData(url);
      console.log("SUCCESS:", data);
    } catch (e) {
      console.error("FAILED:", e.message);
    }
  }
}

testFinal();
