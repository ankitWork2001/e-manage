// middleware/multerConfig.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// 1. Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// 2. Setup separate storage engines for different upload types

// Storage for employee-specific documents (e.g., resume, ID)
const storageEmployeeDocuments = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "employee_documents", // Specific folder
    resource_type: "auto",
    public_id: `doc-${req.params.employeeId}-${
      file.originalname.split(".")[0]
    }-${Date.now()}`,
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "doc",
      "docx",
      "xlsx",
      "txt",
    ],
  }),
});

// Storage for task-specific attachments
const storageTaskAttachments = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "task_attachments", // Specific folder
    resource_type: "auto",
    public_id: `task-${req.params.id}-${
      file.originalname.split(".")[0]
    }-${Date.now()}`,
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "doc",
      "docx",
      "xlsx",
      "txt",
    ],
  }),
});

// 3. Create and export the final Multer instances
export const uploadEmployeeDocuments = multer({
  storage: storageEmployeeDocuments,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
});

export const uploadTaskAttachments = multer({
  storage: storageTaskAttachments,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
});

// 4. Export the cloudinary instance for deletion operations in controllers
export { cloudinary };
