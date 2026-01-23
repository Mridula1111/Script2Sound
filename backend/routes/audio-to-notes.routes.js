import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadMiddleware,
  audioToNotesController,
} from "../controllers/audio-to-notes.controller.js";

const router = express.Router();

router.post("/", protect, uploadMiddleware, audioToNotesController);

export default router;
