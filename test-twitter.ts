import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://api.vxtwitter.com/elonmusk/status/1585841080431321088');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
