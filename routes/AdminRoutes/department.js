import { Router } from "express";
import { addEmployeeToDepartment } from "../../controllers/adminControllers/department.js";

const router = Router();

router.post("/department/add-employee", addEmployeeToDepartment);

export default router;
