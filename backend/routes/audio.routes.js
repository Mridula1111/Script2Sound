import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.middleware.js";
import Audio from "../models/Audio.js";
import { gfs } from "../config/db.js";

const router = express.Router();

/* Get user's audio library */
router.get("/", protect, async (req, res) => {
  console.log("JWT USER:", req.user.userId, typeof req.user.userId);
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

  console.log("LIBRARY USER ID:", userObjectId);

  const audios = await Audio.find({
    user: userObjectId,
  }).sort({ createdAt: -1 });

  console.log("FOUND AUDIOS:", audios.length);
  res.json(audios);
});

/* Stream audio */
router.get("/:filename", protect, (req, res) => {
  res.set("Content-Type", "audio/mpeg");
  gfs.openDownloadStreamByName(req.params.filename).pipe(res);
});

export default router;
