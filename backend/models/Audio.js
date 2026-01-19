import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    speakers: [String],
    duration: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Audio", audioSchema);
