import { Router } from "express";
import {
  getDepartmentLeaveRequests,
  updateLeaveRequestStatus,
} from "../../controllers/adminControllers/leave.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/authmiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(["DepartmentAdmin"]));

// --- Leave Request Management (within department scope) ---
router.get("/leave-requests", getDepartmentLeaveRequests); // Get all leave requests from their department
router.put("/leave-request/:id", updateLeaveRequestStatus); // Update status by MongoDB _id of leave request

export default router;
