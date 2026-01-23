import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import crypto from "crypto"
import { sendVerificationEmail } from "../services/email.service.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
export async function registerUser(req, res) {
  try {
    const { email, password } = req.body;

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      email,
      password,
      verificationCode: code,
      verificationExpiry: Date.now() + 10 * 60 * 1000, // 10 min
    });

    await sendVerificationEmail(email, code);

    res.json({
      message: "Registered. Please verify your email.",
    });
  } catch (err) {
    res.status(400).json({ error: "Register failed" });
  }
}


//VERIFY

export async function verifyEmail(req, res) {
  console.log("VERIFY BODY:", req.body);
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  console.log("STORED CODE:", user?.verificationCode);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: "Invalid code" });
  }

  if (user.verificationExpiry < Date.now()) {
    return res.status(400).json({ error: "Code expired" });
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationExpiry = null;
  await user.save();

  res.json({ message: "Email verified successfully" });
}


//LOGIN

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const emailNormalized = email.trim().toLowerCase();
    console.log("LOGIN EMAIL (normalized):", emailNormalized);

    const user = await User.findOne({ email: emailNormalized });
    console.log("USER FOUND:", !!user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
      });
    }
    
    console.log("STORED HASH:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }

}
