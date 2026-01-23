import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.middleware.js";
import Note from "../models/Note.js";
import { gfs } from "../config/db.js";

const router = express.Router();

/* Get user's notes library */
router.get("/", protect, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const notes = await Note.find({
      user: userObjectId,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* Download PDF */
router.get("/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();

    if (!file || !file.length) {
      return res.sendStatus(404);
    }

    const pdfFile = file[0];
    const fileSize = pdfFile.length;

    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${req.params.filename}"`,
    });

    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    console.error("Download PDF error:", err);
    res.sendStatus(500);
  }
});

/* Delete note */
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Delete file from GridFS
    const file = await gfs.find({ filename: note.filename }).toArray();
    if (file[0]) {
      await gfs.delete(file[0]._id);
    }

    // Delete metadata
    await Note.deleteOne({ _id: note._id });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
