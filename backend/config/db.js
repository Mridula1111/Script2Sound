import "dotenv/config";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb"

let gfs;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // ✅ Initialize GridFS after connection
    gfs = new GridFSBucket(conn.connection.db, {
      bucketName: "audio",
    });

    console.log("🎧 GridFS ready");

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export { gfs };
export default connectDB;
