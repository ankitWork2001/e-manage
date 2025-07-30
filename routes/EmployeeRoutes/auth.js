import { Router } from "express";
import {
  registerEmployee,
  loginEmployee,
  forgotPassword,
  resetPassword,
} from "../../controllers/employeeControllers/auth.js";

const router = Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.post("/forgot-password", forgotPassword);
router.post("/:employeeId/reset-password", resetPassword);

export default router;
