// models/Payroll.js
import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    basicSalary: {
        type: Number,
        required: true,
    },
    hra: {
        type: Number,
        default: 0,
    },
    deductions: {
        type: Number,
        default: 0,
    },
    netSalary: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
    generatedOn: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true 
});

// Add a unique compound index to ensure only one payslip per employee per month/year
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', PayrollSchema);

export default Payroll;
