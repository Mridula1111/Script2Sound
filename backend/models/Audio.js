import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
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

    scriptText: String,

    speakers: [String],
    
    duration: Number,

    // Language fields
    language: {
      type: String,
      enum: ["english", "native"],
      default: "english",
    },
    
    nativeLanguage: {
      type: String,
      enum: ["hindi", "tamil", "telugu", "kannada", "malayalam", "marathi", "gujarati"],
      default: null,
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

export default mongoose.model("Audio", audioSchema);
