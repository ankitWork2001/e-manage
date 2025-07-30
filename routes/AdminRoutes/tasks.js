// routes/tasks.js
import { Router } from "express";
import {
  assignTask,
  // You might add more task-related controllers here, e.g., updateTaskStatus, getEmployeeTasks, deleteTask
} from "../../controllers/adminControllers/tasks.js"; // Assuming assignTask is in admin controller, or you might move it to a task-specific controller

const router = Router();

router.post("/assign", assignTask); // Assign a task to an employee
router.put("/update/:taskId", updateTaskStatus); // Example: Update task status
router.get("/employee/:employeeId", getEmployeeTasks); // Example: Get tasks for a specific employee

export default router;
