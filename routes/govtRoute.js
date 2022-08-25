const express = require("express");

const { verify } = require("../controller/govtController");

const govtRouter = express.Router();

govtRouter.post("/verify", verify);

module.exports = govtRouter;
