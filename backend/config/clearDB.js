import "dotenv/config";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all models
import User from "../models/User.js";
import Audio from "../models/Audio.js";
import Course from "../models/Course.js";
import Note from "../models/Note.js";
import StudySession from "../models/StudySession.js";
import Task from "../models/Task.js";

const clearDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    console.log("🔄 Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Clear all collections
    console.log("\n📋 Clearing collections...");
    
    const collections = [
      { model: User, name: "Users" },
      { model: Audio, name: "Audio Files" },
      { model: Course, name: "Courses" },
      { model: Note, name: "Notes" },
      { model: StudySession, name: "Study Sessions" },
      { model: Task, name: "Tasks" },
    ];

    for (const { model, name } of collections) {
      const count = await model.countDocuments();
      if (count > 0) {
        await model.deleteMany({});
        console.log(`  ✓ Cleared ${name} (${count} documents)`);
      } else {
        console.log(`  ✓ ${name} already empty`);
      }
    }

    // Clear GridFS buckets
    console.log("\n🎧 Clearing GridFS buckets...");
    const db = conn.connection.db;
    
    const bucketNames = ["audio", "notes"];
    for (const bucketName of bucketNames) {
      try {
        const gfs = new GridFSBucket(db, { bucketName });
        const files = await db
          .collection(`${bucketName}.files`)
          .find({})
          .toArray();
        
        if (files.length > 0) {
          for (const file of files) {
            await gfs.delete(file._id);
          }
          console.log(`  ✓ Cleared ${bucketName} bucket (${files.length} files)`);
        } else {
          console.log(`  ✓ ${bucketName} bucket already empty`);
        }
      } catch (error) {
        console.log(`  ✓ ${bucketName} bucket already empty or doesn't exist`);
      }
    }

    // Clear uploaded files from filesystem
    console.log("\n📁 Clearing uploaded files...");
    const uploadsDir = path.join(__dirname, "../uploads");
    
    if (fs.existsSync(uploadsDir)) {
      const subdirs = fs.readdirSync(uploadsDir);
      let filesRemoved = 0;
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(uploadsDir, subdir);
        const stat = fs.statSync(subdirPath);
        
        if (stat.isDirectory()) {
          const files = fs.readdirSync(subdirPath);
          files.forEach((file) => {
            const filePath = path.join(subdirPath, file);
            try {
              fs.unlinkSync(filePath);
              filesRemoved++;
            } catch (error) {
              console.error(`  ⚠ Failed to delete ${filePath}: ${error.message}`);
            }
          });
        }
      }
      
      if (filesRemoved > 0) {
        console.log(`  ✓ Removed ${filesRemoved} uploaded files`);
      } else {
        console.log(`  ✓ No uploaded files to remove`);
      }
    } else {
      console.log(`  ✓ Uploads directory doesn't exist`);
    }

    console.log("\n✨ Database cleared successfully!");
    console.log("🔒 All user data and generated content have been removed.");

  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB disconnected");
    process.exit(0);
  }
};

// Run the clear script
clearDatabase();
