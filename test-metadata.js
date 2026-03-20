import axios from 'axios';

async function testMetadata() {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const platform = 'youtube';
  
  console.log(`Testing metadata fetch for ${platform}: ${url}...`);
  try {
    // We need to call the local server API.
    // Assuming the server is running on http://localhost:3000
    const response = await axios.post('http://localhost:3000/api/fetch-metadata', {
      url,
      platform
    });
    
    console.log('✅ Response:', response.data);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

testMetadata();
