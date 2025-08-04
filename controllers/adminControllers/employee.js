import Employee from "../../models/employeeModel.js";
import { hashPassword } from "../../utils/password.js";
import Department from "../models/Department.js";
// --- Employee Management (within department) ---

export const createEmployee = async (req, res) => {
  const {
    employeeId,
    name,
    email,
    password,
    phone,
    position,
    dateOfJoining,
    salary,
  } = req.body;
  const adminDepartmentId = req.user.departmentId; // Get department from authenticated admin's token

  try {
    // Basic validation
    if (!employeeId || !name || !email || !password || !adminDepartmentId) {
      return res.status(400).json({
        message: "Missing required employee fields or admin department ID.",
      });
    }

    // Check for unique employeeId and email across all employees
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee ID or email already exists in the system.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newEmployee = new Employee({
      employeeId,
      name,
      email,
      password: hashedPassword,
      phone,
      position,
      department: adminDepartmentId, // Assign to the admin's department
      dateOfJoining,
      salary,
    });
    await newEmployee.save();

    res.status(201).json({
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating employee." });
  }
};

export const getDepartmentEmployees = async (req, res) => {
  const adminDepartmentId = req.user.departmentId;
  try {
    const employees = await Employee.find({ department: adminDepartmentId })
      .select("-password") // Exclude password from response
      .populate("department", "name"); // Populate department name for clarity
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching department employees." });
  }
};

export const getDepartmentEmployeeById = async (req, res) => {
  const { employeeId } = req.params; // This is the employee's string employeeId
  const adminDepartmentId = req.user.departmentId;

  try {
    // Using employeeId string, not MongoDB _id
    const employee = await Employee.findOne({
      employeeId,
      department: adminDepartmentId,
    })
      .select("-password")
      .populate("department", "name");

    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found in your department." });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching employee details." });
  }
};

export const updateDepartmentEmployee = async (req, res) => {
  const { employeeId } = req.params; // Employee's string employeeId
  const { name, email, phone, position, dateOfJoining, status } = req.body; // Salary update is for HR admin
  const adminDepartmentId = req.user.departmentId;

  try {
    const employee = await Employee.findOne({
      employeeId,
      department: adminDepartmentId,
    });
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found in your department." });
    }

    if (name) employee.name = name;
    if (email && email !== employee.email) {
      // Check for email uniqueness if changed, excluding the current employee
      const emailTaken = await Employee.findOne({
        email,
        _id: { $ne: employee._id },
      });
      if (emailTaken) {
        return res
          .status(400)
          .json({ message: "Email already in use by another employee." });
      }
      employee.email = email;
    }
    if (phone) employee.phone = phone;
    if (position) employee.position = position;
    if (dateOfJoining) employee.dateOfJoining = dateOfJoining;
    if (status) employee.status = status; // Consider enum validation if not handled by schema

    await employee.save();
    res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating employee." });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  const { employeeId } = req.params; // Employee's string employeeId
  const { status } = req.body; // 'Active' or 'Inactive'
  const adminDepartmentId = req.user.departmentId;

  try {
    const employee = await Employee.findOne({
      employeeId,
      department: adminDepartmentId,
    });
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found in your department." });
    }
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status provided. Must be Active or Inactive.",
      });
    }

    employee.status = status;
    await employee.save();

    res
      .status(200)
      .json({ message: "Employee status updated successfully", employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating employee status." });
  }
};

// --- Employee Salary Management (HR Admin specific access) ---

export const updateEmployeeSalary = async (req, res) => {
  const { employeeId } = req.params;
  const { salary } = req.body; // The new salary amount

  if (typeof salary !== "number" || salary < 0) {
    return res
      .status(400)
      .json({ message: "Salary must be a positive number." });
  }

  try {
    const employee = await Employee.findById(employeeId); // HR Admin can update any employee's salary
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    employee.salary = salary;
    await employee.save();

    res
      .status(200)
      .json({ message: "Employee salary updated successfully.", employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating employee salary." });
  }
};
