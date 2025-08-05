import { Router } from "express";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  recordAttendance,
  getAttendanceReport,
  applyForLeave,
  getEmployeePayslip,
} from "../../controllers/employeeControllers/employee.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";
const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["Employee"]));

router.get("/profile", getEmployeeProfile);
router.put("/update", updateEmployeeProfile);
router.post("/attendance", recordAttendance);
router.get("/attendance-report", getAttendanceReport);
router.post("/leave", applyForLeave);
router.get("/payslip", getEmployeePayslip);

export default router;
