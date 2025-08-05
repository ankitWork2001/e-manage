// routes/tasks.js
import { Router } from "express";
import {
  getMyTasks,
  updateTaskStatus,
} from "../../controllers/employeeControllers/tasks.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["Employee"]));
router.get("/my-tasks", getMyTasks); // Get all tasks assigned to the authenticated employee
router.put("/update-status/:taskId", updateTaskStatus); // Update the status of a specific task

export default router;
