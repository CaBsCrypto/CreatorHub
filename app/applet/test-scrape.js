const axios = require('axios');

async function testScrape() {
  try {
    const url = 'https://www.instagram.com/reel/C-t_Z55v7lR/';
    const pageRes = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 5000
    });
    
    const html = pageRes.data;
    
    // Try to find view count in meta tags
    const viewMatch = html.match(/"video_view_count":(\d+)/);
    const playMatch = html.match(/"play_count":(\d+)/);
    const likeMatch = html.match(/"edge_media_preview_like":{"count":(\d+)/) || html.match(/"like_count":(\d+)/);
    const commentMatch = html.match(/"edge_media_to_comment":{"count":(\d+)/) || html.match(/"comment_count":(\d+)/);
    
    console.log("Views:", viewMatch ? viewMatch[1] : (playMatch ? playMatch[1] : 'Not found'));
    console.log("Likes:", likeMatch ? likeMatch[1] : 'Not found');
    console.log("Comments:", commentMatch ? commentMatch[1] : 'Not found');
    
    // Also check for og:description which often has "X Likes, Y Comments"
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (descMatch) {
      console.log("OG Desc:", descMatch[1]);
    }
  } catch (e) {
    console.error(e.message);
  }
}

testScrape();
