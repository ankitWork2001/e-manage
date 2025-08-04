// models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    // associatedEmployees removed - relationship handled from Employee side
    admin: {
      // Link to the departmental admin
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentalAdmin", // References the updated Admin model
      unique: true, // A department should generally have one admin, or at least one primary admin.
      sparse: true, // Allows null values, meaning a department might not have an admin assigned yet
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    description: { type: String },
  },
  { timestamps: true }
);

const departmentModel = mongoose.model("Department", departmentSchema);

export default departmentModel;
