import employeeModel from "../models/employeeModel.js";

 const generateUniqueEmployeeId = async () => {
  let unique = false;
  let employeeId = "";

  while (!unique) {
    const randomDigits = Math.floor(100 + Math.random() * 900); // 3-digit number (100–999)
    employeeId = `EMS${randomDigits}`;
    
    const existing = await employeeModel.findOne({ employeeId });
    if (!existing) unique = true; // ensure uniqueness
  }

  return employeeId;
};


export default generateUniqueEmployeeId;