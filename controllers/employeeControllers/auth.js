import employeeModel from "../../models/employeeModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import generateUniqueEmployeeId from "../../utils/employeeIdGenerator.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_Expires = process.env.JWT_Expires || "2d";
const PORT = process.env.PORT || 8000;

export const registerEmployee = async (req, res) => {
  try {
    const { name, email, phone, position, department, dateOfJoining, salary, password } = req.body;


     if (!name || !email || !password || !phone) {
  return res.status(400).json({ message: "All fields (name, email, password, phone) are required" });
}


    const existing = await employeeModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Employee already exists with this email" });

    const employeeId = await generateUniqueEmployeeId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await employeeModel.create({
      employeeId,
      name,
      email,
      phone,
      position,
      department,
      dateOfJoining,
      salary,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Employee registered successfully", employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};


export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

     if (!email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}

    const employee = await employeeModel.findOne({ email });
    if (!employee) 
      return res.status(404).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) 
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: employee._id }, JWT_SECRET, { expiresIn: JWT_Expires});

    res.status(200).json({
      message: "Login successful",
      token,
      employee:employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const employee = await employeeModel.findOne({ email });
    if (!employee) 
      return res.status(404).json({ message: "Employee not found" });

         // Create reset URL
    const resetUrl = `http://localhost:${PORT}/api/auth/employee/${employee._id}/reset-password`;

    // Send email
    const mailOptions = {
      from: `"EMS Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${employee.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `
    };

       res.status(200).json({ message: "Password reset instructions sent to your email" });

    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).json({ message: "Error in forgot password", error: error.message });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const employee = await employeeModel.findOne({ email });
    if (!employee)
     return res.status(404).json({ message: "Employee not found" });

    const employeeId = req.params.employeeId;

  if (employeeId !== employee._id.toString()) {
  return res.status(401).json({ message: "Invalid Authentication" });
}
 

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;

    await employee.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
