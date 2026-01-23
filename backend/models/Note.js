import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    
    filename: {
      type: String,
      required: true,
    },

    originalAudioFilename: {
      type: String,
      required: true,
    },

    transcript: {
      type: String,
      required: true,
    },

    content: {
      definitions: [String],
      explanations: [String],
      practiceQuestions: [
        {
          question: String,
          answer: String,
        },
      ],
    },

    format: {
      type: String,
      enum: ["pdf", "ppt"],
      default: "pdf",
    },

    linkedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
