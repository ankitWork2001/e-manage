import express from "express";
import {
  loginAdmin,
} from "../../controllers/adminControllers/auth.js";

const router = express.Router();

router.post("/admin/login", loginAdmin);

export default router;
