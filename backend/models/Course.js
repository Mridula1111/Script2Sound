import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: false,
    },

    color: {
      type: String,
      default: "#6366f1", // Default indigo color
    },
  },
  { timestamps: true }
);

// Index for efficient queries
courseSchema.index({ user: 1, name: 1 });

export default mongoose.model("Course", courseSchema);
