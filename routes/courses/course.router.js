const express = require("express"); 

const { 
    getAllCourses, 
    getCourse , 
    createCourse,
    updateCourse
} = require("./course.controller");

const courseRouter = express.Router();

courseRouter.get("/course/list", getAllCourses);
courseRouter.get("/course/:id", getCourse);
courseRouter.post("/course/createCourse", createCourse);
courseRouter.put("/course/updateCourse", updateCourse);

module.exports = courseRouter;
