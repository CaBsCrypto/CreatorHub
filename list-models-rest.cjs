const axios = require("axios");
require("dotenv").config();

async function listAllModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await axios.get(url);
    const models = res.data.models || [];
    console.log("Available Models (First 10):");
    models.slice(0, 10).forEach(m => console.log(`- ${m.name}`));
  } catch (err) {
    if (err.response) {
      console.error("Error Status:", err.response.status);
      console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err.message);
    }
  }
}

listAllModels();
