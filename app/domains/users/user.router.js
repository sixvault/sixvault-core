const express = require("express");
const userRouter = express.Router();

const authRouter = require("./auth/user.auth.router");

const userControl = require("./user.controller");

userRouter.use("/auth", authRouter);

userRouter.post("/remove", userControl.remove);

module.exports = userRouter;

