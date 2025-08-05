import DepartmentalAdmin from "../../models/departmentalAdmin.js";
import { comparePassword } from "../../utils/password.js";
import { generateToken, verifyToken } from "../../utils/jwt.js"; // Note: Added verifyToken
import jwt from "jsonwebtoken"; // You'll need this for logout logic
import dotenv from "dotenv";

dotenv.config();

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find the admin by email
    const admin = await DepartmentalAdmin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Compare the provided password with the stored hash
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate a JWT upon successful login
    const token = generateToken({
      adminId: admin._id,
      role: "DepartmentAdmin",
      departmentId: admin.department,
    });

    // 4. Set the token in a secure, http-only cookie
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "strict", // Protects against CSRF attacks
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
    });

    // 5. Respond with a success message and non-sensitive details
    res.status(200).json({
      message: "Login successful",
      role: "DepartmentAdmin",
      adminId: admin._id,
      departmentId: admin.department,
      name: admin.name,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during Departmental Admin login" });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    // 1. Clear the token cookie to end the session
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // 2. Send a success message
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during logout." });
  }
};
