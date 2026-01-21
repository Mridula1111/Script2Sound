import { ElevenLabsClient } from "elevenlabs";
import fetch from "node-fetch";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// ElevenLabs voice IDs for Indian languages and English
const VOICE_MAP = {
  english: {
    host: "iP95p4xoKVk53GoZ742B", // Chris - Charming, Down-to-Earth
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam - Dominant, Firm
  },
  hindi: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
  tamil: {
    host: "OUBMjq0LvBjb07bhwD3H", // Chris
    cohost: "5klqvwuBHYwcS99jLmDR", // Adam
  },
  telugu: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
  kannada: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
  malayalam: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
  marathi: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
  gujarati: {
    host: "iP95p4xoKVk53GoZ742B", // Chris
    cohost: "pNInz6obpgDQGcFmaJgB", // Adam
  },
};

export async function generateTTSElevenLabs(text, language, speaker) {
  const voiceMap = VOICE_MAP[language];

  if (!voiceMap) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const voiceId = voiceMap[speaker] || voiceMap.host;

  try {
    // Use ElevenLabs API directly for better control
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // Supports 29 languages including Indian languages
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ElevenLabs API error: ${error.detail?.message || error.error}`);
    }

    const buffer = await response.buffer();
    return buffer;
  } catch (error) {
    console.error("ElevenLabs TTS Error:", error.message);
    throw error;
  }
}