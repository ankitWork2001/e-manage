import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    position: { type: String },
    department: {
      // Changed to ObjectId reference
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    dateOfJoining: { type: Date },
    salary: { type: Number }, // Kept for current basic salary, access restricted by HR role
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const employeeModel = mongoose.model("Employee", employeeSchema);

export default employeeModel;
