// controllers/superAdminController.js
import SuperAdmin from "../../models/SuperAdmin.js";
import DepartmentalAdmin from "../../models/departmentalAdmin.js";
import Department from "../../models/departmentModel.js";
import Employee from "../../models/employeeModel.js"; // Will need for employee transfer/global view later
import { hashPassword, comparePassword } from "../../utils/password.js";
import mongoose from "mongoose"; // Import mongoose for isValidObjectId check
import { generateToken, verifyToken } from "../../utils/jwt.js"; // Note: Added verifyToken

export const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(400).json({ message: "Not found" });
    }

    const isMatch = await comparePassword(password, superAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      superAdminId: superAdmin._id,
      role: "SuperAdmin",
    });
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 days in milliseconds
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "strict", // Protects against CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });
    res.json({
      message: "Login successful",
      role: "SuperAdmin",
      superAdminId: superAdmin._id,
      name: superAdmin.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during Super Admin login" });
  }
};
// --- Departmental Admin Management ---

export const createDepartmentalAdmin = async (req, res) => {
  const { name, email, password, departmentId } = req.body;
  try {
    // 1. Validate departmentId format
    if (!mongoose.isValidObjectId(departmentId)) {
      return res.status(400).json({ message: "Invalid Department ID format." });
    }

    // 2. Check if department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found." });
    }

    // 3. Check if department already has an admin assigned
    if (departmentExists.admin) {
      return res.status(400).json({
        message: `Department "${departmentExists.name}" already has an admin assigned.`,
      });
    }

    // 4. Check if email is already used by an Admin or SuperAdmin
    const existingAdmin = await DepartmentalAdmin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Email already registered as a departmental admin." });
    }
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res
        .status(400)
        .json({ message: "Email already registered as a super admin." });
    }

    // 5. Hash password and create new admin
    const hashedPassword = await hashPassword(password);
    const newAdmin = new DepartmentalAdmin({
      name,
      email,
      password: hashedPassword,
      department: departmentId,
      role: "DepartmentAdmin", // Explicitly set role
    });
    await newAdmin.save();

    // 6. Link the new admin to the department
    departmentExists.admin = newAdmin._id;
    await departmentExists.save();

    res.status(201).json({
      message: "Departmental Admin created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during creation of departmental admin." });
  }
};

export const getAllDepartmentalAdmins = async (req, res) => {
  try {
    const admins = await DepartmentalAdmin.find().populate(
      "department",
      "name description"
    ); // Populate department name and description
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching departmental admins." });
  }
};

export const getDepartmentalAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Admin ID format." });
    }
    const admin = await DepartmentalAdmin.findById(id).populate(
      "department",
      "name description"
    );
    if (!admin) {
      return res.status(404).json({ message: "Departmental Admin not found." });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching departmental admin." });
  }
};

export const updateDepartmentalAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, departmentId } = req.body;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Admin ID format." });
    }

    const admin = await DepartmentalAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Departmental Admin not found." });
    }

    // Handle potential department re-assignment
    if (
      departmentId &&
      departmentId.toString() !== admin.department.toString()
    ) {
      if (!mongoose.isValidObjectId(departmentId)) {
        return res
          .status(400)
          .json({ message: "Invalid new Department ID format." });
      }
      const newDepartment = await Department.findById(departmentId);
      if (!newDepartment) {
        return res.status(404).json({ message: "New department not found." });
      }
      if (newDepartment.admin && newDepartment.admin.toString() !== id) {
        return res.status(400).json({
          message: `New department "${newDepartment.name}" already has an admin assigned.`,
        });
      }

      // Unlink from old department
      const oldDepartment = await Department.findById(admin.department);
      if (
        oldDepartment &&
        oldDepartment.admin &&
        oldDepartment.admin.toString() === id
      ) {
        oldDepartment.admin = undefined; // Unset the admin reference
        await oldDepartment.save();
      }

      // Link to new department
      newDepartment.admin = admin._id;
      await newDepartment.save();
      admin.department = departmentId;
    }

    // Update fields
    if (name) admin.name = name;
    if (email && email !== admin.email) {
      // Check for email uniqueness if changed
      const emailTaken = await DepartmentalAdmin.findOne({
        email,
        _id: { $ne: id },
      });
      if (emailTaken) {
        return res
          .status(400)
          .json({ message: "Email already in use by another admin." });
      }
      admin.email = email;
    }
    if (password) admin.password = await hashPassword(password);

    await admin.save();
    res
      .status(200)
      .json({ message: "Departmental Admin updated successfully", admin });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error updating departmental admin." });
  }
};

export const deleteDepartmentalAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Admin ID format." });
    }

    const admin = await DepartmentalAdmin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: "Departmental Admin not found." });
    }

    // Also unlink the admin from the department
    const department = await Department.findOneAndUpdate(
      { admin: id },
      { $unset: { admin: 1 } }, // Remove the admin field
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Departmental Admin deleted successfully.", admin });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error deleting departmental admin." });
  }
};

// --- Department Management ---

export const createDepartment = async (req, res) => {
  const { name, description } = req.body;
  try {
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res
        .status(400)
        .json({ message: "Department with this name already exists." });
    }
    const newDepartment = new Department({ name, description });
    await newDepartment.save();
    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during department creation." });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("admin", "name email"); // Populate admin details
    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching departments." });
  }
};

export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Department ID format." });
    }
    const department = await Department.findById(id).populate(
      "admin",
      "name email"
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching department." });
  }
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body; // status can be 'Active' or 'Inactive'
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Department ID format." });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    // Check for unique name if changed
    if (name && name !== department.name) {
      const nameTaken = await Department.findOne({ name, _id: { $ne: id } });
      if (nameTaken) {
        return res
          .status(400)
          .json({ message: "Department with this name already exists." });
      }
      department.name = name;
    }
    if (description) department.description = description;
    if (status) department.status = status; // Validate status enum if not already handled by schema

    await department.save();
    res
      .status(200)
      .json({ message: "Department updated successfully", department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating department." });
  }
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Department ID format." });
    }

    // Before deleting department, ensure no employees are linked to it or handle them
    const employeesInDepartment = await Employee.countDocuments({
      department: id,
    });
    if (employeesInDepartment > 0) {
      return res.status(400).json({
        message:
          "Cannot delete department with active employees. Please reassign employees first.",
      });
    }

    // If an admin is linked, their department field will become invalid.
    // We should either delete the admin too or unset their department link explicitly.
    // For now, let's unset the admin's department.
    const linkedAdmin = await DepartmentalAdmin.findOneAndUpdate(
      { department: id },
      { $unset: { department: 1 } },
      { new: true }
    );
    if (linkedAdmin) {
      // Also remove the admin reference from the department itself if it wasn't already null
      await Department.findByIdAndUpdate(id, { $unset: { admin: 1 } });
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res
      .status(200)
      .json({ message: "Department deleted successfully.", department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting department." });
  }
};

// --- Global Employee Oversight (Remaining TODOs from previous) ---

export const getAllEmployeesGlobal = async (req, res) => {
  try {
    // Only HR admin should see salary, or implement separate route for salary view.
    // For now, SuperAdmin sees all, but exclude sensitive info like password
    const employees = await Employee.find()
      .select("-password")
      .populate("department", "name");
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching all employees." });
  }
};

export const transferEmployeeDepartment = async (req, res) => {
  const { employeeId } = req.params;
  const { newDepartmentId } = req.body;
  try {
    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid Employee ID format." });
    }
    if (!mongoose.isValidObjectId(newDepartmentId)) {
      return res
        .status(400)
        .json({ message: "Invalid New Department ID format." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const newDepartment = await Department.findById(newDepartmentId);
    if (!newDepartment) {
      return res.status(404).json({ message: "New department not found." });
    }

    employee.department = newDepartmentId;
    await employee.save();

    res.status(200).json({
      message: "Employee department transferred successfully",
      employee,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during employee department transfer." });
  }
};
