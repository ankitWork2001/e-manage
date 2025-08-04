import Employee from "../models/Employee.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      employeeId: employee._id,
      role: "Employee",
      departmentId: employee.department,
    });
    res.json({
      token,
      role: "Employee",
      employeeId: employee._id,
      departmentId: employee.department,
      name: employee.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during Employee login" });
  }
};
