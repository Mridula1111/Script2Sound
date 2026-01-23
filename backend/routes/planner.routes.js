import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getDailyView,
  getWeeklyView,
  scheduleTask,
  unscheduleTask,
} from "../controllers/planner.controller.js";

const router = express.Router();

router.get("/daily", protect, getDailyView);
router.get("/weekly", protect, getWeeklyView);
router.post("/schedule", protect, scheduleTask);
router.delete("/unschedule/:taskId", protect, unscheduleTask);

export default router;
