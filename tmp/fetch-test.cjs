const axios = require('axios');

async function testHTML(url) {
  console.log(`--- Testing HTML Fallback for ${url} ---`);
  try {
    const pageRes = await axios.get(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }, 
      timeout: 10000 
    });
    const html = pageRes.data;
    
    let views = 0, likes = 0, comments = 0;
    
    // Updated Regexes from my fix
    const viewMatch = html.match(/"video_view_count":(\d+)/) || 
                      html.match(/"play_count":(\d+)/) || 
                      html.match(/"video_play_count":(\d+)/) ||
                      html.match(/"edge_media_preview_like":\{"count":(\d+)\}/);
    if (viewMatch) views = parseInt(viewMatch[1]);
    
    const likeMatch = html.match(/"edge_media_preview_like":\{"count":(\d+)\}/) || 
                      html.match(/"like_count":(\d+)/) ||
                      html.match(/"edge_liked_by":\{"count":(\d+)\}/);
    if (likeMatch) likes = parseInt(likeMatch[1]);

    const commMatch = html.match(/"edge_media_to_comment":\{"count":(\d+)\}/) || 
                      html.match(/"comment_count":(\d+)/);
    if (commMatch) comments = parseInt(commMatch[1]);

    console.log("Extracted Data:", { views, likes, comments });
    
    if (views === 0 && likes > 0) {
      console.log("Using Likes as Proxy for Views");
      views = likes;
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

testHTML('https://www.instagram.com/reel/C5To87vM-xS/');
