import { Router } from "express";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  recordAttendance,
  getAttendanceReport,
  applyForLeave,
  getEmployeePayslip,
} from "../../controllers/employeeControllers/employee.js";

const router = Router();

router.get("/profile", getEmployeeProfile);
router.put("/update", updateEmployeeProfile);
router.post("/attendance", recordAttendance);
router.get("/attendance-report", getAttendanceReport);
router.post("/leave", applyForLeave);
router.get("/payslip", getEmployeePayslip);

export default router;
