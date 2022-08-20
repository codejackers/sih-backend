const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  CourseName: {
    type: String,
    required: true,
  },
  CourseDesc: {
    type: String,
    min: 60,
  },
  CourseIntakeCap: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("CoursesInfo", coursesSchema);
