import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    associatedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    description: { type: String },
  },
  { timestamps: true }
);

const departmentModel = mongoose.model("Department", departmentSchema);

export default departmentModel;
