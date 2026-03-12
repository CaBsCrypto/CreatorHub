const axios = require("axios");
require("dotenv").config();

async function testREST() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Hola" }] }]
    });
    console.log("Success:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("Error Status:", err.response.status);
      console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err.message);
    }
  }
}

testREST();
