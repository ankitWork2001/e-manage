import { Router } from "express";
import { addEmployeeToDepartment } from "../../controllers/adminControllers/department.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["SuperAdmin", "DepartmentAdmin"]));
router.post("/add-employee", addEmployeeToDepartment);

export default router;
