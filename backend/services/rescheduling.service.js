import Task from "../models/Task.js";
import mongoose from "mongoose";
import { checkConflicts, sortTasksByPriority } from "./scheduling.service.js";

/**
 * Rescheduling service
 * Handles missed tasks, changes, and automatic rescheduling
 */

/**
 * Reschedule missed tasks
 * @param {string} userId - User ID
 * @param {Date} fromDate - Start date to check for missed tasks
 * @returns {Promise<Array>} - Array of rescheduled tasks
 */
export async function rescheduleMissedTasks(userId, fromDate = new Date()) {
  const missedTasks = await Task.find({
    user: new mongoose.Types.ObjectId(userId),
    status: { $in: ["pending", "in-progress"] },
    scheduledStart: { $lt: fromDate },
    deadline: { $gte: fromDate }, // Still has time before deadline
  })
    .populate("course", "name color")
    .sort({ deadline: 1 });

  const rescheduled = [];

  for (const task of missedTasks) {
    // Try to reschedule to next available slot before deadline
    const suggestedSlot = await findNextAvailableSlot(
      userId,
      fromDate,
      task.deadline,
      task.estimatedHours || 1
    );

    if (suggestedSlot) {
      task.scheduledStart = suggestedSlot.start;
      task.scheduledEnd = suggestedSlot.end;
      await task.save();
      rescheduled.push(task);
    }
  }

  return rescheduled;
}

/**
 * Find next available slot for a task
 * @param {string} userId - User ID
 * @param {Date} startDate - Start searching from this date
 * @param {Date} deadline - Must be before this date
 * @param {number} durationHours - Required duration in hours
 * @returns {Promise<Object|null>} - Available slot { start, end } or null
 */
export async function findNextAvailableSlot(
  userId,
  startDate,
  deadline,
  durationHours
) {
  // Simple implementation: find first available slot
  // Future: integrate with availability windows
  const durationMs = durationHours * 60 * 60 * 1000;
  let currentDate = new Date(startDate);
  currentDate.setHours(9, 0, 0, 0); // Start at 9 AM

  while (currentDate < deadline) {
    const endTime = new Date(currentDate.getTime() + durationMs);

    // Check if this slot conflicts with existing tasks
    const conflicts = await checkConflicts(
      userId,
      currentDate,
      endTime
    );

    if (conflicts.length === 0) {
      return { start: currentDate, end: endTime };
    }

    // Move to next hour
    currentDate.setHours(currentDate.getHours() + 1);
  }

  return null;
}

/**
 * Auto-schedule unscheduled tasks
 * @param {string} userId - User ID
 * @param {Date} startDate - Start scheduling from this date
 * @param {number} daysAhead - How many days ahead to schedule
 * @returns {Promise<Object>} - Scheduling results
 */
export async function autoScheduleTasks(userId, startDate = new Date(), daysAhead = 7) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysAhead);

  // Get unscheduled tasks with deadlines
  const unscheduledTasks = await Task.find({
    user: new mongoose.Types.ObjectId(userId),
    status: { $in: ["pending", "in-progress"] },
    scheduledStart: { $exists: false },
    deadline: { $lte: endDate, $gte: startDate },
  })
    .populate("course", "name color");

  // Sort by priority and deadline
  const sortedTasks = sortTasksByPriority(unscheduledTasks);

  const scheduled = [];
  const failed = [];

  for (const task of sortedTasks) {
    const slot = await findNextAvailableSlot(
      userId,
      startDate,
      task.deadline || endDate,
      task.estimatedHours || 1
    );

    if (slot) {
      task.scheduledStart = slot.start;
      task.scheduledEnd = slot.end;
      await task.save();
      scheduled.push(task);
    } else {
      failed.push(task);
    }
  }

  return {
    scheduled,
    failed,
    total: unscheduledTasks.length,
  };
}

/**
 * Detect and warn about scheduling conflicts
 * @param {string} userId - User ID
 * @param {Date} startDate - Start checking from this date
 * @param {number} daysAhead - How many days ahead to check
 * @returns {Promise<Array>} - Array of conflict warnings
 */
export async function detectConflicts(userId, startDate = new Date(), daysAhead = 7) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysAhead);

  const tasks = await Task.find({
    user: new mongoose.Types.ObjectId(userId),
    scheduledStart: {
      $gte: startDate,
      $lte: endDate,
    },
    scheduledEnd: { $exists: true },
  })
    .populate("course", "name color")
    .sort({ scheduledStart: 1 });

  const conflicts = [];

  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const task1 = tasks[i];
      const task2 = tasks[j];

      if (
        task1.scheduledStart < task2.scheduledEnd &&
        task1.scheduledEnd > task2.scheduledStart
      ) {
        conflicts.push({
          task1: {
            id: task1._id,
            title: task1.title,
            start: task1.scheduledStart,
            end: task1.scheduledEnd,
          },
          task2: {
            id: task2._id,
            title: task2.title,
            start: task2.scheduledStart,
            end: task2.scheduledEnd,
          },
        });
      }
    }
  }

  return conflicts;
}
