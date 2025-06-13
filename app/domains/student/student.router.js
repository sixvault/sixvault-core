const express = require("express");
const studentRouter = express.Router();

const studentController = require("./student.controller");

studentRouter.post("/search", studentController.search);

module.exports = studentRouter;
