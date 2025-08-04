import { Router } from "express";
import {
  loginEmployee,
  forgotPassword,
  resetPassword,
} from "../../controllers/employeeControllers/auth.js";

const router = Router();

router.post("/login", loginEmployee);

export default router;
