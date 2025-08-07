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
  // The employeeId from the body is the CUSTOM STRING ID (e.g., 'EMP003')
  const { employeeId: customEmployeeId, date, status } = req.body;
  const adminDepartmentId = req.user.departmentId;

  try {
    // 1. Find the Employee document using their CUSTOM STRING ID
    const employee = await Employee.findOne({ employeeId: customEmployeeId }); // 2. Check if the employee exists and is in the admin's department
    if (
      !employee ||
      employee.department.toString() !== adminDepartmentId.toString()
    ) {
      return res.status(403).json({
        message: "Employee not found in your department or unauthorized.",
      });
    } // From this point on, use the employee's MongoDB _id (employee._id) // This resolves the CastError. // 3. Normalize the date

    const attendanceDate = new Date(date).setHours(0, 0, 0, 0); // 4. Check if attendance for this employee and date already exists

    let attendance = await Attendance.findOne({
      employeeId: employee._id, // Use the MongoDB _id here
      date: attendanceDate,
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
        employeeId: employee._id, // Use the MongoDB _id here
        date: attendanceDate,
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
    console.log(employee);
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
