import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  linkNoteToTask,
  linkAudioToTask,
  unlinkNoteFromTask,
  unlinkAudioFromTask,
  createTaskFromNote,
  createTaskFromAudio,
} from "../controllers/tasks.controller.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// Linking operations
router.post("/:id/link-note", protect, linkNoteToTask);
router.post("/:id/link-audio", protect, linkAudioToTask);
router.delete("/:id/unlink-note/:noteId", protect, unlinkNoteFromTask);
router.delete("/:id/unlink-audio/:audioId", protect, unlinkAudioFromTask);

// Create task from existing content
router.post("/from-note/:noteId", protect, createTaskFromNote);
router.post("/from-audio/:audioId", protect, createTaskFromAudio);

export default router;
