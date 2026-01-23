import mongoose from "mongoose";

const studentAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    curriculumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
    },
    unitName: {
      type: String,
      required: true,
    },
    questions: [
      {
        id: String,
        question: String,
        type: {
          type: String,
          enum: ["mcq", "numerical"],
        },
        options: [String], // for MCQ
        correctAnswer: String,
        studentAnswer: String,
        isCorrect: Boolean,
      },
    ],
    profile: {
      // e.g., { "Vectors": "Legend", "Kinematics": "Pro", "Forces": "Noob" }
      type: Map,
      of: String, // "Legend", "Pro", or "Noob"
    },
    totalScore: Number,
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentAssessment", studentAssessmentSchema);
