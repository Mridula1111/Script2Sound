import Audio from "../models/Audio.js";
import openai from "../services/openai.service.js";

export const generateQuestions = async (req, res) => {
  try {
    const { audioId } = req.params;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ error: "Audio not found" });
    }

    const prompt = `
You are a teacher.
Create 5 study questions with answers based on the following topic:

Title: ${audio.title || audio.filename}

Return JSON ONLY in this format:
[
  { "question": "...", "answer": "..." }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content;
    const questions = JSON.parse(raw);

    res.json({ questions });
  } catch (err) {
    console.error("QUESTIONS ERROR:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};