const express = require("express");

const { getAllColleges, getCollege , registerCollege , verificationCollege , verified} = require("./college.controller");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);
collegeRouter.post("/college/register",registerCollege);
collegeRouter.get("/verify/:userId/:uniquestring", verificationCollege);
collegeRouter.get("/verified", verified);


module.exports = collegeRouter;
