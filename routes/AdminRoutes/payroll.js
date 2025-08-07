import { Router } from "express";
import {
  generatePayroll,
  viewDepartmentPayroll,
  updatePayroll,
} from "../../controllers/adminControllers/payroll.js";
import { updateEmployeeSalary } from "../../controllers/adminControllers/employee.js";
import {
  authenticateToken,
  authorizeRole,
  authorizeHRAdmin,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

// Employee Salary Management (HR Admin only)
router.post("/payroll", authorizeHRAdmin, generatePayroll); // Only HR admin can generate payroll
router.get("/payroll/department", viewDepartmentPayroll); // General admin can view basic payroll for their department
router.put("/payroll/:id", authorizeHRAdmin, updatePayroll); // Only HR admin can update payroll record
router.put(
  "/employees/:employeeId/salary",
  authorizeHRAdmin,
  updateEmployeeSalary
); // Use employee's MongoDB _id here
