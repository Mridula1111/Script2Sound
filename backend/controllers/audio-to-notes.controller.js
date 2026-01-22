import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { transcribeAudio } from "../services/transcription.service.js";
import { generateStructuredNotes } from "../services/note-generation.service.js";
import { generatePDF } from "../services/pdf-generation.service.js";
import { gfs } from "../config/db.js";
import Note from "../models/Note.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const audioUploadDir = path.join(__dirname, "../uploads/audio");
const notesUploadDir = path.join(__dirname, "../uploads/notes");
fs.mkdirSync(audioUploadDir, { recursive: true });
fs.mkdirSync(notesUploadDir, { recursive: true });

// Configure multer for audio uploads
const upload = multer({
  dest: audioUploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const allowedMimes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Please upload an audio file."), false);
    }
  },
});

export const uploadMiddleware = upload.single("audio");

export const audioToNotesController = async (req, res) => {
  let audioFilePath = null;
  let renamedAudioPath = null;
  let pdfPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    audioFilePath = req.file.path;
    const { title, format = "pdf" } = req.body;

    console.log("🎙️ Processing audio to notes:", req.file.originalname);

    // Rename file to include extension (OpenAI Whisper requires file extension)
    const originalExt = path.extname(req.file.originalname) || ".mp3";
    renamedAudioPath = audioFilePath + originalExt;
    fs.renameSync(audioFilePath, renamedAudioPath);
    audioFilePath = renamedAudioPath; // Use renamed path for transcription

    // Step 1: Transcribe audio
    console.log("📝 Step 1: Transcribing audio...");
    const transcript = await transcribeAudio(audioFilePath);

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcription resulted in empty text");
    }

    // Step 2: Generate structured notes
    console.log("📚 Step 2: Generating structured notes...");
    const structuredNotes = await generateStructuredNotes(transcript);

    // Step 3: Generate PDF
    console.log("📄 Step 3: Generating PDF...");
    const safeTitle = title?.trim() || `Lecture Notes ${new Date().toLocaleDateString()}`;
    pdfPath = await generatePDF(structuredNotes, safeTitle, transcript);

    // Step 4: Save PDF to GridFS
    console.log("💾 Step 4: Saving PDF to GridFS...");
    const pdfFilename = `${safeTitle.replace(/[^a-z0-9-_ ]/gi, "").trim()}-${Date.now()}.pdf`;
    const uploadStream = gfs.openUploadStream(pdfFilename, {
      contentType: "application/pdf",
    });

    fs.createReadStream(pdfPath)
      .pipe(uploadStream)
      .on("finish", async () => {
        // Step 5: Save metadata to database
        const note = await Note.create({
          user: new mongoose.Types.ObjectId(req.user.userId),
          title: safeTitle,
          filename: uploadStream.filename,
          originalAudioFilename: req.file.originalname,
          transcript: transcript,
          content: structuredNotes,
          format: format,
        });

        console.log("✅ Audio-to-notes conversion completed");

        // Cleanup temporary files
        if (renamedAudioPath && fs.existsSync(renamedAudioPath)) {
          fs.unlinkSync(renamedAudioPath);
        } else if (audioFilePath && fs.existsSync(audioFilePath)) {
          fs.unlinkSync(audioFilePath);
        }
        if (pdfPath && fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }

        res.json({
          success: true,
          noteId: note._id,
          filename: uploadStream.filename,
          title: safeTitle,
        });
      })
      .on("error", (err) => {
        console.error("GridFS upload error:", err);
        res.status(500).json({ error: "Failed to save PDF" });
      });
  } catch (error) {
    console.error("❌ Audio-to-notes error:", error.message);

    // Cleanup on error
    if (renamedAudioPath && fs.existsSync(renamedAudioPath)) {
      fs.unlinkSync(renamedAudioPath);
    } else if (audioFilePath && fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.status(500).json({
      error: error.message || "Audio-to-notes conversion failed",
    });
  }
};
