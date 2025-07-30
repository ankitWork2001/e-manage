// employee.js
import Employee from "../../models/employeeModel.js";
import Attendance from "../../models/attendanceModel.js";
import Leave from "../../models/leaveRequestModel.js";
import Payroll from "../../models/payrollModel.js";

export const getEmployeeProfile = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res
      .status(200)
      .json({ message: "Employee profile fetched successfully", employee });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employee profile",
      error: error.message,
    });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const { name, email, phone, position, department, dateOfJoining, salary } =
      req.body;
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "All fields (name, email, phone) are required" });
    }
    employee.name = name;
    employee.email = email;
    employee.phone = phone;
    employee.position = position;
    employee.department = department;
    employee.dateOfJoining = dateOfJoining;
    employee.salary = salary;
    await employee.save();
    res
      .status(200)
      .json({ message: "Employee profile updated successfully", employee });
  } catch (error) {
    res.status(500).json({
      message: "Error updating employee profile",
      error: error.message,
    });
  }
};

export const recordAttendance = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const { date, reason } = req.body;
    if (!date || !reason) {
      return res
        .status(400)
        .json({ message: "All fields (date, reason) are required" });
    }
    const attendance = new Attendance({
      employeeId,
      date,
      reason,
    });
    await attendance.save();
    res
      .status(201)
      .json({ message: "Attendance recorded successfully", attendance });
  } catch (error) {
    res.status(500).json({
      message: "Error recording attendance",
      error: error.message,
    });
  }
};

export const getAttendanceReport = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const attendances = await Attendance.find({ employeeId });
    res
      .status(200)
      .json({ message: "Attendance report fetched successfully", attendances });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance report",
      error: error.message,
    });
  }
};

export const applyForLeave = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "All fields (startDate, endDate, reason) are required",
      });
    }
    const leave = new Leave({
      employeeId,
      startDate,
      endDate,
      reason,
    });
    await leave.save();
    res
      .status(201)
      .json({ message: "Leave request submitted successfully", leave });
  } catch (error) {
    res.status(500).json({
      message: "Error applying for leave",
      error: error.message,
    });
  }
};

export const getEmployeePayslip = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const payroll = await Payroll.find({ employeeId });
    res.status(200).json({ message: "Payslip fetched successfully", payroll });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payslip",
      error: error.message,
    });
  }
};
