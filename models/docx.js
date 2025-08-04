import mongoose  from 'mongoose';

const employeeDocumentSchema = new mongoose.Schema({
  employeeId: {
   type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    unique: true,
  },
  documents: {
    type: Map,
    of: String, // Each key holds a URL string
  },
}, { timestamps: true });

const documentModel = mongoose.model('EmployeeDocuments', employeeDocumentSchema);

export default documentModel;
