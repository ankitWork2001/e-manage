import employeeModel from "../../models/employeeModel.js";

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find().populate("department", "name");
    res.status(200).json(employees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel
      .findById(id)
      .populate("department", "name");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employee", error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const employee = await employeeModel.create({
      name,
      email,
      password,
      department,
    });
    res
      .status(201)
      .json({ message: "Employee created successfully", employee });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "An employee with this email already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating employee", error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, department } = req.body;

    const employee = await employeeModel.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password,
        department,
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating employee", error: error.message });
  }
};

export const blockEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.status === "Inactive") {
      return res.status(400).json({ message: "Employee is already inactive" });
    }
    employee.status = "Inactive";
    await employee.save();
    res
      .status(200)
      .json({ message: "Employee blocked successfully", employee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error blocking employee", error: error.message });
  }
};

export const activateBlockedEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.status = "Active";
    await employee.save();
    res
      .status(200)
      .json({ message: "Employee activated successfully", employee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error activating employee", error: error.message });
  }
};
