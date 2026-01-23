import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import extractRoutes from "./routes/extract.routes.js";
import scriptRoutes from "./routes/script.routes.js";
import ttsRoutes from "./routes/tts.routes.js";

import authRoutes from "./routes/auth.routes.js";
import audioRoutes from "./routes/audio.routes.js";
import audioToNotesRoutes from "./routes/audio-to-notes.routes.js";
import notesRoutes from "./routes/notes.routes.js";

import questionsRoutes from "./routes/questions.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import plannerRoutes from "./routes/planner.routes.js";
import studySessionsRoutes from "./routes/study-sessions.routes.js";
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/extract", extractRoutes);
app.use("/script", scriptRoutes);
app.use("/tts", ttsRoutes);
app.use("/auth", authRoutes);
app.use("/audio", audioRoutes);
app.use("/audio-to-notes", audioToNotesRoutes);
app.use("/notes", notesRoutes);
app.use("/questions",questionsRoutes);
app.use("/courses", coursesRoutes);
app.use("/tasks", tasksRoutes);
app.use("/planner", plannerRoutes);
app.use("/study-sessions", studySessionsRoutes);
app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.url);
  next();
});

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
