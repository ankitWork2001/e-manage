import {Router} from "express";
import {getAllEmployees, getEmployeeById, makeEmployeeHR, updateEmployee, blockEmployee, activateBlockedEmployee} from "../../controllers/adminControllers/employee.js";

const router = Router();

router.get('/employees', getAllEmployees);
router.get('/employees/:employeeId', getEmployeeById);
router.post('/:id/promote-employee', makeEmployeeHR);
router.put('/employees/:id', updateEmployee);
router.patch('/employees/block/:employeeId', blockEmployee);
router.patch('/employees/activate/:employeeId', activateBlockedEmployee);

export default router;