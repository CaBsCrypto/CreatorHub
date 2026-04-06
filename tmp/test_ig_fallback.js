import axios from 'axios';

async function fetchFromHTMLFallback(url) {
  console.log(`[Testing New Fallback] URL: ${url}`);
  try {
    const pageRes = await axios.get(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }, 
      timeout: 10000 
    });
    const html = pageRes.data;
    
    let views = 0, likes = 0, comments = 0, thumbnail = "", title = "Instagram Post";
    
    // 1. Try to find numerical data with more granular regex
    const viewMatch = html.match(/"video_view_count":(\d+)/) || html.match(/"play_count":(\d+)/);
    if (viewMatch) views = parseInt(viewMatch[1]);
    
    const likeMatch = html.match(/"edge_media_preview_like":\{"count":(\d+)\}/) || html.match(/"like_count":(\d+)/);
    if (likeMatch) likes = parseInt(likeMatch[1]);

    const commMatch = html.match(/"edge_media_to_comment":\{"count":(\d+)\}/) || html.match(/"comment_count":(\d+)/);
    if (commMatch) comments = parseInt(commMatch[1]);

    // 2. Logic Check
    if (views === 0 && likes > 0) views = likes; 

    // 3. Metadata
    const thumbMatch = html.match(/<meta property="og:image" content="([^"]+)"/) || html.match(/"display_url":"([^"]+)"/);
    if (thumbMatch) {
      thumbnail = thumbMatch[1].replace(/\\u0026/g, '&');
    }
    
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (descMatch) title = descMatch[1].split(' - ')[0];

    return { 
      success: true,
      title, 
      views, 
      likes, 
      comments, 
      thumbnail: thumbnail.substring(0, 40) + "..."
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const url = 'https://www.instagram.com/reels/DAyG19CscHw/'; // Real reel
fetchFromHTMLFallback(url).then(res => console.log(JSON.stringify(res, null, 2)));
