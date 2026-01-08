const API_KEY = "AIzaSyAYHgJ55ahLj-EG38s-djqZaPll2wxrFaQ"; 

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  console.log("🔍 Fetching available models for your key...");
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log("❌ Error:", data.error.message);
      return;
    }

    console.log("\n✅ YOU CAN USE THESE MODELS:");
    console.log("-----------------------------");
    
    // Filter to only show models that generate text (content)
    const available = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .sort((a, b) => b.displayName.localeCompare(a.displayName)); // Sort by name

    available.forEach(model => {
      // Highlight the free/popular ones
      const isFlash = model.name.includes("flash");
      const mark = isFlash ? "⚡" : "  ";
      
      // Clean up the name (remove "models/" prefix)
      const cleanName = model.name.replace("models/", "");
      
      console.log(`${mark} ${cleanName}`);
    });
    
    console.log("\n💡 RECOMMENDATION: Use 'gemini-1.5-flash' for your .env file.");

  } catch (err) {
    console.error("Failed to fetch models:", err.message);
  }
}

listModels();