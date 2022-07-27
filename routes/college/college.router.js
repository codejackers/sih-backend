const express = require("express");

const { getAllColleges, getCollege , registerCollege } = require("./college.controller");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);
collegeRouter.post("/college/register",registerCollege);

module.exports = collegeRouter;
