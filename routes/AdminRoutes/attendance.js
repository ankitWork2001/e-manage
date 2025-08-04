import { Router } from "express";
import {
  getDepartmentAttendance,
  markEmployeeAttendance,
} from "../../controllers/adminControllers/attendance.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

// --- Attendance Management (within department scope) ---
router.get("/attendance", getDepartmentAttendance); // Fetch attendance for department
router.post("/attendance", markEmployeeAttendance); // Mark/update attendance for an employee

export default router;
