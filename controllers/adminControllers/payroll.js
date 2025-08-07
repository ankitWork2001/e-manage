import mongoose from "mongoose";
import Employee from "../../models/employeeModel.js";
import Payroll from "../../models/payrollModel.js";

export const generatePayroll = async (req, res) => {
  // This function would typically be called by an HR admin
  // The authorizeHRAdmin middleware handles access control for this route.
  const { employeeId, basicSalary, hra, deductions, month, year } = req.body;

  try {
    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID format." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Calculate net salary
    const netSalary = basicSalary + hra - deductions;

    const newPayroll = new Payroll({
      employeeId,
      basicSalary,
      hra,
      deductions,
      netSalary,
      month,
      year,
    });
    await newPayroll.save();

    res
      .status(201)
      .json({ message: "Payroll generated successfully", payroll: newPayroll });
  } catch (error) {
    console.error(error);
    // Handle unique index violation (duplicate payroll for month/year)
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Payslip for this employee and month/year already exists for the given period.",
      });
    }
    res.status(500).json({ message: "Server error generating payroll." });
  }
};

export const viewDepartmentPayroll = async (req, res) => {
  const adminDepartmentId = req.user.departmentId; // Departmental admin's department ID
  const { month, year } = req.query;

  try {
    const employeeIdsInDepartment = await Employee.find({
      department: adminDepartmentId,
    }).select("_id");
    const employeeObjectIds = employeeIdsInDepartment.map((emp) => emp._id);

    let query = { employeeId: { $in: employeeObjectIds } };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payrollRecords = await Payroll.find(query)
      .populate("employeeId", "name employeeId position department") // Populate relevant employee info
      .sort({ year: -1, month: -1 });

    res.status(200).json(payrollRecords);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching department payroll." });
  }
};

export const updatePayroll = async (req, res) => {
  const { id } = req.params; // Payroll record MongoDB _id
  const { basicSalary, hra, deductions, month, year } = req.body; // Fields to update

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ message: "Invalid payroll record ID format." });
    }

    const payrollRecord = await Payroll.findById(id);
    if (!payrollRecord) {
      return res.status(404).json({ message: "Payroll record not found." });
    }

    // Update fields if provided
    if (basicSalary !== undefined) payrollRecord.basicSalary = basicSalary;
    if (hra !== undefined) payrollRecord.hra = hra;
    if (deductions !== undefined) payrollRecord.deductions = deductions;
    if (month !== undefined) payrollRecord.month = month;
    if (year !== undefined) payrollRecord.year = year;

    // Recalculate net salary if basicSalary, hra, or deductions changed
    if (
      basicSalary !== undefined ||
      hra !== undefined ||
      deductions !== undefined
    ) {
      payrollRecord.netSalary =
        payrollRecord.basicSalary +
        payrollRecord.hra -
        payrollRecord.deductions;
    }

    await payrollRecord.save();
    res
      .status(200)
      .json({ message: "Payroll record updated successfully.", payrollRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating payroll record." });
  }
};
