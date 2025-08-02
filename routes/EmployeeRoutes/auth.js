import { Router } from "express";
import {
  registerEmployee,
  loginEmployee,
  forgotPassword,
  resetPassword,
  logoutEmployee
} from "../../controllers/employeeControllers/auth.js";

const router = Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.post("/logout",logoutEmployee);
router.post("/forgot-password", forgotPassword);
router.post("/:employeeId/reset-password", resetPassword);

export default router;
