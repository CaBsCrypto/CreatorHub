import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzePerformance(summaryData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI Key not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest"];
  let lastError = "";

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Analiza los siguientes datos de rendimiento de redes sociales para una agencia de marketing y proporciona un resumen breve y accionable en español (máximo 3 párrafos cortos). Usa viñetas para los puntos clave. Identifica qué plataforma funciona mejor y sugiere mejoras inmediatas. Datos: ${JSON.stringify(summaryData)}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err.message;
      if (err.message?.includes("404")) {
        // model not available, try next
        continue;
      }
      if (err.message?.includes("429")) {
        throw new Error("Cuota de IA agotada. Inténtalo de nuevo en unos minutos.");
      }
      break;
    }
  }

  throw new Error(lastError || "No se pudo generar el análisis.");
}

export async function analyzeTwitchScreenshot(image: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI Key not configured");

  const prompt = `Analiza esta captura de pantalla de estadísticas. Puede ser un resumen de stream de Twitch, estadísticas de Discord, estadísticas de TikTok o visualizaciones/espectadores de una Historia de Instagram (Instagram Story).
Extrae los siguientes datos y devuélvelos en formato JSON:
{ 
  "views": número (visualizaciones, vistas totales, reproducciones en vivo, espectadores totales o visualizaciones de historia/views de Instagram Story), 
  "likes": número (interacciones, interactions, o likes si es historia de Instagram; de lo contrario likes estándar),
  "comments": número (actividad de perfil, profile activity, o comentarios si es historia de Instagram; de lo contrario comentarios estándar),
  "peek_viewers": número (máximo de espectadores/peak, si aplica), 
  "duration_minutes": número (duración total en minutos, si aplica), 
  "average_viewers": número (promedio de espectadores, si aplica), 
  "unique_viewers": número (espectadores únicos, alcance o reach, si aplica),
  "unique_chatters": número (chatters únicos, si aplica),
  "title": cadena (título descriptivo extraído o generado automáticamente según corresponda, ej. 'Estadísticas de Historia', 'Resumen de Stream'), 
  "platform": cadena (debe ser uno de los siguientes: 'twitch', 'discord', 'tiktok', 'instagram_story', 'baseapp')
}
Si no encuentras alguno de los campos numéricos, pon 0. Si no encuentras el título, pon null o genera uno adecuado. Responde únicamente con el objeto JSON puro y sin bloques de markdown.`;
  const base64Data = image.split(',')[1] || image;
  
  // Use gemini-2.0-flash as confirmed by list-models diagnostic
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: base64Data } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini REST Error:", data);
      throw new Error(data.error?.message || "Error en la API de Google");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Improved JSON extraction: find the first { and last }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", text);
      throw new Error("La IA no devolvió un formato válido.");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (err: any) {
    console.error("REST AI Analysis failed:", err.message);
    throw new Error("Fallo en el análisis de imagen: " + err.message);
  }
}

export async function summarizeCreatorProfile(profileData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI Key not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Actúa como un director de marketing de influencers. Analiza los siguientes datos de perfil de un creador y proporciona un resumen ejecutivo (máximo 2 párrafos). Enfócate en:
  1. Su alcance estimado del último mes.
  2. Su nivel de engagement y calidad de audiencia.
  3. Su potencial para campañas de branding y ROI.
  
  Sé profesional, directo y usa un tono de consultoría. Menciona si el perfil es "Top Tier", "Rising Star" o "Niche Expert".
  Datos: ${JSON.stringify(profileData)}`;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    console.error("AI Summary Error:", err.message);
    return "No se pudo generar el resumen automático en este momento.";
  }
}
