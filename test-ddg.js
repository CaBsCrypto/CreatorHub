import axios from 'axios';

async function searchGoogle() {
  try {
    const res = await axios.get('https://html.duckduckgo.com/html/?q=site:rapidapi.com+"instagram-looter2"+"Media+info+by+URL"');
    console.log(res.data.substring(0, 1000));
    const matches = res.data.match(/href="([^"]+)"/g);
    if (matches) {
      console.log(matches.slice(0, 10));
    }
  } catch (e) {
    console.log(e.message);
  }
}

searchGoogle();
