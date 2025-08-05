import EmployeeDocuments from "../models/docx.js";
import { cloudinary } from "../config/cloudinary.js";

export const uploadDynamicDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const files = req.files;

    const uploadedDocs = {};

    for (const fieldName in files) {
      const file = files[fieldName][0];
      uploadedDocs[fieldName] = file.path;
    }

    let doc = await EmployeeDocuments.findOne({ employeeId });

    if (doc) {
      // Merge existing documents with new ones
      for (const key in uploadedDocs) {
        doc.documents.set(key, uploadedDocs[key]);
      }
      await doc.save();
      res.json({ message: "Documents updated", data: doc });
    } else {
      doc = new EmployeeDocuments({
        employeeId,
        documents: uploadedDocs,
      });
      await doc.save();
      res.status(201).json({ message: "Documents uploaded", data: doc });
    }
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};

export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const doc = await EmployeeDocuments.findOne({ employeeId });

    if (!doc) {
      return res
        .status(404)
        .json({ message: "No documents found for this employee." });
    }

    res.json({ message: "Documents fetched successfully.", data: doc });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch documents", details: err.message });
  }
};

export const deleteDocumentByKey = async (req, res) => {
  try {
    const { employeeId, key } = req.params;

    const doc = await EmployeeDocuments.findOne({ employeeId });
    if (!doc || !doc.documents.has(key)) {
      return res
        .status(404)
        .json({ message: "Document not found for given key." });
    }

    const fileUrl = doc.documents.get(key);

    // Extract public_id from Cloudinary URL
    const parts = fileUrl.split("/");
    const publicIdWithExt = parts.slice(-1)[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

    // Delete from Cloudinary
    const extension = publicIdWithExt.split(".").pop().toLowerCase();
let resourceType = "image";

if (["pdf", "doc", "docx", "txt"].includes(extension)) {
  resourceType = "raw";
} else if (["mp4", "avi", "mov"].includes(extension)) {
  resourceType = "video";
}

await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    // Remove key from MongoDB
    doc.documents.delete(key);
    await doc.save();

    res.json({ message: `Document '${key}' deleted successfully.` });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete document.", details: err.message });
  }
};

export const updateDocumentByKey = async (req, res) => {
  try {
    const { employeeId, key } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const newFile = req.files[0];

    const doc = await EmployeeDocuments.findOne({ employeeId });
    if (!doc || !doc.documents.has(key)) {
      return res
        .status(404)
        .json({ message: `Document with key '${key}' not found.` });
    }

    // Delete old file from Cloudinary
    const oldUrl = doc.documents.get(key);
    const parts = oldUrl.split("/");
    const publicIdWithExt = parts.slice(-1)[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

    // Detect correct resource type
    const extension = publicIdWithExt.split(".").pop().toLowerCase();
    let resourceType = "image";
    if (["pdf", "doc", "docx", "txt"].includes(extension)) {
      resourceType = "raw";
    } else if (["mp4", "avi", "mov"].includes(extension)) {
      resourceType = "video";
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    // Update with new Cloudinary URL
    doc.documents.set(key, newFile.path); // or newFile.url based on your Cloudinary storage
    await doc.save();

    res.json({ message: `Document '${key}' updated successfully.`, data: doc });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update document.", details: err.message });
  }
};

