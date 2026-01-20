import openai from "../services/openai.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import { gfs } from "../config/db.js"
import Audio from "../models/Audio.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ make sure this file exists
const introPath = path.join(__dirname, "../assets/intro.mp3");

export const ttsController = async (req, res) => {
  try {
    const { script, title } = req.body;

    if (!Array.isArray(script)) {
      return res.status(400).json({ error: "Invalid script format" });
    }

    const voiceMap = {
      host: "alloy",
      cohost: "verse",
    };

    const tempFiles = [];

    /* 1️⃣ Generate TTS per SPEECH */
    for (let i = 0; i < script.length; i++) {
      const line = script[i];
      if (line.type !== "speech") continue;

      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voiceMap[line.speaker] || "alloy",
        input: line.text,
        format: "mp3",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const tempPath = path.join(__dirname, `temp_${Date.now()}_${i}.mp3`);

      fs.writeFileSync(tempPath, buffer);
      tempFiles.push(tempPath);
    }

    if (!tempFiles.length) {
      return res.status(400).json({ error: "No speech found" });
    }

    const outputPath = path.join(__dirname, `final_${Date.now()}.mp3`);

    /* 2️⃣ Intro + speech concat (ONE filter graph) */
    await new Promise((resolve, reject) => {
      const cmd = ffmpeg();

      // Intro first
      cmd.input(introPath).inputOptions(["-t 12"]);

      // Then all speech clips
      tempFiles.forEach(file => cmd.input(file));

      const concatInputs = [];
      for (let i = 1; i <= tempFiles.length; i++) {
        concatInputs.push(`${i}:a`);
      }

      cmd
        .complexFilter([
          {
            filter: "volume",
            options: "0.6",
            inputs: "0:a",
            outputs: "intro_vol",
          },
          {
            filter: "afade",
            options: "t=out:st=10:d=2",
            inputs: "intro_vol",
            outputs: "intro_fade",
          },
          {
            filter: "concat",
            options: {
              n: tempFiles.length + 1,
              v: 0,
              a: 1,
            },
            inputs: ["intro_fade", ...concatInputs],
            outputs: "outa",
          },
        ])
        .outputOptions(["-map [outa]"])
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    // 3️⃣ Save final MP3 to GridFS
    const safeTitle = title
      ? title.replace(/[^a-z0-9-_ ]/gi, "").trim()
      : "Untitled Audio";

    const filename = `${safeTitle}-${Date.now()}.mp3`;

    const uploadStream = gfs.openUploadStream(filename);

    console.log("DECODED USER:", req.user);

    fs.createReadStream(outputPath)
      .pipe(uploadStream)
      .on("finish", async () => {
        // 4️⃣ Save metadata
        await Audio.create({
          user: new mongoose.Types.ObjectId(req.user.userId),
          title: safeTitle,
          filename: uploadStream.filename,
          scriptText: script.map(l => l.text).join("\n"), // ✅ IMPORTANT
          speakers: [...new Set(script.map(l => l.speaker))],
        });

        // 5️⃣ Stream back to user
        res.json({
          filename: uploadStream.filename,
        });

        // 6️⃣ Cleanup

        const safeUnlink = (file) => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        };
        tempFiles.forEach(safeUnlink);
        safeUnlink(outputPath);
      });

  } catch (err) {
    console.error("MULTI TTS ERROR:", err);
    res.status(500).json({ error: "Multi-speaker TTS failed" });
  }
};
