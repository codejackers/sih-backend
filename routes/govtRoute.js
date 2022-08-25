const express = require("express");

const { createData, getToken } = require("../controller/govtController");

const govtRouter = express.Router();

govtRouter.post("/govt/create", createData);
govtRouter.post("/govt/getToken", getToken);

module.exports = govtRouter;
