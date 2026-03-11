import axios from 'axios';

async function searchApi() {
  try {
    const res = await axios.get('https://rapidapi.com/mrngstar/api/instagram-looter2/details');
    console.log(res.data.substring(0, 500));
  } catch (e) {
    console.log(e.message);
  }
}

searchApi();
