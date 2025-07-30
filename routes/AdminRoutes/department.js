import {Router} from "express";
import {getAllDepartments, createDepartment, updateDepartment, blockDepartment, activateBlockedDepartment} from "../../controllers/adminControllers/department.js";

const router = Router();

router.get('/departments', getAllDepartments);
router.post('/departments/create', createDepartment);
router.put('/departments/update/:employeeId', updateDepartment);
router.patch('/departments/block/:departmentId', blockDepartment);
router.patch('/departments/activate/:departmentId', activateBlockedDepartment);

export default router;