const express = require("express");
const transcriptRouter = express.Router();

const transcriptController = require("./transcript.controller");

transcriptRouter.post("/generate", transcriptController.generate);
transcriptRouter.post("/decrypt", transcriptController.decrypt);

module.exports = transcriptRouter;
