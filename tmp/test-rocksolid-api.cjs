require('dotenv').config();
const axios = require('axios');

async function testRockSolid() {
  const url = 'https://www.instagram.com/p/C_q8Xqfvx_G/'; // Example post
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.log("No RAPIDAPI_KEY in .env");
    return;
  }

  console.log("Testing RockSolid API with RAPIDAPI_KEY...");
  try {
    const response = await axios.get('https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php', {
      params: { 
        reel_post_code_or_url: url,
        type: 'post'
      },
      headers: { 
        'X-RapidAPI-Key': apiKey, 
        'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com' 
      },
      validateStatus: () => true
    });

    console.log(`Status: ${response.status}`);
    if (response.data && response.data.message) {
      console.log(`Message: ${response.data.message}`);
    } else if (response.data && response.data.data) {
      console.log(`Success! Found post ID: ${response.data.data.id}`);
      console.log(`Likes: ${response.data.data.like_count}, Comments: ${response.data.data.comment_count}`);
    } else {
      console.log("Response:", Object.keys(response.data));
    }
  } catch (err) {
    console.error("Axios throw:", err.message);
  }
}

testRockSolid();
