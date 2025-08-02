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
// import { verifyToken } from "../../middleware/verifyToken.js";
import { isAdmin } from "../../middleware/role.js";

const router = Router();

router.post("/",isAdmin, assignTask);
router.get("/", isAdmin, getAllTasks);
router.get("/:id", isAdmin, getTaskById);
router.put("/:id", isAdmin, updateTask);
router.delete("/:id", isAdmin, deleteTask);
router.post("/:id/comments", isAdmin, addCommentToTask);

export default router;
