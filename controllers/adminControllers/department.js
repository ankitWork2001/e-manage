import departmentModel from "../../models/departmentModel.js";
import employeeModel from "../../models/employeeModel.js";

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentModel
      .find()
      .populate("associatedEmployees", "name email");
    res.status(200).json(departments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching departments", error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const department = await departmentModel.create({ name, description });
    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A department with this name already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating department", error: error.message });
  }
};

export const blockDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (department.status === "Inactive") {
      return res
        .status(400)
        .json({ message: "Department is already inactive" });
    }
    department.status = "Inactive";
    await department.save();
    res
      .status(200)
      .json({ message: "Department blocked successfully", department });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error blocking department", error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (name) department.name = name;
    if (description) department.description = description;

    await department.save();
    res
      .status(200)
      .json({ message: "Department updated successfully", department });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Another department with this name already exists." });
    }
    res
      .status(500)
      .json({ message: "Error updating department", error: error.message });
  }
};

export const activateBlockedDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    department.status = "Active";
    await department.save();
    res
      .status(200)
      .json({ message: "Department activated successfully", department });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error activating department", error: error.message });
  }
};

export const addEmployeeToDepartment = async (req, res) => {
  try {
    const { departmentId, employeeId } = req.body;
    const [department, employee] = await Promise.all([
      departmentModel.findById(departmentId),
      employeeModel.findById(employeeId),
    ]);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (department.associatedEmployees.includes(employee._id)) {
      return res
        .status(400)
        .json({ message: "Employee already associated with this department" });
    }

    department.associatedEmployees.push(employee._id);
    await department.save();

    res.status(200).json({
      message: "Employee added to department successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding employee to department",
      error: error.message,
    });
  }
};
