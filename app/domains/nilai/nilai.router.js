const express = require("express");
const nilaiRouter = express.Router();

const nilaiController = require("./nilai.controller");
const { verifyAccessToken } = require("../../middlewares/auth/jwt/jwt.verify");

nilaiRouter.post("/add", verifyAccessToken, nilaiController.add_nilai);
nilaiRouter.post("/decrypt", nilaiController.decrypt_nilai);
nilaiRouter.get("/view/:nim_nip", verifyAccessToken, nilaiController.view_nilai);
nilaiRouter.post("/request", verifyAccessToken, nilaiController.request_nilai);
nilaiRouter.get("/request/list", verifyAccessToken, nilaiController.request_list);
nilaiRouter.post("/request/approve", verifyAccessToken, nilaiController.request_approve);
nilaiRouter.post("/sign", verifyAccessToken, nilaiController.sign_nilai);
nilaiRouter.get("/sign/list", verifyAccessToken, nilaiController.list_signature);

module.exports = nilaiRouter;
