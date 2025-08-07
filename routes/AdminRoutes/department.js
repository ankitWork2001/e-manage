import { Router } from "express";
import {
  addEmployeeToDepartment,
  removeEmployeeFromDepartment,
} from "../../controllers/adminControllers/department.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["SuperAdmin", "DepartmentAdmin"]));

router.post("/add-employee", addEmployeeToDepartment);
router.delete("/remove-employee", removeEmployeeFromDepartment);

export default router;
