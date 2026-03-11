import axios from 'axios';

async function testEndpoints() {
  const endpoints = [
    '/reel',
    '/reels',
    '/video',
    '/media-info-by-url',
    '/media-info'
  ];

  for (const ep of endpoints) {
    console.log(`Testing endpoint: ${ep}`);
    try {
      const response = await axios.request({
        method: 'GET',
        url: `https://instagram-looter2.p.rapidapi.com${ep}`,
        params: { url: 'https://www.instagram.com/reel/C-t_Z55v7lR/' },
        headers: {
          'X-RapidAPI-Key': '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38',
          'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com'
        },
        timeout: 5000
      });
      console.log(`Success on ${ep}:`, Object.keys(response.data));
    } catch (error) {
      console.log(`Failed on ${ep}:`, error.response ? error.response.status : error.message);
    }
  }
}

testEndpoints();
