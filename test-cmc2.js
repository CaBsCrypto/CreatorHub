import axios from 'axios';
import fs from 'fs';

async function testCMC() {
  try {
    const url = 'https://coinmarketcap.com/community/post/374386254';
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    
    const html = res.data;
    fs.writeFileSync('cmc.html', html);
    console.log("Saved to cmc.html");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testCMC();
