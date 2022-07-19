const capitalizeString = require("capitalize-string");
const CoursesInfo = require("../../models/course.model");

const getAllCourses = async (req, res) => {
  try {
      const courses = await CoursesInfo.find({});
      return res.status(200).json(courses);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCourse = async (req, res) => {
  try {
    const id = req.params.id; // ask
    const course = await CoursesInfo.findById(id);
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
};
