// routes/tasks.js
import { Router } from "express";
import {
  getMyTasks,
  updateTaskStatus,
} from "../../controllers/employeeControllers/tasks.js"; 

const router = Router();

router.get("/my-tasks", getMyTasks); // Get all tasks assigned to the authenticated employee
router.put("/update-status/:taskId", updateTaskStatus); // Update the status of a specific task

export default router;
