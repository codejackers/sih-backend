const express = require("express");

const { getAllColleges } = require("./college.controller");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);

module.exports = collegeRouter;
