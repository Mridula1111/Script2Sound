import mongoose from "mongoose";
import StudySession from "../models/StudySession.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Audio from "../models/Audio.js";

export const createSession = async (req, res) => {
  try {
    const { taskId, notes } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const session = await StudySession.create({
      user: new mongoose.Types.ObjectId(req.user.userId),
      task: taskId,
      startTime: new Date(),
      linkedNotes: [],
      linkedAudio: [],
      notes: notes || "",
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ error: "Failed to create study session" });
  }
};

export const getSessions = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const { taskId, limit = 50 } = req.query;

    const query = { user: userObjectId };
    if (taskId) query.task = taskId;

    const sessions = await StudySession.find(query)
      .populate("task", "title type")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename")
      .sort({ startTime: -1 })
      .limit(parseInt(limit));

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("task", "title type course")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { notes } = req.body;

    const session = await StudySession.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      { notes },
      { new: true, runValidators: true }
    )
      .populate("task", "title type")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.endTime) {
      return res.status(400).json({ error: "Session already ended" });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / 1000 / 60); // minutes

    session.endTime = endTime;
    session.actualDuration = duration;
    await session.save();

    // Update task's actual hours
    const task = await Task.findById(session.task);
    if (task) {
      task.actualHours = (task.actualHours || 0) + duration / 60;
      await task.save();
    }

    const updatedSession = await StudySession.findById(session._id)
      .populate("task", "title type")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    res.json(updatedSession);
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
};

export const linkNoteToSession = async (req, res) => {
  try {
    const { noteId } = req.body;
    const sessionId = req.params.id;

    const session = await StudySession.findOne({
      _id: sessionId,
      user: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const note = await Note.findOne({
      _id: noteId,
      user: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (!session.linkedNotes.includes(noteId)) {
      session.linkedNotes.push(noteId);
      await session.save();
    }

    const updatedSession = await StudySession.findById(sessionId)
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    res.json(updatedSession);
  } catch (error) {
    console.error("Link note to session error:", error);
    res.status(500).json({ error: "Failed to link note to session" });
  }
};

export const linkAudioToSession = async (req, res) => {
  try {
    const { audioId } = req.body;
    const sessionId = req.params.id;

    const session = await StudySession.findOne({
      _id: sessionId,
      user: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const audio = await Audio.findOne({
      _id: audioId,
      user: req.user.userId,
    });

    if (!audio) {
      return res.status(404).json({ error: "Audio not found" });
    }

    if (!session.linkedAudio.includes(audioId)) {
      session.linkedAudio.push(audioId);
      await session.save();
    }

    const updatedSession = await StudySession.findById(sessionId)
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    res.json(updatedSession);
  } catch (error) {
    console.error("Link audio to session error:", error);
    res.status(500).json({ error: "Failed to link audio to session" });
  }
};
