import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import Tesseract from "tesseract.js";
import { exec } from "child_process";
import path from "path";
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- EXTRACT NOTES (TXT) ----

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let extractedText = "";

    // TXT
    if (fileType === "text/plain") {
      extractedText = fs.readFileSync(filePath, "utf-8");
    }

    // DOCX
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    }

    // ---------- IMAGE OCR ----------
    else if (fileType.startsWith("image/")) {
      const result = await Tesseract.recognize(filePath, "eng");
      extractedText = result.data.text;
    }

    // ---------- PDF OCR ----------
    else if (fileType === "application/pdf") {
      const outputDir = "uploads/pdf_images";
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      // Convert PDF → images
      await new Promise((resolve, reject) => {
        exec(
          `pdftoppm -png "${filePath}" "${outputDir}/page"`,
          (error) => (error ? reject(error) : resolve())
        );
      });

      const images = fs.readdirSync(outputDir).filter(f => f.endsWith(".png"));

      for (const img of images) {
        const result = await Tesseract.recognize(
          path.join(outputDir, img),
          "eng"
        );
        extractedText += result.data.text + "\n";
      }
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    res.json({
      text: extractedText,
      length: extractedText.length
    });

  } catch (err) {
    console.error("OCR ERROR:", err);
    res.status(500).json({ error: "OCR extraction failed" });
  }
});

// ---- AI SCRIPT GENERATION ----
app.post("/script", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional podcast script writer. Convert notes into an engaging, conversational podcast script. Do not sound like notes.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const script = response.choices[0].message.content;
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: "AI script generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
