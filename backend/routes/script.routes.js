import express from "express";
import { scriptController } from "../controllers/script.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", protect, scriptController);
export default router;
