// middleware/authMiddleware.js
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
  if (req.user.role === "SuperAdmin") {
    return next(); // SuperAdmin has global access
  }

  if (req.user.role === "DepartmentAdmin") {
    const departmentIdFromToken = req.user.departmentId;
    const resourceId =
      req.params.employeeId || req.params.leaveId || req.params.taskId; // Add other IDs as needed

    if (!resourceId) {
      // This middleware is for specific resource access within a department.
      // If no resource ID is provided, it's likely a list request or creation, which needs different handling.
      // For now, let's assume if no ID, it's a list operation of own department's resources.
      return next(); // For 'get all employees in my department' type calls
    }

    try {
      let resource;
      if (req.params.employeeId) {
        resource = await Employee.findById(resourceId);
      } else if (req.params.leaveId) {
        resource = await LeaveRequest.findById(resourceId).populate(
          "employeeId"
        );
        resource.department = resource.employeeId.department; // Get department from associated employee
      } else if (req.params.taskId) {
        resource = await Task.findById(resourceId).populate("assignedTo");
        resource.department = resource.assignedTo.department; // Get department from assigned employee
      }
      // Add other resource types (e.g., Attendance, Payroll) as needed

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (resource.department.toString() !== departmentIdFromToken) {
        return res.status(403).json({
          message: "Access denied: Resource does not belong to your department",
        });
      }
      next();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error during department access check" });
    }
  } else {
    // For Employee role, they should only access their own resources
    if (req.user.role === "Employee") {
      const resourceId =
        req.params.employeeId || req.params.leaveId || req.params.taskId;
      if (resourceId && resourceId !== req.user.employeeId) {
        return res.status(403).json({
          message: "Access denied: You can only access your own resources",
        });
      }
    }
    next();
  }
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
