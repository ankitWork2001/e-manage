import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true},
  phone: { type: String },
  position: { type: String },
  department: { type: String },
  dateOfJoining: { type: Date },
  salary: { type: Number },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

const employeeModel = mongoose.model("Employee", employeeSchema);

export default employeeModel;