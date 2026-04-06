const axios = require('axios');
require('dotenv').config();

const keys = [
  process.env.RAPIDAPI_KEY,
  process.env.RAPIDAPI_KEY_2
].filter(Boolean);

const testUrl = 'https://www.instagram.com/reels/DAyG19CscHw/';

async function testRockSolid(url, key, index) {
  console.log(`\n--- Testing RockSolid API (Key ${index + 1}) ---`);
  try {
    const response = await axios.get('https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php', {
      params: { 
        reel_post_code_or_url: url,
        type: 'reel'
      },
      headers: { 
        'X-RapidAPI-Key': key, 
        'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com' 
      },
      timeout: 10000
    });
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data).substring(0, 500));
  } catch (error) {
    console.log(`Error: ${error.message}`);
    if (error.response) console.log(`Response Data:`, JSON.stringify(error.response.data));
  }
}

async function testLooter2(url, key, index) {
  console.log(`\n--- Testing Looter2 API (Key ${index + 1}) ---`);
  try {
    const response = await axios.get('https://instagram-looter2.p.rapidapi.com/post', {
      params: { url },
      headers: { 
        'X-RapidAPI-Key': key, 
        'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' 
      },
      timeout: 10000
    });
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data).substring(0, 500));
  } catch (error) {
    console.log(`Error: ${error.message}`);
    if (error.response) console.log(`Response Data:`, JSON.stringify(error.response.data));
  }
}

async function runTests() {
  for (let i = 0; i < keys.length; i++) {
    await testRockSolid(testUrl, keys[i], i);
    await testLooter2(testUrl, keys[i], i);
  }
}

runTests();
