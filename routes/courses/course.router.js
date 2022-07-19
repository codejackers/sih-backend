const express = require("express"); 

const { getAllCourses, getCourse } = require("./course.controller");

const courseRouter = express.Router();

courseRouter.get("/courses/list", getAllCourses);
courseRouter.get("/course/:id", getCourse);

module.exports = courseRouter;
