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

// stream = public
router.get("/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();

    if (!file || !file.length) {
      return res.sendStatus(404);
    }

    const audioFile = file[0];
    const fileSize = audioFile.length;
    const range = req.headers.range;

    if (range) {
      // 🔑 Partial content
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
      });

      gfs.openDownloadStreamByName(req.params.filename, {
        start,
        end: end + 1,
      }).pipe(res);
    } else {
      // Full file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


export default router;
