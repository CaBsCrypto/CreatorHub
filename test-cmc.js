import axios from 'axios';

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
    console.log("HTML length:", html.length);
    
    // Look for common JSON data islands
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      console.log("Found __NEXT_DATA__");
      const data = JSON.parse(nextDataMatch[1]);
      // We'll dump a bit of it or search for '374386254'
      console.log("Keys in props:", Object.keys(data.props || {}));
    } else {
      console.log("No __NEXT_DATA__ found");
    }

    // Attempt to regex match views/likes/comments directly
    const viewMatch = html.match(/"viewCount":(\d+)/) || html.match(/"views":(\d+)/);
    console.log("View match:", viewMatch ? viewMatch[1] : "Not found");
    
    const likeMatch = html.match(/"likeCount":(\d+)/) || html.match(/"likes":(\d+)/);
    console.log("Like match:", likeMatch ? likeMatch[1] : "Not found");
    
    const commentMatch = html.match(/"replyCount":(\d+)/) || html.match(/"commentCount":(\d+)/);
    console.log("Comment match:", commentMatch ? commentMatch[1] : "Not found");
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testCMC();
