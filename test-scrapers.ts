import dotenv from 'dotenv';
import { fetchYouTubeData, fetchTikTokData, fetchInstagramData } from './src/services/scraperService.ts';

dotenv.config();

async function runTests() {
  console.log('--- Testing YouTube ---');
  const yt = await fetchYouTubeData('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  console.log('YouTube Result:', yt);

  console.log('\n--- Testing TikTok ---');
  const tt = await fetchTikTokData('https://www.tiktok.com/@khaby.lame/video/6959546274431945989');
  console.log('TikTok Result:', tt);

  console.log('\n--- Testing Instagram ---');
  const ig = await fetchInstagramData('https://www.instagram.com/p/Ct_v6O_uXf9/');
  console.log('Instagram Result:', ig);
}

runTests().catch(console.error);
