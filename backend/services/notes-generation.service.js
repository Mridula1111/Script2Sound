const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate personalized study notes based on student profile and curriculum
 * @param {object} assessment - Student assessment with profile and score
 * @param {string} curriculum - Curriculum details with units/subtopics
 * @param {string} unitName - Specific unit being studied
 * @returns {Promise<string>} Markdown-formatted study notes
 */
async function generateStudyNotes(assessment, curriculum, unitName) {
  try {
    const profileLevels = {};
    for (const [subtopic, level] of assessment.profile) {
      profileLevels[subtopic] = level;
    }

    const prompt = `You are an expert tutor. Create comprehensive study notes for a student studying ${unitName}.

Student Profile (Knowledge Levels):
${Object.entries(profileLevels).map(([st, level]) => `- ${st}: ${level} level`).join('\n')}

Assessment Score: ${assessment.totalScore || 50}%

Curriculum Syllabus:
${curriculum.units?.map(u => `- ${u.name}: ${u.subtopics?.join(', ')}`).join('\n')}

Generate markdown study notes with:
1. Key Concepts (definitions, explanations)
2. Learning Objectives (what student will learn)
3. Core Content (well-structured, progressive difficulty)
4. Important Formulas/Theorems (if applicable)
5. Real-World Applications
6. Common Mistakes (based on student level)
7. Practice Questions with Solutions
8. Summary & Review Checklist

Focus on areas where the student scored lower. Make content engaging and clear.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Note Generation Error:', error.message);
    // Fallback to placeholder notes
    return generatePlaceholderNotes(unitName, profileLevels || {});
  }
}

/**
 * Generate quiz notes focused on weak areas
 * @param {object} popQuizResult - Quiz result with feedback
 * @param {string} unitName - Unit being studied
 * @returns {Promise<string>} Focused revision notes
 */
async function generateRevisionNotes(popQuizResult, unitName) {
  try {
    const weakAreas = Object.entries(popQuizResult.subtopicsFeedback || {})
      .filter(([_, feedback]) => feedback.score < 70)
      .map(([topic]) => topic);

    const prompt = `Create focused revision notes for ${unitName}.

Weak areas identified: ${weakAreas.join(', ')}
Quiz feedback: ${JSON.stringify(popQuizResult.subtopicsFeedback)}

Format as quick-reference revision guide with:
1. Concept Reminders
2. Common Misconceptions
3. Worked Examples
4. Quick Memory Aids
5. Links to Strong Topics (for context)

Make it concise and actionable. Student has limited time to revise.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Revision Notes Error:', error.message);
    return generatePlaceholderRevisionNotes(unitName, weakAreas || []);
  }
}

/**
 * Fallback: Generate placeholder study notes
 */
function generatePlaceholderNotes(unitName, profileLevels) {
  return `# Study Notes: ${unitName}

## Learning Objectives
- Understand core concepts of ${unitName}
- Apply knowledge to real-world scenarios
- Master fundamental principles
- Develop problem-solving skills

## Key Concepts

### 1. Foundation Concepts
Core building blocks and definitions that form the foundation of ${unitName}.

### 2. Intermediate Understanding
Deeper exploration of how concepts relate and interconnect.

### 3. Advanced Applications
Complex scenarios and problem-solving approaches.

## Common Mistakes to Avoid
Based on your current understanding level:
- Confusing terminology
- Incorrect formula application
- Overlooking edge cases
- Rushing through calculations

## Practice Questions
1. Conceptual question about foundations
2. Calculation-based problem
3. Application-based scenario
4. Analysis question

## Summary Checklist
- [ ] Understand all key concepts
- [ ] Can apply formulas correctly
- [ ] Know common pitfalls
- [ ] Ready for next section

---
*Generated for ${unitName} on ${new Date().toLocaleDateString()}*`;
}

/**
 * Fallback: Generate placeholder revision notes
 */
function generatePlaceholderRevisionNotes(unitName, weakAreas) {
  return `# Revision Notes: ${unitName}

## Focus Areas
${weakAreas.length > 0 ? weakAreas.map(area => `### ${area}\n- Key reminder\n- Common error\n- Quick tip`).join('\n\n') : '### General Review\n- All topics solid\n- Quick refresher provided'}

## Quick Memory Aids
- Use mnemonics for key concepts
- Create visual mind maps
- Link to real-world examples

## 10-Minute Quick Revision
1. Review key definitions (2 min)
2. Work through one example (5 min)
3. Check understanding (3 min)

---
*Last Updated: ${new Date().toLocaleDateString()}*`;
}

module.exports = {
  generateStudyNotes,
  generateRevisionNotes,
};
