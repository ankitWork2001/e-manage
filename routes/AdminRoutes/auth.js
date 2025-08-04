import express from "express";
import {
  loginSuperAdmin,
  loginAdmin,
} from "../../controllers/adminControllers/auth.js";

const router = express.Router();

router.post("/superadmin/login", loginSuperAdmin);
router.post("/admin/login", loginAdmin);

export default router;
