import Task from "../models/Task.js";
import mongoose from "mongoose";

/**
 * Manual scheduling service (MVP)
 * Validates and schedules tasks manually assigned by user
 */

/**
 * Check for scheduling conflicts
 * @param {string} userId - User ID
 * @param {Date} startTime - Scheduled start time
 * @param {Date} endTime - Scheduled end time
 * @param {string} excludeTaskId - Task ID to exclude from conflict check
 * @returns {Promise<Array>} - Array of conflicting tasks
 */
export async function checkConflicts(userId, startTime, endTime, excludeTaskId = null) {
  const query = {
    user: new mongoose.Types.ObjectId(userId),
    scheduledStart: { $exists: true },
    scheduledEnd: { $exists: true },
    $or: [
      {
        // New task starts during existing task
        scheduledStart: {
          $lte: startTime,
        },
        scheduledEnd: {
          $gt: startTime,
        },
      },
      {
        // New task ends during existing task
        scheduledStart: {
          $lt: endTime,
        },
        scheduledEnd: {
          $gte: endTime,
        },
      },
      {
        // New task completely contains existing task
        scheduledStart: {
          $gte: startTime,
        },
        scheduledEnd: {
          $lte: endTime,
        },
      },
    ],
  };

  if (excludeTaskId) {
    query._id = { $ne: excludeTaskId };
  }

  const conflicts = await Task.find(query)
    .populate("course", "name color")
    .sort({ scheduledStart: 1 });

  return conflicts;
}

/**
 * Validate deadline constraints
 * @param {Date} scheduledStart - Scheduled start time
 * @param {Date} deadline - Task deadline
 * @returns {boolean} - True if valid
 */
export function validateDeadline(scheduledStart, deadline) {
  if (!deadline || !scheduledStart) return true;
  return scheduledStart <= deadline;
}

/**
 * Sort tasks by priority and deadline (for automatic scheduling - future)
 * @param {Array} tasks - Array of tasks
 * @returns {Array} - Sorted tasks
 */
export function sortTasksByPriority(tasks) {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  
  return tasks.sort((a, b) => {
    // First by priority
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by deadline (earlier first)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    // Finally by creation date
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/**
 * Calculate suggested time slots based on availability (for future automatic scheduling)
 * @param {Object} availability - User availability configuration
 * @param {Date} startDate - Start date for suggestions
 * @param {Date} endDate - End date for suggestions
 * @param {number} durationHours - Required duration in hours
 * @returns {Array} - Array of suggested time slots
 */
export function calculateSuggestedSlots(availability, startDate, endDate, durationHours) {
  // This is a placeholder for future automatic scheduling
  // For MVP, users manually schedule tasks
  const slots = [];
  
  // Future implementation would:
  // 1. Parse availability windows
  // 2. Find gaps between existing scheduled tasks
  // 3. Match gaps to required duration
  // 4. Return sorted suggestions
  
  return slots;
}

/**
 * Automatic scheduling algorithm (enhanced)
 * @param {string} userId - User ID
 * @param {Array} tasks - Tasks to schedule
 * @param {Object} constraints - Scheduling constraints
 * @returns {Promise<Object>} - Scheduling results
 */
export async function automaticScheduling(userId, tasks, constraints = {}) {
  // Sort tasks by priority and deadline
  const sortedTasks = sortTasksByPriority(tasks);
  
  const scheduled = [];
  const failed = [];
  
  // For each task, find the best available slot
  for (const task of sortedTasks) {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const durationHours = task.estimatedHours || 1;
    
    // Find available slot
    const slot = await findBestSlot(
      userId,
      new Date(), // Start from now
      deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days ahead
      durationHours,
      constraints
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
  
  return { scheduled, failed };
}

/**
 * Find best available slot for a task
 * @param {string} userId - User ID
 * @param {Date} startDate - Start searching from
 * @param {Date} endDate - Must be before this date
 * @param {number} durationHours - Required duration
 * @param {Object} constraints - Additional constraints
 * @returns {Promise<Object|null>} - Best slot or null
 */
async function findBestSlot(userId, startDate, endDate, durationHours, constraints) {
  const durationMs = durationHours * 60 * 60 * 1000;
  let currentDate = new Date(startDate);
  
  // Default: 9 AM to 5 PM
  const startHour = constraints.startHour || 9;
  const endHour = constraints.endHour || 17;
  
  while (currentDate < endDate) {
    // Set to start of day with preferred start hour
    const dayStart = new Date(currentDate);
    dayStart.setHours(startHour, 0, 0, 0);
    
    // Try slots throughout the day
    for (let hour = startHour; hour <= endHour - durationHours; hour++) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      
      // Check conflicts
      const conflicts = await checkConflicts(userId, slotStart, slotEnd);
      
      if (conflicts.length === 0) {
        return { start: slotStart, end: slotEnd };
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return null;
}

/**
 * Detect overload weeks (for future analytics)
 * @param {string} userId - User ID
 * @param {Date} weekStart - Start of week
 * @returns {Promise<Object>} - Overload analysis
 */
export async function detectOverload(userId, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const tasks = await Task.find({
    user: new mongoose.Types.ObjectId(userId),
    scheduledStart: {
      $gte: weekStart,
      $lt: weekEnd,
    },
  });

  const totalHours = tasks.reduce((sum, task) => {
    if (task.scheduledStart && task.scheduledEnd) {
      const hours = (task.scheduledEnd - task.scheduledStart) / (1000 * 60 * 60);
      return sum + hours;
    }
    return sum + (task.estimatedHours || 0);
  }, 0);

  // Threshold: 40 hours per week
  const threshold = 40;
  const isOverloaded = totalHours > threshold;

  return {
    totalHours,
    taskCount: tasks.length,
    isOverloaded,
    threshold,
    warning: isOverloaded
      ? `You have ${totalHours.toFixed(1)} hours scheduled this week, exceeding the recommended ${threshold} hours.`
      : null,
  };
}
