const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate 5 dynamic assessment questions based on curriculum and unit
 * @param {string} curriculumType - Type of curriculum (CBSE, TN, ANNA)
 * @param {string} subject - Subject name
 * @param {string} unitName - Unit/Chapter name
 * @param {array} subtopics - Subtopics covered in the unit
 * @returns {Promise<array>} Array of 5 questions with options and answers
 */
async function generateAssessmentQuestions(curriculumType, subject, unitName, subtopics) {
  try {
    const prompt = `You are an expert educator creating assessment questions for ${curriculumType} ${subject}.
Unit: ${unitName}
Subtopics: ${subtopics.join(', ')}

Generate exactly 5 assessment questions in JSON format:
- 3 multiple-choice questions (with 4 options each)
- 2 numerical/short-answer questions

STRICT FORMAT (no markdown, no code blocks):
[
  {
    "id": "q1",
    "type": "mcq",
    "text": "Question text?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "A) option1"
  },
  {
    "id": "q2",
    "type": "mcq",
    "text": "Question text?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "C) option3"
  },
  {
    "id": "q3",
    "type": "mcq",
    "text": "Question text?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "B) option2"
  },
  {
    "id": "q4",
    "type": "numerical",
    "text": "Calculate/Find: [numerical problem]?",
    "correctAnswer": "123.45"
  },
  {
    "id": "q5",
    "type": "short_answer",
    "text": "Explain: [concept question]?",
    "correctAnswer": "Expected answer summary (5-20 words)"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();
    const questions = JSON.parse(content);

    return questions;
  } catch (error) {
    console.error('OpenAI Assessment Generation Error:', error.message);
    // Fallback to placeholder questions if OpenAI fails
    return generatePlaceholderQuestions(unitName, subtopics);
  }
}

/**
 * Grade student assessment answers against correct answers
 * @param {array} questions - Array of questions with correct answers
 * @param {object} studentAnswers - Object with questionId => studentAnswer mapping
 * @returns {object} { score, profile, feedback }
 */
async function gradeAssessment(questions, studentAnswers) {
  try {
    const gradingPrompt = `You are an expert grader. Evaluate these student answers:

${questions.map(q => `Q${q.id}: ${q.text}
Correct Answer: ${q.correctAnswer}
Student Answer: ${studentAnswers[q.id] || 'Not answered'}
---`).join('\n')}

Return JSON with:
{
  "score": 85,
  "maxScore": 100,
  "feedback": {
    "q1": "Well done, correct answer",
    "q2": "Close, but remember...",
    "q3": "Incorrect. The concept is...",
    "q4": "Correct calculation",
    "q5": "Good understanding"
  },
  "subtopicAnalysis": {
    "subtopic1": { "level": "Pro", "score": 80 },
    "subtopic2": { "level": "Legend", "score": 95 },
    "subtopic3": { "level": "Noob", "score": 40 }
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: gradingPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    return result;
  } catch (error) {
    console.error('OpenAI Grading Error:', error.message);
    // Fallback grading
    return calculatePlaceholderGrade(questions, studentAnswers);
  }
}

/**
 * Fallback: Generate placeholder questions if OpenAI fails
 */
function generatePlaceholderQuestions(unitName, subtopics) {
  return [
    {
      id: 'q1',
      type: 'mcq',
      text: `What is a key concept in ${unitName}?`,
      options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
      correctAnswer: 'A) Option 1',
    },
    {
      id: 'q2',
      type: 'mcq',
      text: `How does ${subtopics[0]} relate to ${subtopics[1]}?`,
      options: ['A) They are independent', 'B) They complement each other', 'C) They conflict', 'D) No relationship'],
      correctAnswer: 'B) They complement each other',
    },
    {
      id: 'q3',
      type: 'mcq',
      text: `Which statement about ${unitName} is true?`,
      options: ['A) False statement', 'B) Also false', 'C) True statement', 'D) Partially true'],
      correctAnswer: 'C) True statement',
    },
    {
      id: 'q4',
      type: 'numerical',
      text: `Calculate the value of X in the ${unitName} formula`,
      correctAnswer: '42.5',
    },
    {
      id: 'q5',
      type: 'short_answer',
      text: `Explain the importance of ${subtopics[0]}`,
      correctAnswer: 'It provides foundational understanding for advanced concepts',
    },
  ];
}

/**
 * Fallback: Calculate placeholder grade
 */
function calculatePlaceholderGrade(questions, studentAnswers) {
  let correctCount = 0;
  const feedback = {};
  const subtopicAnalysis = {};

  questions.forEach(q => {
    const isCorrect = studentAnswers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase();
    if (isCorrect) correctCount++;

    feedback[q.id] = isCorrect ? 'Correct answer' : `Expected: ${q.correctAnswer}`;
  });

  const score = Math.round((correctCount / questions.length) * 100);

  return {
    score,
    maxScore: 100,
    feedback,
    subtopicAnalysis: {
      subtopic1: { level: score > 80 ? 'Legend' : score > 50 ? 'Pro' : 'Noob', score: score },
      subtopic2: { level: score > 75 ? 'Legend' : score > 45 ? 'Pro' : 'Noob', score: Math.max(0, score - 10) },
      subtopic3: { level: score > 70 ? 'Legend' : score > 40 ? 'Pro' : 'Noob', score: Math.max(0, score - 20) },
    },
  };
}

module.exports = {
  generateAssessmentQuestions,
  gradeAssessment,
};
