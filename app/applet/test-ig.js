const axios = require('axios');

async function test() {
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
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

test();
