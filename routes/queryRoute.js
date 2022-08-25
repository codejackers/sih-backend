const express = require("express");

const { createQuery } = require("../controller/queryController");

const queryRouter = express.Router();

queryRouter.post("/query/createQuery", createQuery);

module.exports = queryRouter;
