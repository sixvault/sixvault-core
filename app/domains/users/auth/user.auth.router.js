const express = require("express");
const authRouter = express.Router();

const {
    verifyRefreshToken,
    verifyAccessToken
} = require("../../../middlewares/auth/jwt/jwt.verify");

const authController = require("./user.auth.controller");

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/refresh-token", verifyRefreshToken, authController.refresh);
authRouter.get("/verify", verifyAccessToken, authController.verify)

module.exports = authRouter;

