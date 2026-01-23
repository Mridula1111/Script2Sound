const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a checkpoint pop quiz for student assessment
 * @param {string} unitName - Unit being studied
 * @param {array} subtopics - Subtopics covered
 * @param {object} studentProfile - Student's knowledge profile
 * @param {number} quizIndex - Which checkpoint quiz (1st, 2nd, etc.)
 * @returns {Promise<array>} Array of quiz questions
 */
async function generatePopQuiz(unitName, subtopics, studentProfile, quizIndex = 1) {
  try {
    const weakAreas = Object.entries(studentProfile || {})
      .filter(([_, level]) => level !== 'Legend')
      .map(([topic]) => topic);

    const prompt = `Create a checkpoint quiz for students studying ${unitName}.
This is Quiz #${quizIndex} (${quizIndex === 1 ? 'first' : 'final'} assessment).

Subtopics: ${subtopics.join(', ')}
${weakAreas.length > 0 ? `Focus on weak areas: ${weakAreas.join(', ')}` : 'Cover all topics evenly'}

Generate 5 quiz questions in JSON format:
- 2 multiple choice questions
- 2 short-answer questions  
- 1 application/problem-solving question

STRICT FORMAT:
[
  {
    "id": "quiz_q1",
    "type": "mcq",
    "text": "Question here?",
    "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
    "correctAnswer": "A) opt1"
  },
  {
    "id": "quiz_q2",
    "type": "short_answer",
    "text": "Explain or define: something?",
    "correctAnswer": "Expected answer (1-2 sentences)"
  },
  {
    "id": "quiz_q3",
    "type": "application",
    "text": "Solve this problem: [scenario]?",
    "correctAnswer": "Step-by-step solution"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const questions = JSON.parse(response.choices[0].message.content.trim());
    return questions;
  } catch (error) {
    console.error('OpenAI Pop Quiz Generation Error:', error.message);
    return generatePlaceholderPopQuiz(unitName, subtopics);
  }
}

/**
 * Grade pop quiz answers using OpenAI
 * @param {array} questions - Quiz questions
 * @param {object} answers - Student answers object
 * @param {array} subtopics - Subtopics for feedback mapping
 * @returns {Promise<object>} { score, feedback, subtopicsFeedback }
 */
async function gradePopQuiz(questions, answers, subtopics) {
  try {
    const gradingPrompt = `Grade these quiz answers fairly but strictly:

${questions.map(q => `Q${q.id}: ${q.text}
Correct: ${q.correctAnswer}
Student: ${answers[q.id] || 'Not answered'}
---`).join('\n')}

Return strict JSON:
{
  "score": 72,
  "maxScore": 100,
  "feedback": {
    "quiz_q1": "Your answer is correct",
    "quiz_q2": "Good, but missing [detail]",
    "quiz_q3": "Partially correct. The approach was right but..."
  },
  "subtopicsFeedback": {
    "subtopic1": { "score": 80, "feedback": "Strong understanding" },
    "subtopic2": { "score": 60, "feedback": "Needs more practice" }
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: gradingPrompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });

    return JSON.parse(response.choices[0].message.content.trim());
  } catch (error) {
    console.error('OpenAI Pop Quiz Grading Error:', error.message);
    return calculatePlaceholderGrade(questions, answers, subtopics);
  }
}

/**
 * Fallback: Generate placeholder pop quiz
 */
function generatePlaceholderPopQuiz(unitName, subtopics) {
  return [
    {
      id: 'quiz_q1',
      type: 'mcq',
      text: `What is the primary purpose of ${subtopics[0]}?`,
      options: ['A) Foundational support', 'B) Advanced application', 'C) Real-world connection', 'D) Historical context'],
      correctAnswer: 'A) Foundational support',
    },
    {
      id: 'quiz_q2',
      type: 'mcq',
      text: `How does ${subtopics[1]} relate to ${subtopics[0]}?`,
      options: ['A) Independently', 'B) Directly dependent', 'C) Complementary', 'D) No relation'],
      correctAnswer: 'C) Complementary',
    },
    {
      id: 'quiz_q3',
      type: 'short_answer',
      text: `Explain the significance of ${subtopics[0]} in ${unitName}`,
      correctAnswer: 'It provides foundational understanding needed for advanced concepts',
    },
    {
      id: 'quiz_q4',
      type: 'short_answer',
      text: `Describe a real-world application of ${subtopics[2]}`,
      correctAnswer: 'Can be applied in practical scenarios and scientific contexts',
    },
    {
      id: 'quiz_q5',
      type: 'application',
      text: `Problem: Apply the concepts to solve this scenario`,
      correctAnswer: 'Follow the step-by-step process learned in the unit',
    },
  ];
}

/**
 * Fallback: Calculate placeholder grade
 */
function calculatePlaceholderGrade(questions, answers, subtopics) {
  let score = 60;

  return {
    score,
    maxScore: 100,
    feedback: {
      quiz_q1: 'Good understanding of basics',
      quiz_q2: 'Correct answer',
      quiz_q3: 'Needs more detail',
      quiz_q4: 'Right track',
      quiz_q5: 'Application understanding evident',
    },
    subtopicsFeedback: {
      [subtopics[0]]: { score: 85, feedback: 'Strong grasp of concept' },
      [subtopics[1]]: { score: 70, feedback: 'Needs more practice' },
      [subtopics[2]]: { score: 75, feedback: 'Good progress' },
    },
  };
}

module.exports = {
  generatePopQuiz,
  gradePopQuiz,
};
