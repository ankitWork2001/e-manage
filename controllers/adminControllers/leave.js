import leaveModel from "../../models/leaveRequestModel.js";
import attendanceModel from "../../models/attendanceModel.js";
import employeeModel from "../../models/employeeModel.js";

export const getAllTodayLeaves = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const leaves = await leaveModel
      .find({
        fromDate: { $lt: tomorrow },
        toDate: { $gte: today },
        status: "Approved",
      })
      .populate("employeeId", "name email");

    res.status(200).json(leaves);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching today's leaves", error: error.message });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveModel
      .findById(id)
      .populate("employeeId", "name email");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.status(200).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leave request", error: error.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveModel.findById(id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    if (leave.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Leave already ${leave.status.toLowerCase()}` });
    }

    leave.status = "Rejected";
    await leave.save();

    res.status(200).json({ message: "Leave request rejected", leave });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting leave request", error: error.message });
  }
};

export const getAllLeavesOfEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const leaves = await leaveModel.find({ employeeId: employeeId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employee leave requests",
      error: error.message,
    });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveModel.findById(id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    if (leave.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Leave already ${leave.status.toLowerCase()}` });
    }

    leave.status = "Approved";
    await leave.save();

    const attendanceRecords = [];
    let currentDate = new Date(leave.fromDate);
    while (currentDate <= leave.toDate) {
      attendanceRecords.push({
        employeeId: leave.employeeId,
        date: new Date(currentDate),
        status: "Leave",
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (attendanceRecords.length > 0) {
      await attendanceModel.insertMany(attendanceRecords);
    }

    res.status(200).json({ message: "Leave request approved", leave });
  } catch (error) {
    res.status(500).json({
      message: "Error approving leave request",
      error: error.message,
    });
  }
};
