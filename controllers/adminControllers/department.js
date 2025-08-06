import departmentModel from "../../models/departmentModel.js";
import employeeModel from "../../models/employeeModel.js";

// --- Department Management ---
export const addEmployeeToDepartment = async (req, res) => {
  try {
    // Corrected: Destructure employeeId and departmentName from the body
    const { employeeId, departmentName } = req.body;

    // Corrected: Find the department by its unique name
    const department = await departmentModel.findOne({ name: departmentName });

    // Corrected: Find the employee by their unique string ID
    const employee = await employeeModel.findOne({ employeeId });

    if (!department) {
      return res.status(404).json({ message: "New department not found" });
    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if the employee is already in this department to avoid unnecessary updates
    if (
      employee.department &&
      employee.department.toString() === department._id.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Employee is already in this department" });
    }

    // Update the employee's department field using the department's MongoDB _id
    employee.department = department._id;
    await employee.save();

    res.status(200).json({
      message: `Employee ${employee.name} department updated to ${department.name} successfully`,
      employee: {
        _id: employee._id,
        name: employee.name,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating employee department",
      error: error.message,
    });
  }
};

export const removeEmployeeFromDepartment = async (req, res) => {
  try {
    // Corrected: Destructure employeeId and departmentName from the body
    const { employeeId, departmentName } = req.body;

    // Corrected: Find the department by its unique name
    const department = await departmentModel.findOne({ name: departmentName });

    // Corrected: Find the employee by their unique string ID
    const employee = await employeeModel.findOne({ employeeId, department: department._id });

    if (!department) {
      return res.status(404).json({ message: "New department not found" });
    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if the employee is not in this department to avoid unnecessary updates
    if (
      employee.department &&
      employee.department.toString() !== department._id.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Employee is not in this department" });
    }

    // Update the employee's department field using the department's MongoDB _id
    employee.department = null
    await employee.save();

    res.status(200).json({
      message: `Employee ${employee.name} department removed successfully`,
      employee: {
        _id: employee._id,
        name: employee.name,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating employee department",
      error: error.message,
    });
  }
};
