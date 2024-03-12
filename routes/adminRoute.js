const express = require("express");

const adminRoute = express();
const session = require("express-session");
const config = require("../config/config");
const { uploadUser, userImgResize } = require("../config/multer");
const auth = require("../middleware/adminAuth");
const {
 
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
 
} = require("../controllers/adminController");

adminRoute.use(session({ secret: config.sessionSecret }));
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");
adminRoute.use(express.static("public"));

adminRoute.get("/",auth.isLogout, loadLogin);
adminRoute.post("/",verifyLogin);
adminRoute.get("/home",auth.isLogin,loadHome);
adminRoute.get("/logout", auth.isLogin, logout);

adminRoute.get("/dashboard", auth.isLogin, loadDashboard);

adminRoute.get("/addemployee", auth.isLogin, loadAddEmployee);
adminRoute.post("/addemployee",auth.isLogin, uploadUser.single("image"),userImgResize, createEmployee);


adminRoute.delete("/delete_employees/:id",auth.isLogin, deleteEmployee);
adminRoute.get("/edit-employee", auth.isLogin,editemployeeLoad );


adminRoute.post("/edit-employee", auth.isLogin,uploadUser.single("image"),userImgResize, editEmployee);

module.exports = adminRoute;