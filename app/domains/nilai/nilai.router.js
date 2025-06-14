const express = require("express");
const nilaiRouter = express.Router();

const nilaiController = require("./nilai.controller");
const { verifyAccessToken } = require("../../middlewares/auth/jwt/jwt.verify");

nilaiRouter.post("/add", nilaiController.add_nilai);
nilaiRouter.post("/decrypt", nilaiController.decrypt_nilai);
nilaiRouter.get("/view", verifyAccessToken, nilaiController.view_nilai);

module.exports = nilaiRouter;
