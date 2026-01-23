import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Planner configuration service
 * Manages user availability, preferences, and constraints
 */

// Default availability structure
const defaultAvailability = {
  monday: [{ start: "09:00", end: "17:00" }],
  tuesday: [{ start: "09:00", end: "17:00" }],
  wednesday: [{ start: "09:00", end: "17:00" }],
  thursday: [{ start: "09:00", end: "17:00" }],
  friday: [{ start: "09:00", end: "17:00" }],
  saturday: [],
  sunday: [],
};

/**
 * Get user planner configuration
 * For MVP, we'll store this in a simple structure
 * Future: Create a separate PlannerConfig model
 */
export async function getUserConfig(userId) {
  // For MVP, return default config
  // Future: Fetch from PlannerConfig model or User.plannerConfig field
  return {
    availability: defaultAvailability,
    preferences: {
      preferredSessionLength: 60, // minutes
      preferredStartTime: "09:00",
      bufferTime: 15, // minutes between sessions
    },
    constraints: [], // Fixed time blocks (classes, meetings, etc.)
  };
}

/**
 * Update user planner configuration
 */
export async function updateUserConfig(userId, config) {
  // For MVP, this is a placeholder
  // Future: Save to PlannerConfig model or User.plannerConfig field
  console.log("Updating planner config for user:", userId, config);
  return config;
}

/**
 * Parse availability windows into usable time slots
 */
export function parseAvailability(availability) {
  const slots = [];
  
  Object.keys(availability).forEach((day) => {
    const windows = availability[day];
    windows.forEach((window) => {
      slots.push({
        day,
        start: window.start,
        end: window.end,
      });
    });
  });
  
  return slots;
}
