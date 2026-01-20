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
Based ONLY on the following content, generate 5 relevant practice questions with answers.

CONTENT:
${audio.scriptText}

Rules:
- Questions must come ONLY from this content
- No outside knowledge
- Respond with ONLY valid JSON
- No markdown, no backticks

Format:
[
  { "question": "...", "answer": "..." }
]
`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    
    const raw = completion.choices[0].message.content;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const questions = JSON.parse(cleaned);

    res.json({ questions });
  } catch (err) {
    console.error("QUESTIONS ERROR:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};