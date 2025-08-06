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

router.get("/", getDepartmentEmployees); // Gets employees only from admin's department
router.get("/:employeeId", getDepartmentEmployeeById); // Specific employee by their custom employeeId string
router.put("/:employeeId", updateDepartmentEmployee); // Update employee details
router.put("/:employeeId/status", updateEmployeeStatus); // Deactivate/Activate employee

export default router;
