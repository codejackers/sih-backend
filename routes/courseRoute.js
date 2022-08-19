const express = require("express");

const {
  createCourse,
  deleteCourse,
} = require("../controller/courseController");

const courseRouter = express.Router();

courseRouter.post("/course/createCourse", createCourse);
courseRouter.delete("/course/deleteCourse", deleteCourse);

module.exports = courseRouter;
