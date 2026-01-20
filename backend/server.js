import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import extractRoutes from "./routes/extract.routes.js";
import scriptRoutes from "./routes/script.routes.js";
import ttsRoutes from "./routes/tts.routes.js";

import authRoutes from "./routes/auth.routes.js";
import audioRoutes from "./routes/audio.routes.js";

import questionsRoutes from "./routes/questions.routes.js";
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/extract", extractRoutes);
app.use("/script", scriptRoutes);
app.use("/tts", ttsRoutes);
app.use("/auth", authRoutes);
app.use("/audio", audioRoutes);
app.use("/questions",questionsRoutes);
app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.url);
  next();
});

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
