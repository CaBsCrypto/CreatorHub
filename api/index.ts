import express from "express";
import dotenv from "dotenv";

// Import centralized services
import * as scraperService from "../src/services/scraperService";
import * as aiService from "../src/services/aiService";
import * as emailService from "../src/services/emailService";

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/debug-env", (req, res) => {
  res.json({
    rapid_key_set: !!process.env.RAPIDAPI_KEY,
    gemini_key_set: !!process.env.GEMINI_API_KEY,
    youtube_key_set: !!process.env.YOUTUBE_API_KEY,
    node_env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

app.post("/api/fetch-metadata", async (req, res) => {
  try {
    const { url, platform } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    
    let data;
    switch(platform) {
      case 'tiktok': data = await scraperService.fetchTikTokData(url); break;
      case 'youtube': data = await scraperService.fetchYouTubeData(url); break;
      case 'instagram': data = await scraperService.fetchInstagramData(url); break;
      case 'x': data = await scraperService.fetchXData(url); break;
      case 'coinmarketcap': data = await scraperService.fetchCMCData(url); break;
      default: data = { title: "New Upload", views: 0, likes: 0, comments: 0, thumbnail: "" };
    }
    res.json(data);
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refresh-metrics", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required" });
    }

    const results = [];
    for (const item of items) {
      if (!item.id || !item.url || !item.platform) continue;
      try {
        let data;
        switch(item.platform) {
          case 'tiktok': data = await scraperService.fetchTikTokData(item.url); break;
          case 'youtube': data = await scraperService.fetchYouTubeData(item.url); break;
          case 'instagram': data = await scraperService.fetchInstagramData(item.url); break;
          case 'x': data = await scraperService.fetchXData(item.url); break;
          case 'coinmarketcap': data = await scraperService.fetchCMCData(item.url); break;
          default: continue;
        }
        results.push({ id: item.id, ...data });
      } catch (itemError: any) {
        console.error(`Failed to refresh item ${item.url}:`, itemError.message);
      }
    }
    res.json({ success: true, results });
  } catch (globalError: any) {
    console.error("Refresh error:", globalError);
    res.status(500).json({ error: globalError.message });
  }
});

app.post("/api/analyze-twitch", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image data is required" });

    const stats = await aiService.analyzeTwitchScreenshot(image);
    res.json(stats);
  } catch (error: any) {
    console.error("Twitch analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-performance", async (req, res) => {
  try {
    const { summaryData } = req.body;
    const analysis = await aiService.analyzePerformance(summaryData);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-creator", async (req, res) => {
  try {
    const { username, platform } = req.body;
    if (!username || !platform) {
      return res.status(400).json({ error: "Username and platform are required" });
    }

    let profileData;
    switch(platform) {
      case 'twitch': profileData = await scraperService.fetchTwitchProfile(username); break;
      case 'instagram': profileData = await scraperService.fetchInstagramProfile(username); break;
      case 'youtube': profileData = await scraperService.fetchYouTubeProfile(username); break;
      default: throw new Error("Plataforma no soportada para análisis profundo.");
    }

    const summary = await aiService.summarizeCreatorProfile(profileData);
    res.json({ ...profileData, summary });
  } catch (error: any) {
    console.error("Creator analysis error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { subject, html } = req.body;
    const result = await emailService.sendNotificationEmail(subject, html);
    if (result.skip) return res.json({ skip: true });
    res.json({ success: true, data: result.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("CRITICAL_ERROR:", err);
  res.status(500).json({ error: "SERVER_ERROR", message: err.message });
});

export default app;
