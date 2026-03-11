import axios from 'axios';

async function testReels() {
  try {
    const response = await axios.request({
      method: 'GET',
      url: `https://instagram-looter2.p.rapidapi.com/reels`,
      params: { id: '25025320' }, // Instagram's user ID is 25025320
      headers: {
        'X-RapidAPI-Key': '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38',
        'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.items) {
      const item = response.data.items[0].media;
      console.log("Media keys:", Object.keys(item));
      console.log("view_count:", item.view_count);
      console.log("play_count:", item.play_count);
      console.log("code:", item.code);
    }
  } catch (error) {
    console.log(`Failed:`, error.response ? error.response.status : error.message);
  }
}

testReels();
