import { generateTTSElevenLabs } from "../services/elevenlabs-tts.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import { gfs } from "../config/db.js";
import Audio from "../models/Audio.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const introPath = path.join(__dirname, "../assets/intro.mp3");

export const ttsController = async (req, res) => {
  try {
    const { script, title, language = "english", nativeLanguage = null } = req.body;

    if (!Array.isArray(script)) {
      return res.status(400).json({ error: "Invalid script format" });
    }

    const tempFiles = [];
    const activeLanguage = language === "native" ? nativeLanguage : "english";

    console.log(`🎵 Starting TTS generation for: ${activeLanguage}`);

    /* 1️⃣ Generate TTS per SPEECH using ElevenLabs */
    for (let i = 0; i < script.length; i++) {
      const line = script[i];
      if (line.type !== "speech") continue;

      console.log(`🎤 Generating TTS for ${line.speaker} (${activeLanguage})`);

      try {
        // Use ElevenLabs for natural multilingual support
        const audioBuffer = await generateTTSElevenLabs(
          line.text,
          activeLanguage,
          line.speaker
        );

        const tempPath = path.join(__dirname, `temp_${Date.now()}_${i}.mp3`);
        fs.writeFileSync(tempPath, audioBuffer);
        tempFiles.push(tempPath);

        console.log(`✅ TTS generated for ${line.speaker}`);
      } catch (ttsError) {
        console.error(`TTS Error for ${line.speaker}:`, ttsError.message);
        throw new Error(
          `Failed to generate audio for ${line.speaker}: ${ttsError.message}`
        );
      }
    }

    if (!tempFiles.length) {
      return res.status(400).json({ error: "No speech found in script" });
    }

    console.log(`📦 Concatenating ${tempFiles.length} audio clips...`);

    const outputPath = path.join(__dirname, `final_${Date.now()}.mp3`);

    /* 2️⃣ Intro + speech concat */
    await new Promise((resolve, reject) => {
      const cmd = ffmpeg();

      cmd.input(introPath).inputOptions(["-t 12"]);

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

    const languageSuffix = language === "native" ? `_${nativeLanguage}` : "_english";
    const filename = `${safeTitle}${languageSuffix}-${Date.now()}.mp3`;

    const uploadStream = gfs.openUploadStream(filename);

    console.log("📤 Uploading to GridFS:", filename);

    fs.createReadStream(outputPath)
      .pipe(uploadStream)
      .on("finish", async () => {
        // 4️⃣ Save metadata
        await Audio.create({
          user: new mongoose.Types.ObjectId(req.user.userId),
          title: safeTitle,
          filename: uploadStream.filename,
          language: language,
          nativeLanguage: nativeLanguage || null,
          scriptText: script.map(l => l.text).join("\n"),
          speakers: [...new Set(script.map(l => l.speaker))],
        });

        res.json({
          filename: uploadStream.filename,
          language: language,
        });

        console.log("✅ Audio saved and metadata recorded");

        // 5️⃣ Cleanup
        const safeUnlink = (file) => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        };
        tempFiles.forEach(safeUnlink);
        safeUnlink(outputPath);
      })
      .on("error", (err) => {
        console.error("GridFS upload error:", err);
        res.status(500).json({ error: "Failed to save audio" });
      });

  } catch (err) {
    console.error("MULTI TTS ERROR:", err.message);
    res.status(500).json({ error: err.message || "Multi-speaker TTS failed" });
  }
};
