const express = require("express");
const nilaiRouter = express.Router();

const nilaiController = require("./nilai.controller");
const { verifyAccessToken } = require("../../middlewares/auth/jwt/jwt.verify");

nilaiRouter.post("/add", verifyAccessToken, nilaiController.add_nilai);
nilaiRouter.post("/decrypt", nilaiController.decrypt_nilai);
nilaiRouter.get("/view/:nim_nip", verifyAccessToken, nilaiController.view_nilai);
nilaiRouter.post("/request", nilaiController.request_nilai);
nilaiRouter.get("/request/list", nilaiController.request_list);
nilaiRouter.post("/request/approve", nilaiController.request_approve);

module.exports = nilaiRouter;
