import openai from "./openai.service.js";

const LANGUAGE_MAP = {
  hindi: "Hindi",
  tamil: "Tamil",
  telugu: "Telugu",
  kannada: "Kannada",
  malayalam: "Malayalam",
  marathi: "Marathi",
  gujarati: "Gujarati",
};

export async function translateToMixedLanguage(text, nativeLanguage) {
  if (!LANGUAGE_MAP[nativeLanguage]) {
    throw new Error("Unsupported language");
  }

  const languageName = LANGUAGE_MAP[nativeLanguage];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6, // Increased for more casual tone
    messages: [
      {
        role: "system",
        content: `You are a translator specializing in creating natural, conversational bilingual content in ${languageName} and English.

Your task is to translate the given content into a mix of ${languageName} and English where:

KEY GUIDELINES:
1. **Keep these terms in English** (they sound better and are more commonly understood):
   - Technical jargon, software/IT terms (database, API, algorithm, cloud, server, etc.)
   - Scientific terms (physics, chemistry, biology concepts)
   - Modern technology terms (AI, machine learning, blockchain, etc.)
   - Business/Professional terms (startup, investment, stakeholder, etc.)
   - Proper nouns (company names, product names)
   - Acronyms (API, JSON, REST, SQL, etc.)

2. **Convert to ${languageName}}**:
   - General explanations and descriptions
   - Everyday concepts and ideas
   - Narrative and storytelling content
   - Casual conversation phrases
   - Numbers and quantities (when contextually appropriate)

3. **Tone & Style**:
   - Use casual, conversational ${languageName} (NOT formal/textbook style)
   - Add natural conversational markers ("you know", "like", etc. in native equivalent)
   - Make it sound like a friendly podcast discussion, not a lecture
   - Use colloquial expressions where appropriate
   - Keep the energy engaging and relatable

4. **Structure**:
   - Let English terms flow naturally within the ${languageName} narrative
   - Don't awkwardly translate technical terms - keep them in English
   - Ensure smooth transitions between languages
   - Maintain natural speech patterns and rhythm

Example for Tamil:
Input: "The machine learning algorithm processes data from multiple sources"
Output: "Machine learning algorithm ந்த தகவல்-சேகரணை செய்ற வெவ்வேறு வழிகளிலிருந்து data ஈவு கோளோக தயாரி்ற்றுக்கு"
(Keep: machine learning, algorithm, data; Convert: processes, from multiple sources)

Return the translated text as plain text, ready to be used in a conversational podcast script.`,
      },
      {
        role: "user",
        content: `Please translate this content to a conversational mix of ${languageName} and English. Make it sound natural and casual, like a podcast discussion between friends:\n\n${text}`,
      },
    ],
  });

  return response.choices[0].message.content;
}