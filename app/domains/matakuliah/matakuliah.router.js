const express = require("express");
const mkRouter = express.Router();

const mkController = require("./matakuliah.controller");

const { verifyAccessToken } = require("../../middlewares/auth/jwt/jwt.verify");

mkRouter.post("/add", verifyAccessToken, mkController.add);
mkRouter.get("/list", verifyAccessToken, mkController.list);
mkRouter.post("/remove", verifyAccessToken, mkController.remove);

module.exports = mkRouter;
