import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  endSession,
  linkNoteToSession,
  linkAudioToSession,
} from "../controllers/study-sessions.controller.js";

const router = express.Router();

router.post("/", protect, createSession);
router.get("/", protect, getSessions);
router.get("/:id", protect, getSession);
router.put("/:id", protect, updateSession);
router.post("/:id/end", protect, endSession);
router.post("/:id/link-note", protect, linkNoteToSession);
router.post("/:id/link-audio", protect, linkAudioToSession);

export default router;
