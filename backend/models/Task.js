import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["exam", "assignment", "revision"],
      default: "assignment",
    },

    deadline: {
      type: Date,
      required: false,
    },

    estimatedHours: {
      type: Number,
      default: 1,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },

    subtasks: [subtaskSchema],

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

    scheduledStart: {
      type: Date,
      required: false,
    },

    scheduledEnd: {
      type: Date,
      required: false,
    },

    actualHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ course: 1 });
taskSchema.index({ scheduledStart: 1, scheduledEnd: 1 });

export default mongoose.model("Task", taskSchema);
