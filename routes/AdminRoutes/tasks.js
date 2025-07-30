// routes/tasks.js
import { Router } from "express";
import {
  assignTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addCommentToTask,
} from "../../controllers/adminControllers/tasks.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { isAdmin } from "../../middleware/role.js";

const router = Router();

router.post("/", verifyToken, isAdmin, assignTask);
router.get("/", verifyToken, isAdmin, getAllTasks);
router.get("/:id", verifyToken, isAdmin, getTaskById);
router.put("/:id", verifyToken, isAdmin, updateTask);
router.delete("/:id", verifyToken, isAdmin, deleteTask);
router.post("/:id/comments", verifyToken, isAdmin, addCommentToTask);

export default router;
