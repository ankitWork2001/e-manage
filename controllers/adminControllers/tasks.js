import Task from "../../models/taskModel.js";
import Employee from "../../models/employeeModel.js";
import mongoose from "mongoose";
// --- Task Management (within department) ---

export const assignTask = async (req, res) => {
  const { title, description, deadline, assignedTo } = req.body; // assignedTo is employee ObjectId
  const adminDepartmentId = req.user.departmentId;
  const assignedById = req.user.adminId;

  try {
    if (!title || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title and assigned employee are required." });
    }
    if (!mongoose.isValidObjectId(assignedTo)) {
      return res
        .status(400)
        .json({ message: "Invalid assignedTo employee ID format." });
    }

    // Check if assignedTo employee exists and is in the admin's department
    const employee = await Employee.findById(assignedTo);
    if (
      !employee ||
      employee.department.toString() !== adminDepartmentId.toString()
    ) {
      return res.status(403).json({
        message:
          "Cannot assign task: Employee not found in your department or unauthorized.",
      });
    }

    const newTask = new Task({
      title,
      description,
      deadline,
      assignedTo,
      assignedBy: assignedById,
      status: "Pending", // Default status
    });
    await newTask.save();

    res
      .status(201)
      .json({ message: "Task assigned successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error assigning task." });
  }
};

export const getDepartmentTasks = async (req, res) => {
  const adminDepartmentId = req.user.departmentId;
  const { status, assignedTo } = req.query; // Optional filters

  try {
    const employeeIdsInDepartment = await Employee.find({
      department: adminDepartmentId,
    }).select("_id");
    const employeeObjectIds = employeeIdsInDepartment.map((emp) => emp._id);

    let query = {
      $or: [
        { assignedBy: req.user.adminId }, // Tasks assigned by this admin
        { assignedTo: { $in: employeeObjectIds } }, // Tasks assigned to employees in this admin's department
      ],
    };

    if (status) {
      query.status = status;
    }
    if (assignedTo && mongoose.isValidObjectId(assignedTo)) {
      // If a specific employee is requested, ensure they are in the department
      if (!employeeObjectIds.includes(assignedTo)) {
        return res.status(403).json({
          message: "Cannot filter tasks for employee outside your department.",
        });
      }
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name employeeId") // Show who it's assigned to
      .populate("assignedBy", "name email") // Show who assigned it
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error fetching department tasks." });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params; // Task MongoDB _id
  const adminDepartmentId = req.user.departmentId;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }

    const task = await Task.findById(id)
      .populate("assignedTo", "name employeeId department")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Verify task is relevant to this admin: either assigned by them or assigned to someone in their department
    const isAssignedByMe =
      task.assignedBy.toString() === req.user.adminId.toString();
    const isAssignedToMyDeptEmployee =
      task.assignedTo &&
      task.assignedTo.department &&
      task.assignedTo.department.toString() === adminDepartmentId.toString();

    if (!isAssignedByMe && !isAssignedToMyDeptEmployee) {
      return res.status(403).json({
        message: "Access denied: Task is not related to your department.",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching task details." });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params; // Task MongoDB _id
  const { title, description, deadline, status, assignedTo } = req.body;
  const adminDepartmentId = req.user.departmentId;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }

    const task = await Task.findById(id).populate("assignedTo", "department");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Ensure the admin has permission to update this task
    const isAssignedByMe =
      task.assignedBy.toString() === req.user.adminId.toString();
    const isAssignedToMyDeptEmployee =
      task.assignedTo &&
      task.assignedTo.department &&
      task.assignedTo.department.toString() === adminDepartmentId.toString();

    if (!isAssignedByMe && !isAssignedToMyDeptEmployee) {
      return res.status(403).json({
        message:
          "Access denied: You cannot update tasks outside your management scope.",
      });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (deadline) task.deadline = deadline;
    if (status) task.status = status;

    // Handle re-assigning task (only if to an employee within the same department)
    if (assignedTo && assignedTo.toString() !== task.assignedTo.toString()) {
      if (!mongoose.isValidObjectId(assignedTo)) {
        return res
          .status(400)
          .json({ message: "Invalid assignedTo employee ID format." });
      }
      const newAssignedToEmployee = await Employee.findById(assignedTo);
      if (
        !newAssignedToEmployee ||
        newAssignedToEmployee.department.toString() !==
          adminDepartmentId.toString()
      ) {
        return res.status(403).json({
          message:
            "Cannot reassign task to an employee outside your department.",
        });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating task." });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params; // Task MongoDB _id
  const adminDepartmentId = req.user.departmentId;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }

    const task = await Task.findById(id).populate("assignedTo", "department");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Ensure the admin has permission to delete this task
    const isAssignedByMe =
      task.assignedBy.toString() === req.user.adminId.toString();
    const isAssignedToMyDeptEmployee =
      task.assignedTo &&
      task.assignedTo.department &&
      task.assignedTo.department.toString() === adminDepartmentId.toString();

    if (!isAssignedByMe && !isAssignedToMyDeptEmployee) {
      return res.status(403).json({
        message:
          "Access denied: You cannot delete tasks outside your management scope.",
      });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting task." });
  }
};

export const addCommentToTask = async (req, res) => {
  const { id } = req.params; // Task MongoDB _id
  const { text } = req.body;
  const adminDepartmentId = req.user.departmentId; // Admin ID from token

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }
    if (!text) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const task = await Task.findById(id).populate("assignedTo", "department");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const isAssignedByMe =
      task.assignedBy.toString() === req.user.adminId.toString();
    const isAssignedToMyDeptEmployee =
      task.assignedTo &&
      task.assignedTo.department &&
      task.assignedTo.department.toString() === adminDepartmentId.toString();

    if (!isAssignedByMe && !isAssignedToMyDeptEmployee) {
      return res.status(403).json({
        message:
          "Access denied: You cannot comment on tasks outside your management scope.",
      });
    }

    task.comments.push({
      text,
      postedBy: req.user.adminId,
      postedAt: Date.now(),
    }); // Admin is posting comment
    await task.save();

    res.status(200).json({ message: "Comment added successfully.", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error adding comment to task." });
  }
};

export const addAttachmentToTask = async (req, res) => {
  // This is a placeholder. Real implementation needs file upload middleware (e.g., multer)
  // and storage solution (e.g., AWS S3, local filesystem).
  const { id } = req.params; // Task MongoDB _id
  const { fileName, fileUrl } = req.body; // In a real app, fileUrl would come from upload service

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }
    if (!fileName || !fileUrl) {
      return res
        .status(400)
        .json({ message: "File name and URL are required." });
    }

    const task = await Task.findById(id).populate("assignedTo", "department");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const adminDepartmentId = req.user.departmentId;
    const isAssignedByMe =
      task.assignedBy.toString() === req.user.adminId.toString();
    const isAssignedToMyDeptEmployee =
      task.assignedTo &&
      task.assignedTo.department &&
      task.assignedTo.department.toString() === adminDepartmentId.toString();

    if (!isAssignedByMe && !isAssignedToMyDeptEmployee) {
      return res.status(403).json({
        message:
          "Access denied: You cannot add attachments to tasks outside your management scope.",
      });
    }

    task.attachments.push({ fileName, fileUrl, uploadedAt: Date.now() });
    await task.save();

    res.status(200).json({ message: "Attachment added successfully.", task });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error adding attachment to task." });
  }
};
