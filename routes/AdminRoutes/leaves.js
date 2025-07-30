import { Router } from "express";
import {
  getAllTodayLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  getAllLeavesOfEmployee,
} from "../../controllers/adminControllers/leave.js";

const router = Router();

router.get("/leaves/today", getAllTodayLeaves);
router.get("/leaves/:id", getLeaveById);
router.get("/leaves/employee/:employeeId", getAllLeavesOfEmployee);
router.put("/leaves/approve/:id", approveLeave);
router.put("/leaves/reject/:id", rejectLeave);

export default router;
