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

  const prompt = "Analiza esta captura de pantalla de las estadísticas de un stream de Twitch. Extrae los siguientes datos en formato JSON: { 'views': número (reproducciones en vivo), 'peek_viewers': número (máximo de espectadores), 'duration_minutes': número (duración total en minutos), 'average_viewers': número (promedio de espectadores), 'title': cadena, 'stream_date': cadena ISO }. Si no encuentras alguno, pon 0 o null. No incluyas markdown, solo el objeto JSON puro.";
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
