const axios = require('axios');
require('dotenv').config();

// Simulation of fetchFromRapidAPILooter2 from scraperService.ts
async function fetchFromRapidAPILooter2(url, apiKey, keyIndex) {
  if (!apiKey) throw new Error("MISSING_KEY");
  console.log(`[Test] Using API Key ${keyIndex + 1}...`);
  
  try {
    const response = await axios.get('https://instagram-looter2.p.rapidapi.com/post', {
      params: { url },
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
      validateStatus: () => true,
      timeout: 10000
    });

    console.log(`[Test] Status: ${response.status}`);
    
    if (response.status === 429 || response.data?.message?.includes('exceeded') || response.data?.message?.includes('quota')) {
      throw new Error(`QUOTA_EXCEEDED`);
    }

    if (response.status !== 200) {
      throw new Error(`RapidAPI Error ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const postDataRaw = response.data;
    if (postDataRaw.status === false || postDataRaw.errorMessage) {
      throw new Error(`API_INTERNAL_ERROR: ${postDataRaw.errorMessage || 'Unknown error'}`);
    }

    const postData = postDataRaw?.data || postDataRaw?.items?.[0] || postDataRaw?.graphql?.shortcode_media || postDataRaw;
    
    if (!postData || (!postData.id && !postData.shortcode)) {
      console.log("[Test] Raw Data Received:", JSON.stringify(postDataRaw).substring(0, 500));
      throw new Error('NO_POST_DATA_FOUND');
    }

    const likes = postData.like_count ?? postData.likes ?? postData.edge_media_preview_like?.count ?? 0;
    const comments = postData.comment_count ?? postData.comments ?? postData.edge_media_to_comment?.count ?? 0;
    const views = Math.max(postData.view_count || 0, postData.play_count || 0, postData.video_view_count || 0, likes);

    return { views, likes, comments, title: postData.caption?.text || "Instagram Post" };
  } catch (err) {
    console.error(`[Test] API ${keyIndex + 1} Failed:`, err.message);
    throw err;
  }
}

async function runTest() {
  const url = process.argv[2] || "https://www.instagram.com/p/DWr9o5CCeML/";
  const apiKeys = [
    process.env.RAPIDAPI_KEY,
    process.env.RAPIDAPI_KEY_2
  ].filter(Boolean);

  console.log(`Testing URL: ${url}`);
  console.log(`Found ${apiKeys.length} API Keys.`);

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const data = await fetchFromRapidAPILooter2(url, apiKeys[i], i);
      console.log("SUCCESS:", data);
      return;
    } catch (e) {
      if (i === apiKeys.length - 1) {
        console.log("All APIs failed. Testing HTML Fallback simulation...");
        // HTML Fallback simulation logic could go here if needed
      }
    }
  }
}

runTest();
