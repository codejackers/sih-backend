const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  UID: { type: String, required: true },
});

module.exports = mongoose.model("CoursesInfo", coursesSchema);
