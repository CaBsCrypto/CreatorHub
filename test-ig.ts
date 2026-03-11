import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('https://api.microlink.io?url=https://www.instagram.com/p/C0O9_9_o1_2/');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
