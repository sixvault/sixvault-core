const express = require("express");
const kaprodiRouter = express.Router();

const kaprodiController = require("./kaprodi.controller");

kaprodiRouter.get("/list", kaprodiController.list);

module.exports = kaprodiRouter;
