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
      }
    } else {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const oembedRes = await axios.get(oembedUrl);
      title = oembedRes.data.title || title;
      author = oembedRes.data.author_name || author;
    }
    return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
  } catch (error) {
    return { title: "YouTube Video", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

export async function fetchInstagramData(url: string) {
  let title = "Instagram Post", views = 0, likes = 0, comments = 0, ownerId = "", shortcode = "", thumbnail = "";
  const apiKey = process.env.RAPIDAPI_KEY;
  const start = Date.now();
  try {
    try {
      const pageRes = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 3000 });
      const thumbMatch = pageRes.data.match(/<meta property="og:image" content="([^"]+)"/);
      if (thumbMatch) {
         // Proxy via weserv to prevent 403 CDN errors
         thumbnail = `https://images.weserv.nl/?url=${encodeURIComponent(thumbMatch[1])}&default=https://cdn-icons-png.flaticon.com/512/174/174855.png`;
      }
    } catch (e) { /* thumbnail fetch optional */ }

    const postRes = await axios.get('https://instagram-looter2.p.rapidapi.com/post', {
      params: { url },
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
      timeout: 5000
    });
    
    const postDataRaw = postRes.data as any;
    
    // Check for RapidAPI Quota Limit
    if (postDataRaw?.message?.includes('exceeded') || postDataRaw?.message?.includes('quota')) {
      console.warn("RapidAPI Quota Exceeded for Instagram Looter 2. Switching to HTML fallback.");
      throw new Error('RAPIDAPI_QUOTA_EXCEEDED');
    }

    const postData = postDataRaw?.data || postDataRaw?.items?.[0] || postDataRaw?.graphql?.shortcode_media || postDataRaw;
    
    if (postData && (postData.id || postData.shortcode)) {
      ownerId = postData.owner?.id || postData.user?.pk || postData.owner?.pk || "";
      shortcode = postData.shortcode || postData.code || "";
      title = postData.caption?.text || postData.text || postData.title || title;
      if (title === "Instagram Post" || !title || title === "") {
        title = postData.edge_media_to_caption?.edges?.[0]?.node?.text || title;
      }

      likes = postData.like_count ?? postData.likes ?? (postData.edge_media_preview_like?.count ?? 0);
      comments = postData.comment_count ?? postData.comments ?? (postData.edge_media_to_comment?.count ?? 0);
      
      views = Math.max(
        postData.view_count || 0,
        postData.play_count || 0,
        postData.video_view_count || 0,
        postData.video_play_count || 0,
        likes
      );
      
      if (!thumbnail && (postData.display_url || postData.thumbnail_url)) {
        thumbnail = `https://images.weserv.nl/?url=${encodeURIComponent(postData.display_url || postData.thumbnail_url)}&default=https://cdn-icons-png.flaticon.com/512/174/174855.png`;
      }
    } else {
      throw new Error('NO_POST_DATA_FOUND');
    }

    const isVideo = url.includes('/reel/') || postData?.is_video === true || !!postData?.video_url;
    
    if (views === 0 && isVideo && ownerId && shortcode) {
      try {
        const reelsRes = await axios.get('https://instagram-looter2.p.rapidapi.com/reels', {
          params: { id: ownerId },
          headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
          timeout: 4000
        });
        const reel = reelsRes.data.items?.find((i: any) => i.media?.code === shortcode);
        if (reel?.media) {
          const reelViews = Math.max(
            reel.media.play_count || 0,
            reel.media.view_count || 0,
            reel.media.video_view_count || 0
          );
          if (reelViews > views) views = reelViews;
          if (reel.media.like_count > likes) likes = reel.media.like_count;
          if (reel.media.comment_count > comments) comments = reel.media.comment_count;
        }
      } catch (e) { /* reels fallback optional */ }
    }

    // Last resort fallback via HTML regex if views still 0
    if (views === 0) {
      try {
        const fallbackRes = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 3000 });
        const html = fallbackRes.data;
        const viewMatch = html.match(/"video_view_count":(\d+)/) || html.match(/"play_count":(\d+)/);
        if (viewMatch) views = parseInt(viewMatch[1]);
        if (views < likes) views = likes;
      } catch (e) { /* fallback ignored if fails */ }
    }

    const duration = Date.now() - start;
    const isZeroViews = views === 0 && isVideo;
    
    // Log FULL response if something is wrong to debug 0-views
    await logScraperAction('instagram', url, isZeroViews ? 'error' : 'success', isZeroViews ? 'Extracted 0 views for IG video' : undefined, duration, { 
      views, 
      likes, 
      hasApiKey: !!apiKey,
      rawResponse: isZeroViews ? (postRes.data as any) : undefined,
      postDataFound: !!postData 
    });

    return { title: title.substring(0, 100), views, likes, comments, thumbnail };
  } catch (error: any) {
    const duration = Date.now() - start;
    const isQuotaError = error.message === 'RAPIDAPI_QUOTA_EXCEEDED';
    
    // --- EMERGENCY HTML FALLBACK ---
    // If API fails or quota hit, try direct HTML scraping
    console.log(`[IG Scraper] API failed (${error.message}). Attempting direct HTML fallback for ${url}...`);
    try {
      const pageRes = await axios.get(url, { 
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" }, 
        timeout: 5000 
      });
      const html = pageRes.data;
      
      // 1. Extract Views
      const viewMatch = html.match(/"video_view_count":(\d+)/) || html.match(/"play_count":(\d+)/) || html.match(/"edge_media_preview_like":\{"count":(\d+)\}/);
      if (viewMatch) views = parseInt(viewMatch[1]);
      
      // 2. Extract Likes as backup for views
      const likeMatch = html.match(/"edge_media_preview_like":\{"count":(\d+)\}/) || html.match(/"like_count":(\d+)/);
      if (likeMatch && views < parseInt(likeMatch[1])) {
          likes = parseInt(likeMatch[1]);
          if (views === 0) views = likes; // Use likes as proxy for views if 0
      }

      // 3. Extract Thumbnail
      const thumbMatch = html.match(/<meta property="og:image" content="([^"]+)"/) || html.match(/"display_url":"([^"]+)"/);
      if (thumbMatch && !thumbnail) {
        thumbnail = `https://images.weserv.nl/?url=${encodeURIComponent(thumbMatch[1].replace(/\\u0026/g, '&'))}&default=https://cdn-icons-png.flaticon.com/512/174/174855.png`;
      }
      
      // 4. Extract Title
      const titleMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
      if (titleMatch && title === "Instagram Post") title = titleMatch[1].split(' - ')[0];

      if (views > 0) {
        await logScraperAction('instagram', url, 'success', `HTML Fallback Success (API ${error.message})`, duration, { views, mode: 'HTML_ONLY' });
        return { title: title.substring(0, 100), views, likes, comments, thumbnail };
      }
    } catch (fallbackError: any) {
      console.error("Instagram Fallback also failed:", fallbackError.message);
    }

    await logScraperAction('instagram', url, 'error', `IG Fail: ${error.message}`, duration, { 
      status: error.response?.status,
      isQuotaError,
      hasApiKey: !!apiKey
    });

    console.error("Instagram Fetch Error:", error.message);
    return { title: "Instagram Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
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
    const postId = urlObj.pathname.split('/').pop();
    const statsRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"commentCount"\\s*:\\s*"(\\d+)"[\\s\\S]*?"likeCount"\\s*:\\s*"(\\d+)"`, 'i');
    const match = html.match(statsRegex);
    let views = 0, likes = 0, comments = 0;
    if (match) { comments = parseInt(match[1], 10); likes = parseInt(match[2], 10); }
    const impRegex = new RegExp(`"gravityId"\\s*:\\s*"${postId}"[\\s\\S]*?"impressionCount"\\s*:\\s*"(\\d+)"`, 'i');
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
  const apiKey = process.env.RAPIDAPI_KEY;
  try {
    const res = await axios.get('https://instagram-looter2.p.rapidapi.com/user', {
      params: { username },
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
      timeout: 5000
    });
    
    const data = res.data?.data || res.data;
    const followers = data.follower_count || 0;
    // Instagram Monthly Reach estimate: Followers * 2.1 (reels + posts reach)
    const monthlyViews = Math.round(followers * 1.2); 

    return {
      platform: 'instagram',
      username: data.username || username,
      followers,
      monthlyReach: monthlyViews,
      engagement: data.media_count > 100 ? "Estable" : "En crecimiento",
      image: data.profile_pic_url ? `https://images.weserv.nl/?url=${encodeURIComponent(data.profile_pic_url)}&default=https://cdn-icons-png.flaticon.com/512/1144/1144760.png` : "",
      description: data.biography || "",
      region: "N/A"
    };
  } catch (e) {
    throw new Error("No se pudo encontrar el perfil de Instagram.");
  }
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
