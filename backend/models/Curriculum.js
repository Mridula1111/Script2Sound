import mongoose from "mongoose";

const curriculumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // e.g., "CBSE Class 11", "Anna University BE"
    },
    type: {
      type: String,
      enum: ["CBSE", "TN", "ANNA"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      // e.g., "Mathematics", "Physics", "Chemistry"
    },
    units: [
      {
        name: String,
        description: String,
        complexity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        subtopics: [String],
        // e.g., ["Vectors", "Kinematics", "Forces"]
      },
    ],
    isPreloaded: {
      type: Boolean,
      default: true,
      // true if from default database, false if user-uploaded
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Curriculum", curriculumSchema);
