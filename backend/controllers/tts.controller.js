import openai from "../services/openai.service.js";

export const ttsController = async (req, res) => {
  const { text, speaker } = req.body;

  const voiceMap = {
    host: "alloy",
    cohost: "verse",
  };

  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voiceMap[speaker] || "alloy",
      input: text,
      format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
    });

    res.send(buffer); // 🔊 stream audio
  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({ error: "TTS failed" });
  }
};
