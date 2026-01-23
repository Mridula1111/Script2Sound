import openai from "./openai.service.js";
import fs from "fs";
import path from "path";

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param {string} audioFilePath - Path to the audio file (must have correct extension)
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioFilePath) {
  try {
    console.log("🎤 Starting transcription for:", audioFilePath);

    // The OpenAI SDK needs to know the file format
    // When using a stream, we need to create a File object with the correct filename
    // In Node.js, we can use the global File class (Node 18+) or create a File-like object
    
    // Read file as buffer to create a proper File object
    const fileBuffer = fs.readFileSync(audioFilePath);
    const filename = path.basename(audioFilePath);
    
    // Create a File object (available in Node.js 18+)
    // This ensures the SDK can detect the file extension from the filename
    const file = new File([fileBuffer], filename, {
      type: "audio/mpeg", // Will be overridden by extension detection
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    const transcript = transcription.text;
    console.log("✅ Transcription completed. Length:", transcript.length);

    return transcript;
  } catch (error) {
    console.error("❌ Transcription error:", error.message);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}
