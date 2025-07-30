
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Overdue"],
      default: "Pending",
    },
    comments: [
      {
        text: String,
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee", 
        },
        postedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
