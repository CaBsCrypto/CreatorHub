const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct 'listModels' in the GenAI SDK usually, 
    // but we can try to find how it's done or just test common ones.
    // Actually, let's try 'gemini-1.5-pro' and 'gemini-1.5-flash-8b'
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`Model ${m} is AVAILABLE`);
      } catch (e) {
        console.log(`Model ${m} is NOT available: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
