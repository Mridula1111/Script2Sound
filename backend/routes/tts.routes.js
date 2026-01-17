import express from "express";
import { ttsController } from "../controllers/tts.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, ttsController);

export default router;