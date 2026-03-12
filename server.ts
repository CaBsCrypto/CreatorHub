import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// --- PLATFORM HELPERS ---

async function fetchTikTokData(url: string) {
  try {
    let title = "TikTok Video", author = "", thumbnail = "";
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedRes = await axios.get(oembedUrl);
      if (oembedRes.data.title) title = oembedRes.data.title;
      if (oembedRes.data.author_name) author = oembedRes.data.author_name;
      if (oembedRes.data.thumbnail_url) thumbnail = oembedRes.data.thumbnail_url;
    } catch (err: any) { console.error("TikTok oEmbed error:", err.message); }

    let views = 0, likes = 0, comments = 0;
    try {
      const pageRes = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36" },
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

    return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
  } catch (error) {
    return { title: "TikTok Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

async function fetchXData(url: string) {
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
  } catch (err: any) { console.error("X API error:", err.message); }
  return { title: (author ? `${author} - ${title}` : title).substring(0, 100), views, likes, comments, thumbnail };
}

async function fetchYouTubeData(url: string) {
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

async function fetchInstagramData(url: string) {
  let title = "Instagram Post", views = 0, likes = 0, comments = 0, ownerId = "", shortcode = "", thumbnail = "";
  const apiKey = process.env.RAPIDAPI_KEY || '1e492088c3msh36ba0d59dedf5a7p1b7467jsnc6a3c896dd38';
  try {
    // Attempt to scrape thumbnail first (FAST)
    try {
      const pageRes = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 3000 });
      const thumbMatch = pageRes.data.match(/<meta property="og:image" content="([^"]+)"/);
      if (thumbMatch) thumbnail = thumbMatch[1];
    } catch (e) {}

    const postRes = await axios.get('https://instagram-looter2.p.rapidapi.com/post', {
      params: { url },
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
      timeout: 4000
    });
    const postData = postRes.data.data || postRes.data.items?.[0] || postRes.data;
    if (postData) {
      ownerId = postData.owner?.id || postData.user?.pk || "";
      shortcode = postData.shortcode || postData.code || "";
      title = postData.caption?.text || postData.text || title;
      likes = postData.like_count ?? postData.likes ?? 0;
      comments = postData.comment_count ?? postData.comments ?? 0;
      views = postData.view_count ?? postData.play_count ?? 0;
      if (!thumbnail) thumbnail = postData.display_url || postData.thumbnail_url || "";
    }
    if (views === 0 && url.includes('/reel/') && ownerId && shortcode) {
      try {
        const reelsRes = await axios.get('https://instagram-looter2.p.rapidapi.com/reels', {
          params: { id: ownerId },
          headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
          timeout: 3000
        });
        const reel = reelsRes.data.items?.find((i: any) => i.media?.code === shortcode);
        if (reel?.media) {
          views = reel.media.play_count ?? reel.media.view_count ?? views;
          likes = reel.media.like_count ?? likes;
          comments = reel.media.comment_count ?? comments;
        }
      } catch (e) {}
    }
    return { title: title.substring(0, 100), views, likes, comments, thumbnail };
  } catch (error) {
    return { title: "Instagram Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

async function fetchCMCData(url: string) {
  try {
    const pageRes = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 });
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
    return { title: "CoinMarketCap Post", views, likes, comments, thumbnail };
  } catch (error) {
    return { title: "CoinMarketCap Post", views: 0, likes: 0, comments: 0, thumbnail: "" };
  }
}

// --- SERVER SETUP ---

const app = express();
app.use(express.json());

// --- ROUTES ---

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/fetch-metadata", async (req, res) => {
  const { url, platform } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  
  let data;
  switch(platform) {
    case 'tiktok': data = await fetchTikTokData(url); break;
    case 'youtube': data = await fetchYouTubeData(url); break;
    case 'instagram': data = await fetchInstagramData(url); break;
    case 'x': data = await fetchXData(url); break;
    case 'coinmarketcap': data = await fetchCMCData(url); break;
    default: data = { title: "New Upload", views: 0, likes: 0, comments: 0 };
  }
  res.json(data);
});

app.post("/api/analyze-performance", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "AI Key not configured" });
    const { summaryData } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Fallback logic for models
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `Analiza los siguientes datos de rendimiento de redes sociales para una agencia de marketing y proporciona un resumen breve y accionable en español (máximo 3 párrafos cortos). Usa viñetas para los puntos clave. Identifica qué plataforma funciona mejor y sugiere mejoras inmediatas. Datos: ${JSON.stringify(summaryData)}`;
        const result = await model.generateContent(prompt);
        return res.json({ analysis: result.response.text() });
      } catch (err: any) {
        lastError = err.message;
        if (err.message?.includes("404")) {
          console.log(`Model ${modelName} not found, trying next...`);
          continue;
        }
        if (err.message?.includes("429")) {
          return res.status(429).json({ error: "Cuota de IA agotada. Inténtalo de nuevo en unos minutos." });
        }
        break; // Stop on unknown errors
      }
    }
    
    console.error("AI Error:", lastError);
    res.status(500).json({ error: "No se pudo generar el análisis. Verifica tu API Key o inténtalo más tarde." });
  } catch (error: any) {
    console.error("General AI Error:", error.message);
    res.status(500).json({ error: "Fallo inesperado en el análisis de IA" });
  }
});

app.post("/api/send-email", async (req, res) => {
  const { Resend } = await import('resend');
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email.");
    return res.json({ skip: true, message: "Resend not configured" });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Umbra Creator Hub <notifications@resend.dev>',
      to: ['cabscryptocontacto@gmail.com'],
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(400).json({ error });
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Notification failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- VITE / STATIC SERVING ---

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development server running on http://localhost:${PORT}`);
    });
  } else {
    // In production (Vercel), Express doesn't need to serve static files 
    // because Vercel handles the dist directory via rewrites.
    // However, if running as a standalone node app:
    app.use(express.static("dist"));
  }
}

if (!process.env.VERCEL) {
  setupVite();
}

export default app;
