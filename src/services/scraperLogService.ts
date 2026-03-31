import { createClient } from '@supabase/supabase-js';
import { sendNotificationEmail } from './emailService.js';

// Supabase client is initialized lazily to ensure environment variables are loaded
let supabaseClient: any = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ScraperLogService: Missing Supabase configuration", { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}


export async function logScraperAction(
  platform: string, 
  url: string, 
  status: 'success' | 'error', 
  errorMessage?: string, 
  responseTime?: number, 
  metadata?: any
) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    // 1. Log to database
    const { error } = await supabase.from('scraper_logs').insert([{
      platform,
      url,
      status,
      error_message: errorMessage,
      response_time_ms: responseTime,
      metadata,
      created_at: new Date().toISOString()
    }]);
    
    if (error) console.error("Error logging scraper action to DB:", error.message);

    // 2. Alert logic for critical errors
    if (status === 'error') {
      const isCritical = 
        errorMessage?.includes('429') || // Too many requests
        errorMessage?.includes('401') || // Unauthorized
        errorMessage?.includes('403') || // Forbidden
        errorMessage?.toLowerCase().includes('rate limit') ||
        (metadata?.isZeroViews && (platform === 'instagram' || platform === 'tiktok')); // Failed to extract real data

      if (isCritical) {
        console.log(`[ALERT] Critical error on ${platform}. Sending email...`);
        await sendNotificationEmail(
          `🚨 Alerta Crítica Scraper: ${platform}`,
          `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fef2f2;">
            <h2 style="color: #dc2626; margin-top: 0;">Fallo Crítico detectado</h2>
            <p>El sistema de extracción de métricas ha encontrado un error que requiere atención inmediata.</p>
            <hr style="border: none; border-top: 1px solid #fca5a5; margin: 20px 0;" />
            <p><strong>Plataforma:</strong> <span style="text-transform: uppercase;">${platform}</span></p>
            <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
            <p><strong>Error:</strong> <code style="background: #fff; padding: 2px 4px; border-radius: 4px;">${errorMessage}</code></p>
            ${metadata ? `<p><strong>Detalles adicionales:</strong> <pre style="font-size: 11px; background: #fff; padding: 10px; border-radius: 8px;">${JSON.stringify(metadata, null, 2)}</pre></p>` : ''}
            <p style="font-size: 12px; color: #991b1b; margin-top: 20px;">Este es un aviso automático de Umbra Creator Hub.</p>
          </div>
          `
        ).catch(err => console.error("Failed to send alert email:", err.message));
      }
    }
  } catch (e: any) {
    console.error("Fatal error in logScraperAction:", e.message);
  }
}
