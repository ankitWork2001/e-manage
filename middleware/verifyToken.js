import jwt from "jsonwebtoken";
// import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No Auth Header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    // Find user by ID from token payload
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
