import mongoose from "mongoose";
import Task from "../models/Task.js";

export const getDailyView = async (req, res) => {
  try {
    const { date } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get tasks scheduled for this day or with deadline on this day
    const tasks = await Task.find({
      user: userObjectId,
      $or: [
        {
          scheduledStart: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
        {
          deadline: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      ],
    })
      .populate("course", "name code color")
      .sort({ scheduledStart: 1, priority: -1 });

    res.json({
      date: targetDate.toISOString(),
      tasks,
    });
  } catch (error) {
    console.error("Get daily view error:", error);
    res.status(500).json({ error: "Failed to fetch daily view" });
  }
};

export const getWeeklyView = async (req, res) => {
  try {
    const { startDate } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const weekStart = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    // Get all tasks scheduled in this week or with deadlines in this week
    const tasks = await Task.find({
      user: userObjectId,
      $or: [
        {
          scheduledStart: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        },
        {
          deadline: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        },
      ],
    })
      .populate("course", "name code color")
      .sort({ scheduledStart: 1, deadline: 1 });

    // Group tasks by day
    const tasksByDay = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayKey = day.toISOString().split("T")[0];
      tasksByDay[dayKey] = [];
    }

    tasks.forEach((task) => {
      const taskDate = task.scheduledStart || task.deadline;
      if (taskDate) {
        const dayKey = new Date(taskDate).toISOString().split("T")[0];
        if (tasksByDay[dayKey]) {
          tasksByDay[dayKey].push(task);
        }
      }
    });

    res.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      tasksByDay,
    });
  } catch (error) {
    console.error("Get weekly view error:", error);
    res.status(500).json({ error: "Failed to fetch weekly view" });
  }
};

export const scheduleTask = async (req, res) => {
  try {
    const { taskId, scheduledStart, scheduledEnd } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Basic conflict check (can be enhanced later)
    if (scheduledStart && scheduledEnd) {
      const conflicts = await Task.find({
        user: req.user.userId,
        _id: { $ne: taskId },
        scheduledStart: { $exists: true },
        scheduledEnd: { $exists: true },
        $or: [
          {
            scheduledStart: {
              $gte: new Date(scheduledStart),
              $lt: new Date(scheduledEnd),
            },
          },
          {
            scheduledEnd: {
              $gt: new Date(scheduledStart),
              $lte: new Date(scheduledEnd),
            },
          },
        ],
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          error: "Scheduling conflict detected",
          conflicts: conflicts.map((c) => ({
            id: c._id,
            title: c.title,
            scheduledStart: c.scheduledStart,
            scheduledEnd: c.scheduledEnd,
          })),
        });
      }
    }

    task.scheduledStart = scheduledStart ? new Date(scheduledStart) : null;
    task.scheduledEnd = scheduledEnd ? new Date(scheduledEnd) : null;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("course", "name code color");

    res.json(updatedTask);
  } catch (error) {
    console.error("Schedule task error:", error);
    res.status(500).json({ error: "Failed to schedule task" });
  }
};

export const unscheduleTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.scheduledStart = null;
    task.scheduledEnd = null;
    await task.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Unschedule task error:", error);
    res.status(500).json({ error: "Failed to unschedule task" });
  }
};
