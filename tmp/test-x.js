import axios from 'axios';

async function testX(url) {
  try {
    const urlObj = new URL(url);
    const fxUrl = `https://api.fxtwitter.com${urlObj.pathname}`;
    console.log(`Testing: ${url}`);
    console.log(`API URL: ${fxUrl}`);
    
    const res = await axios.get(fxUrl, { timeout: 10000 });
    
    if (res.data?.tweet) {
      const t = res.data.tweet;
      console.log('--- SUCCESS ---');
      console.log(`Title: ${t.text?.substring(0, 50)}...`);
      console.log(`Views: ${t.views}`);
      console.log(`Likes: ${t.likes}`);
      console.log(`Replies: ${t.replies}`);
      console.log('----------------\n');
    } else {
       console.log('--- NO TWEET DATA ---');
       console.log(res.data);
       console.log('----------------\n');
    }
  } catch (err) {
    console.error(`--- ERROR for ${url} ---`);
    console.error(err.response ? JSON.stringify(err.response.data) : err.message);
    console.log('----------------\n');
  }
}

async function run() {
  const urls = [
    'https://x.com/camululis/status/2039837582784131403', // Tweet from user
    'https://x.com/Suhail/status/1843468537651139049',    // Example tweet
    'https://twitter.com/elonmusk/status/1843466487126839737' // Another tweet
  ];

  for (const url of urls) {
    await testX(url);
  }
}

run();
