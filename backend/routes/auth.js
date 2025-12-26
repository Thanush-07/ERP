// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const router = express.Router();

// TODO: move to .env
const JWT_SECRET = "your_jwt_secret_key";
const FRONTEND_URL = "http://localhost:5173";

// =================== LOGIN ===================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", { email, password: password ? "***" : "missing" });

    if (!email || !password) {
      console.log("VALIDATION FAILED: Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Only active users can login
    const user = await User.findOne({ email, status: "active" });

    if (!user) {
      console.log("USER NOT FOUND or INACTIVE:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("USER FOUND:", { id: user._id, email: user.email, hasHash: !!user.password_hash });

    const ok = await user.comparePassword(password);
    if (!ok) {
      console.log("PASSWORD MISMATCH for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token + user data (includes institution_id for institution_admin)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id || null,
        branch_id: user.branch_id || null,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================== FORGOT PASSWORD ===================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.json({
        message: "If that email exists, a reset link was sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    console.log("PASSWORD RESET LINK:", resetUrl);

    // In production you would send this link via email
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================== RESET PASSWORD ===================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password_hash = hash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful, you can login now" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================== CHANGE PASSWORD (LOGGED-IN) ===================
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "User, current password and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user || user.status !== "active") {
      return res.status(400).json({ message: "User not found or inactive" });
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    await user.setPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
