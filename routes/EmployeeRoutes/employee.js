import { Router } from "express";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
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

router.get("/profile/:id", getEmployeeProfile);
router.put("/update/:id", updateEmployeeProfile);
router.get("/attendance-report/:id", getAttendanceReport);
router.post("/leave/:id", applyForLeave);
router.get("/payslip/:id", getEmployeePayslip);

export default router;
