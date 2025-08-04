import express from "express";
const router = express.Router({ mergeParams: true });
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  recordAttendance,
  getAttendanceReport,
  applyForLeave,
  getEmployeePayslip,
} from "../../controllers/employeeControllers/employee.js";


router.get("/profile", getEmployeeProfile);
router.put("/update", updateEmployeeProfile);
router.post("/attendance", recordAttendance);
router.get("/attendance-report", getAttendanceReport);
router.post("/leave", applyForLeave);
router.get("/payslip", getEmployeePayslip);

export default router;
