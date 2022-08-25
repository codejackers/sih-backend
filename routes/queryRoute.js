const express = require("express");

const { createQuery, captchaVerify } = require("../controller/queryController");

const queryRouter = express.Router();

queryRouter.post("/query/createQuery", createQuery);
queryRouter.post("/captchaVerify", captchaVerify);

module.exports = queryRouter;
