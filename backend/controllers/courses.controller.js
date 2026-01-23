import mongoose from "mongoose";
import Course from "../models/Course.js";

export const createCourse = async (req, res) => {
  try {
    const { name, code, color } = req.body;

    const course = await Course.create({
      user: new mongoose.Types.ObjectId(req.user.userId),
      name,
      code,
      color: color || "#6366f1",
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ error: error.message || "Failed to create course" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const courses = await Course.find({ user: userObjectId }).sort({
      createdAt: -1,
    });

    res.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { name, code, color } = req.body;

    const course = await Course.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      { name, code, color },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};
