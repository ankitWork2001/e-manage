import { Router } from "express";
import {
  getDepartmentAttendance,
  markEmployeeAttendance,
  getEmployeeAttendance,
} from "../../controllers/adminControllers/attendance.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

// --- Attendance Management (within department scope) ---
router.get("/department", getDepartmentAttendance); // Fetch attendance for department
router.post("/:id/mark", markEmployeeAttendance); // Mark/update attendance for an employee
router.post("/:id", getEmployeeAttendance); // Get attendance for a specific employee by ID

export default router;
