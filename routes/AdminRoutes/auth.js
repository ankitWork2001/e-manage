import express from "express";
import {
  loginAdmin,
  logoutAdmin,
} from "../../controllers/adminControllers/auth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

export default router;
