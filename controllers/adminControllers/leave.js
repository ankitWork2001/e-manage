import LeaveRequest from "../../models/leaveRequestModel.js";
import Employee from "../../models/employeeModel.js";
import mongoose from "mongoose";

// --- Leave Request Management (within department) ---

export const getDepartmentLeaveRequests = async (req, res) => {
  const adminDepartmentId = req.user.departmentId;
  const { status } = req.query; // Optional filter: 'Pending', 'Approved', 'Rejected'

  try {
    const employeeIdsInDepartment = await Employee.find({
      department: adminDepartmentId,
    }).select("_id");
    const employeeObjectIds = employeeIdsInDepartment.map((emp) => emp._id);

    let query = { employeeId: { $in: employeeObjectIds } };
    if (status) {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employeeId", "name employeeId department")
      .sort({ createdAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching department leave requests." });
  }
};

export const updateLeaveRequestStatus = async (req, res) => {
  const { id } = req.params; // Leave request MongoDB _id
  const { status } = req.body; // 'Approved' or 'Rejected'
  const adminDepartmentId = req.user.departmentId;

  if (!mongoose.isValidObjectId(id)) {
    return res
      .status(400)
      .json({ message: "Invalid leave request ID format." });
  }
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({
      message: "Invalid leave status provided. Must be Approved or Rejected.",
    });
  }

  try {
    const leaveRequest = await LeaveRequest.findById(id).populate("employeeId");
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    // Ensure the leave request belongs to an employee in this admin's department
    if (
      !leaveRequest.employeeId ||
      leaveRequest.employeeId.department.toString() !==
        adminDepartmentId.toString()
    ) {
      return res.status(403).json({
        message:
          "Access denied: Leave request not in your department or employee not found.",
      });
    }

    if (leaveRequest.status !== "Pending") {
      return res.status(400).json({
        message: `Leave request already ${leaveRequest.status}. Cannot be changed.`,
      });
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error updating leave request status." });
  }
};
