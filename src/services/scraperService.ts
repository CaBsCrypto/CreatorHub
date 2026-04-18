import axios from "axios";
import { google } from "googleapis";
import { logScraperAction } from "./scraperLogService.js";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";

export async function fetchTikTokData(url: string) {
  const start = Date.now();
  try {
    let title = "TikTok Video", author = "", thumbnail = "";
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedRes = await axios.get(oembedUrl, {
        headers: { "User-Agent": USER_AGENT }
      });
      if (oembedRes.data.title) title = oembedRes.data.title;
      if (oembedRes.data.author_name) author = oembedRes.data.author_name;
      if (oembedRes.data.thumbnail_url) thumbnail = oembedRes.data.thumbnail_url;
    } catch (err: any) { console.error("TikTok oEmbed error:", err.message); }

    let views = 0, likes = 0, comments = 0;
    try {
      const pageRes = await axios.get(url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 5000
      });
      const html = pageRes.data;
      if (!thumbnail) {
        const thumbMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (thumbMatch) thumbnail = thumbMatch[1];
      }
      const playMatch = html.match(/"playCount":(\d+)/);
      const diggMatch = html.match(/"diggCount":(\d+)/);
      const commentMatch = html.match(/"commentCount":(\d+)/);
      if (playMatch) views = parseInt(playMatch[1], 10);
      if (diggMatch) likes = parseInt(diggMatch[1], 10);
      if (commentMatch) comments = parseInt(commentMatch[1], 10);
    } catch (err: any) { console.error("TikTok scrape error:", err.message); }

    const duration = Date.now() - start;
    const isZeroViews = views === 0;
    await logScraperAction('tiktok', url, isZeroViews ? 'error' : 'success', isZeroViews ? 'TikTok returned 0 views' : undefined, duration, { views, likes });

    return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
  } catch (error: any) {
    const duration = Date.now() - start;
    await logScraperAction('tiktok', url, 'error', error.message, duration);
    return { title: "TikTok Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

export async function fetchXData(url: string) {
  const start = Date.now();
  let title = "X (Twitter) Post", views = 0, likes = 0, comments = 0, author = "", thumbnail = "";
  try {
    const urlObj = new URL(url);
    const fxUrl = `https://api.fxtwitter.com${urlObj.pathname}`;
    const fxRes = await axios.get(fxUrl, { timeout: 5000 });
    if (fxRes.data?.tweet) {
      const t = fxRes.data.tweet;
      title = t.text || title;
      author = t.author?.name || "";
      likes = parseInt(t.likes, 10) || 0;
      comments = parseInt(t.replies, 10) || 0;
      views = parseInt(t.views, 10) || 0;
      if (t.media?.all_media?.[0]?.url) thumbnail = t.media.all_media[0].url;
      else if (t.author?.avatar_url) thumbnail = t.author.avatar_url;
    }
    const duration = Date.now() - start;
    await logScraperAction('x', url, views === 0 ? 'error' : 'success', views === 0 ? 'X returned 0 views' : undefined, duration, { views, likes });
  } catch (err: any) {
    console.error("X API error:", err.message);
    await logScraperAction('x', url, 'error', err.message, Date.now() - start);
  }
  return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
}

export async function fetchYouTubeData(url: string) {
  const start = Date.now();
  let title = "YouTube Video", author = "", views = 0, likes = 0, comments = 0, thumbnail = "";
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    if (videoId && process.env.YOUTUBE_API_KEY) {
      const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
      const response = await youtube.videos.list({ part: ['snippet', 'statistics'], id: [videoId] });
      if (response.data.items?.[0]) {
        const video = response.data.items[0];
        title = video.snippet?.title || title;
        author = video.snippet?.channelTitle || author;
        views = parseInt(video.statistics?.viewCount || '0', 10);
        likes = parseInt(video.statistics?.likeCount || '0', 10);
        comments = parseInt(video.statistics?.commentCount || '0', 10);
      } else {
        console.warn(`[YT Scraper] No video found for ID ${videoId}`);
      }
    } else {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const oembedRes = await axios.get(oembedUrl);
      title = oembedRes.data.title || title;
      author = oembedRes.data.author_name || author;
    }

    const duration = Date.now() - start;
    await logScraperAction('youtube', url, views === 0 ? 'error' : 'success', views === 0 ? 'YouTube returned 0 views (Quota or Invalid ID?)' : undefined, duration, { views, likes });

    return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error("[YT Scraper] Error:", error.message);
    await logScraperAction('youtube', url, 'error', error.message, duration);
    return { title: "YouTube Video", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

// --- INSTAGRAM REFACTOR (MULTI-PROVIDER & INSIGHTS SUPPORT) ---

const igCache = new Map<string, { data: any, timestamp: number }>();
const IG_CACHE_TTL = 15 * 60 * 1000; // 15 mins

/**
 * Converts an Instagram Media ID (from Insights links) to a public shortcode.
 */
function idToShortcode(id: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let shortcode = '';
  let idBigInt = BigInt(id);
  while (idBigInt > 0n) {
    let remainder = idBigInt % 64n;
    shortcode = alphabet[Number(remainder)] + shortcode;
    idBigInt = idBigInt / 64n;
  }
  return shortcode;
}

/**
 * Normalizes any Instagram URL (Posts, Reels, Insights) to a standard public URL.
 */
function normalizeInstagramUrl(url: string): string {
  if (url.includes('/insights/media/')) {
    const match = url.match(/\/insights\/media\/(\d+)/);
    if (match && match[1]) {
      const shortcode = idToShortcode(match[1]);
      console.log(`[IG Scraper] Converting Insights ID ${match[1]} to Shortcode ${shortcode}`);
      return `https://www.instagram.com/p/${shortcode}/`;
    }
  }
  return url;
}

function getInstagramApiKeys() {
  return [
    process.env.RAPIDAPI_KEY,
    process.env.RAPIDAPI_KEY_2,
    process.env.RAPIDAPI_KEY_3,
    process.env.RAPIDAPI_KEY_4,
    process.env.RAPIDAPI_KEY_5
  ].filter(k => k && k.length > 20 && !k.startsWith('TU_')) as string[];
}

// Updated to use the more stable "RockSolid AI" provider format (instagram-scraper-stable-api)
async function fetchFromRockSolidAPI(url: string, apiKey: string, keyIndex: number) {
  if (!apiKey) throw new Error("MISSING_KEY");
  
  // Detect if it's a reel or post for the 'type' parameter
  const type = (url.includes('/reel/') || url.includes('/reels/')) ? 'reel' : 'post';
  
  const response = await axios.get('https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php', {
    params: { 
      reel_post_code_or_url: url,
      type: type
    },
    headers: { 
      'X-RapidAPI-Key': apiKey, 
      'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com' 
    },
    validateStatus: () => true,
    timeout: 10000
  });

  if (response.status === 429 || response.data?.message?.includes('exceeded') || response.data?.message?.includes('quota')) {
    throw new Error(`RAPIDAPI_QUOTA_EXCEEDED_KEY_${keyIndex + 1}`);
  }

  if (response.status === 403 && response.data?.message?.includes('not subscribed')) {
    throw new Error(`API_NOT_SUBSCRIBED_KEY_${keyIndex + 1}`);
  }

  if (response.status !== 200) {
    throw new Error(`RapidAPI Error ${response.status}: ${response.data?.message || 'Unknown'}`);
  }

  const postData = response.data?.data || response.data;
  
  if (!postData || (!postData.id && !postData.shortcode && !postData.code)) {
    throw new Error('NO_POST_DATA_FOUND');
  }

  const title = postData.caption?.text || postData.title || "Instagram Post";
  const likes = postData.like_count ?? postData.likes ?? 0;
  const comments = postData.comment_count ?? postData.comments ?? 0;
  
  // Real view/play count prioritization
  let views = Math.max(
    postData.play_count || 0,
    postData.video_play_count || 0,
    postData.view_count || 0,
    postData.video_view_count || 0,
    postData.plays || 0,
    postData.metrics?.plays || 0,
    postData.metrics?.views || 0,
    postData.video?.play_count || 0,
    likes // proxy
  );

  let thumbnail = "";
  if (postData.thumbnail_url || postData.display_url) {
    thumbnail = `https://images.weserv.nl/?url=${encodeURIComponent(postData.thumbnail_url || postData.display_url)}&default=https://cdn-icons-png.flaticon.com/512/174/174855.png`;
  }

  return { title, views, likes, comments, thumbnail };
}


async function fetchFromRapidAPILooter2(url: string, apiKey: string, keyIndex: number) {
  const response = await axios.get('https://instagram-looter2.p.rapidapi.com/post', {
    params: { url },
    headers: { 
      'X-RapidAPI-Key': apiKey, 
      'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' 
    },
    validateStatus: () => true,
    timeout: 10000
  });

  if (response.status === 429 || response.data?.message?.includes('exceeded') || response.data?.message?.includes('quota')) {
    throw new Error(`RAPIDAPI_QUOTA_EXCEEDED_KEY_${keyIndex + 1}`);
  }

  if (response.status !== 200 || !response.data) {
    throw new Error(`RapidAPI Looter2 Error ${response.status}: ${response.data?.message || 'Unknown'}`);
  }

  const postData = response.data;
  
  // Real view/play count prioritization for Looter 2
  let views = Math.max(
    postData.play_count || 0,
    postData.view_count || 0,
    postData.video_view_count || 0,
    postData.video_play_count || 0,
    postData.likes || 0
  );

  const title = postData.caption || postData.title || "Instagram Post";
  const likes = postData.likes || 0;
  const comments = postData.comments || 0;
  
  let thumbnail = postData.thumbnail_url || postData.display_url || "";
  if (thumbnail) {
    thumbnail = `https://images.weserv.nl/?url=${encodeURIComponent(thumbnail)}&default=https://cdn-icons-png.flaticon.com/512/174/174855.png`;
  }

  return { title, views, likes, comments, thumbnail };
}

export async function fetchInstagramData(url: string) {
  const start = Date.now();
  const normalizedUrl = normalizeInstagramUrl(url);
  
  // 1. Check Cache
  const cached = igCache.get(normalizedUrl);
  if (cached && (Date.now() - cached.timestamp) < IG_CACHE_TTL) {
    console.log(`[IG Scraper] Using cached data for ${normalizedUrl}`);
    return cached.data;
  }

  const apiKeys = getInstagramApiKeys();
  let lastError = "";

  // 2. Execution Loop across all keys
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    
    // --- Step A: Try Instagram Looter (Primary) ---
    try {
      console.log(`[IG Scraper] Trying Instagram Looter (Primary) with Key ${i+1}...`);
      const data = await fetchFromRapidAPILooter2(normalizedUrl, key, i);
      
      if (data.views > 0 || data.likes > 0) {
        igCache.set(normalizedUrl, { data, timestamp: Date.now() });
        const duration = Date.now() - start;
        await logScraperAction('instagram', normalizedUrl, 'success', undefined, duration, { provider: 'Looter2', keyIndex: i+1, views: data.views });
        return data;
      }
      console.warn(`[IG Scraper] Looter Key ${i+1} returned 0 views. Trying fallback...`);
    } catch (err: any) {
      console.warn(`[IG Scraper] Looter Key ${i + 1} failed: ${err.message}`);
      lastError = err.message;
      
      if (err.message.includes('QUOTA_EXCEEDED')) {
        await logScraperAction('instagram', normalizedUrl, 'error', `Looter Key ${i+1} Quota Exceeded`, Date.now() - start);
      }
      // Continue to RockSolid even if Looter fails
    }

    // --- Step B: Try RockSolid API (Fallback) ---
    try {
      console.log(`[IG Scraper] Trying RockSolid API (Fallback) with Key ${i+1}...`);
      const data = await fetchFromRockSolidAPI(normalizedUrl, key, i);
      
      if (data.views > 0 || data.likes > 0) {
        igCache.set(normalizedUrl, { data, timestamp: Date.now() });
        const duration = Date.now() - start;
        await logScraperAction('instagram', normalizedUrl, 'success', undefined, duration, { provider: 'RockSolid', keyIndex: i+1, views: data.views });
        return data;
      }
    } catch (err: any) {
      console.warn(`[IG Scraper] RockSolid API ${i + 1} failed: ${err.message}`);
      lastError = err.message;
      
      if (err.message.includes('QUOTA_EXCEEDED') || err.message.includes('NOT_SUBSCRIBED')) {
         // Move to next key if this one is exhausted for both
         continue;
      }
    }
  }

  // If we reach here, all providers and keys failed
  const duration = Date.now() - start;
  await logScraperAction('instagram', url, 'error', `All methods failed. Last error: ${lastError}`, duration);
  console.error(`[IG Scraper] Fatal: All extraction methods failed. Last error: ${lastError}`);
  
  // Categorized error for the frontend/server to handle
  if (lastError.includes('QUOTA_EXCEEDED')) {
    throw new Error('IG_QUOTA_EXCEEDED');
  }
  
  return { title: "Instagram Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
}

export async function fetchCMCData(url: string) {
  const start = Date.now();
  try {
    const pageRes = await axios.get(url, { headers: { "User-Agent": USER_AGENT }, timeout: 5000 });
    const html = pageRes.data;
    let thumbnail = "";
    const thumbMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (thumbMatch) thumbnail = thumbMatch[1];

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const postId = pathParts.pop();

    // Stats Regex: Matches both "key":"value" and "key":value (number)
    // Also handles gravityId at the start of the block to ensure we match the right post
    const statsRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"commentCount"\\s*:\\s*"?(\\d+)"?[\\s\\S]*?"likeCount"\\s*:\\s*"?(\\d+)"?`, 'i');
    const match = html.match(statsRegex);
    let views = 0, likes = 0, comments = 0;
    
    if (match) { 
      comments = parseInt(match[1], 10); 
      likes = parseInt(match[2], 10); 
    }

    // Impression Count Regex: Numeric or String
    const impRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"impressionCount"\\s*:\\s*"?(\\d+)"?`, 'i');
    const impMatch = html.match(impRegex);
    if (impMatch) views = parseInt(impMatch[1], 10);
    const duration = Date.now() - start;
    await logScraperAction('coinmarketcap', url, views === 0 ? 'error' : 'success', views === 0 ? 'CMC returned 0 views' : undefined, duration, { views, likes });
    return { title: "CoinMarketCap Post", views, likes, comments, thumbnail };
  } catch (error: any) {
    await logScraperAction('coinmarketcap', url, 'error', error.message, Date.now() - start);
    return { title: "CoinMarketCap Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

// --- PROFILE SCRAERS (REFINED FOR MONTHLY REACH) ---

export async function fetchTwitchProfile(username: string) {
  try {
    // Phase 1: Basic profile info from Twitch (image, description)
    const aboutUrl = `https://www.twitch.tv/${username}/about`;
    const aboutRes = await axios.get(aboutUrl, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000
    });
    const html = aboutRes.data;
    const titleMatch = html.match(/"description":"([^"]+)"/);
    const imgMatch = html.match(/"profile_image_url":"([^"]+)"/);

    // Phase 2: Professional stats from TwitchTracker API
    // This provides accurate 30-day historical data
    const statsUrl = `https://twitchtracker.com/api/channels/summary/${username}`;
    const statsRes = await axios.get(statsUrl, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000
    });
    
    const stats = statsRes.data;
    const hoursStreamed = stats.minutes_streamed ? Math.round(stats.minutes_streamed / 60) : 0;
    const avgViewers = stats.avg_viewers || 0;
    const totalFollowers = stats.followers_total || 0;

    return {
      platform: 'twitch',
      username,
      followers: totalFollowers,
      monthlyReach: stats.hours_watched ? Math.round(stats.hours_watched / 10) : Math.round(avgViewers * 40), // Heuristic if hours_watched is weird
      avgViewers,
      hoursStreamed,
      engagement: avgViewers > 1000 ? "Alta" : "Media",
      image: imgMatch ? imgMatch[1] : "",
      description: titleMatch ? titleMatch[1] : `Canal de Twitch de ${username}`,
      region: "Global"
    };
  } catch (e) {
    console.error("Twitch fetch error:", e);
    throw new Error("No se pudo encontrar el perfil de Twitch o sus estadísticas.");
  }
}

export async function fetchInstagramProfile(username: string) {
  const start = Date.now();
  const apiKeys = getInstagramApiKeys();
  
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    try {
      console.log(`[IG Profile] Trying Provider API ${i + 1} for @${username}...`);
      const res = await axios.get('https://instagram-looter2.p.rapidapi.com/profile', {
        params: { username },
        headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
        validateStatus: () => true,
        timeout: 6000
      });

      if (res.status === 429 || res.data?.message?.includes('exceeded') || res.data?.message?.includes('quota')) {
        throw new Error(`RAPIDAPI_QUOTA_EXCEEDED`);
      }

      const data = res.data?.data || res.data;
      if (!data || (!data.username && !data.pk)) throw new Error("NO_PROFILE_DATA");

      const followers = data.follower_count ?? data.edge_followed_by?.count ?? 0;
      const mediaCount = data.media_count ?? data.edge_owner_to_timeline_media?.count ?? 0;
      const monthlyViews = Math.round(followers * 1.2); 

      return {
        platform: 'instagram',
        username: data.username || username,
        followers,
        monthlyReach: monthlyViews,
        engagement: mediaCount > 100 ? "Estable" : "En crecimiento",
        image: data.profile_pic_url ? `https://images.weserv.nl/?url=${encodeURIComponent(data.profile_pic_url)}&default=https://cdn-icons-png.flaticon.com/512/1144/1144760.png` : "",
        description: data.biography || "",
        region: "N/A"
      };
    } catch (e: any) {
      console.warn(`[IG Profile] API ${i + 1} failed: ${e.message}`);
      if (i < apiKeys.length - 1) continue;
      throw new Error(`No se pudo encontrar el perfil de Instagram: ${e.message}`);
    }
  }
  throw new Error("No se pudo encontrar el perfil de Instagram (Todas las APIs fallaron).");
}

export async function fetchYouTubeProfile(handleOrId: string) {
  try {
    const handle = handleOrId.startsWith('@') ? handleOrId : `@${handleOrId}`;
    const url = `https://www.youtube.com/${handle}`;
    const res = await axios.get(url, { timeout: 5000 });
    const html = res.data;
    
    const subMatch = html.match(/"subscriberCountText":"([^"]+)"/);
    const nameMatch = html.match(/"title":"([^"]+)"/);
    const imgMatch = html.match(/"avatar":{"thumbnails":\[{"url":"([^"]+)"/);
    
    // YouTube Monthly Reach: Subs * multiplier
    const subsText = subMatch ? subMatch[1].replace(/ subscribers| subs| suscrip.*/g, '') : "0";
    let subs = 0;
    if (subsText.includes('K')) subs = parseFloat(subsText) * 1000;
    else if (subsText.includes('M')) subs = parseFloat(subsText) * 1000000;
    else subs = parseInt(subsText, 10) || 0;

    return {
      platform: 'youtube',
      username: handle,
      followers: subMatch ? subMatch[1] : "N/A",
      monthlyReach: Math.round(subs * 1.5),
      engagement: "Medio",
      image: imgMatch ? imgMatch[1] : "",
      description: nameMatch ? nameMatch[1] : "Canal de YouTube",
      region: "Global"
    };
  } catch (e) {
    throw new Error("No se pudo encontrar el canal de YouTube.");
  }
}
