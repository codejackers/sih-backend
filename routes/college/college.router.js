const express = require("express");

const { getAllColleges, getCollege } = require("./college.controller");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);

module.exports = collegeRouter;
