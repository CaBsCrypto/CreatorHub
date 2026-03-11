import axios from 'axios';

async function getReel() {
  try {
    const res = await axios.get('https://www.reddit.com/r/Instagram/search.json?q=url:instagram.com/reel/&restrict_sr=1');
    const posts = res.data.data.children;
    for (const post of posts) {
      const url = post.data.url;
      if (url && url.includes('/reel/')) {
        console.log("Found reel URL:", url);
        return url;
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}

getReel();
