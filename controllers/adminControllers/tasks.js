import Task from "../../models/taskModel.js";
import Employee from "../../models/employeeModel.js";
import mongoose from "mongoose";

// --- Task Management (within department) ---

export const assignTask = async (req, res) => {
  // Corrected: assignedTo is now the employee's custom string ID (e.g., "EMP003")
  const {
    title,
    description,
    deadline,
    assignedTo: customEmployeeId,
  } = req.body;
  const adminDepartmentId = req.user.departmentId;
  const assignedById = req.user.adminId;

  try {
    if (!title || !customEmployeeId) {
      return res
        .status(400)
        .json({ message: "Title and assigned employee ID are required." });
    }

    // Corrected: Find the Employee document using their custom string ID
    const employee = await Employee.findOne({ employeeId: customEmployeeId });

    if (
      !employee ||
      employee.department.toString() !== adminDepartmentId.toString()
    ) {
      return res.status(403).json({
        message:
          "Cannot assign task: Employee not found in your department or unauthorized.",
      });
    }

    // Now, use the employee's MongoDB _id (employee._id) for the new task
    const newTask = new Task({
      title,
      description,
      deadline,
      assignedTo: employee._id, // Use the MongoDB _id for the reference
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
  // Corrected: assignedTo in query can now be custom employee ID string
  const { status, assignedTo: queryEmployeeId } = req.query;

  try {
    const employeeIdsInDepartment = await Employee.find({
      department: adminDepartmentId,
    }).select("_id");
    const employeeObjectIds = employeeIdsInDepartment.map((emp) =>
      emp._id.toString()
    ); // Convert to string for includes check

    let query = {
      $or: [
        { assignedBy: req.user.adminId }, // Tasks assigned by this admin
        { assignedTo: { $in: employeeObjectIds } }, // Tasks assigned to employees in this admin's department
      ],
    };

    if (status) {
      query.status = status;
    }

    // Corrected: Handle assignedTo filter using custom employee ID string
    if (queryEmployeeId) {
      const targetEmployee = await Employee.findOne({
        employeeId: queryEmployeeId,
      });
      if (!targetEmployee) {
        return res.status(404).json({ message: "Filter employee not found." });
      }
      // Ensure the target employee is in the admin's department
      if (!employeeObjectIds.includes(targetEmployee._id.toString())) {
        return res.status(403).json({
          message: "Cannot filter tasks for employee outside your department.",
        });
      }
      // Override the $or condition to filter for this specific employee
      query = { assignedTo: targetEmployee._id };
      if (status) {
        query.status = status; // Apply status filter if present
      }
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
  // Corrected: assignedTo in body can now be custom employee ID string
  const {
    title,
    description,
    deadline,
    status,
    assignedTo: newAssignedToCustomId,
  } = req.body;
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

    // Corrected: Handle re-assigning task using custom employee ID string
    if (
      newAssignedToCustomId &&
      newAssignedToCustomId !== task.assignedTo.employeeId
    ) {
      const newAssignedToEmployee = await Employee.findOne({
        employeeId: newAssignedToCustomId,
      });
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
      task.assignedTo = newAssignedToEmployee._id; // Use the MongoDB _id for the reference
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
      postedBy: req.user.adminId, // Admin is posting comment
      postedAt: Date.now(),
    });
    await task.save();

    res.status(200).json({ message: "Comment added successfully.", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error adding comment to task." });
  }
};

export const addAttachmentToTask = async (req, res) => {
  const { id } = req.params; // Task MongoDB _id
  const adminDepartmentId = req.user.departmentId;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }

    // Multer has processed the file and added req.file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Corrected: Use secure_url from multer-cloudinary
    const { originalname, secure_url } = req.file;

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
          "Access denied: You cannot add attachments to tasks outside your management scope.",
      });
    }

    task.attachments.push({
      fileName: originalname,
      fileUrl: secure_url, // Use the Cloudinary secure URL
      uploadedAt: Date.now(),
    });
    await task.save();

    res.status(200).json({ message: "Attachment added successfully.", task });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error adding attachment to task." });
  }
};
