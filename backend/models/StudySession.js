import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: false,
    },

    actualDuration: {
      type: Number, // Duration in minutes
      default: 0,
    },

    linkedNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],

    linkedAudio: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],

    notes: {
      type: String, // User notes about the session
      required: false,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
studySessionSchema.index({ user: 1, startTime: -1 });
studySessionSchema.index({ task: 1 });

export default mongoose.model("StudySession", studySessionSchema);
