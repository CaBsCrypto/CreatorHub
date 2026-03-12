const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
  
  console.log("Testing with gemini-2.0-flash...");
  try {
    const result = await model.generateContent("Hola, esto es una prueba de conexión.");
    console.log("AI Response (2.0-flash):", result.response.text());
  } catch (err) {
    console.error("AI Error (2.0-flash):", err.message);
  }
}

testAI();
