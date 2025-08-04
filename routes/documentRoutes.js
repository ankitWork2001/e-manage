import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

import {
  uploadDynamicDocuments,
  getEmployeeDocuments,
  deleteDocumentByKey,
  updateDocumentByKey,
} from "../controllers/documentControllers.js";

const upload = multer({ storage });

const router = express.Router();

router.post(
  "/upload/:employeeId",
  upload.any(), // Accept any field names
  (req, res, next) => {
    // Reconstruct req.files to behave like multer.fields
    const groupedFiles = {};
    req.files.forEach((file) => {
      if (!groupedFiles[file.fieldname]) groupedFiles[file.fieldname] = [];
      groupedFiles[file.fieldname].push(file);
    });
    req.files = groupedFiles;
    next();
  },
  uploadDynamicDocuments
);

router.get("/view/:employeeId", getEmployeeDocuments);

router.delete("/delete/:employeeId/:key", deleteDocumentByKey);

// Update a specific document
router.put(
  "/update/:employeeId/:key",
  upload.single("file"), // `file` is the field name in form-data
  async (req, res, next) => {
    req.updatedKey = req.params.key;
    next();
  },
  updateDocumentByKey
);

export default router;
