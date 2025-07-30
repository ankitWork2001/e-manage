import taskModel from "../../models/taskModel.js";

export const assignTask = async (req, res) => {
  try {
    const {
      assignedTo,
      assignedBy,
      title,
      description,
      deadline,
      status,
      comments,
      attachments,
    } = req.body;

    // Validate required fields based on your schema
    if (!assignedTo || !assignedBy || !title) {
      return res
        .status(400)
        .json({
          message:
            "Assigned To (employeeId), Assigned By (adminId), and Task Title are required",
        });
    }

    const task = await taskModel.create({
      assignedTo,
      assignedBy,
      title,
      description,
      deadline,
      status,
      comments,
      attachments, 
    });

    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    console.error("Error assigning task:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error assigning task", error: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    // Populate assignedTo and assignedBy to get full employee/admin details
    const tasks = await taskModel
      .find()
      .populate("assignedTo", "firstName lastName email") // Adjust fields as per your Employee model
      .populate("assignedBy", "name email"); // Adjust fields as per your Admin model
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel
      .findById(id)
      .populate("assignedTo", "firstName lastName email") // Populate for single task as well
      .populate("assignedBy", "name email");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching task", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Contains fields to update

    const task = await taskModel
      .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("assignedTo", "firstName lastName email")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res
      .status(500)
      .json({ message: "Error updating task", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.message });
  }
};

// Example of how to add a comment (assuming you'd have a separate route for this)
export const addCommentToTask = async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const { text, postedBy } = req.body; // Comment text and the ID of who posted it

    if (!text || !postedBy) {
      return res
        .status(400)
        .json({ message: "Comment text and postedBy ID are required" });
    }

    const task = await taskModel.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({ text, postedBy });
    await task.save();

    res.status(200).json({ message: "Comment added successfully", task });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};
