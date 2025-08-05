import Attendance from "../../models/attendanceModel.js";
import Employee from "../../models/employeeModel.js";
import mongoose from "mongoose";
// --- Attendance Management (within department) ---

export const getDepartmentAttendance = async (req, res) => {
  const adminDepartmentId = req.user.departmentId;
  const { startDate, endDate } = req.query; // Optional date range

  try {
    // Find employees in the admin's department
    const employeeIdsInDepartment = await Employee.find({
      department: adminDepartmentId,
    }).select("_id");
    const employeeObjectIds = employeeIdsInDepartment.map((emp) => emp._id);

    let query = { employeeId: { $in: employeeObjectIds } };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("employeeId", "name employeeId department") // Populate employee name/ID
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching department attendance." });
  }
};

export const markEmployeeAttendance = async (req, res) => {
  const { employeeId, date, status } = req.body; // employeeObjectId is MongoDB _id
  const adminDepartmentId = req.user.departmentId;

  try {
    // Verify employee belongs to admin's department
    const employee = await Employee.findOne({
      employeeId: employeeId,
      department: adminDepartmentId,
    });
    if (
      !employee ||
      employee.department.toString() !== adminDepartmentId.toString()
    ) {
      return res.status(403).json({
        message: "Employee not found in your department or unauthorized.",
      });
    }

    // Check if attendance for this employee and date already exists
    let attendance = await Attendance.findOne({
      employeeId: employeeObjectId,
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      await attendance.save();
      res
        .status(200)
        .json({ message: "Attendance updated successfully.", attendance });
    } else {
      // Create new record
      attendance = new Attendance({
        employeeId: employeeObjectId,
        date: new Date(date).setHours(0, 0, 0, 0), // Normalize date to start of day
        status,
      });
      await attendance.save();
      res
        .status(201)
        .json({ message: "Attendance marked successfully.", attendance });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error marking attendance." });
  }
};

export const getEmployeeAttendance = async (req, res) => {
  const { employeeId } = req.params; // This is the employee's string employeeId
  const adminDepartmentId = req.user.departmentId;

  try {
    // Using employeeId string, not MongoDB _id
    const employee = await Employee.findOne({
      employeeId,
      department: adminDepartmentId,
    });
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found in your department." });
    }

    const attendanceRecords = await Attendance.find({
      employeeId: employee._id,
    })
      .populate("employeeId", "name employeeId department") // Populate employee name/ID
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching attendance for employee." });
  }
};
