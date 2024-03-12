const mongoose = require('mongoose');

// Define schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  designation: {
    type: String,
    enum: ["HR", "Manager", "Sales"],
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  courses: {
    type: [String], // Assuming multiple courses can be selected
    enum: ["MCA", "BCA", "BSC"],
  },
  // Assuming you want to store the file path or some reference to the uploaded file
  image: {
    type: String,
    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
