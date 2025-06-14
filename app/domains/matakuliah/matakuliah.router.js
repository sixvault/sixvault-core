const express = require("express");
const mkRouter = express.Router();

const mkController = require("./matakuliah.controller");

mkRouter.post("/add", mkController.add);
mkRouter.get("/list", mkController.list);
mkRouter.post("/remove", mkController.remove);

module.exports = mkRouter;
