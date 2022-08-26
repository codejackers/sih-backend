const express = require("express");

const { createCollege } = require("../controller/aiuController");

const aiuRouter = express.Router();

aiuRouter.post("/aiu/create", createCollege);

module.exports = aiuRouter;
