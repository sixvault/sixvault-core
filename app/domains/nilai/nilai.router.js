const express = require("express");
const nilaiRouter = express.Router();

const nilaiController = require("./nilai.controller");

nilaiRouter.post("/add", nilaiController.add_nilai);
nilaiRouter.post("/decrypt", nilaiController.decrypt_nilai);

module.exports = nilaiRouter;
