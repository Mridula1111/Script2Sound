import "dotenv/config";
import { ElevenLabsClient } from "elevenlabs";

async function testVoices() {
  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    console.log("Fetching available voices...");
    const response = await client.voices.getAll();
    
    const voices = response.voices || response || [];
    
    if (Array.isArray(voices) && voices.length > 0) {
      console.log("\n✅ All Available Voices:");
      console.log("=====================================");
      voices.forEach((voice) => {
        console.log(`Name: ${voice.name}`);
        console.log(`ID: ${voice.voice_id}`);
        console.log(`Category: ${voice.category || "N/A"}`);
        console.log("-----");
      });

      // Search for specific voices
      console.log("\n🔍 SEARCHING FOR SPECIFIC VOICES:");
      console.log("=====================================");
      
      const deviVoice = voices.find(v => v.name.toLowerCase().includes("devi"));
      const nirajVoice = voices.find(v => v.name.toLowerCase().includes("niraj"));
      
      if (deviVoice) {
        console.log(`✅ Found DEVI:`);
        console.log(`   Name: ${deviVoice.name}`);
        console.log(`   ID: ${deviVoice.voice_id}`);
      } else {
        console.log(`❌ DEVI voice not found`);
      }
      
      if (nirajVoice) {
        console.log(`✅ Found NIRAJ:`);
        console.log(`   Name: ${nirajVoice.name}`);
        console.log(`   ID: ${nirajVoice.voice_id}`);
      } else {
        console.log(`❌ NIRAJ voice not found`);
      }
    } else {
      console.log("Response structure:", Object.keys(response));
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testVoices();