import mongoose from "mongoose";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Audio from "../models/Audio.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      type,
      deadline,
      estimatedHours,
      priority,
      course,
      subtasks,
      scheduledStart,
      scheduledEnd,
    } = req.body;

    const task = await Task.create({
      user: new mongoose.Types.ObjectId(req.user.userId),
      title,
      type: type || "assignment",
      deadline: deadline ? new Date(deadline) : null,
      estimatedHours: estimatedHours || 1,
      priority: priority || "medium",
      course: course ? new mongoose.Types.ObjectId(course) : null,
      subtasks: subtasks || [],
      scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: error.message || "Failed to create task" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const { course, status, type } = req.query;

    const query = { user: userObjectId };
    if (course) query.course = course;
    if (status) query.status = status;
    if (type) query.type = type;

    const tasks = await Task.find(query)
      .populate("course", "name code color")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename")
      .sort({ deadline: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("course", "name code color")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Convert date strings to Date objects
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);
    if (updateData.scheduledStart) updateData.scheduledStart = new Date(updateData.scheduledStart);
    if (updateData.scheduledEnd) updateData.scheduledEnd = new Date(updateData.scheduledEnd);

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("course", "name code color")
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

export const linkNoteToTask = async (req, res) => {
  try {
    const { noteId } = req.body;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const note = await Note.findOne({
      _id: noteId,
      user: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Add note to task if not already linked
    if (!task.linkedNotes.includes(noteId)) {
      task.linkedNotes.push(noteId);
      await task.save();
    }

    // Add task to note if not already linked
    if (!note.linkedTasks.includes(taskId)) {
      note.linkedTasks.push(taskId);
      await note.save();
    }

    const updatedTask = await Task.findById(taskId)
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    res.json(updatedTask);
  } catch (error) {
    console.error("Link note error:", error);
    res.status(500).json({ error: "Failed to link note to task" });
  }
};

export const linkAudioToTask = async (req, res) => {
  try {
    const { audioId } = req.body;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const audio = await Audio.findOne({
      _id: audioId,
      user: req.user.userId,
    });

    if (!audio) {
      return res.status(404).json({ error: "Audio not found" });
    }

    // Add audio to task if not already linked
    if (!task.linkedAudio.includes(audioId)) {
      task.linkedAudio.push(audioId);
      await task.save();
    }

    // Add task to audio if not already linked
    if (!audio.linkedTasks.includes(taskId)) {
      audio.linkedTasks.push(taskId);
      await audio.save();
    }

    const updatedTask = await Task.findById(taskId)
      .populate("linkedNotes", "title filename")
      .populate("linkedAudio", "title filename");

    res.json(updatedTask);
  } catch (error) {
    console.error("Link audio error:", error);
    res.status(500).json({ error: "Failed to link audio to task" });
  }
};

export const unlinkNoteFromTask = async (req, res) => {
  try {
    const { noteId } = req.params;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.linkedNotes = task.linkedNotes.filter(
      (id) => id.toString() !== noteId
    );
    await task.save();

    // Remove task from note
    const note = await Note.findById(noteId);
    if (note) {
      note.linkedTasks = note.linkedTasks.filter(
        (id) => id.toString() !== taskId
      );
      await note.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Unlink note error:", error);
    res.status(500).json({ error: "Failed to unlink note from task" });
  }
};

export const unlinkAudioFromTask = async (req, res) => {
  try {
    const { audioId } = req.params;
    const taskId = req.params.id;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.linkedAudio = task.linkedAudio.filter(
      (id) => id.toString() !== audioId
    );
    await task.save();

    // Remove task from audio
    const audio = await Audio.findById(audioId);
    if (audio) {
      audio.linkedTasks = audio.linkedTasks.filter(
        (id) => id.toString() !== taskId
      );
      await audio.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Unlink audio error:", error);
    res.status(500).json({ error: "Failed to unlink audio from task" });
  }
};

export const createTaskFromNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, deadline, estimatedHours, priority, course } = req.body;

    const note = await Note.findOne({
      _id: noteId,
      user: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const task = await Task.create({
      user: new mongoose.Types.ObjectId(req.user.userId),
      title: title || note.title,
      type: "revision",
      deadline: deadline ? new Date(deadline) : null,
      estimatedHours: estimatedHours || 2,
      priority: priority || "medium",
      course: course ? new mongoose.Types.ObjectId(course) : null,
      linkedNotes: [noteId],
    });

    // Link task to note
    note.linkedTasks.push(task._id);
    await note.save();

    const populatedTask = await Task.findById(task._id)
      .populate("course", "name code color")
      .populate("linkedNotes", "title filename");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task from note error:", error);
    res.status(500).json({ error: "Failed to create task from note" });
  }
};

export const createTaskFromAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { title, deadline, estimatedHours, priority, course } = req.body;

    const audio = await Audio.findOne({
      _id: audioId,
      user: req.user.userId,
    });

    if (!audio) {
      return res.status(404).json({ error: "Audio not found" });
    }

    const task = await Task.create({
      user: new mongoose.Types.ObjectId(req.user.userId),
      title: title || audio.title,
      type: "revision",
      deadline: deadline ? new Date(deadline) : null,
      estimatedHours: estimatedHours || 2,
      priority: priority || "medium",
      course: course ? new mongoose.Types.ObjectId(course) : null,
      linkedAudio: [audioId],
    });

    // Link task to audio
    audio.linkedTasks.push(task._id);
    await audio.save();

    const populatedTask = await Task.findById(task._id)
      .populate("course", "name code color")
      .populate("linkedAudio", "title filename");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task from audio error:", error);
    res.status(500).json({ error: "Failed to create task from audio" });
  }
};
