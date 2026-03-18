import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzePerformance(summaryData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI Key not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
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
        console.log(`Model ${modelName} not found, trying next...`);
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Analiza esta captura de pantalla de las estadísticas de un stream de Twitch. Extrae los siguientes datos en formato JSON: { 'views': número, 'peek_viewers': número, 'duration_minutes': número, 'title': cadena, 'stream_date': cadena ISO }. Si no encuentras alguno, pon 0 o null. No incluyas markdown, solo el objeto JSON puro.";
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: image.split(',')[1] || image,
        mimeType: "image/png"
      }
    }
  ]);

  const response = await result.response;
  let text = response.text();
  
  // Clean up markdown if AI returned it
  text = text.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("No se pudieron extraer las estadísticas de la imagen.");
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
