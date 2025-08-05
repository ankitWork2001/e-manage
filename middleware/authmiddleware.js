import { verifyToken } from "../utils/jwt.js";

import DepartmentalAdmin from "../models/departmentalAdmin.js";

import Employee from "../models/employeeModel.js";

import Department from "../models/departmentModel.js"; // Needed to check HR department

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

  req.user = decoded; // Attach user payload to request

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
  // SuperAdmin has full access, so they bypass all checks.
  if (req.user.role === "SuperAdmin") {
    return next();
  }

  // Find a resource ID from the URL parameters
  const { employeeId, leaveId, taskId } = req.params;
  const resourceId = employeeId || leaveId || taskId;

  // Crucial Correction:
  // If no resource ID is present in the URL, assume it's a list or creation request.
  // The controller's own logic must then ensure the department scope.
  if (!resourceId) {
    return next();
  }

  // --- Departmental Admin Access Check ---
  if (req.user.role === "DepartmentAdmin") {
    const departmentIdFromToken = req.user.departmentId;

    try {
      let resourceDepartmentId;

      if (employeeId) {
        // Corrected: Use findOne to search by custom string employeeId or ObjectId
        const employee = await Employee.findOne({
          $or: [
            { employeeId: employeeId },
            { _id: mongoose.isValidObjectId(employeeId) ? employeeId : null },
          ],
        });
        if (!employee) {
          return res.status(404).json({ message: "Employee not found." });
        }
        resourceDepartmentId = employee.department.toString();
      } else if (leaveId) {
        // Corrected: Populating to access the employee's department
        const leaveRequest = await LeaveRequest.findById(leaveId).populate(
          "employeeId"
        );
        if (!leaveRequest || !leaveRequest.employeeId) {
          return res.status(404).json({ message: "Leave request not found." });
        }
        resourceDepartmentId = leaveRequest.employeeId.department.toString();
      } else if (taskId) {
        // Corrected: Populating to access the assigned employee's department
        const task = await Task.findById(taskId).populate("assignedTo");
        if (!task || !task.assignedTo) {
          return res.status(404).json({ message: "Task not found." });
        }
        resourceDepartmentId = task.assignedTo.department.toString();
      } else {
        // This handles cases where a param exists but isn't one we expect
        return res
          .status(400)
          .json({ message: "Invalid resource type in URL parameter." });
      }

      // Check if the resource's department matches the admin's department
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

  // --- Employee Self-Service Access Check ---
  else if (req.user.role === "Employee") {
    // Logic for employees accessing their own resources would go here.
    // For now, this is a placeholder. A simple check for a direct employeeId
    // in the params is handled here.
    if (
      employeeId &&
      employeeId.toString() === req.user.employeeId.toString()
    ) {
      return next();
    }
    // More complex checks (for leave requests, tasks) would need to be added.
    // For now, if no direct employeeId match, we deny access.
    return res
      .status(403)
      .json({
        message: "Access denied: You can only access your own employee data.",
      });
  }

  return res
    .status(403)
    .json({ message: "Access denied: Role not authorized for this resource." });
};

export const authorizeHRAdmin = async (req, res, next) => {
  if (req.user.role === "SuperAdmin") {
    return next(); // SuperAdmin can do anything
  }

  if (req.user.role !== "DepartmentAdmin" || !req.user.departmentId) {
    return res

      .status(403)

      .json({ message: "Access denied: Not a departmental admin" });
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

    res.status(500).json({ message: "Server error during HR admin check" });
  }
};
