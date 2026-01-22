import openai from "./openai.service.js";

/**
 * Generate structured notes from transcript
 * @param {string} transcript - The transcribed text
 * @returns {Promise<Object>} - Structured notes with definitions, explanations, and questions
 */
export async function generateStructuredNotes(transcript) {
  try {
    console.log("📝 Generating structured notes from transcript...");

    const prompt = `You are an educational content creator. Convert the following lecture transcript into a well-structured, learnable study material.

Transcript:
${transcript}

Please generate:
1. Key Definitions: Extract and clearly define all important terms and concepts mentioned in the lecture. Format each as a concise definition.

2. Explanations: Provide clear, concise explanations of the main topics covered. Break down complex concepts into easy-to-understand explanations.

3. Practice Questions: Create 5-10 practice questions that test understanding of the content. Include both conceptual questions and application-based questions. For each question, provide a clear answer.

Format your response as a JSON object with this exact structure:
{
  "definitions": ["definition 1", "definition 2", ...],
  "explanations": ["explanation 1", "explanation 2", ...],
  "practiceQuestions": [
    {"question": "question text", "answer": "answer text"},
    ...
  ]
}

Return ONLY the JSON object, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to extract JSON from the response (in case there's extra text)
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const structuredNotes = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!structuredNotes.definitions || !structuredNotes.explanations || !structuredNotes.practiceQuestions) {
        throw new Error("Invalid structure in generated notes");
      }

      console.log("✅ Structured notes generated successfully");
      return structuredNotes;
    } else {
      throw new Error("No valid JSON found in response");
    }
  } catch (error) {
    console.error("❌ Note generation error:", error.message);
    throw new Error(`Note generation failed: ${error.message}`);
  }
}
