const axios = require('axios');
const fs = require('fs');

async function test() {
  const reelUrl = 'https://www.instagram.com/p/DVnHBzIDPbT/';
  const apiKey = '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38';
  
  console.log(`Testing Reel: ${reelUrl}`);
  
  const options = {
    method: 'GET',
    url: 'https://instagram-looter2.p.rapidapi.com/post',
    params: { url: reelUrl },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const postData = response.data.data || response.data.items?.[0] || response.data;
    
    console.log('--- FULL POST DATA ---');
    fs.writeFileSync('full-ig-response.json', JSON.stringify(postData, null, 2));
    console.log('Saved to full-ig-response.json');
    
    console.log('--- API RESPONSE KEYS ---');
    console.log(Object.keys(postData));
    
    const views = Math.max(
      postData.view_count || 0,
      postData.play_count || 0,
      postData.video_view_count || 0,
      postData.video_play_count || 0
    );
    const likes = postData.like_count ?? postData.likes ?? (postData.edge_media_preview_like?.count ?? 0);
    const comments = postData.comment_count ?? postData.comments ?? (postData.edge_media_to_comment?.count ?? 0);
    
    console.log('--- EXTRACTED DATA ---');
    console.log({
      views,
      likes,
      comments,
      is_video: postData.is_video,
      owner_id: postData.owner?.id || postData.user?.pk,
      shortcode: postData.shortcode || postData.code
    });

    if (views === 0 && postData.is_video) {
        console.log('Views are 0. Testing Reels endpoint...');
        const ownerId = postData.owner?.id || postData.user?.pk;
        const reelsRes = await axios.get('https://instagram-looter2.p.rapidapi.com/reels', {
            params: { id: ownerId },
            headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' }
        });
        const reel = reelsRes.data.items?.find(i => i.media?.code === (postData.shortcode || postData.code));
        if (reel) {
            console.log('Found in Reels endpoint!');
            console.log({
                reel_views: reel.media?.play_count ?? reel.media?.view_count,
                reel_likes: reel.media?.like_count
            });
        } else {
            console.log('Not found in Reels endpoint.');
        }
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
