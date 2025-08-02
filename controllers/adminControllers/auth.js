import adminModel from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import {generateTokenForUser} from "../../middleware/verifyToken.js";
// import jwt from "jsonwebtoken";

// // Secret for JWT
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// const JWT_Expires = process.env.JWT_Expires || "1h" ;

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  
        const token = generateTokenForUser(admin);

        // Set token in cookie
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

    res.status(200).json({
      message: "Login successful",
      user : admin,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const adminLogout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logout successful" });
};
