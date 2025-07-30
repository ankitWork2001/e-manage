import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import connectDB from "./config/db.js";

// Import all the routes
import employeeAuthRoutes from "./routes/EmployeeRoutes/auth.js";
import employeeRoutes from "./routes/EmployeeRoutes/employee.js"; 
import employeeTaskRoutes from "./routes/EmployeeRoutes/tasks.js"; 
import adminRoutes from "./routes/AdminRoutes/auth.js"; 
import departmentRoutes from "./routes/AdminRoutes/department.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use("/api", limiter);

// Routes
// Employee Authentication routes
app.use("/api/auth/employee", employeeAuthRoutes);

// Employee Panel routes
app.use("/api/employee", employeeRoutes);
app.use("/api/employee/tasks", employeeTaskRoutes); // Employee's view of tasks

// HR/Admin Panel routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/departments", departmentRoutes); // Admin department routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



