const express = require("express");
const userRoute = express();
const {loadHome} = require("../controllers/userController");

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(express.static("public"));

userRoute.get("/",loadHome);

module.exports = userRoute;