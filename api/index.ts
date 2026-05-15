import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authenticate, authorize, isSuperadmin } from "../src/middleware/auth.js";
import {
  validate,
  FetchMetadataSchema,
  RefreshMetricsSchema,
  AnalyzeTwitchSchema,
  AnalyzePerformanceSchema,
  AnalyzeCreatorSchema,
  SendEmailSchema,
  InviteUserSchema
} from "../src/middleware/validation.js";

// Import centralized services
import * as scraperService from "../src/services/scraperService.js";
import * as aiService from "../src/services/aiService.js";
import * as emailService from "../src/services/emailService.js";
import { createClient } from "@supabase/supabase-js";

// dotenv.config(); - Removed, now using import 'dotenv/config'


const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'cabscryptocontacto@gmail.com';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Safely initialize supabaseAdmin
let supabaseAdmin: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { 
    auth: { autoRefreshToken: false, persistSession: false } 
  });
} else {
  console.error("❌ API Entry: Supabase configuration missing in environment!");
}


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

const creatorRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1, // 1 vez por 15 minutos
  message: { error: 'Los creadores solo pueden sincronizar sus métricas manualmente 1 vez cada 15 minutos.' },
  skip: (req: any) => req.userProfile?.role === 'admin' || req.userProfile?.email === SUPERADMIN_EMAIL,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// CRON KEEP-ALIVE ENDPOINT
app.get("/api/cron/keep-alive", async (req, res) => {
  const isCron = req.headers['x-vercel-cron'] === '1';
  console.log(`[CRON] Keep-alive triggered. Source: ${isCron ? 'Vercel Cron' : 'Manual/External'}`);
  
  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

    // Ultra-light query to just wake up the DB
    const { data, error } = await supabaseAdmin.from('users').select('id').limit(1);
    
    if (error) throw error;

    res.json({ 
      success: true, 
      message: "Database is awake", 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("[CRON] Keep-alive failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUBLIC STATS ENDPOINT - No auth required (landing page)
app.get("/api/public-stats", async (req, res) => {
  const isCron = req.headers['x-vercel-cron'] === '1';
  if (isCron) console.log("[CRON] Public stats refresh triggered by Vercel Cron");

  console.log("[STATS] Public stats request received");
  try {
    if (!supabaseAdmin) {
      console.error("❌ Stats Error: Supabase Admin client not initialized (Check environment variables)");
      return res.json({ views: 50000000, campaigns: 120, creators: 30 });
    }

    // Fetch all three stats in parallel
    const [viewsResult, campaignsResult, creatorsResult] = await Promise.all([
      // Sum all views from content (excluding deleted)
      supabaseAdmin
        .from('content')
        .select('views')
        .is('deleted_at', null)
        .neq('status', 'archived')
        .limit(2000), // Safety limit
      // Count campaigns (excluding deleted)
      supabaseAdmin
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null),
      // Count active creators
      supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'creator')
        .is('deleted_at', null),
    ]);

    if (viewsResult.error) console.error("❌ Views Query Error:", viewsResult.error);
    if (campaignsResult.error) console.error("❌ Campaigns Query Error:", campaignsResult.error);
    if (creatorsResult.error) console.error("❌ Creators Query Error:", creatorsResult.error);

    // Sum views manually from the rows
    const totalViews = (viewsResult.data || []).reduce(
      (sum: number, row: any) => sum + (Number(row.views) || 0), 0
    );

    console.log(`[STATS] Calculated - Views: ${totalViews}, Campaigns: ${campaignsResult.count}, Creators: ${creatorsResult.count}`);

    // If data is genuinely empty, use the realistic placeholders
    const finalViews = totalViews || 50000000;
    const finalCampaigns = (campaignsResult.count !== null) ? campaignsResult.count : 120;
    const finalCreators = (creatorsResult.count !== null) ? creatorsResult.count : 30;

    res.json({
      views: finalViews,
      campaigns: finalCampaigns,
      creators: finalCreators,
    });
  } catch (error: any) {
    console.error("Public stats fatal error:", error.message);
    res.json({ views: 50000000, campaigns: 120, creators: 30 });
  }
});

app.get("/api/scraper-status", authenticate, authorize(['admin']), async (req, res) => {
  const status = {
    rapidapi_key_1: !!process.env.RAPIDAPI_KEY,
    rapidapi_key_2: !!process.env.RAPIDAPI_KEY_2,
    rapidapi_key_3: !!process.env.RAPIDAPI_KEY_3,
    youtube_api_key: !!process.env.YOUTUBE_API_KEY,
    gemini_api_key: !!process.env.GEMINI_API_KEY,
    supabase_url: !!process.env.VITE_SUPABASE_URL,
    supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  res.json(status);
});

app.post("/api/fetch-metadata", authenticate, metadataLimiter, validate(FetchMetadataSchema), async (req, res) => {
  try {
    const { url, platform, contentId } = req.body;
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

    // AUTO-UPDATE DATABASE if contentId is provided
    if (contentId && data && !((data as any).error)) {
      const updates: any = {};
      if (data.title && data.title !== 'Instagram Post') updates.title = data.title;
      if (data.thumbnail) updates.thumbnail = data.thumbnail;
      if (data.views > 0) updates.views = data.views;
      if (data.likes > 0) updates.likes = data.likes;
      if (data.comments > 0) updates.comments = data.comments;

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('content').update(updates).eq('id', contentId);
      }
    }

    res.json(data);
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refresh-metrics", authenticate, authorize(['admin', 'creator']), refreshLimiter, creatorRefreshLimiter, validate(RefreshMetricsSchema), async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required" });
    }

    const userProfile = (req as any).userProfile;
    const userId = (req as any).user?.id;

    const results = [];
    for (const item of items) {
      if (!item.id || !item.url || !item.platform) continue;
      
      // HIERARCHICAL SECURITY: Verify ownership if user is a creator
      if (userProfile?.role === 'creator') {
         const { data: dbItem } = await supabaseAdmin.from('content').select('creator_id').eq('id', item.id).single();
         if (!dbItem || dbItem.creator_id !== userId) {
            console.warn(`[Security] Creator ${userId} tried to refresh item ${item.id} belonging to another user. Blocked.`);
            continue; 
         }
      }

      try {
        let data: any;
        switch(item.platform) {
          case 'tiktok': data = await scraperService.fetchTikTokData(item.url); break;
          case 'youtube': data = await scraperService.fetchYouTubeData(item.url); break;
          case 'instagram': data = await scraperService.fetchInstagramData(item.url); break;
          case 'x': 
          case 'x_video': data = await scraperService.fetchXData(item.url); break;
          case 'coinmarketcap': data = await scraperService.fetchCMCData(item.url); break;
          default: continue;
        }

        if (data && !data.error) {
          const updates: any = {};
          if (data.title && data.title !== 'Instagram Post') updates.title = data.title;
          if (data.thumbnail) updates.thumbnail = data.thumbnail;
          if (data.views > 0) updates.views = data.views;
          if (data.likes > 0) updates.likes = data.likes;
          if (data.comments > 0) updates.comments = data.comments;

          if (Object.keys(updates).length > 0) {
            await supabaseAdmin.from('content').update(updates).eq('id', item.id);
          }
          results.push({ id: item.id, ...data });
        }
      } catch (itemError: any) {
        console.error(`Failed to refresh item ${item.url}:`, itemError.message);
      }
    }
    res.json({ success: true, results_count: results.length });
  } catch (globalError: any) {
    console.error("Refresh error:", globalError);
    res.status(500).json({ error: globalError.message });
  }
});

app.post("/api/analyze-twitch", authenticate, aiLimiter, validate(AnalyzeTwitchSchema), async (req, res) => {
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

app.post("/api/analyze-performance", authenticate, aiLimiter, validate(AnalyzePerformanceSchema), async (req, res) => {
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
