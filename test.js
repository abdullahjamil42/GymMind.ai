const { GoogleGenerativeAI } = require("@google/generative-ai");

// ⬇️ PASTE YOUR NEW KEY HERE ⬇️
const API_KEY = "AIzaSyAYHgJ55ahLj-EG38s-djqZaPll2wxrFaQ";

async function finalTest() {
  console.log("🚀 Testing your Manual API Key...");

  if (API_KEY !== "AIzaSyAYHgJ55ahLj-EG38s-djqZaPll2wxrFaQ" || !API_KEY) {
    console.error("❌ ERROR: You forgot to paste the key inside the quotes!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // We use 'gemini-1.5-flash' because it is the fastest and cheapest model
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    console.log("📡 Sending request to Google...");
    const result = await model.generateContent("Reply with exactly three words: 'API is working'");
    const response = result.response;
    const text = response.text();

    console.log("\n✅ SUCCESS! The API is connected.");
    console.log("🤖 Gemini says:", text);
    console.log("\n👉 NEXT STEP: Copy this key into your .env.local file now.");

  } catch (error) {
    console.error("\n❌ FAILED.");
    console.error("👉 Error details:", error.message);
  }
}

finalTest();