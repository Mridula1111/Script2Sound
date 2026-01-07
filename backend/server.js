import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";

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
app.post("/extract", upload.single("file"), (req, res) => {
  try {
    const text = fs.readFileSync(req.file.path, "utf-8");
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Text extraction failed" });
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
