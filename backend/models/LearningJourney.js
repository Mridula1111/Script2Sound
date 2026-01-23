import mongoose from "mongoose";

const learningJourneySchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAssessment",
      // Linked after assessment is completed
    },
    studentProfile: {
      // e.g., { "Vectors": "Legend", "Kinematics": "Pro", "Forces": "Noob" }
      type: Map,
      of: String,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "paused", "archived"],
      default: "in-progress",
    },
    currentStageIndex: {
      type: Number,
      default: 0,
      // 0 = Assessment, then alternates between notes and quizzes
    },
    completedStages: [Number],
    // Track which stages (by index) have been completed
    generatedNotes: [
      {
        subtopicIndex: Number,
        subtopic: String,
        content: String,
        // Docx content stored as string or reference
        generatedAt: Date,
      },
    ],
    popQuizResults: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PopQuizResult",
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    pausedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Index for efficient queries
learningJourneySchema.index({ userId: 1, curriculumId: 1 });

export default mongoose.model("LearningJourney", learningJourneySchema);
