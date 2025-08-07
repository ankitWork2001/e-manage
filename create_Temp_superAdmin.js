// temp_create_superadmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import SuperAdmin from "./models/SuperAdmin.js";
import { hashPassword } from "./utils/password.js";
import connectDB from "./config/db.js";

dotenv.config();

const createInitialSuperAdmin = async () => {
  await connectDB();
  try {
    const email = process.env.EMAIL_USER;
    const password = process.env.EMAIL_PASS;
    const name = "Super Admin";

    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      console.log("Super Admin already exists.");
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newSuperAdmin = new SuperAdmin({
      name,
      email,
      password: hashedPassword,
    });

    await newSuperAdmin.save();
    console.log("Initial Super Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error creating initial Super Admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

createInitialSuperAdmin();
