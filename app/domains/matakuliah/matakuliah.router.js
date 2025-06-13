const express = require("express");
const mkRouter = express.Router();

const mkController = require("./matakuliah.controller");

mkRouter.post("/add", mkController.add);

module.exports = mkRouter;
