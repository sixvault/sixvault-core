const express = require("express");
const studentRouter = express.Router();

const studentController = require("./student.controller");
const authRouter = require("../users/auth/user.auth.routes");

studentRouter.post("/search", studentController.search);
studentRouter.post("/add", studentController.add_data);

module.exports = studentRouter;
