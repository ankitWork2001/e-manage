import { Router } from "express";
import {
  loginEmployee,
} from "../../controllers/employeeControllers/auth.js";

const router = Router();

router.post("/login", loginEmployee);

export default router;
