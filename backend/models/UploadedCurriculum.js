import mongoose from "mongoose";

const uploadedCurriculumSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    unitName: {
      type: String,
      required: true,
    },
    subtopics: [String],
    // Array of subtopic names extracted from upload
    rawContent: String,
    // Store raw text if manually entered
    uploadMethod: {
      type: String,
      enum: ["docx", "manual"],
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UploadedCurriculum", uploadedCurriculumSchema);
