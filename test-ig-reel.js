const axios = require('axios');

async function testReel() {
  const options = {
    method: 'GET',
    url: 'https://instagram-looter2.p.rapidapi.com/post',
    params: { url: 'https://www.instagram.com/reel/C-t_Z55v7lR/' },
    headers: {
      'X-RapidAPI-Key': '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38',
      'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log("Response keys:", Object.keys(response.data));
    
    // Let's look for anything related to views, plays, or media
    const dataStr = JSON.stringify(response.data);
    
    const viewMatches = dataStr.match(/.{0,20}view.{0,20}/gi);
    const playMatches = dataStr.match(/.{0,20}play.{0,20}/gi);
    
    console.log("View matches:", viewMatches ? [...new Set(viewMatches)] : "None");
    console.log("Play matches:", playMatches ? [...new Set(playMatches)] : "None");
    
    if (response.data.data) {
        console.log("Data keys:", Object.keys(response.data.data));
    }
    
  } catch (error) {
    console.error(error.message);
    if (error.response) console.error(error.response.data);
  }
}

testReel();
