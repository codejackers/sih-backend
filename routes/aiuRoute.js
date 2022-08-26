const express = require("express");

const { createCollege } = require("../controller/aiuController");

const aiuRouter = express.Router();

aiuRouter.get("/aiu/create", createCollege);

module.exports = aiuRouter;
