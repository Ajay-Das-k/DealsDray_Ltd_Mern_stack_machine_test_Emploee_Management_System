const User = require("../models/userModel");
const Employee = require("../models/employeeModel")
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const config = require("../config/config");
const fs = require("fs");
const path = require("path");


const loadLogin = async (req, res) => {
  try {
    res.render("signIn");
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const userName = req.body.userName;
    const password = req.body.password;

    const userData = await User.findOne({ userName: userName });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("signIn", { message: "User Name and password is incorrect" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("signIn", { message: "User Name and password is incorrect" });
      }
    } else {
      res.render("signIn", { message: "User Name and password is incorrect" });
    }
   } catch (error) {console.log(error.message);
    throw new Error(error);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};




const loadHome = async (req, res) => {
    try {
      const userData = await User.findById(req.session.user_id)
      res.render("home", { userName: userData.name });
     } catch (error) {console.log(error.message);
      throw new Error(error);
    }
  };
  const loadDashboard = async (req, res) => {
    try {
      const userData = await User.findById(req.session.user_id);
      const employeeData=await Employee.find()
      res.render("dashboard", {
        userName: userData.name,
        employeeData: employeeData,
        employeeCount: employeeData.length
      });
     } catch (error) {console.log(error.message);
      throw new Error(error);
    }
  };
  const loadAddEmployee = async (req, res) => {
    try {
      const userData = await User.findById(req.session.user_id);
      res.render("add-employee", { userName: userData.name });
     } catch (error) {console.log(error.message);
      throw new Error(error);
    }
  };
  


const createEmployee = async (req, res) => {
  try {
    console.log("Entering into Add user")
    const existingUserEmail = await User.findOne({ email: req.body.email });
    const existingUserMobile = await User.findOne({
      
      mobileNumber: req.body.mobileNumber,
    });
    if (existingUserEmail) {
      console.log("exist mobile");
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    if (existingUserMobile) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already exists." });
    }

    const { name, email, mobileNumber, designation, gender, courses } = req.body;
    const image = req.file.filename; // Assuming you're handling file uploads

    const newEmployee = new Employee({
        name,
        email,
        mobileNumber,
        designation,
        gender,
        courses,
        image,
    });

    await newEmployee.save();
    return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employee: newEmployee,
    });
} catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ success: false, message: "Email already exists." });
    }
     else if (error.code === 11000 && error.keyPattern && error.keyPattern.mobileNumber) {
        return res.status(400).json({ success: false, message: "Mobile number already exists." });
     
    } else {
        console.error("Error creating employee:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while creating the employee",
        });
    }
}
}



const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Find the employee by ID
    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Construct the absolute path to the image file
    const imagePath = path.join(
      __dirname,
      "../public/images/userProfile",
      deletedEmployee.image
    );

    // Unlink the image associated with the deleted employee
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        // You may choose to handle this error differently, depending on your application requirements
      } else {
        console.log("Image deleted successfully");
      }
    });

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      deletedEmployee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the employee",
    });
  }
};





  const editemployeeLoad = async (req, res) => {
    try {
      console.log(req.query.id);
      const userData = await User.findById(req.session.user_id);
      const currentEmployeeData=await Employee.findById(req.query.id);
      res.render("edit-employee", { userName: userData.name,employeeData:currentEmployeeData });
     } catch (error) {console.log(error.message);
      throw new Error(error);
    }
  };



  const editEmployee = async (req, res) => {
    try {
        const { id, name, designation, gender, courses, email, mobileNumber } = req.body;

        // Find the employee data by ID
        const employeeEdited = await Employee.findById(id);

        // Check if employee data is found
        if (!employeeEdited) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        // Check if the email is being changed and if it already exists for another employee
        if (email !== employeeEdited.email) {
            const existingEmployeeEmail = await Employee.findOne({ email });
            if (existingEmployeeEmail && existingEmployeeEmail._id.toString() !== id) {
                return res.status(400).json({ success: false, message: "Email already exists." });
            }
            // Update email if it's different
            employeeEdited.email = email;
        }

        // Check if the phone number is being changed and if it already exists for another employee
        if (mobileNumber !== employeeEdited.mobileNumber) {
            const existingEmployeePhone = await Employee.findOne({ mobileNumber });
            if (existingEmployeePhone && existingEmployeePhone._id.toString() !== id) {
                return res.status(400).json({ success: false, message: "Phone number already exists." });
            }
            // Update phone number if it's different
            employeeEdited.mobileNumber = mobileNumber;
        }

        // Update other fields to be updated in the database
        employeeEdited.name = name;
        employeeEdited.designation = designation;
        employeeEdited.gender = gender;
        employeeEdited.courses = courses;

        // If a file is uploaded, update the image field
        if (req.file) {
            employeeEdited.image = req.file.filename;
        }

        // Save the updated employee data in the database
        await employeeEdited.save();

        // Redirect to success page
        res.status(200).json({ success: true, message: "Employee updated successfully." });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



  module.exports = {
    
    loadAddEmployee,
    loadDashboard,
    loadHome,
    loadLogin,
    verifyLogin,
    createEmployee,
    logout,
    deleteEmployee,
    editemployeeLoad,
    editEmployee
    
  };
