// middleware/authMiddleware.js
import { verifyToken } from "../utils/jwt.js";
import DepartmentalAdmin from "../models/departmentalAdmin.js";
import Employee from "../models/employeeModel.js";
import Department from "../models/departmentModel.js";
import LeaveRequest from "../models/leaveRequestModel.js"; // Corrected: Added LeaveRequest model
import Task from "../models/taskModel.js"; // Corrected: Added Task model
import mongoose from "mongoose"; // Added for ObjectId validation

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
};

export const authorizeRole = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res
      .status(403)
      .json({ message: "Access denied: User role not found" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied: Requires one of ${roles.join(", ")} roles`,
    });
  }
  next();
};

export const authorizeDepartmentAccess = async (req, res, next) => {
  // SuperAdmin has full access, no need to check further
  if (req.user.role === "SuperAdmin") {
    return next();
  }

  // --- Departmental Admin Access Check ---
  if (req.user.role === "DepartmentAdmin") {
    const departmentIdFromToken = req.user.departmentId;
    const { employeeId, leaveId, taskId, payrollId } = req.params;

    // For list or creation requests (no resource ID), pass through
    if (!employeeId && !leaveId && !taskId && !payrollId) {
      return next();
    }

    try {
      let resource;
      let resourceDepartmentId;

      if (employeeId) {
        // Corrected: Use findOne to search by custom string employeeId or ObjectId
        const employee = await Employee.findOne({
          $or: [
            { employeeId },
            { _id: mongoose.isValidObjectId(employeeId) ? employeeId : null },
          ],
        });
        if (!employee)
          return res.status(404).json({ message: "Employee not found." });
        resourceDepartmentId = employee.department.toString();
      } else if (leaveId) {
        // Corrected: More efficient lookup
        const leaveRequest = await LeaveRequest.findById(leaveId).populate(
          "employeeId"
        );
        if (!leaveRequest || !leaveRequest.employeeId)
          return res.status(404).json({ message: "Leave request not found." });
        resourceDepartmentId = leaveRequest.employeeId.department.toString();
      } else if (taskId) {
        // Corrected: More efficient lookup
        const task = await Task.findById(taskId).populate("assignedTo");
        if (!task || !task.assignedTo)
          return res.status(404).json({ message: "Task not found." });
        resourceDepartmentId = task.assignedTo.department.toString();
      } else if (payrollId) {
        // Assuming a payroll ID parameter exists
        const payroll = await Payroll.findById(payrollId).populate(
          "employeeId"
        );
        if (!payroll || !payroll.employeeId)
          return res.status(404).json({ message: "Payroll record not found." });
        resourceDepartmentId = payroll.employeeId.department.toString();
      }

      // Final check to see if the resource's department matches the admin's department
      if (resourceDepartmentId !== departmentIdFromToken.toString()) {
        return res
          .status(403)
          .json({
            message:
              "Access denied: Resource does not belong to your department.",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error during department access check." });
    }
  }

  // --- Employee Access Check (for self-service) ---
  else if (req.user.role === "Employee") {
    const { employeeId, leaveId, taskId, payrollId } = req.params;

    // Direct access to a resource via ID
    if (
      employeeId &&
      employeeId.toString() !== req.user.employeeId.toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied: You can only access your own employee data.",
        });
    }
    // Checking leave request ownership
    if (leaveId) {
      const leaveRequest = await LeaveRequest.findById(leaveId);
      if (
        !leaveRequest ||
        leaveRequest.employeeId.toString() !== req.user.employeeId.toString()
      ) {
        return res
          .status(403)
          .json({
            message:
              "Access denied: You can only access your own leave requests.",
          });
      }
    }
    // Checking task ownership
    if (taskId) {
      const task = await Task.findById(taskId);
      if (
        !task ||
        task.assignedTo.toString() !== req.user.employeeId.toString()
      ) {
        return res
          .status(403)
          .json({
            message: "Access denied: You can only access your own tasks.",
          });
      }
    }
    // Checking payroll ownership
    if (payrollId) {
      const payroll = await Payroll.findById(payrollId);
      if (
        !payroll ||
        payroll.employeeId.toString() !== req.user.employeeId.toString()
      ) {
        return res
          .status(403)
          .json({
            message: "Access denied: You can only access your own payroll.",
          });
      }
    }

    next();
  } else {
    // For any other unexpected roles, deny access
    return res
      .status(403)
      .json({ message: "Access denied: Role not authorized." });
  }
};

export const authorizeHRAdmin = async (req, res, next) => {
  if (req.user.role === "SuperAdmin") {
    return next();
  }
  if (req.user.role !== "DepartmentAdmin" || !req.user.departmentId) {
    return res
      .status(403)
      .json({ message: "Access denied: Not a departmental admin." });
  }

  try {
    const hrDepartment = await Department.findOne({ name: "HR" });
    if (
      !hrDepartment ||
      hrDepartment._id.toString() !== req.user.departmentId
    ) {
      return res.status(403).json({
        message:
          "Access denied: Only HR Department Admin can perform this action",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during HR admin check." });
  }
};
