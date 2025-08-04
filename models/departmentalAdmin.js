import mongoose from "mongoose";

const departmentalAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      // Explicitly define the role
      type: String,
      enum: ["DepartmentAdmin"],
      default: "DepartmentAdmin",
      required: true,
    },
    department: {
      // Link to the specific department this admin manages
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      unique: true, // A department can only have one designated admin
    },
  },
  { timestamps: true }
);

const departmentalAdminModel = mongoose.model(
  "DepartmentalAdmin",
  departmentalAdminSchema
);
export default departmentalAdminModel;
