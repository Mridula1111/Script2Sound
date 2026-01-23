import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { registerUser, loginUser, verifyEmail, getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyEmail);
router.get("/me", protect, getCurrentUser);

export default router;