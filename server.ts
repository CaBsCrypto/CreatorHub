import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import {
  fetchTikTokData,
  fetchYouTubeData,
  fetchInstagramData,
  fetchXData,
  fetchCMCData,
  fetchTwitchProfile,
  fetchInstagramProfile,
  fetchYouTubeProfile
} from "./src/services/scraperService.js";
import { analyzePerformance, summarizeCreatorProfile } from "./src/services/aiService.js";
import { sendNotificationEmail } from "./src/services/emailService.js";
import { authenticate, authorize } from "./src/middleware/auth.js";
import { 
  validate, 
  FetchMetadataSchema, 
  RefreshMetricsSchema, 
  AnalyzeCreatorSchema, 
  SendEmailSchema,
  AnalyzeTwitchSchema
} from "./src/middleware/validation.js";
import { analyzeTwitchScreenshot } from "./src/services/aiService.js";

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const app = express();
app.use(helmet()); 

// CORS Hardening
const allowedOrigins = [
  'https://creator-hub-three-lake.vercel.app',
  'https://creator-hub-three-lake-cabs-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Por favor, intenta de nuevo más tarde." }
});

// Stricter limiter for AI and Email (expensive/sensitive)
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Has excedido el límite de análisis/correos por hora." }
});

app.use("/api/", apiLimiter);
app.use("/api/send-email", strictLimiter);
app.use("/api/analyze-", strictLimiter);

// --- ROUTES ---

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Removed /api/debug-env for security

app.post("/api/fetch-metadata", authenticate, validate(FetchMetadataSchema), async (req, res) => {
  try {
    const { url, platform } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let data;
    switch(platform) {
      case 'tiktok': data = await fetchTikTokData(url); break;
      case 'youtube': data = await fetchYouTubeData(url); break;
      case 'instagram': data = await fetchInstagramData(url); break;
      case 'x': data = await fetchXData(url); break;
      case 'coinmarketcap': data = await fetchCMCData(url); break;
      default: data = { title: "New Upload", views: 0, likes: 0, comments: 0, thumbnail: "" };
    }
    res.json(data);
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-twitch", authenticate, validate(AnalyzeTwitchSchema), async (req, res) => {
  try {
    const { image } = req.body;
    const analysis = await analyzeTwitchScreenshot(image);
    res.json(analysis);
  } catch (error: any) {
    console.error("Twitch analysis error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refresh-metrics", authenticate, authorize(['admin']), validate(RefreshMetricsSchema), async (req, res) => {
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
          case 'tiktok': data = await fetchTikTokData(item.url); break;
          case 'youtube': data = await fetchYouTubeData(item.url); break;
          case 'instagram': data = await fetchInstagramData(item.url); break;
          case 'x': data = await fetchXData(item.url); break;
          case 'coinmarketcap': data = await fetchCMCData(item.url); break;
          default: continue;
        }
        results.push({ id: item.id, ...data });
      } catch (itemError: any) {
        console.error(`Failed to refresh item ${item.url}:`, itemError.message);
      }
    }
    res.json({ success: true, results });
  } catch (globalError: any) {
    console.error("Global refresh error:", globalError);
    res.status(500).json({ error: globalError.message });
  }
});

app.post("/api/analyze-performance", authenticate, async (req, res) => {
  try {
    const { summaryData } = req.body;
    const analysis = await analyzePerformance(summaryData);
    res.json({ analysis });
  } catch (error: any) {
    console.error("AI analysis error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-creator", authenticate, validate(AnalyzeCreatorSchema), async (req, res) => {
  try {
    const { username, platform } = req.body;
    if (!username || !platform) {
      return res.status(400).json({ error: "Username and platform are required" });
    }

    let profileData;
    switch(platform) {
      case 'twitch': profileData = await fetchTwitchProfile(username); break;
      case 'instagram': profileData = await fetchInstagramProfile(username); break;
      case 'youtube': profileData = await fetchYouTubeProfile(username); break;
      default: throw new Error("Plataforma no soportada para análisis profundo.");
    }

    const summary = await summarizeCreatorProfile(profileData);
    res.json({ ...profileData, summary });
  } catch (error: any) {
    console.error("Creator analysis error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/send-email", authenticate, authorize(['admin']), validate(SendEmailSchema), async (req, res) => {
  try {
    const { subject, html, to } = req.body;
    const result = await sendNotificationEmail(subject, html, to);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
    app.use(express.static("dist"));
  }
}

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("GLOBAL_ERROR:", err);
  res.status(500).json({ 
    error: "INTERNAL_SERVER_ERROR", 
    message: err.message
  });
});

if (!process.env.VERCEL) {
  setupVite();
}

export default app;
