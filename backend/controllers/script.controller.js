import openai from "../services/openai.service.js";
import { parseScript } from "../services/scriptParser.js";
import { translateToMixedLanguage } from "../services/language.service.js";

export const scriptController = async (req, res) => {
  try {
    const { text, language = "english", nativeLanguage = null } = req.body;

    let processedText = text;

    // If native language is selected, translate to mixed language first
    if (language === "native" && nativeLanguage) {
      console.log(`🌍 Translating to ${nativeLanguage} mixed with English`);
      processedText = await translateToMixedLanguage(text, nativeLanguage);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You generate podcast scripts for a machine from given text, ignore all previous topics.

LINE FORMAT:
MUSIC:intro
SFX:transition
SPEECH:host:text
SPEECH:cohost:text

${
  language === "native" && nativeLanguage
    ? `IMPORTANT: The content is in a mix of ${nativeLanguage} and English.
    
REQUIREMENTS FOR NATIVE LANGUAGE MODE:
1. Generate the script in the SAME mixture of (${nativeLanguage} + English) for BOTH host and cohost
2. Maintain natural conversation flow between host and cohost, both using the same language mix
3. Keep technical terms, acronyms, and proper nouns in English
4. Use casual, conversational  tone ${nativeLanguage} (NOT formal/textbook style)
5. the ${nativeLanguage} should not be robotic when transitioning from English to ${nativeLanguage} or vice versa

(Both speakers use mixture of ${nativeLanguage} + English)`
    : "Generate the script in English."
}`,
        },
        { role: "user", content: processedText },
      ],
    });

    const raw = response.choices[0].message.content;
    const parsedScript = parseScript(raw);

    res.json({ script: parsedScript });

    console.log("✅ Script generated successfully");
    console.log("Language mode:", language);
    if (nativeLanguage) console.log("Native language:", nativeLanguage);
  } catch (err) {
    console.error("SCRIPT ERROR:", err.message);
    res.status(500).json({ error: err.message || "Script generation failed" });
  }
};
