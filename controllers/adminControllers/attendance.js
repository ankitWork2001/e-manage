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
  const { employeeObjectId, date, status } = req.body; // employeeObjectId is MongoDB _id
  const adminDepartmentId = req.user.departmentId;

  try {
    if (!mongoose.isValidObjectId(employeeObjectId)) {
      return res
        .status(400)
        .json({ message: "Invalid employee object ID format." });
    }

    // Verify employee belongs to admin's department
    const employee = await Employee.findById(employeeObjectId);
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
