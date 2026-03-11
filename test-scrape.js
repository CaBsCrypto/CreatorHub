import axios from 'axios';

async function testScrape() {
  try {
    const pageRes = await axios.get('https://www.instagram.com/reel/C-t_Z55v7lR/', {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
      timeout: 5000
    });
    
    const html = pageRes.data;
    
    const viewMatch = html.match(/"video_view_count":(\d+)/) || 
                      html.match(/"play_count":(\d+)/) ||
                      html.match(/"view_count":(\d+)/);
    console.log("View match:", viewMatch ? viewMatch[1] : "Not found");
    
    const likeMatch = html.match(/"edge_media_preview_like":{"count":(\d+)/) || 
                      html.match(/"like_count":(\d+)/);
    console.log("Like match:", likeMatch ? likeMatch[1] : "Not found");
    
    const commentMatch = html.match(/"edge_media_to_comment":{"count":(\d+)/) || 
                         html.match(/"comment_count":(\d+)/);
    console.log("Comment match:", commentMatch ? commentMatch[1] : "Not found");
  } catch (err) {
    console.error("Instagram scrape error:", err.message);
  }
}

testScrape();
