import SuperAdmin from "../models/SuperAdmin.js";
import DepartmentalAdmin from "../../models/departmentalAdmin.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, superAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      superAdminId: superAdmin._id,
      role: "SuperAdmin",
    });
    res.json({
      token,
      role: "SuperAdmin",
      superAdminId: superAdmin._id,
      name: superAdmin.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during Super Admin login" });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await DepartmentalAdmin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      adminId: admin._id,
      role: "DepartmentAdmin",
      departmentId: admin.department,
    });
    res.json({
      token,
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
