import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateQuestions } from "../controllers/questions.controller.js";

const router = express.Router();

router.post("/:audioId", protect, generateQuestions);

export default router;