import { Router } from "express";
import {
  assignTask,
  getDepartmentTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addCommentToTask,
  addAttachmentToTask,
} from "../../controllers/adminControllers/tasks.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

// --- Task Management (within department scope) ---
// assignedTo in body should be MongoDB _id of employee
router.post("/tasks", assignTask); // Assign task to employee in their department
router.get("/tasks", getDepartmentTasks); // Get all tasks assigned by them or in their department
router.get("/tasks/:id", getTaskById); // Get specific task by MongoDB _id
router.put("/tasks/:id", updateTask); // Update task details by MongoDB _id
router.delete("/tasks/:id", deleteTask); // Delete task by MongoDB _id
router.post("/tasks/:id/comments", addCommentToTask); // Add comment to task by MongoDB _id
router.post("/tasks/:id/attachments", addAttachmentToTask); // Add attachment to task by MongoDB _id

export default router;
