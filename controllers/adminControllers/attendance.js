import Attendance from "../../models/attendanceModel.js";

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

export const markAttendance = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const { date, status } = req.body;
    if (!date || !status) {
      return res
        .status(400)
        .json({ message: "All fields (date, status) are required" });
    }
    const attendance = new Attendance({
      employeeId,
      date,
      status,
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

export const unmarkAttendance = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const { date, status } = req.body;
    if (!date || !status) {
      return res
        .status(400)
        .json({ message: "All fields (date, status) are required" });
    }
    const attendance = await Attendance.findOne({ employeeId, date });
    if (!attendance) {
      return res
        .status(400)
        .json({ message: "Attendance not found for this date" });
    }
    await Attendance.deleteOne({ employeeId, date });
    res.status(200).json({ message: "Attendance unmarked successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error unmarking attendance",
      error: error.message,
    });
  }
};
