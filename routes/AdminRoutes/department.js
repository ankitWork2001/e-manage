import { Router } from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  blockDepartment,
  activateBlockedDepartment,
  addEmployeeToDepartment,
} from "../../controllers/adminControllers/department.js";

const router = Router();

router.get("/departments", getAllDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.patch("/departments/:id/block", blockDepartment);
router.patch("/departments/:id/activate", activateBlockedDepartment);
router.post("/departments/add-employee", addEmployeeToDepartment);

export default router;
