import express from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/authmiddleware.js";
import {
  createDepartmentalAdmin,
  getAllDepartmentalAdmins,
  getDepartmentalAdminById,
  updateDepartmentalAdmin,
  deleteDepartmentalAdmin,
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getAllEmployeesGlobal, // Global view
  transferEmployeeDepartment,
} from "../controllers/superAdminControllers/superAdminController.js";

const router = express.Router();

// All Super Admin routes should be protected
router.use(authenticateToken);
router.use(authorizeRole(["SuperAdmin"]));

// --- Departmental Admin Management ---
router.post("/create-admin", createDepartmentalAdmin);
router.get("/admins", getAllDepartmentalAdmins);
router.get("/admins/:id", getDepartmentalAdminById);
router.put("/admins/:id", updateDepartmentalAdmin);
router.delete("/admins/:id", deleteDepartmentalAdmin);

// --- Department Management ---
router.post("/create-department", createDepartment);
router.get("/departments", getAllDepartments);
router.get("/departments/:id", getDepartmentById);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// --- Global Employee Oversight (SuperAdmin can see all employees) ---
router.get("/employees/all", getAllEmployeesGlobal); // Route to get all employees across departments
router.put("/employees/:employeeId/transfer", transferEmployeeDepartment); // Route to transfer an employee

export default router;
