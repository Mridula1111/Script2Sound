const OpenAI = require('openai');
const ElevenLabs = require('elevenlabs-node');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsClient = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY,
  baseUrl: 'https://api.elevenlabs.io/v1',
});

// Available voices in ElevenLabs
const VOICES = {
  narrator: 'Adam', // Professional male voice
  female: 'Bella', // Professional female voice
  friendly: 'Charlie', // Friendly male voice
  educational: 'George', // Clear male voice for teaching
};

/**
 * Convert study notes to audio using ElevenLabs TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voiceType - Type of voice (narrator, female, friendly, educational)
 * @returns {Promise<Buffer>} Audio file buffer
 */
async function generateAudioNotes(text, voiceType = 'narrator') {
  try {
    const voiceId = mapVoiceType(voiceType);

    const response = await elevenLabsClient.textToSpeech({
      textInput: text.substring(0, 5000), // Limit to 5000 chars per request
      voiceId,
      outputFormat: 'mp3_44100_64',
      modelId: 'eleven_monolingual_v1',
    });

    return response;
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error.message);
    // Fallback: Use OpenAI TTS if ElevenLabs fails
    return generateAudioWithOpenAI(text);
  }
}

/**
 * Generate audio using OpenAI TTS (fallback)
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio file buffer
 */
async function generateAudioWithOpenAI(text) {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'onyx',
      input: text.substring(0, 4096), // OpenAI limit
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('OpenAI TTS Error:', error.message);
    throw new Error('Audio generation failed');
  }
}

/**
 * Generate audio for assessment/quiz questions
 * @param {array} questions - Array of question objects
 * @param {string} voiceType - Voice preference
 * @returns {Promise<object>} Map of questionId => audioBuffer
 */
async function generateQuestionAudio(questions, voiceType = 'educational') {
  const audioMap = {};

  try {
    for (const question of questions) {
      const audioBuffer = await generateAudioNotes(question.text, voiceType);
      audioMap[question.id] = audioBuffer;
    }
    return audioMap;
  } catch (error) {
    console.error('Question audio generation error:', error);
    return audioMap; // Return partial results
  }
}

/**
 * Stream audio file from storage
 * @param {string} journeyId - Journey ID for audio storage reference
 * @param {string} audioType - Type of audio (notes, question, feedback)
 * @returns {string} File path to cached audio
 */
function getAudioPath(journeyId, audioType) {
  const audioDir = path.join(process.cwd(), 'uploads', 'audio', journeyId);

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  return path.join(audioDir, `${audioType}_${Date.now()}.mp3`);
}

/**
 * Map voice type string to ElevenLabs voice ID
 */
function mapVoiceType(type) {
  const voiceMap = {
    narrator: '5Q0edFqKEXW03lT8AcQn', // Adam
    female: 'EXAVITQu4vr4xnSDxMaL', // Bella
    friendly: 'iP3nJ0z0nHcGSRHY1xNC', // Charlie
    educational: 'SOZo3FFqkMnGnnLhb1Ll', // George
  };
  return voiceMap[type] || voiceMap.narrator;
}

/**
 * Save audio to file and return URI
 * @param {Buffer} audioBuffer - Audio data buffer
 * @param {string} journeyId - Journey ID
 * @param {string} audioType - Type identifier
 * @returns {string} File path
 */
async function saveAudio(audioBuffer, journeyId, audioType) {
  const filePath = getAudioPath(journeyId, audioType);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, audioBuffer, (err) => {
      if (err) reject(err);
      else resolve(filePath);
    });
  });
}

module.exports = {
  generateAudioNotes,
  generateAudioWithOpenAI,
  generateQuestionAudio,
  getAudioPath,
  saveAudio,
};
