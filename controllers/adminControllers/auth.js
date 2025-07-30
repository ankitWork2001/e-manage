import adminModel from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_Expires = process.env.JWT_Expires || "1h" ;

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn:  JWT_Expires });

     res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      message: "Login successful",
      user : admin,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.setHeader("Authorization", ``);
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
