import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authenticate, authorize, isSuperadmin } from "../src/middleware/auth.js";
import { 
  validate, 
  FetchMetadataSchema, 
  RefreshMetricsSchema, 
  AnalyzeCreatorSchema, 
  SendEmailSchema,
  InviteUserSchema
} from "../src/middleware/validation.js";

// Import centralized services
import * as scraperService from "../src/services/scraperService.js";
import * as aiService from "../src/services/aiService.js";
import * as emailService from "../src/services/emailService.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'cabscryptocontacto@gmail.com';

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
  'https://umbra-hub.vercel.app',
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting for expensive endpoints
const metadataLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas solicitudes de análisis. Intenta en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Sincronización masiva limitada a 3 veces por minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/fetch-metadata", authenticate, metadataLimiter, validate(FetchMetadataSchema), async (req, res) => {
  try {
    const { url, platform } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    
    let data;
    switch(platform) {
      case 'tiktok': data = await scraperService.fetchTikTokData(url); break;
      case 'youtube': data = await scraperService.fetchYouTubeData(url); break;
      case 'instagram': data = await scraperService.fetchInstagramData(url); break;
      case 'x': 
      case 'x_video': data = await scraperService.fetchXData(url); break;
      case 'coinmarketcap': data = await scraperService.fetchCMCData(url); break;
      default: data = { title: "New Upload", views: 0, likes: 0, comments: 0, thumbnail: "" };
    }
    res.json(data);
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refresh-metrics", authenticate, authorize(['admin']), refreshLimiter, validate(RefreshMetricsSchema), async (req, res) => {
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
          case 'x': 
          case 'x_video': data = await scraperService.fetchXData(item.url); break;
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

app.post("/api/analyze-twitch", authenticate, aiLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { image } = req.body;
    console.log(`[API] Received Twitch analysis request. Image length: ${image?.length || 0}`);
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("[API] GEMINI_API_KEY is not set!");
      return res.status(500).json({ error: "Configuración incompleta: Falta la API Key de Gemini en el servidor." });
    }

    if (!image) return res.status(400).json({ error: "Image data is required" });

    const stats = await aiService.analyzeTwitchScreenshot(image);
    const duration = Date.now() - startTime;
    console.log(`[API] Analysis completed in ${duration}ms`);
    
    res.json(stats);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[API] Twitch analysis failed after ${duration}ms:`, error);
    res.status(500).json({ 
      error: "Error en el análisis de IA", 
      details: error.message,
      duration: `${duration}ms`,
      suggestion: "Si tardó más de 10s, es posible que Vercel haya cortado la conexión (Timeout). Prueba con una imagen más ligera."
    });
  }
});

app.post("/api/analyze-performance", authenticate, aiLimiter, async (req, res) => {
  try {
    const { summaryData } = req.body;
    const analysis = await aiService.analyzePerformance(summaryData);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-creator", authenticate, aiLimiter, validate(AnalyzeCreatorSchema), async (req, res) => {
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

app.post("/api/send-email", authenticate, authorize(['admin']), validate(SendEmailSchema), async (req, res) => {
  try {
    const { subject, html, to } = req.body;
    const result = await emailService.sendNotificationEmail(subject, html, to);
    if (result.skip) return res.json({ skip: true });
    res.json({ success: true, data: result.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/invite-user", authenticate, authorize(['admin']), validate(InviteUserSchema), async (req, res) => {
  try {
    const { email, role, display_name } = req.body;
    
    // HIERARCHICAL SECURITY: Only Superadmin can create other Admins
    if (role === 'admin') {
      const profile = (req as any).userProfile;
      if (profile?.email !== SUPERADMIN_EMAIL) {
        return res.status(403).json({ error: 'Solo el Superadmin puede invitar a otros Administradores.' });
      }
    }
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");
      return res.status(500).json({ error: "Configuración del servidor incompleta (Missing Service Key)" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { role, display_name },
      // Optional: automatically generate a password or send a recovery email
    });

    if (authError) throw authError;

    // 2. The Auth trigger might already create the public.users row. We can check or upsert.
    // For safety, let's explicitly insert/update the public record using admin privileges
    const { data: userData, error: publicError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        role,
        display_name
      })
      .select()
      .single();

    if (publicError) {
      // If we fail here, we might have an orphaned auth user, but usually the trigger handles it.
      console.error("Public users insert error:", publicError);
    }

    res.json({ success: true, user: userData || authData.user });
  } catch (error: any) {
    console.error("Invite user error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("SERVER_ERROR:", err);
  res.status(500).json({ error: "SERVER_ERROR", message: err.message });
});

export default app;
