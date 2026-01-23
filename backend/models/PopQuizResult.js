import mongoose from "mongoose";

const popQuizResultSchema = new mongoose.Schema(
  {
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningJourney",
      required: true,
    },
    quizIndex: {
      type: Number,
      required: true,
      // Which pop quiz in the sequence (1st, 2nd, 3rd, 4th)
    },
    questions: [
      {
        id: String,
        question: String,
        options: [String],
        correctAnswer: String,
        studentAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: {
      type: Number,
      required: true,
      // Percentage or absolute score
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    subtopicsFeedback: {
      // e.g., { "Vectors": "Strong", "Kinematics": "Weak", "Forces": "Moderate" }
      type: Map,
      of: String,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PopQuizResult", popQuizResultSchema);
