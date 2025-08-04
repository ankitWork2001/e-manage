import { Router } from "express";
import {
  getDepartmentEmployees,
  getDepartmentEmployeeById,
  updateDepartmentEmployee,
  updateEmployeeStatus,
} from "../../controllers/adminControllers/employee.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

router.get("/employees", getDepartmentEmployees); // Gets employees only from admin's department
router.get("/employees/:employeeId", getDepartmentEmployeeById); // Specific employee by their custom employeeId string
router.put("/employees/:employeeId", updateDepartmentEmployee); // Update employee details
router.put("/employees/:employeeId/status", updateEmployeeStatus); // Deactivate/Activate employee

export default router;
