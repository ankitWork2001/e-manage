// controllers/employeeControllers/task.js
import Task from "../../models/taskModel.js"; // Import the Task model

export const getMyTasks = async (req, res) => {
    // Controller logic for getting tasks assigned to the authenticated employee
    try {
        const tasks = await Task.find({ employee: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving tasks", error: error.message });
    }
};

export const updateTaskStatus = async (req, res) => {
    // Controller logic for updating the status of a specific task
    try {
        const { taskId, status } = req.body;
        const task = await Task.findByIdAndUpdate(taskId, { status });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task status", error: error.message });
    }
};
